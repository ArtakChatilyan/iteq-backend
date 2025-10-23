const express = require("express");
const router = express.Router();

const productController = require("../controllers/userBrandProducts.controller");

router.get("/", productController.getBrandProducts);

module.exports=router;