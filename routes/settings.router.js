const express = require("express");
const router = express.Router();

const settingsController = require("../controllers/settings.controller");

router.get('/about', settingsController.getAbout);
router.get('/contacts', settingsController.getContacts);
router.put('/about', settingsController.updateAbout);
router.put('/contacts', settingsController.updateContact);

module.exports=router;