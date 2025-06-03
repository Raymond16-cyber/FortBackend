import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    friendName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Friend", friendSchema);
