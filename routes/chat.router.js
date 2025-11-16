const express = require("express");
const router = express.Router();

const chatController=require('../controllers/chat.controller');


router.get('/users', chatController.getMessages);

router.get('/messages/:userId', chatController.getUserMessages);

// router.get('/all', brandController.getBrandsAll);

// router.get('/:id', brandController.getBrand);

// router.post('/', upload.single("imgUrl"), brandController.addBrand);

// router.put('/:id',upload.single("imgUrl"),  brandController.updateBrand);

// router.delete('/:id', brandController.deleteBrand);

module.exports=router;
