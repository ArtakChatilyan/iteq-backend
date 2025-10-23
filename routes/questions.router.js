const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const questionsController = require("../controllers/questions.controller");

router.get("/", questionsController.getQuestions);
router.get("/:id", questionsController.getQuestionById);
router.post("/", questionsController.addQuestion);
router.put("/:id", questionsController.updateQuestion);
router.delete("/:id", questionsController.deleteQuestion);

module.exports=router;