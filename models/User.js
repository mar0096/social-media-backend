import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide name"],
      minlength: 3,
      maxlength: 30,
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      maxlength: 30,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      validate: {
        validator: validator.isEmail,
        message: "Please provide valid email",
      },
      maxlength: 30,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: 8,
      maxlength: 30,
      select: false,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    category: {
      type: String,
      default: "",
    },
    follower: {
      type: Array,
      default: [],
    },

    following: {
      type: Array,
      default: [],
    },
    followRequest: {
      type: Array,
      default: [],
    },
    posts: {
      type: Array,
      default: [],
    },
    savePosts: {
      type: Array,
      default: [],
    },
    profileImage: {
      type: String,
      default: "",
    },
    private: {
      type: Boolean,
      default: false,
    },
    hashtag: {
      type: Array,
      default: [],
    },
  },
  { minimize: false }
);
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

export default mongoose.model("User", UserSchema);
