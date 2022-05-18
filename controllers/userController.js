import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} from "../errors/index.js";

const getUser = async (req, res) => {
  const {
    params: { id: singleUserId },
  } = req;
  const user = await User.findOne(
    { _id: singleUserId },
    { savePosts: 0, email: 0 }
  );
  if (!user) {
    throw new NotFoundError(`No user with id ${singleUserId}`);
  }
  res.status(StatusCodes.OK).json({ user });
};

const getAllUsers = async (req, res) => {
  const condition = {};
  if (req.query.me) {
    condition["_id"] = { $ne: req.user };
  }
  if (req.query.idList) {
    condition["_id"] = { $in: req.query.idList.split(",") };
  }
  if (req.query.follower) {
    condition["follower"] = { $nin: req.user };
  }
  if (req.query.request) {
    condition["followRequest"] = { $nin: req.user };
  }
  if (req.query.private) {
    condition["private"] = false;
  }
  if (req.query.search) {
    condition["$or"] = [
      { username: { $regex: req.query.search } },
      { name: { $regex: req.query.search } },
      { hashtag: { $in: req.query.search } },
    ];
  }

  const users = await User.find(condition, {
    savePosts: 0,
    email: 0,
  }).limit(req.query.limit ? req.query.limit : 30);
  if (!users) {
    throw new NotFoundError(`No  user found`);
  }

  res.status(StatusCodes.OK).json({ users });
};

const followUser = async (req, res) => {
  if (!req.body.action || !req.body.targetUser) {
    throw new BadRequestError(`No action or targetUser`);
  }
  const oriUser = await User.findOne({ _id: req.user });
  const targetUser = await User.findOne({ _id: req.body.targetUser });

  if (!oriUser || !targetUser) {
    throw new NotFoundError(
      `No user with id ${req.user} or ${req.body.targetUser}`
    );
  }
  if (req.body.action === "follow") {
    if (!oriUser.following.includes(req.body.targetUser)) {
      oriUser.following.push(req.body.targetUser);
    }
    if (!targetUser.follower.includes(req.user)) {
      targetUser.follower.push(req.user);
    }
  } else if (req.body.action === "unfollow") {
    if (oriUser.following.includes(req.body.targetUser)) {
      oriUser.following = oriUser.following.filter(
        (id) => id !== req.body.targetUser
      );
    }
    if (targetUser.follower.includes(req.user)) {
      targetUser.follower = targetUser.follower.filter((id) => id !== req.user);
    }
  } else if (req.body.action === "request") {
    if (!targetUser.followRequest.includes(req.user)) {
      targetUser.followRequest.push(req.user);
    }
  } else if (req.body.action === "accept") {
    if (oriUser.followRequest.includes(req.body.targetUser)) {
      oriUser.followRequest = oriUser.followRequest.filter(
        (id) => id !== req.body.targetUser
      );
    }
    if (!targetUser.following.includes(req.user)) {
      targetUser.following.push(req.user);
    }
    if (!oriUser.follower.includes(req.body.targetUser)) {
      oriUser.follower.push(req.body.targetUser);
    }
  }
  await targetUser.save();
  await oriUser.save();
  res.status(StatusCodes.OK).json({ user: oriUser, target: targetUser });
};

// const getUsersList = async (req, res) => {
//   const {
//     params: { list: userListStr },
//   } = req;

//   const userList = userListStr.split(",");
//   const users = await User.find(
//     { _id: { $in: userList } },
//     { savePosts: 0, email: 0 }
//   );
//   res.status(StatusCodes.OK).json({ users });
// };

// const getSearchUsers = async (req, res) => {
//   const {
//     params: { search },
//   } = req;
//   let hashtag;
//   if (search[0] !== "#") {
//     hashtag = "#" + search;
//   } else {
//     hashtag = search;
//   }
//   const users = await User.find({
//     $or: [
//       { username: { $regex: search } },
//       { name: { $regex: search } },
//       { hashtag: { $in: hashtag } },
//     ],
//   });
//   if (!users) {
//     throw new NotFoundError(`No user with ${search}`);
//   }
//   res.status(StatusCodes.OK).json({ users });
// };

export { getUser, followUser, getAllUsers };
