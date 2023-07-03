const createTokenUser = (user) => {
  const tokenUser = {
    name: user.name,
    id: user._id,
    role: user.role,
  };
  return tokenUser;
};

module.exports = createTokenUser;
