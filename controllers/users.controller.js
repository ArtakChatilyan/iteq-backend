const userService = require("../service/user.service");
const { validationResult } = require("express-validator");
const ApiError = require("../middlewares/api-error");

const userCntroller = {
  registration: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(ApiError.BadRequest("Invalid email or password", errors.array()));
      }
      const { email, password, name, phone } = req.body;
            
      const userData = await userService.registration(
        email,
        password,
        name,
        phone
      );
      res.cookie("refreshTokenIteq", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      res.json(userData);
    } catch (e) {
      next(e);
    }
  },
  resend: async (req, res, next) => {
    try {
      const { refreshTokenIteq } = req.cookies;
      await userService.resendActivationLink(refreshTokenIteq);
      res.json({ status: "done!" });
    } catch (e) {
      next(e);
    }
  },
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);
      res.cookie("refreshTokenIteq", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      res.json(userData);
    } catch (e) {
      next(e);
    }
  },
  logout: async (req, res, next) => {
    try {
      const { refreshTokenIteq } = req.cookies;
      await userService.logout(refreshTokenIteq);
      res.clearCookie("refreshTokenIteq");
      res.json(refreshTokenIteq);
    } catch (e) {
      next(e);
    }
  },
  activate: async (req, res, next) => {
    try {
      const link = req.params.link;
      await userService.activate(link);
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    } catch (e) {
      next(e);
    }
  },
  changePassword: async (req, res, next) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userData = res.user;
      const result = await userService.changePassword(
        userData,
        oldPassword,
        newPassword
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
  recover: async (req, res, next) => {
    try {
      const { email } = req.body;
      const userData = await userService.recover(email);
      res.json(userData);
    } catch (e) {
      next(e);
    }
  },
  passwordRecovery: async (req, res, next) => {
    try {
      const link = req.params.link;
      const userData = await userService.checkRecoveryLink(link);

      if (userData) {
        return res.redirect(
          `${process.env.CLIENT_URL}/passwordRecovery/${userData.userId}`
        );
      }
    } catch (e) {
      return res.redirect(`${process.env.CLIENT_URL}/passwordRecovery`);
    }
  },
  setPassword: async (req, res, next) => {
    try {
      const { userId, password } = req.body;
      const result = await userService.setPassword(
        userId,
        password
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
  refresh: async (req, res, next) => {
    try {
      const { refreshTokenIteq } = req.cookies;
      const userData = await userService.refresh(refreshTokenIteq);
      res.cookie("refreshTokenIteq", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      res.json(userData);
    } catch (e) {
      next(e);
    }
  },
  getUsers: async (req, res, next) => {
    try {
      const { page, perPage } = req.query;
      const users = await userService.getUsers(
        parseInt(page),
        parseInt(perPage)
      );
      res.json(users);
    } catch (e) {
      next(e);
    }
  },
  email: async (req, res, next) => {
    try {
      const { Firstname, Lastname, Email, Phone, Message } = req.body;
      await userService.sendEmail(Firstname, Lastname, Email, Phone, Message);

      res.json({ state: "Message sent successfully" });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = userCntroller;
