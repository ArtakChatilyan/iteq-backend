const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/userCategories.controller");

router.get("/main", categoryController.getMain);
router.get("/", categoryController.getCategories);
router.get("/:categoryId", categoryController.getCategoriesById);

module.exports=router;