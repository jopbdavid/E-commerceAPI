const User = require("../models/User");
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require("../errors");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
} = require("../utils");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const checkEmail = await User.findOne({ email });
  if (checkEmail) {
    throw new BadRequestError("Email already exists!");
  }

  //first registered user is the admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const user = await User.create({ name, email, password, role });

  const token = attachCookiesToResponse(res, {
    name: user.name,
    id: user._id,
    role: user.role,
  });

  res.status(StatusCodes.CREATED).json({ user: { name, email, role }, token });
};

const logIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please insert email and password.");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError("User does not exist.");
  }

  const checkPassword = await user.comparePassword(password);
  if (!checkPassword) {
    throw new UnauthenticatedError("Invalid password.");
  }

  attachCookiesToResponse(res, {
    name: user.name,
    id: user._id,
    role: user.role,
  });

  res
    .status(StatusCodes.OK)
    .json(`Login successful, welcome back ${user.name}`);
};

const logOut = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now() + 5000),
  });

  res.status(StatusCodes.OK).json(`Logging out...`);
};

module.exports = { register, logIn, logOut };
