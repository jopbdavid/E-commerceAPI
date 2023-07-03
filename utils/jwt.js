const jwt = require("jsonwebtoken");

const createJWT = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
  return token;
};

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = (res, user) => {
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });

  res.cookie("token", token, {
    expires: new Date(Date.now() + 8 * 3600 * 24),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

module.exports = { createJWT, isTokenValid, attachCookiesToResponse };
