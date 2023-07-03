const User = require("../models/User");
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { attachCookiesToResponse } = require("../utils/jwt");
const { checkPermissions } = require("../utils");

//-------------------------
// GET ALL USERS CONTROLLER
const getAllUsers = async (req, res) => {
  let users = await User.find({ role: "user" }).select("-password");
  if (!users) {
    throw new NotFoundError("No users available");
  }

  res.status(StatusCodes.OK).json({ users });
};

//-------------------------
// GET SINGLE USER CONTROLLER
const getSingleUser = async (req, res) => {
  const { id } = req.params;

  checkPermissions(req.user, id);

  let user = await User.findById(id).select("-password");

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  res.status(StatusCodes.OK).json({ user });
};
//-------------------------

//-------------------------
// SHOW LOGGED USER CONTROLLER
const showCurrentUser = async (req, res) => {
  const user = req.user;

  res.status(StatusCodes.OK).json({ user });
};
//-------------------------

//-------------------------
// UPDATE USER CONTROLLER
const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!email || !name) {
    throw new BadRequestError("Please provide name and email.");
  }

  let user = await User.findOneAndUpdate(
    { _id: req.user.id },
    { name: name, email: email },
    { runValidators: true }
  );

  if (!user) {
    throw new BadRequestError("User not found.");
  }

  const token = attachCookiesToResponse(res, {
    name: user.name,
    id: user._id,
    role: user.role,
  });
  console.log(token);
  res.status(StatusCodes.OK).json({ user: { name, email } });
};
//-------------------------

//-------------------------
// UPDATE PASSWORD CONTROLLER
const updateUserPassword = async (req, res) => {
  const { newPassword, oldPassword } = req.body;
  if (!newPassword || !oldPassword) {
    throw new BadRequestError("Please provide both values");
  }

  let user = await User.findOne({ _id: req.user.id });

  const checkPassword = await user.comparePassword(oldPassword);
  if (!checkPassword) {
    throw new UnauthenticatedError("Invalid password.");
  }

  user.password = newPassword;

  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Password updated!" });
};
//-------------------------

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
