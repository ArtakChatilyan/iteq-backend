const sqlPool = require("../database");
const jwt = require("jsonwebtoken");

const tokenService = {
  genearteTokens: (payload) => {
    const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET, {
      expiresIn: "30m",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {
      expiresIn: "30d",
    });
    return { accessToken, refreshToken };
  },
  saveRefreshToken: async (userId, token) => {
    const [refreshTokens] = await sqlPool.query(
      "select * from tokens where userId=?",
      [userId]
    );

    if (refreshTokens.length > 0) {
      await sqlPool.query("update tokens set token=? where userId=?", [
        token,
        userId,
      ]);
    } else {
      await sqlPool.query("insert into tokens(userId,token) values(?,?)", [
        userId,
        token,
      ]);
    }

    return token;
  },
};

module.exports = tokenService;
