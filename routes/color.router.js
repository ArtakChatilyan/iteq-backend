const express = require("express");
const fs = require("fs");
const path = require("path");
const colorController = require("../controllers/color.controller");
const router = express.Router();

router.get('/', colorController.getColors);

router.get('/:id', colorController.getColor);

router.post('/', colorController.addColor);

router.put('/:id', colorController.updateColor);

router.delete('/:id', colorController.deleteColor);

router.get('/productColors/:id', colorController.getProductColors);

module.exports=router;