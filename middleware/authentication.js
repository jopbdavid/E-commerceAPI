const { StatusCodes } = require("http-status-codes");
const CustomErr = require("../errors");

const { isTokenValid } = require("../utils/jwt");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomErr.UnauthenticatedError("Authentication Invalid");
  }

  try {
    const { name, id, role } = isTokenValid(token);
    req.user = { name, id, role };
    next();
  } catch (error) {
    throw new CustomErr.UnauthenticatedError("Authentication Invalid");
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomErr.UnauthorizedError("Access Forbidden.");
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
