import express from "express";
const router = express.Router();
import { register, login, updateUser } from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authentication.js";
import rateLimiter from "express-rate-limit";
const apiLimiter = rateLimiter({
  windowMs: 30 * 60 * 1000,
  max: 10,
  message:
    "Too many request from this IP address, please try again after 15 minutes",
});

router.route("/register").post(apiLimiter, register);
router.route("/login").post(apiLimiter, login);
router.route("/updateUser").patch(authenticateUser, updateUser);

export default router;
