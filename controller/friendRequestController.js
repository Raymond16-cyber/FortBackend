import FriendRequest from "../model/friendRequestModel.js";
import User from "../model/userModel.js";
import asyncHandler from "express-async-handler";

// get all friendrequests
export const getAllFriendRequests = asyncHandler(async (req, res) => {
  const myID = req.myID;
  console.log("hitting getallfriend requests");
  if (!myID) {
    return res.status(404).json({
      error: "Your access is unauthorized",
    });
  }

  const friendRequests = await FriendRequest.find({
    $or: [
      {
        $and: [{ senderId: { $eq: myID } }],
      },
      {
        $and: [{ receiverId: { $eq: myID } }],
      },
    ],
  })
    .populate("senderId", "fname lname image email")
    .populate("receiverId", "fname lname image email");
  if (!friendRequests) {
    return res.status(400).json({
      error: "unable to retrieve friend requests at the moment",
    });
  }
  // const pendingFriendRequest = friendRequests.filter((request) => request.requestStatus === "pending")
  // console.log("new fffff",pendingFriendRequest)

  // console.log("all friend request gotten",friendRequests);
  res.status(200).json({
    message: "Friend request retrieved successfully",
    friendRequests: friendRequests,
  });
});

export const sendFriendRequest = asyncHandler(async (req, res) => {
  const { receiverID } = req.params;
  const { senderId } = req.body;
  console.log(req.params);
  const myID = req.myID;
  if (!myID) {
    return res.status(400).json({
      error: "You cannot add friends at the moment ",
    });
  }
  if (senderId !== myID) {
    return res.status(400).json({
      error: "You are not authorized to add friends at the moment ",
    });
  }

  if (!receiverID) {
    return res.status(404).json({
      error: "This user's account was not found ",
    });
  }
  if (senderId === receiverID) {
    return res.status(400).json({
      error: "You cannot add yourself ",
    });
  }

  const isSender = await User.findById(senderId);
  const isReceiver = await User.findById(receiverID);
  if (!isSender || !isReceiver) {
    return res.status(404).json({
      error: "You cannot add friends at the moment ",
    });
  }

  const existingRequest = await FriendRequest.findOne({
    $or: [
      { senderId: myID, receiverId: receiverID },
      { senderId: receiverID, receiverId: myID },
    ],
  });

  if (existingRequest) {
    return res.status(400).json({
      error: "You already have an active friend request with this user.",
    });
  }

  // success
  const newFriendRequest = await FriendRequest.create({
    senderName: isSender?.fname,
    senderId,
    receiverId: receiverID,
    requestStatus: "pending",
  });

  const populatedRequest = await newFriendRequest.populate([
    { path: "senderId", select: "fname lname email image" },
    { path: "receiverId", select: "fname lname email image" },
  ]);

  console.log("successfully sent a request");

  res.status(201).json({
    message: `Friend request sent to ${isReceiver?.fname}`,
    request: populatedRequest,
  });
});

// cancel a friendRequest by the sender
export const cancelFriendRequestController = asyncHandler(async (req, res) => {
  console.log("cancelling a friend request");
  const { requestId } = req.params;

  if (!requestId) {
    return res.status(404).json({
      error:
        "Unable to retrieve relative information for deleting this request",
    });
  }

  const isFriendRequest = await FriendRequest.findByIdAndDelete(requestId);

  if (!isFriendRequest) {
    return res.status(404).json({
      error:
        "This friendRequest is no longer available or it may have been deleted by You",
    });
  }
  console.log("Your friend request has been deleted");
  return res.status(200).json({
    message: "friend request deleted successfully",
    requestId,
  });
});

export const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  console.log("accepting a reqquest for: ", requestId);
  const userId = req.myID;

  const request = await FriendRequest.findById(requestId);
  if (!request || request.receiverId.toString() !== userId.toString())
    return res
      .status(400)
      .json({ message: "Request not found or unauthorized" });

  request.requestStatus = "accepted";
  await request.save();

  console.log(request);
  // add to both users
  const sender = await User.findById(request.senderId);
  const receiver = await User.findById(userId);

  if (!sender.friends.includes(receiver._id)) sender.friends.push(receiver._id);
  if (!receiver.friends.includes(sender._id)) receiver.friends.push(sender._id);

  await sender.save();
  await receiver.save();

  res.json({
    message: "Friend request accepted",
    sender,
    receiver,
    requestId: requestId,
  });
});

//  block friend
export const blockUserRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  console.log("request for blocking: ", requestId);
  const userId = req.myID;

  const request = await FriendRequest.findById(requestId);
  if (!request || request.receiverId.toString() !== userId) {
    return res.status(404).json({ message: "Request not found or not yours" });
  }

  request.requestStatus = "blocked";
  await request.save();

  console.log("user blocked");
  res
    .status(200)
    .json({ message: "User blocked", requestId: requestId, request: request });
});
