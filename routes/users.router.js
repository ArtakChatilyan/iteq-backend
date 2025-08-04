const express = require("express");
const router = express.Router();
const userCntroller = require("../controllers/users.controller");
const authMiddleWare = require("../middlewares/auth-middleware");
const { body } = require("express-validator");

router.post(
  "/registration",
  body("email").isEmail(),
  body("password").isLength({ min: 3, max: 16 }),
  userCntroller.registration
);
router.get("/resend", userCntroller.resend);
router.post("/login", userCntroller.login);
router.post("/logout", userCntroller.logout);
router.post("/changePassword", authMiddleWare,  userCntroller.changePassword);

router.get("/activate/:link", userCntroller.activate);
router.get("/forgotPassword/:link", userCntroller.forgotPassword);
router.get("/refresh", userCntroller.refresh);
router.get("/",  userCntroller.getUsers); //authMiddleWare,
router.post("/email", userCntroller.email);

module.exports = router;
