import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnauthenticatedError } from "../errors/index.js";
import { attachCookiesToResponse, createTokenUser } from "../utils/index.js";

const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw new BadRequestError("please provider all values");
  }
  const user = await User.create(req.body);
  const tokenUser = createTokenUser(user);
  const token = attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user, token });
};
const login = async (req, res) => {
  console.log(req.user);
  const { username, password } = req.body;
  if (!username || !password) {
    throw new BadRequestError("Please provide all values");
  }
  const user = await User.findOne({ username }).select("+password");
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const tokenUser = createTokenUser(user);
  const token = attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user, token });
};

const updateUser = async (req, res) => {
  const {
    username,
    name,
    email,
    bio,
    category,
    profileImage,
    private: isPrivate,
    hashtag,
  } = req.body;
  const user = await User.findOne({ _id: req.user });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  if (username && email) {
    user.username = username;
    user.name = name;
    user.email = email;
    user.bio = bio;
    user.category = category;
    user.profileImage = profileImage;
    user.private = isPrivate;
    user.hashtag = hashtag;
  } else {
    throw new BadRequestError("Please provide all values");
  }
  await user.save();
  const tokenUser = createTokenUser(user);
  const token = attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user, token });
};

export { register, login, updateUser };
