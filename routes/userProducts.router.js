const express = require("express");
const router = express.Router();

const productController = require("../controllers/userProduct.controller");

router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);
router.get("/productCategories/:id", productController.getProductCategories);

router.get("/imagesDefault/:id", productController.getImagesDefault);
router.get("/imagesByColor/:id", productController.getImagesByColor);
router.get("/imagesBySize/:id", productController.getImagesBySize);
router.get("/imagesMix/:id", productController.getImagesMix);

module.exports=router;