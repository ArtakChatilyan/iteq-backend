const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const questionsController = require("../controllers/userQuestions.controller");

router.get("/", questionsController.getQuestions);

module.exports=router;