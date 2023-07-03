const CustomErr = require("../errors");

const checkPermissions = (requestUser, resourceUserId) => {
  if (requestUser.role === "admin") {
    return;
  }

  if (requestUser.id === resourceUserId.toString()) {
    return;
  }

  throw new CustomErr.UnauthorizedError("Access Forbidden.");
};

module.exports = checkPermissions;
