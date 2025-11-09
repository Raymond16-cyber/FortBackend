import mongoose from "mongoose";

const FlashRoomMessageSchema = mongoose.Schema(
  {
    // Reference to the FlashRoom this message belongs to
    roomID: {
      type: mongoose.Schema.Types.String,
      ref: "FlashRoom",
      required: true,
    },
    senderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Sender of the message
    senderName: {
      type: mongoose.Schema.Types.String,
      ref: "User",
      required: true,
    },

    // Text or file content
    message: {
      text: {
        type: String,
        default: "",
      },
      image: {
        type: String,
        default: "",
      },
      file: {
        type: String,
        default: "",
      },
    },
    // Message status for read-based destruction
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  
  },
  {
    timestamps: true,
  }
);

const FlashRoomMessage = mongoose.model(
  "FlashRoomMessage",
  FlashRoomMessageSchema
);

export default FlashRoomMessage;
