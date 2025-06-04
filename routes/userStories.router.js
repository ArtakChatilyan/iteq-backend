const express = require("express");
const router = express.Router();

const storiesController = require("../controllers/userStories.controller");

router.get("/", storiesController.getStories);
router.get("/:id", storiesController.getStory);

module.exports=router;