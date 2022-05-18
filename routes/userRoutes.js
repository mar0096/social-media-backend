import express from "express";
const router = express.Router();
import {
  getUser,
  followUser,
  getAllUsers,
} from "../controllers/userController.js";
import { authenticateUser } from "../middleware/authentication.js";

router.route("/").get(authenticateUser, getAllUsers);
router
  .route("/:id")
  .get(authenticateUser, getUser)
  .patch(authenticateUser, followUser);
// router.route("/list/:list").get(authenticateUser, getUsersList);
// router.route("/search/:search").get(authenticateUser, getSearchUsers);
// router.route("/user/:id").get(getUser).post(getRecommendUser);
// router.route("/follow").post(followUser);
// router.route("/unfollow").post(unfollowUser);
// router.route("/acceptUser").post(acceptUser);
// router.route("/requestUser").post(requestUser);

export default router;
