const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "categories/");
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
const categoryController = require("../controllers/categories.controller");

router.get("/", categoryController.getCategories);

router.get("/all", categoryController.getCategoriesForProduct);

router.get("/main", categoryController.getCategoriesMain);

router.get("/:id", categoryController.getCategory);

router.post("/", upload.single("imgUrl"), categoryController.addCategory);

router.put("/:id", upload.single("imgUrl"), categoryController.updateCategory);

router.delete("/:id", categoryController.deleteCategory);

router.get("/categoryBrands/:id", categoryController.getCategoryBrands);

router.post("/categoryBrands", categoryController.setCategoryBrands);

module.exports = router;
