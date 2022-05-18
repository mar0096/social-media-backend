import express from "express";
const router = express.Router();
import {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
  getPost,
} from "../controllers/postController.js";

import { authenticateUser } from "../middleware/authentication.js";

router
  .route("/")
  .get(authenticateUser, getAllPosts)
  .post(authenticateUser, createPost);

router
  .route("/:id")
  .delete(authenticateUser, deletePost)
  .get(authenticateUser, getPost)
  .patch(authenticateUser, updatePost);

// router.route("/list/:list").get(authenticateUser, getPostsList);
// router.route("/search/:search").get(authenticateUser, getSearchPosts);

// router.route("/").post(authenticateUser, createPost);
// router.route("/home").post(authenticateUser, getAllPosts);
// router.route("/user").post(getUserPosts);
// router
//   .route("/:id")
//   .patch(authenticateUser, updatePost)
//   .delete(authenticateUser, deletePost);

export default router;
