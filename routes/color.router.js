const express = require("express");
const fs = require("fs");
const path = require("path");
const colorController = require("../controllers/color.controller");
const router = express.Router();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "colors/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024
  },
});

router.get('/', colorController.getColors);

router.get('/:id', colorController.getColor);

router.post('/',upload.single("iconUrl"), colorController.addColor);

router.put('/:id',upload.single("iconUrl"), colorController.updateColor);

router.delete('/:id', colorController.deleteColor);

router.get('/productColors/:id', colorController.getProductColors);

module.exports=router;