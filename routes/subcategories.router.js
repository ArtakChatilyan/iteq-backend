const express = require("express");
const fs = require("fs");
const path = require("path");
const subcategoryController = require("../controllers/subcategory.controller");
const router = express.Router();

router.get('/', subcategoryController.getSubCategories);

router.get('/:id', subcategoryController.getSubCategory);

router.post('/', subcategoryController.addSubCategory);

router.put('/:id', subcategoryController.updateSubCategory);

router.delete('/:id', subcategoryController.deleteSubCategory);

router.get('/parents/:id', subcategoryController.getParents);

module.exports=router;