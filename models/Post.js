import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
    imageSrc: { type: String, required: true },
    caption: { type: String, default: "" },
    like: { type: Array },
    comment: { type: Array },
    saveAcc: { type: Array },
    share: { type: Number, default: 0 },
    archive: { type: Boolean, default: false },
    showLikeCount: { type: Boolean, default: true },
    showComment: { type: Boolean, default: true },
    hashtag: { type: Array },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.model("Post", PostSchema);
