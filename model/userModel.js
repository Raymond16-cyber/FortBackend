import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    pword: {
      type: String,
      required: true,
      select: false,
    },
    confirmPword: {
      type: String,
      required: true,
    },
    rememberMe: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "",
    },
    localImage: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "Lets Chat on fort....😁",
    },
    status: {
      type: String,
    },
    MyTheme: {
      type: String,
      default: "LightMode",
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blockedFriends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blockedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    roomID: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FlashRoom",
      },
    ],
    organisation: {
      type: String,
      default: "",
    },
    settings: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Settings",
    },
    archivedChats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "archiveChats",
      },
    ],
    passwordResetCode: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    // Flag set after a user successfully verifies the reset code; required before password change
    passwordResetVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
