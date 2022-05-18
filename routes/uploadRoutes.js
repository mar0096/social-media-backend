import express from "express";
const router = express.Router();
import { uploadImage } from "../controllers/uploadsController.js";
import { authenticateUser } from "../middleware/authentication.js";

router.route("/image").post(authenticateUser, uploadImage);

export default router;
