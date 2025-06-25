const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const multer  = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "partners/");
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
const partnersController = require("../controllers/partners.controller");

router.get("/", partnersController.getPartners);
router.get("/:id", partnersController.getPartner);
router.post("/",upload.single("imgUrl"), partnersController.addPartner);
router.put("/:id",upload.single("imgUrl"), partnersController.updatePartner);
router.delete("/:id", partnersController.deletePartner);

module.exports=router;