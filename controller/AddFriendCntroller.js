import asyncHandler from "express-async-handler";
import User from "../model/userModel.js";

export const AddFriendController = asyncHandler(async (req, res) => {
  try {
    const { fname } = req.body;
    const currentUserId = req.myID; // assuming you use middleware to get logged in user
    console.log("oooooooo", currentUserId);

    const friend = await User.findOne({ fname: fname });
    if (!friend) return res.status(404).json({ message: "User not found" });
    if (friend.id === currentUserId) {
      return res.status(400).json({
        message: "Cannot add yorself",
      });
    }

    const user = await User.findById(currentUserId);
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: "Already added" });
    }

    user.friends.push(friend._id);
    await user.save();

    const updatedUser = await User.findById(currentUserId);
    res.json({ user: updatedUser });
    console.log(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

