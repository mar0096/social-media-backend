const createTokenUser = (user) => {
  return { userId: user._id };
};

export default createTokenUser;
