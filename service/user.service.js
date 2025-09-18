const sqlPool = require("../database");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const mailService = require("./mail.service");
const tokenService = require("./token.service");
const ApiError = require("../middlewares/api-error");
const tokenValidation = require("../middlewares/tokenValidation");

const userService = {
  registration: async (email, password, name, phone) => {
    const [existUser] = await sqlPool.query(
      "select * from users where email=?",
      [email]
    );
    if (existUser.length > 0) {
      throw ApiError.BadRequest("A user with this email already exists");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const activationLink = uuid.v4();
    const [insertedData] = await sqlPool.query(
      "insert into users(email, password,name, phone, activationLink, role) values (?,?,?,?,?,?)",
      [email, hashPassword, name, phone, activationLink, 0]
    );

    //await mailService.sendActivationMail(email, activationLink);
    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/v1/users/activate/${activationLink}`
    );

    const [user] = await sqlPool.query("select * from users where userId=?", [
      insertedData.insertId,
    ]);

    const tokens = tokenService.genearteTokens({
      id: user[0].userId,
      email: user[0].email,
    });
    await tokenService.saveRefreshToken(user[0].userId, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        userId: user[0].id,
        email: user[0].email,
        isActivated: user[0].isActivated,
      },
    };
  },
  resendActivationLink: async (token) => {
    const userData = tokenValidation.validateRefreshToken(token);
    const [tokens] = await sqlPool.query("select * from tokens where token=?", [
      token,
    ]);
    if (userData && tokens.length > 0) {
      const [links] = await sqlPool.query(
        "select activationLink from users where userId=?",
        [userData.id]
      );
      await mailService.sendActivationMail(
        userData.email,
        `${process.env.API_URL}/api/v1/users/activate/${links[0].activationLink}`
      );
    }
  },
  activate: async (link) => {
    const [users] = await sqlPool.query(
      "select * from users where activationLink=?",
      [link]
    );
    if (users.length === 0) {
      throw ApiError.BadRequest("Wrong activation link");
    }

    await sqlPool.query("update users set isActivated = 1 where userId=?", [
      users[0].userId,
    ]);
  },
  login: async (email, password) => {
    const [users] = await sqlPool.query("select * from users where email=?", [
      email,
    ]);
    if (users.length === 0) throw ApiError.BadRequest("Wrong email!");

    if (users[0].isActivated === 0)
      throw ApiError.BadRequest("Check email for activation!");
    const isPassEqual = await bcrypt.compare(password, users[0].password);
    if (isPassEqual) {
      const tokens = tokenService.genearteTokens({
        id: users[0].userId,
        email: users[0].email,
      });

      await tokenService.saveRefreshToken(users[0].userId, tokens.refreshToken);

      return {
        ...tokens,
        user: {
          userId: users[0].userId,
          email: users[0].email,
          name: users[0].name,
          phone: users[0].phone,
          role: users[0].role,
          isActivated: users[0].isActivated,
        },
      };
    } else {
      throw ApiError.BadRequest("Wrong password!");
    }
  },
  changePassword: async (userData, oldPassword, newPassword) => {
    const [userPassword] = await sqlPool.query(
      "select * from users where userId=?",
      userData.id
    );
    const isPassEqual = await bcrypt.compare(
      oldPassword,
      userPassword[0].password
    );
    if (isPassEqual) {
      const hashPassword = await bcrypt.hash(newPassword, 10);
      await sqlPool.query("update users set password=? where userId=?", [
        hashPassword,
        userData.id,
      ]);
      return { result: "password changed" };
    } else {
      throw ApiError.BadRequest("Wrong password!");
    }
  },
  logout: async (token) => {
    await sqlPool.query("delete from tokens where token=?", [token]);
  },
  refresh: async (token) => {
    if (!token) throw ApiError.UnauhtorizedError();
    const userData = tokenValidation.validateRefreshToken(token);
    const [tokens] = await sqlPool.query("select * from tokens where token=?", [
      token,
    ]);

    if (userData && tokens.length > 0) {
      const newTokens = tokenService.genearteTokens({
        id: userData.id,
        email: userData.email,
      });

      await tokenService.saveRefreshToken(userData.id, newTokens.refreshToken);
      const [users] = await sqlPool.query(
        "select * from users where userId=?",
        [userData.id]
      );
      return {
        ...newTokens,
        user: {
          userId: users[0].userId,
          name: users[0].name,
          phone: users[0].phone,
          email: users[0].email,
          role: users[0].role,
          isActivated: users[0].isActivated,
        },
      };
    } else {
      throw ApiError.UnauhtorizedError();
    }
  },
  recover: async (email) => {
    const [users] = await sqlPool.query("select * from users where email=?", [
      email,
    ]);
    if (users.length === 0) throw ApiError.BadRequest("Wrong email!");

    const recoveryLink = uuid.v4();
    let date = new Date();
    const linkDate = new Date(
      new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    )
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const [insertedData] = await sqlPool.query(
      "insert into recovery(userId, email, recoveryLink, dateLink) values (?,?,?,?)",
      [users[0].userId, users[0].email, recoveryLink, linkDate]
    );
    await mailService.sendRecoveryMail(
      email,
      `${process.env.API_URL}/api/v1/users/passwordRecovery/${recoveryLink}`
    );
  },
  checkRecoveryLink: async (link) => {
    const [userData] = await sqlPool.query(
      "select * from recovery where recoveryLink=?",
      [link]
    );
    if (userData.length === 0) {
      throw ApiError.BadRequest("Wrong recovery link");
    }

    const currentDate = new Date().getTime();

    for (let i = 0; i < userData.length; i++) {
      const dbDate = new Date(userData[0].dateLink).getTime();
      const dateDiff = (currentDate - dbDate) / (60 * 1000);

      if (dateDiff > 3) {
        await sqlPool.query("delete from recovery where recoveryLink=?", link);
      }
    }

    const dbDate = new Date(userData[0].dateLink).getTime();
    const dateDiff = (currentDate - dbDate) / (60 * 1000);
    if (dateDiff < 3) {
      return userData[0];
    } else {
      throw ApiError.BadRequest("Wrong recovery link");
    }
  },
  setPassword: async (userId, password) => {
    const hashPassword = await bcrypt.hash(password, 10);
    console.log(hashPassword);
    await sqlPool.query("update users set password=? where userId=?", [
      hashPassword,
      userId,
    ]);

    return { result: "password changed" };
  },
  getUsers: async (page, perPage) => {
    const [users] = await sqlPool.query(
      "select * from users  LIMIT ? OFFSET ?", //where role=0
      [perPage, (page - 1) * perPage]
    );
    const [count] = await sqlPool.query("select count(*) as total from users "); //where role=0
    return { users: users, total: count[0].total };
  },
  sendEmail: async (Firstname, Lastname, Email, Phone, Message) => {
    await mailService.sendQuestion(
      "artak.chatilyan@gmail.com",
      Firstname,
      Lastname,
      Email,
      Phone,
      Message
    );
  },
};

module.exports = userService;
