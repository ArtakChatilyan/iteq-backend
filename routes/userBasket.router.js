const express = require("express");
const router = express.Router();
const basketController=require('../controllers/userBasket.controller');

router.get('/', basketController.getUserBasket);

router.get('/:id', basketController.getBasket);

router.get('/total/:userId', basketController.getUserTotal);

router.put('/', basketController.updateBasketCount);

router.post('/', basketController.addBasket);

router.delete('/:id', basketController.deleteBasket);

module.exports=router;