import asyncHandler from "express-async-handler";
import User from "../model/userModel.js";
import archivedChats from "../model/archiveChatModel.js";

export const getArchivesController= asyncHandler(async (req, res) => {
  console.log("getting archived chats");
  const myId = req.myID;
  const isMe = await User.findById(myId);
  if (!isMe) {
    return res.status(400).json({
      error: "Unable to authorize user",
    });
  }
//   get all archives that the archiver is user's ID
const allMyArchives = await archivedChats.find({"archivedBy.0.userId":{$eq: myId.toString()}}).populate("friendId", "fname lname email image bio")
console.log("my archives",allMyArchives)
res.status(200).json({
    message: "Gotten all archives",
    myArchives: allMyArchives
})
})
export const archiveChatController = asyncHandler(async (req, res) => {
  console.log("archiving a chat");
  const { friendId } = req.params;
  console.log(friendId, "");
  const myId = req.myID;

  const isMe = await User.findById(myId);
  const isFriend = await User.findById(friendId);
  if (!isMe) {
    return res.status(400).json({
      error: "Unable to authorize user",
    });
  }
  if (!isFriend) {
    return res.status(400).json({
      error: "Couldn't find anyone to archive",
    });
  }
  // if authorized:
  const newArchive = await archivedChats.create({
    archivedBy: [
      {
        userId: isMe._id,
        summary: "",
      },
    ],
    friendId: isFriend._id,
    archivedAt: Date.now(),
  });
  console.log("archived chat created",newArchive)
//   also add the newarchived id t the user archived Chats,first get archived chat
const archivechat = await archivedChats.findById(newArchive._id)
console.log("archive chat gotten",archivechat)
// then push to the user's archived lists
await isMe.archivedChats.push(archivechat._id)
await isMe.save()
console.log("success",isMe?.archivedChats)
return res.status(200).json({
    message: `Successfully archived ${isFriend?.fname}`,
    myArchives: archivechat,
    friendId:friendId
})

});
