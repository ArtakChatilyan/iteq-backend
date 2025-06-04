const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const multer  = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "news/");
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
const newsController = require("../controllers/news.controller");

router.get("/", newsController.getNews);
router.get("/:id", newsController.getNewsById);
router.post("/",upload.single("imgUrl"), newsController.addNews);
router.put("/:id",upload.single("imgUrl"), newsController.updateNews);
router.delete("/:id", newsController.deleteNews);

module.exports=router;