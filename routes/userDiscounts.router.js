const express = require("express");
const router = express.Router();

const productController = require("../controllers/userDiscount.controller");

router.get("/all", productController.getDiscountsAll);
router.get("/", productController.getDiscounts);

module.exports=router;