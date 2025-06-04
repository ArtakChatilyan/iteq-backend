const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const multer  = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "brands/");
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
const brandController=require('../controllers/brands.controller');


router.get('/', brandController.getBrands);

router.get('/all', brandController.getBrandsAll);

router.get('/:id', brandController.getBrand);

router.post('/', upload.single("imgUrl"), brandController.addBrand);

router.put('/:id',upload.single("imgUrl"),  brandController.updateBrand);

router.delete('/:id', brandController.deleteBrand);

module.exports=router;
