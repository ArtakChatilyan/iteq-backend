const express = require("express");
const router = express.Router();
const orderController=require('../controllers/order.controller');

router.get('/', orderController.getUserOrders);

//router.get('/:id', basketController.getBasket);

//router.get('/total/:userId', basketController.getUserTotal);

//router.put('/', basketController.updateBasketCount);

router.post('/', orderController.addOrders);

//router.delete('/:id', basketController.deleteBasket);

module.exports=router;