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
const deleteFriendMessage = async (currentUserId, friendID) => {
  const msg = await Messages.deleteMany({
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
  });

  return msg;
};

export const getFriendsController = asyncHandler(async (req, res) => {
  const currentUserId = req.myID;
  console.log("from cont...", currentUserId);

  let friendMessage = [];
  let fullBlockedContacts = [];

  try {
    const user = await User.findById(currentUserId)
      .populate({
        path: "friends",
        select: "fname email lname image bio status organisation settings",
        populate: {
          path: "settings",
          select: "PrivacySecurity",
        },
      })
      .populate(
        "blockedFriends",
        "fname email lname image bio status organisation "
      )
      .populate("settings", "PrivacySecurity");

    // loop through blovked contacts

    for (let i = 0; i < user.blockedFriends.length; i++) {
      deleteFriendMessage(currentUserId, user.blockedFriends[i]._id);
      fullBlockedContacts = [
        ...fullBlockedContacts,
        {
          friendInfo: user.blockedFriends[i],
          messageInfo: null,
        },
      ];
    }
    const myBlockedBy = await User.findById(currentUserId).populate(
      "blockedBy",
      "fname lname email organisation image blockedContacts"
    );
  
    console.log("full blocked contacts ");
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

    res.status(200).json({
      friends: friendMessage,
      blockedContacts: fullBlockedContacts,
      myBlockedByList: myBlockedBy?.blockedBy,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load friends" });
  }
});

export const getAllUsersController = asyncHandler(async (req, res) => {
  console.log("all good");
  const allUsers = await User.find();
  if (!allUsers) {
    return res.status(404).json({
      error: "Unable to get Users",
    });
  }

  // console.log("all users is: ", allUsers);
  res.status(200).json({
    message: "Users got successfully",
    users: allUsers,
  });
});

export const blockFriendController = asyncHandler(async (req, res) => {
  console.log("attempting to bock a user");
  const { friendId } = req.params;
  const myID = req.myID;

  const isUser = await User.findById(myID);
  const isFriend = await User.findById(friendId);
  if (!friendId || !isFriend) {
    return res.status(401).json({
      message: "There was no sufficient information to block this user",
    });
  }
  if (!myID || !isUser) {
    return res.status(404).json({
      message: "You are currently unable to block ths user at the moment",
    });
  }
  // filter out the to be blocked friends's Id
  const myNewFriends = isUser.friends.filter(
    (friend) => !friend.toString().includes(isFriend._id.toString())
  );

  isUser.friends = myNewFriends;
  await isUser.blockedFriends.push(isFriend._id);
  await isUser.save();

  // also add the blocker to the friend's BlockedBy list
  isFriend.blockedBy.push(isUser._id);
  await isFriend.save();
  // get the blockedBy list of the user by refetching the friend
  const myFriend = await User.findById(friendId).populate(
    "blockedBy",
    "fname lname email organisation image blockedContacts"
  );

  console.log("blocked successfully ,new friends", myFriend.blockedBy);
  res.status(200).json({
    message: `successfully blocked ${isFriend.fname}`,
    blockedContact: isFriend,
    blockedFriendId: isFriend?._id.toString(),
    newFriends: myNewFriends,
    myBlockedByList: myFriend?.blockedBy,
  });
});

export const unblockFriendController = asyncHandler(async (req, res) => {
  const { friendId } = req.params;
  console.log("friend id", friendId);
  const myId = req.myID;
  const myFriend = await User.findById(friendId.toString());
  const isMe = await User.findById(myId)
    .populate("friends", "fname email lname image bio status organisation")
    .populate(
      "blockedFriends",
      "fname email lname image bio status organisation"
    );
  console.log(isMe);
  if (!myId || !isMe) {
    return res.status(404).json({
      error: "There was an error authorizing your account",
    });
  }
  if (!friendId) {
    return res.status(404).json({
      error: "Unable to find friend to unblock",
    });
  }
  // remove from blocked contacts
  const myNewBlockedFriends = isMe.blockedFriends.filter(
    (friend) => friend._id.toString() !== friendId.toString()
  );

  isMe.blockedFriends = myNewBlockedFriends;
  // add to friend list
  isMe.friends.push(myFriend._id);
  await isMe.save();

  // Refetch user with populated friends to get consistent data
  const updatedUser = await User.findById(myId).populate(
    "friends",
    "fname email lname image bio status organisation"
  );

  console.log("Updated user friends:", updatedUser.friends);

  // filter out the locker id from friends blockedBy
  const newBlockedBy = myFriend.blockedBy.filter(
    (id) => id.toString() !== isMe._id.toString()
  );
  // also remove the blocker from the friend's blockedBy
  myFriend.blockedBy = newBlockedBy;
  await myFriend.save();

  const alsoFriend = await User.findById(friendId.toString()).populate(
    "blockedBy",
    "fname lname email organisation image blockedContacts"
  );
  let newFriends = {};

  newFriends = {
    friendInfo: myFriend,
    messageInfo: null,
  };

  console.log(`Successfully unblocked ${myFriend.fname}`);
  res.status(200).json({
    message: `Successfully unblocked ${myFriend._id}`,
    newFriend: newFriends,
    unBlockedFriendId: myFriend._id,
    blockedByIdToRemove: isMe._id.toString(),
  });
});
