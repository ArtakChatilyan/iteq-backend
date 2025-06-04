const jwt = require("jsonwebtoken");

const tokenValidation = {
  validateAccessToken: (token) => {
    try {
      const userData = jwt.verify(token, process.env.ACCESS_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  },

  validateRefreshToken: (token) => {
    try {
      const userData = jwt.verify(token, process.env.REFRESH_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  },
};

module.exports = tokenValidation;
