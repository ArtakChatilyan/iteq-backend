const express = require("express");
const router = express.Router();

const chatController=require('../controllers/chat.controller');

router.get("/users", chatController.getUsers);

router.get('/messages/:userId', chatController.getUserMessages);

router.get('/unread', chatController.getUnreadUsers);

router.put("/seen/:userId", chatController.markAsSeen);

module.exports=router;
