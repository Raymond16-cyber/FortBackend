import FriendRequest from "../model/friendRequestModel.js";
import asyncHandler from "express-async-handler"


export const sendFriendRequest = asyncHandler(async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.myID;
  console.log("naaa",senderId);
  

  if (senderId === receiverId) return res.status(400).json({ message: "Can't add yourself." });

  // check if already sent
  const existing = await FriendRequest.findOne({ senderId, receiverId });
  if (existing) return res.status(400).json({ message: "Friend request already sent." });

  const senderUser = await User.findById(senderId);
  const newRequest = await FriendRequest.create({
    senderId,
    senderName: senderUser.fname,
    receiverId,
  });

  res.status(201).json(newRequest);
});


export const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  const userId = req.myID;

  const request = await FriendRequest.findById(requestId);
  if (!request || request.receiverId !== userId)
    return res.status(400).json({ message: "Request not found or unauthorized" });

  request.friendRequest = "accepted";
  await request.save();

  // add to both users
  const sender = await User.findById(request.senderId);
  const receiver = await User.findById(userId);

  if (!sender.friends.includes(receiver._id)) sender.friends.push(receiver._id);
  if (!receiver.friends.includes(sender._id)) receiver.friends.push(sender._id);

  await sender.save();
  await receiver.save();

  res.json({ message: "Friend request accepted", sender, receiver });
});


//  block friend
export const blockUserRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  const userId = req.myID;

  const request = await FriendRequest.findById(requestId);
  if (!request || request.receiverId !== userId) {
    return res.status(404).json({ message: "Request not found or not yours" });
  }

  request.friendRequest = "blocked";
  await request.save();

  res.status(200).json({ message: "User blocked", request });
});

