const express = require("express");
const router = express.Router();
const orderController=require('../controllers/userOrder.controller');

router.get('/', orderController.getUserOrders);

router.post('/', orderController.addOrders);

module.exports=router;