const { Op } = require("sequelize");
const moment = require("moment");

function getDateRange(filter) {
  switch (filter) {
    case 'today':
      return [moment().startOf('day').toDate(), moment().endOf('day').toDate()];
    case 'lastWeek':
      return [
        moment().subtract(1, 'weeks').startOf('isoWeek').toDate(),
        moment().subtract(1, 'weeks').endOf('isoWeek').toDate()
      ];
    case 'nextWeek':
      return [
        moment().add(1, 'weeks').startOf('isoWeek').toDate(),
        moment().add(1, 'weeks').endOf('isoWeek').toDate()
      ];
    case 'thisWeek':
      return [
        moment().startOf('isoWeek').toDate(),
        moment().endOf('isoWeek').toDate()
      ];
    default:
      return null;
  }
}

module.exports = (req, res, next) => {
  let { search, startDate, endDate, sort, page, limit, offset, showDeleted, dateField, preDefined, showQuote } = req.query;

  //* ?search[status]=SALER
  //! SEARCHING: URL?search[key1]=value1&search[key2]=value2
  let whereClause = {};
  let include = null;

  for (const key in search) {
    let value = search[key];
    if (['model', 'DriverId', 'capacity', 'status', 'creatorId', 'role', 'FirmId'].includes(key)) {
      whereClause[key] = value;
    } else {
      whereClause[key] = { [Op.iLike]: `%${value}%` };
    }
  }

  //! DATE RANGE: URL?startDate=2023-07-13&endDate=2023-10-01  tarih yıl-ay-gün formatında olmalı
  // endpoint?preDefined=today&dateField=createdAt
  // endpoint?preDefined=lastWeek&dateField=orderDate
  // endpoint?startDate=2023-01-01&endDate=2023-01-07&dateField=requestedDate

  const allowedDateFields = ['requestedDate', 'orderDate', 'createdAt', 'updatedAt'];

  if (req.url.startsWith('/sales')) {
    if (!showQuote || showQuote !== 'true') {
      whereClause['orderDate'] = { [Op.not]: null };
    }
  }

  if (preDefined) {
    const dateRange = getDateRange(preDefined);
    if (dateRange && allowedDateFields.includes(dateField)) {
      whereClause[dateField] = {
        ...whereClause[dateField],
        [Op.between]: dateRange,
      };
    }
  } else if (startDate && endDate && dateField && allowedDateFields.includes(dateField)) {
    whereClause[dateField] = {
      ...whereClause[dateField],
      [Op.between]: [moment(startDate).startOf('day').toDate(), moment(endDate).endOf('day').toDate()],
    };
  }

  //! SORTING: URL?sort[key1]=desc&sort[key2]=asc
  //? Sıralama ölçütleri varsa
  let orderClause = [];
  for (const key in sort) {
    const sortOrder = sort[key];
    orderClause.push([key, sortOrder.toUpperCase()]);
  }

  //! PAGINATION: URL?page=1&limit=10&offset=10
  //* Sayfalama için limit ve offset değerleri(offset mongodb-sql deki skip anlamında )
  //?url den gelen her değer string bu nedenle bu değerleri numberlaştırmam gerekiyor.page de yapmadım -1 zaten onu numberlaştırdı.backende page herzaman -1 dir.

  limit = Number(req.query?.limit);
  limit = limit > 0 ? limit : Number(process.env?.PAGE_SIZE || 20);

  page = (page > 0 ? page : 1) - 1;

  offset = Number(req.query?.offset);
  offset = offset > 0 ? offset : page * limit;

  req.getModelList = async (Model, filters = {}, include = null) => {

    let paranoid = true;

    if (showDeleted === "true" && req.user.role === 5) paranoid = false;

    whereClause = { ...whereClause, ...filters };

    return await Model.findAll({
      where: Object.keys(whereClause).length > 0 ? { [Op.or]: [whereClause] } : {},
      include,
      order: orderClause,
      offset,
      limit,
      paranoid,
    });
  };

  req.getModelListDetails = async (Model, filters = {}) => {
    whereClause = { ...whereClause, ...filters };

    let paranoid = true;

    if (showDeleted === "true" && req.user.role === 5) paranoid = false;

    const data = await Model.findAll({
      where: Object.keys(whereClause).length > 0 ? { [Op.or]: [whereClause] } : {},
      include,
      order: orderClause,
      paranoid,
    });

    let details = {
      search,
      sort,
      offset,
      limit,
      page,
      pages: {
        previous: page > 0 ? page : false,
        current: page + 1,
        next: page + 2,
        total: Math.ceil(data.length / limit),
      },
      totalRecords: data.length,
      showDeleted: showDeleted === "true" && req.user.role === 5 ? true : false,
    };

    details.pages.next = details.pages.next > details.pages.total ? false : details.pages.next;

    if (details.totalRecords <= limit) details.pages = false;

    return details;
  };

  next();
};
