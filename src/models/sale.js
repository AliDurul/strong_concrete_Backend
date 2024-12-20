"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");

const { saleStatuses } = require("../constraints/roles&status");
const { Firm, Product } = sequelize.models;


const Sale = sequelize.define(
  "Sale",
  {
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.FLOAT,
    },
    location: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    otherCharges: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    totalPrice: {
      type: DataTypes.FLOAT,
    },
    discount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    requestedDate: {
      type: DataTypes.DATEONLY,
    },
    sideContact: {
      type: DataTypes.STRING(16),
      allowNull: false,
    },
    orderDate: {
      type: DataTypes.DATEONLY,
    },
    orderNumber: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: Object.keys(saleStatuses)[0],
      validate: {
        isIn: {
          args: [Object.keys(saleStatuses)],
          msg: "Invalid status value",
        },
      },
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: async (sale) => {
        const firm = await Firm.findByPk(sale.FirmId);
        if (firm.status !== 1)
          throw new Error("The firm you have picked is not a Consumer !");

        if (!sale.unitPrice) {
          const product = await Product.findByPk(sale.ProductId);
          sale.unitPrice = product.price;
        }

        sale.totalPrice = sale.quantity * sale.unitPrice + sale.otherCharges - sale.discount;
      },
      beforeUpdate: (sale) => {
        sale.totalPrice = sale.quantity * sale.unitPrice + sale.otherCharges - sale.discount;
      },
    },
  }
);



module.exports = Sale;

/* 
{
  "FirmId": 2,
  "ProductId": 1,
  "quantity": 5,
  "location": "Kabulonga",
  "requestedDate": "2024-01-15T08:15:11.218Z",
  "sideContact": "+26011111"
}
{
  "status": 2,
  "orderDate": "2024-01-15T08:15:11.218Z"
}
*/
