const express = require("express");
const path = require("path");
const router = express.Router();

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "media/");
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
    fileSize: 100 * 1024 * 1024
  },
});

const settingsController = require("../controllers/settings.controller");

router.get('/about', settingsController.getAbout);
router.get('/contacts', settingsController.getContacts);
router.put('/about', settingsController.updateAbout);
router.put('/contacts', settingsController.updateContact);
router.put('/media', upload.single("mediaUrl"), settingsController.updateMedia);

module.exports=router;