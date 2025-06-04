const express = require("express");
const router = express.Router();

const brandController = require("../controllers/userBrands.controller");

router.get("/", brandController.getBrands);

module.exports=router;