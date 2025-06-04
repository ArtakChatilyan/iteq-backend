const express = require("express");
const router = express.Router();

const userPartnerController = require("../controllers/userPartner.controller");

router.get("/", userPartnerController.getPartners);

module.exports=router;