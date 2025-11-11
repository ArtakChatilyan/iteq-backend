const express = require("express");
const router = express.Router();

const visitsController=require('../controllers/visits.controller');


router.get('/summary', visitsController.getSummary);

router.get('/pages', visitsController.getPages);

router.get('/countries', visitsController.getCountries);

router.get('/timeseries', visitsController.getTimeseries);

router.post('/', visitsController.addVisit);

module.exports=router;
