"use strict";

const passwordEncrypt = require("../helpers/passEncrypt");

const User = require("../models/user");
const cyrpto = require('node:crypto');
const sendEmail = require("../middlewares/sendMail");

module.exports = {
  list: async (req, res) => {
    const data = await User.findAndCountAll();
    res.status(200).send({
      result: data,
    });
  },

  register: async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user) throw new Error("A user is already exist with this email !");

    req.body.emailToken = cyrpto.randomBytes(64).toString('hex')

    const data = await User.create(req.body);

    sendEmail(data)

    res.status(201).send({
      data,
    });
  },

  read: async (req, res) => {
    const data = await User.findByPk(req.params.id);
    res.status(200).send({
      data,
    });
  },
  update: async (req, res) => {
    const isUpdated = await User.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });
    // isUpdated return: [ 1 ] or [ 0 ]
    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: await User.findByPk(req.params.id),
    });
  },

  uptadePassword: async (req, res) => {
    const { password, newPassword, reNewPassword } = req.body;
    
    const {id} = req.user
    
    const user = await User.findOne({
      where: {id },
    });

   
    if (!user) {
      res.errorStatusCode = 402;
      throw new Error("User not found! ");
    }
    if (user.password != passwordEncrypt(password)) {
      throw new Error(
        "Current password didn't match!"
      );
    } 

    if (passwordEncrypt(password) === passwordEncrypt(newPassword)) {
      throw new Error(
        "new Password, can't be old  password!"
      );
    } 
     if (newPassword != reNewPassword) {
      throw new Error(
        "new Password, reNew Password must be the same"
      );
    } 
    
   
    user.password=newPassword
    await user.save()
      res.status(200).send({ message: "Password updated successfully!" , user});
    
  },

  delete: async (req, res) => {
    const isDeleted = await User.destroy({ where: { id: req.params.id } });
    res.status(isDeleted ? 204 : 404).send({
      error: Boolean(isDeleted),
    });
  },
  verifyEmail: async (req, res) => {
    const emailToken = req.query.emailToken
    console.log(emailToken);

    if(!emailToken) throw new Error("Email token not found..")

    const user = await User.findOne({where:{emailToken}})

    if(!user) throw new Error("Email verification failed, invalid token !")

    user.emailToken = null;
    user.isVerified = true;

    await user.save()

    res.status(202).send(user);

  }
};
