const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const multer  = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "slides/");
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
const sliderController=require('../controllers/slider.controller');

router.get('/', sliderController.getSlides);
router.post('/',upload.single("itemUrl"), sliderController.addSlide);
router.delete('/:id', sliderController.deleteSlide);

module.exports=router;