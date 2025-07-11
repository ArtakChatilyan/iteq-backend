const express = require("express");
const modelsController = require("../controllers/models.controller");
const router = express.Router();

router.get("/", modelsController.getModels);

router.get("/:id", modelsController.getModel);

router.post("/", modelsController.addModel);

router.put("/:id", modelsController.updateModel);

router.delete("/:id", modelsController.deleteModel);

router.get("/modelColors/:id", modelsController.getModelColors);

router.post('/modelColors', modelsController.setModelColors);

router.get('/modelsizes/:id', modelsController.getModelSizes);

router.get('/modelsize/:id', modelsController.getModelSize);

router.post('/modelsizes', modelsController.addModelSize);

router.put('/modelsize/:id', modelsController.updateModelSize);

router.delete('/modelsize/:id', modelsController.deleteModelSize);

router.get('/modelImageColorSize/:modelId/:imageId', modelsController.getImageColorSize);

router.post('/modelImageColorSize', modelsController.setImageColorSize);

router.delete('/modelImageColorSize/:id', modelsController.deleteImageColorSize);

router.get('/modelDescriptionColorSize/:modelId/:descriptionId', modelsController.getDescriptionColorSize);

router.post('/modelDescriptionColorSize', modelsController.setDescriptionColorSize);

router.delete('/modelDescriptionColorSize/:id', modelsController.deleteDescriptionColorSize);

module.exports = router;
