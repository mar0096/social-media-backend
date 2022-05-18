import Post from "../models/Post.js";
import User from "../models/User.js";
import moment from "moment";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} from "../errors/index.js";
import { attachCookiesToResponse, createTokenUser } from "../utils/index.js";

const createPost = async (req, res) => {
  const { imageSrc, caption, userId, hashtag } = req.body;
  console.log(userId);
  if (!imageSrc) {
    throw new BadRequestError("Please provide image");
  }
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new NotFoundError("Not found user");
  }

  const post = await Post.create({
    imageSrc,
    caption,
    createdBy: userId,
    hashtag,
  });
  user.posts.push(post._id);

  user.save();

  res.status(StatusCodes.CREATED).json({ post, user });
};

const getAllPosts = async (req, res) => {
  // const postsIdList = req.query.idList.split(",");
  const condition = {};
  if (req.query.idList) {
    condition["_id"] = { $in: req.query.idList.split(",") };
  }
  if (req.query.userList) {
    condition["createdBy"] = { $in: req.query.userList.split(",") };
  }
  if (req.query.search) {
    condition["hashtag"] = {
      $in:
        req.query.search[0] === "#" ? req.query.search : "#" + req.query.search,
    };
  }
  let posts = await Post.find(condition).sort([["createdAt", -1]]);

  let postsUser = [];
  posts.map((post) => {
    postsUser.push(post.createdBy);
  });
  console.log(postsUser, Object.keys(posts).length);
  postsUser = [...new Set(postsUser)];
  const users = await User.find({
    _id: { $in: postsUser },
    $or: [
      { private: false },
      { _id: req.user },
      { follower: { $in: req.user } },
    ],
  });
  let UserList = [];
  users.map((user) => {
    UserList.push(String(user._id));
  });
  console.log(UserList);
  posts = posts.filter((post) => {
    return UserList.includes(String(post.createdBy));
  });
  res.status(StatusCodes.OK).json({ posts });
};

// const getPostsList = async (req, res) => {
//   const {
//     params: { list: userListStr },
//   } = req;
//   const userList = userListStr.split(",");
//   console.log(userList);
//   const posts = await Post.find({ createdBy: { $in: userList } }).sort([
//     ["createdAt", -1],
//   ]);

//   res.status(StatusCodes.OK).json({ posts });
// };

const getPost = async (req, res) => {
  const {
    params: { id: postId },
  } = req;
  const post = await Post.findOne({ _id: postId });
  const postUser = await User.findOne({ _id: post.createdBy });
  if (
    postUser.private &&
    !(postUser._id == req.user) &&
    !postUser.follower.includes(req.user)
  ) {
    throw new UnauthenticatedError("private account");
  }
  res.status(StatusCodes.OK).json({ post });
};

const updatePost = async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.id,
  });

  if (!post) {
    throw new NotFoundError("Not found user");
  }
  const user = await User.findOne({ _id: req.user });
  if (!user) {
    throw new NotFoundError("Not found user");
  }
  switch (req.body.action) {
    case "like":
      if (post.like.includes(req.body.userId)) break;
      post.like.push(req.body.userId);
      break;
    case "unlike":
      post.like = post.like.filter((id) => id !== req.body.userId);
      break;
    case "save":
      if (post.saveAcc.includes(req.body.userId)) break;
      post.saveAcc.push(req.body.userId);
      user.savePosts.push(req.params.id);
      break;
    case "unsave":
      post.saveAcc = post.saveAcc.filter((id) => id !== req.body.userId);
      user.savePosts = user.savePosts.filter(
        (post) => String(post) !== req.params.id
      );

      break;
    case "addComment":
      post.comment.push({
        time: moment()._d,
        commentId: req.user,
        comment: req.body.comment,
      });
      post.markModified("comment");
      break;
    case "deleteComment":
      post.comment = post.comment.filter(function (obj) {
        return (
          String(moment(obj.time)) !== String(moment(req.body.comment)) ||
          obj.commentId !== req.user
        );
      });
      post.markModified("comment");
      break;
    case "update":
      console.log(post.createdBy, req.user);
      if (String(post.createdBy) !== req.user) {
        throw new UnauthenticatedError("user id !== post created By");
      }
      post.caption = req.body.caption;
      post.showComment = req.body.showComment;
      post.archive = req.body.archive;
      post.hashtag = req.body.hashtag;
      break;
  }
  user.save();
  post.save();

  res.status(StatusCodes.OK).json({ post, user });
};

const deletePost = async (req, res) => {
  const post = await Post.findByIdAndRemove({
    _id: req.params.id,
    createdBy: req.user,
  });
  if (!post) {
    throw new NotFoundError(
      `No job with id ${req.params.id} and createdBy ${req.user}`
    );
  }
  const user = await User.findOne({ _id: req.user });
  if (!user) {
    throw new NotFoundError("Not found user");
  }

  user.posts = user.posts.filter((post) => String(post) !== req.params.id);

  user.save();
  res.status(StatusCodes.OK).send({ msg: "delete success" });
};

// const getSearchPosts = async (req, res) => {
//   const {
//     params: { search },
//   } = req;
//   let hashtag = "#" + search;
//   let posts = await Post.find({ hashtag: { $in: hashtag } }).sort([
//     ["createdAt", -1],
//   ]);
//   let postsUser = [];
//   if (!posts) {
//     throw new NotFoundError(`No post with ${search}`);
//   }
//   posts.map((post) => {
//     postsUser.push(post.createdBy);
//   });
//   postsUser = [...new Set(postsUser)];
//   const users = await User.find({
//     _id: { $in: postsUser },
//     $or: [
//       { private: false },
//       { _id: req.user },
//       { follower: { $in: req.user } },
//     ],
//   });
//   let UserList = [];
//   users.map((user) => {
//     UserList.push(String(user._id));
//   });
//   posts = posts.filter((post) => {
//     return UserList.includes(String(post.createdBy));
//   });
//   res.status(StatusCodes.OK).json({ posts });
// }

export { createPost, getAllPosts, updatePost, deletePost, getPost };
