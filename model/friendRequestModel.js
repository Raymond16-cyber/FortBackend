import mongoose, { mongo } from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    senderName: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    friendRequest: {
      type: String,
      enum: ["pending", "accepted", "declined", "blocked"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const FriendRequest = new mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;
