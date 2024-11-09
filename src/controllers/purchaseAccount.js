"use strict";

const { PurchaseAccount, Purchase, Material, Firm } = require('../models')


module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['PurchaseAccount']
        #swagger.summary = ' PurchaseAccount List'
        #swagger.description = `You can send query with endpoint for search[], sort[], page and limit.
          <ul> Examples:
              <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
              <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
              <li>URL/?<b>page=2&limit=1</b></li>
          </ul>
        `
        #swagger.parameters['showDeleted'] = {
        in: 'query',
        type: 'boolean',
        description:'Send true to show deleted data as well, default value is false'
      }

     */

    // const FirmId = req.query.firmId;

    // const balance = await PurchaseAccount.sum("balance", { where: { FirmId : FirmId} });

    // data.totalBalance = balance

    const data = await req.getModelList(PurchaseAccount, {}, [
      {
        model: Purchase,
        attributes: ['id'],
        include: [
          {
            model: Material,
            attributes: ["name"],
          },
        ],
      },
      { model: Firm, attributes: ["name"] },
    ]);


    const filteredData = data.reduce((acc, item) => {
      const firmName = item.Firm.name;

      if (!acc[firmName]) {
        acc[firmName] = {
          transactions: [],
          totalCredit: 0,
          totalDebit: 0
        };
      }

      acc[firmName].transactions.push(item);
      acc[firmName].totalCredit += item.credit;
      acc[firmName].totalDebit += item.debit;

      return acc;
    }, {});


    const listPurchaseAccount = Object.keys(filteredData).map(firmName => ({
      firmName,
      ...filteredData[firmName]
    }));

    res.status(200).send(listPurchaseAccount);
    // res.status(200).send(data);
  },

  create: async (req, res) => {
    /* 
        #swagger.tags = ['PurchaseAccount']
        #swagger.deprecated  = true
        #swagger.summary = 'PurchaseAccount: Create'
        #swagger.description = '
          <b>-</b> PurchaseAccount will be created automatically when the purchase is made. <br>
          <b>-</b> There is no need to create a PurchaseAccount manually. <br>
          <b>-</b> Send access token in header.'
        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            "FirmId": "number",
            "credit": "number"
          }
        } 
       
      
     */
    req.body.creatorId = req.user.id;

    if (!req.body.debit) req.body.balance = (0 - req.body.credit).toFixed(2);

    const data = await PurchaseAccount.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    /* 
        #swagger.tags = ['PurchaseAccount']
        #swagger.summary = 'Read PurchaseAccount  with id'
        #swagger.description = '
       <b>-</b> Send access token in header. '
     */
    const data = await PurchaseAccount.findByPk(req.params.id, {
      include: [
        {
          model: Purchase,
          include: [
            {
              model: Material,
              attributes: ["name"],
            },
          ],
        },
        { model: Firm, attributes: ["name"] },
      ]
    });
    if (!data) {
      res.errorStatusCode = 404;
      throw new Error("Not found !");
    }

    res.status(200).send(data);
  },
  update: async (req, res) => {
    /* 
        #swagger.tags = ['PurchaseAccount']
        #swagger.summary = 'Update PurchaseAccount with id'
        #swagger.description = `<b>-</b> Send access token in header.`
        #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>Send the object includes attributes that should be updated.</li>
              
            </ul> ',
          required: true,
          schema: {
            "FirmId": "number",
            "credit": "number"
          }
        } 
     */
    req.body.updaterId = req.user.id;
    const isUpdated = await PurchaseAccount.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });

    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: await PurchaseAccount.findByPk(req.params.id),
    });
  },

  delete: async (req, res) => {
    /* 
        #swagger.tags = ['PurchaseAccount']
        #swagger.summary = 'Delete PurchaseAccount with id'
        #swagger.description = `
          <b>-</b> Send access token in header. <br>
          <b>-</b> This function returns data includes remaning items.
        `
        #swagger.parameters['hardDelete'] = {
          in: 'query',
          type: 'boolean',
          description:'Send true for hard deletion, default value is false which is soft delete.'}
    */

    const hardDelete = req.query.hardDelete === "true";
    if (req.user.role !== 5 && hardDelete)
      throw new Error("You are not authorized for permanent deletetion!");

    const purchaseAccount = await PurchaseAccount.findByPk(req.params.id);
    if (!purchaseAccount)
      throw new Error("PurchaseAccount not found or already deleted.");
    purchaseAccount.updaterId = req.user.id;
    const isDeleted = await purchaseAccount.destroy({ force: hardDelete });

    res.status(isDeleted ? 202 : 404).send({
      error: !Boolean(isDeleted),
      message: !!isDeleted
        ? `The Purchase Account id ${purchaseAccount.id} has been deleted.`
        : "Purchase Account not found or something went wrong.",
      data: await req.getModelList(PurchaseAccount, {}, [
        {
          model: Purchase,
          attributes: ['id'],
          include: [
            {
              model: Material,
              attributes: ["name"],
            },
          ],
        },
        { model: Firm, attributes: ["name"] },
      ]),
    });
  },

  restore: async (req, res) => {
    /* 
        #swagger.tags = ['PurchaseAccount']
         #swagger.summary = 'Restore PurchaseAccount with id'
        #swagger.description = '<b>-</b> Send access token in header.'
     */
    const purchaseAccount = await PurchaseAccount.findByPk(req.params.id, {
      paranoid: false,
    });
    if (!purchaseAccount) throw new Error("PurchaseAccount not Found.");
    purchaseAccount.updaterId = req.user.id;
    const isRestored = await purchaseAccount.restore();

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "PurchaseAccount restored successfuly."
        : "PurchaseAccount not found or something went wrong.",
    });
  },
  multipleDelete: async (req, res) => {
    /* 
      #swagger.tags = ['PurchaseAccount']
      #swagger.summary = 'Multiple-Delete  Firm with ID'
      #swagger.description = `
        <b>-</b> Send access token in header. <br>
        <b>-</b> This function returns data includes remaning items.
      `
       #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>You must write the IDs of the purchaseAccounts you want to delete into the array.</li>
            </ul> ',
          required: true,
          schema: {
            "ids": [1,2,3]
            
          }
        } 
    */
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error("Invalid or empty IDs array in the request body.");
    }

    let totalDeleted = 0;

    for (const id of ids) {
      const purchaseAccount = await PurchaseAccount.findByPk(id);

      if (purchaseAccount) {
        purchaseAccount.updaterId = req.user.id;
        await purchaseAccount.destroy();
        totalDeleted++;
      }
    }

    res.status(totalDeleted ? 202 : 404).send({
      error: !Boolean(totalDeleted),
      message: !!totalDeleted
        ? `The purchase account id's ${ids} has been deleted.`
        : "Purchase Account not found or something went wrong.",
      data: await req.getModelList(PurchaseAccount, {}, [
        {
          model: Purchase,
          attributes: ['id'],
          include: [
            {
              model: Material,
              attributes: ["name"],
            },
          ],
        },
        { model: Firm, attributes: ["name"] },
      ]),
    });
  },
};
