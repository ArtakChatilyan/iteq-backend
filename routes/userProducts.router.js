const express = require("express");
const router = express.Router();

const productController = require("../controllers/userProduct.controller");

router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);
router.get("/productCategories/:id", productController.getProductCategories);

module.exports=router;