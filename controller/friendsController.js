import asyncHandler from "express-async-handler";
import User from "../model/userModel.js";
import Messages from "../model/messageModel.js";

const getLastMessage = async (currentUserId, friendID) => {
  const msg = await Messages.findOne({
    $or: [
      {
        $and: [
          { senderID: { $eq: currentUserId } },
          { receiverID: { $eq: friendID } },
        ],
      },
      {
        $and: [
          { senderID: { $eq: friendID } },
          { receiverID: { $eq: currentUserId } },
        ],
      },
    ],
  }).sort({ updatedAt: -1 });

  return msg;
};

export const getFriendsController = asyncHandler(async (req, res) => {
  const currentUserId = req.myID;
  // console.log("from cont...",currentUserId);
  
  let friendMessage = [];

  try {
    const user = await User.findById(currentUserId).populate(
      "friends",
      "fname email lname image bio status"
    );

    for (let i = 0; i < user.friends.length; i++) {
      let msg = await getLastMessage(currentUserId, user.friends[i]._id);
      friendMessage = [
        ...friendMessage,
        {
          friendInfo: user.friends[i],
          messageInfo: msg,
        },
      ];

      // console.log("new friendMessage:", friendMessage);
    }

    res.json({ friends: friendMessage });
  } catch (error) {
    res.status(500).json({ message: "Failed to load friends" });
  }
});
