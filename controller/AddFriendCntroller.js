import asyncHandler from "express-async-handler";
import User from "../model/userModel.js";

export const AddFriendController = asyncHandler(async (req, res) => {
  const { fname } = req.body;
  const currentUserId = req.myID;

  const friendName = fname.toLowerCase().trim();
  const friend = await User.findOne({ fname: friendName });
  if (!friend) return res.status(404).json({ message: "User not found" });

  if (friend._id.equals(currentUserId)) {
    return res.status(400).json({ message: "Cannot add yourself" });
  }

  const user = await User.findById(currentUserId);
  if (user.friends.includes(friend._id)) {
    return res.status(400).json({ message: "Already added" });
  }

  user.friends.push(friend._id);
  await user.save();

  const updatedUser = await User.findById(currentUserId).populate(
    "friends",
    "_id fname email"
  );

  const formattedFriends = updatedUser.friends.map(friend => ({
    friendInfo: friend,
    messageInfo: {},
  }));

  res.json({ friends: formattedFriends });
});
