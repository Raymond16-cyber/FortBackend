import mongoose from "mongoose";

const archiveChatsSchema = mongoose.Schema(
  {
    archivedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId },
        summary: { type: String },
      },
    ],
    friendId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    archivedAt: { type: Date, default: Date.now() },
  },
  {
    timestamps: true,
  }
);

const archivedChats = mongoose.model("archiveChats", archiveChatsSchema);

export default archivedChats;
