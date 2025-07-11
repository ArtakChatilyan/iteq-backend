const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const multer  = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "products/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
const productController=require('../controllers/products.controller');

router.get('/', productController.getProducts);

router.get('/:id', productController.getProduct);

router.post('/', productController.addProduct);

router.put('/:id', productController.updateProduct);

router.delete('/:id', productController.deleteProduct);

// router.get('/productsizes/:id', productController.getProductSizes);

// router.get('/productsize/:id', productController.getProductSize);

// router.post('/productsizes', productController.addProductSize);

// router.put('/productsize/:id', productController.updateProductSize);

// router.delete('/productsize/:id', productController.deleteProductSize);

router.get('/productCategories/:id', productController.getProductCategories);

router.post('/productCategories', productController.setProductCategories);

// router.get('/productColors/:id', productController.getProductColors);

// router.post('/productColors', productController.setProductColors);

router.get('/productImages/:id', productController.getProductImages);

router.post('/productImages',upload.single("imgUrl"), productController.addProductImage);

router.get('/descriptions/:productId', productController.getDescriptions);

router.get('/description/:descriptionId', productController.getDescription);

router.post('/descriptions', productController.addDescription);

router.put('/descriptions/:descriptionId', productController.updateDescription);

router.delete('/descriptions/:descriptionId', productController.deleteDescription);

// router.get('/productImageColorSize/:id', productController.getImageColorSize);

// router.post('/productImageColorSize', productController.setImageColorSize);

// router.delete('/productImageColorSize/:id', productController.deleteImageColorSize);

router.delete('/productImage/:id', productController.deleteProductImage);

module.exports=router;
