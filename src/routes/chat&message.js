"use strict";
const router = require("express").Router();
const { chatList, chatDelete, messageCreate, groupCreate, messageList, groupUpdate, readChat } = require("../controllers/chat&message");
const permissions = require("../middlewares/permissions");


if (process.env.NODE_ENV !== 'development') {
    router.use(permissions.isLogin);
}


router.route("/").get(chatList)
router.route('/:chatId').delete(chatDelete).get(readChat)

router.post("/group", groupCreate)
router.route('/group/:groupId').patch(groupUpdate)


router.route('/message/:chatId')
    .get(messageList)
    .post(messageCreate)



module.exports = router;
