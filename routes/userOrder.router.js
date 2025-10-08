const express = require("express");
const router = express.Router();
const orderController=require('../controllers/userOrder.controller');

router.get('/', orderController.getUserOrders);

router.post('/', orderController.addOrders);

router.put('/:orderId/:actionType', orderController.cancelOrder);

module.exports=router;