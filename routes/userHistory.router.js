const express = require("express");
const router = express.Router();
const historyController=require('../controllers/userHistory.controller');

router.get('/', historyController.getUserHistory);

module.exports=router;