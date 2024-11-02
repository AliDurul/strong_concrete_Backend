"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const { Purchase } = sequelize.models;


const PurchaseAccount = sequelize.define(
  "PurchaseAccount",
  {
    debit: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    credit: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    balance: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: async (purchaseAccount) => {
        if (purchaseAccount.PurchaseId) {
          const purchase = await Purchase.findByPk(purchaseAccount.PurchaseId);
          purchaseAccount.FirmId = purchase?.FirmId;
          purchaseAccount.debit = purchase?.totalPrice;
          purchaseAccount.balance = (purchaseAccount.debit - purchaseAccount.credit).toFixed(2);
        }

      },
      beforeUpdate: async (purchaseAccount) => {

        const purchase = await Purchase.findByPk(purchaseAccount.PurchaseId);
        const currentPurchaseAccount = await PurchaseAccount.findByPk(purchaseAccount.id);
        purchaseAccount.credit = currentPurchaseAccount.credit + purchaseAccount.credit;

        purchaseAccount.FirmId = purchase.FirmId;
        purchaseAccount.debit = purchase.totalPrice;
        purchaseAccount.balance = (purchaseAccount.debit - purchaseAccount.credit).toFixed(2);
      },
    },
  }
);



module.exports = PurchaseAccount;
