import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    senderID: {
      type: String,
      required: true,
   
    },
    senderName: {
      type: String,
      required: true,
    },
    receiverID: {
      type: String,
      required: true,
    },
    message: {
      text: {
        type: String,
        default: ""
      },
      image: {
        type: String,
        default: "",
      },
    },
    status: {
      type: String,
      default: "unseen",
    },
  },
  {
    timestamps: true,
  }
);

const Messages = mongoose.model("Messages", messageSchema);

export default Messages;
