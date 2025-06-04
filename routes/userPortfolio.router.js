const express = require("express");
const router = express.Router();

const userPortfolioController = require("../controllers/userPortfolio.controller");

router.get("/", userPortfolioController.getPortfolio);
router.get("/:id", userPortfolioController.getPortfolioById);

module.exports=router;