const express = require("express");
const router = express.Router();

const searchController = require("../controllers/userSearch.controller");

router.get("/brand", searchController.getByBrand);
router.get("/productsByBrand", searchController.getProductsByBrand);
router.get("/model", searchController.getByModel);
router.get("/productsByModel", searchController.getProductsByModel);
router.get("/category", searchController.getByCategory);
router.get("/productsByCategory", searchController.getProductsByCategory);
router.get("/general", searchController.getGeneral);
router.get("/generalProducts", searchController.getGeneralProducts);

module.exports=router;