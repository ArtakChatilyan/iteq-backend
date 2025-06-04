const ApiError = require("./api-error");
const tokenValidation = require("./tokenValidation");

module.exports = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) return next(ApiError.UnauhtorizedError());

    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) return next(ApiError.UnauhtorizedError());

    const userData = tokenValidation.validateAccessToken(accessToken);
    if (!userData) return next(ApiError.UnauhtorizedError());

    res.user = userData;
    next();
  } catch (e) {
    return next(ApiError.UnauhtorizedError());
  }
};
