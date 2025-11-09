import asyncHandler from "express-async-handler";
import FlashRoom from "../../model/Rooms/FlashRoom/flashRoomModel.js";
import User from "../../model/userModel.js";
import FlashRoomMessage from "../../model/Rooms/FlashRoom/FlashRoomMessages.js";

export const FlashRoomController = asyncHandler(async (req, res) => {
  console.log("req.body", req.body);

  const {
    roomName,
    roomDescription,
    admin,
    roomDestructionDate,
    destructionType,
  } = req.body;
  const adminUser = await User.findById(admin);
  if (!adminUser) {
    return res.status(404).json({
      error: "Unable to authorize room admin",
    });
  }

  if (!roomName) {
    return res.status(400).json({
      error: "Room name is required",
    });
  }
  if (!roomDescription) {
    return res.status(400).json({
      error: "Room description is required",
    });
  }

  // Remove spaces before and after roomName and roomDescription
  const trimmedRoomName = roomName.trim();
  const trimmedRoomDescription = roomDescription.trim();

  const genRoomID =
    "qedv10ads4er1e2yr1rnfqwd09eGLI9dlqkH9skdjGFdsKnnks0O9m3sok0sdmMsndl230pom0smw0sO0molN43NINOor03n2i1nd09c10jvs12nc410b123n2ncdi1wkdlas01e3N92M10";
  let randomRoomID = "";

  for (let i = 0; i < 42; i++) {
    const randomIndex = Math.floor(Math.random() * genRoomID.length);
    randomRoomID += genRoomID[randomIndex];
  }

  const newFlashRoom = await FlashRoom.create({
    admin: adminUser,
    roomName: trimmedRoomName,
    roomDescription: trimmedRoomDescription,
    roomID: randomRoomID,
    destructionType: destructionType,
    roomDestructionDate: roomDestructionDate,
    isDestroyed: false,
    destroyedAt: null,
    allMembersRead: false,
    allowExport: false,
    isExported: false,
    members: [adminUser],
    messages: [],
  });

  return res.status(201).json({
    message: "Flash Room created successfully",
    flashRoom: newFlashRoom,
  });
});

// getting flash rooms for the current user
export const getFlashRoomsController = asyncHandler(async (req, res) => {
  const currentUserId = req.myID;
  console.log("Current User ID from request:", currentUserId);

  try {
    const flashRooms = await FlashRoom.find({
      members: { $in: [currentUserId] },
    })
      .populate("admin", "fname lname image email")
      .populate("members", "fname lname image email");

    if (!flashRooms || flashRooms.length === 0) {
      return res.status(200).json({
        error: "No flash rooms found for this user",
      });
    }

    console.log("flashrooms", flashRooms);
    res.status(200).json({
      message: "All flash rooms got successfully",
      flashRooms: flashRooms,
    });
  } catch (error) {
    console.error("Error fetching flash rooms:", error);
    res.status(500).json({ error: "Failed to load flash rooms" });
  }
});

export const getFlashRoomByIdController = asyncHandler(async (req, res) => {
  const currentUserId = req.myID;
  const { roomID } = req.query; // <-- get from params
  console.log("Fetching flash room with ID:", roomID, currentUserId);

  try {
    if (!currentUserId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }
    const user = await User.findById(currentUserId).populate(
      "fname lname image email"
    );
    const flashRoom = await FlashRoom.findOne({ roomID })
      .populate("admin", "fname lname image email")
      .populate("members", "fname lname image email");

    if (!flashRoom) {
      return res.status(200).json({
        error: "Flash room not found",
      });
    }
    console.log(
      "Current members in flashRoom:",
      flashRoom.members.map((m) => m.toString())
    );

    if (
      flashRoom.members.some(
        (member) => member._id.toString() === currentUserId.toString()
      )
    ) {
      return res.status(200).json({
        error: "You are already a member of this flash room",
      });
    }
    if (flashRoom.isDestroyed) {
      return res.status(200).json({
        error: "This flash room has been destroyed",
      });
    }
    flashRoom.members.push(currentUserId);
    await flashRoom.save();

    // 🛠️ Re-fetch with populated fields
    const updatedFlashRoom = await FlashRoom.findOne({ roomID })
      .populate("admin", "fname lname image email")
      .populate("members", "fname lname image email");

    res.status(200).json({
      message: `Successfully joined ${updatedFlashRoom.roomName}`,
      flashRoom: updatedFlashRoom,
      roomID: updatedFlashRoom.roomID,
      members: updatedFlashRoom.members,
    });
  } catch (error) {
    console.error("Error fetching flash room:", error);
    res.status(200).json({ error: "Failed to load flash room" });
  }
});

export const sendFlashRoomMessageController = asyncHandler(async (req, res) => {
  const { roomID, senderID, senderName, message } = req.body;
  const myID = req.myID;

  if (myID !== senderID) {
    return res.status(403).json({
      error: "You are not authorized to send messages in this room",
    });
  }
  const user = await User.findById(myID);

  if (!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }
  if (!roomID || !senderID || !message) {
    return res.status(400).json({
      error: "Room ID, sender ID, and message are required",
    });
  }
  const flashRoom = await FlashRoom.findOne({ roomID });

  if (!flashRoom) {
    return res.status(404).json({
      error: "Flash room not found",
    });
  }

  const newMessage = await FlashRoomMessage.create({
    roomID: flashRoom.roomID,
    senderID: user._id,
    senderName: user.fname,
    message: {
      text: message.text,
      image: "",
      file: "",
    },
    readBy: [],
  });

  // console.log("New message sent:", newMessage, flashRoom);
  return res.status(201).json({
    message: "Message sent successfully",
    newMessage: newMessage,
    flashRoom: flashRoom,
  });
});

// getting flash room messages for the user
export const getFlashRoomsMessagesController = asyncHandler(
  async (req, res) => {
    const currentUserId = req.myID;
    console.log("Current User ID from request:", currentUserId);

    try {
      // Find all flash rooms the user is a member of
      const flashRooms = await FlashRoom.find({
        members: { $in: [currentUserId] },
      }).lean();

      if (!flashRooms || flashRooms.length === 0) {
        return res.status(200).json({
          error: "No flash rooms found for this user",
        });
      }

      // Collect all roomIDs
      const roomIDs = flashRooms.map((room) => room.roomID);

      // Find all messages for these roomIDs
      const messages = await FlashRoomMessage.find({ roomID: { $in: roomIDs } })
        .populate("senderID", "fname lname image email")
        .sort({ createdAt: 1 }) // <-- oldest first
        .lean();

      console.log("All flash room messages for user:", messages);

      res.status(200).json({
        message: "All flash room messages retrieved successfully",
        messages: messages,
      });
    } catch (error) {
      console.error("Error fetching flash room messages:", error);
      res.status(500).json({ error: "Failed to load flash room messages" });
    }
  }
);

export const checkDestroyedFlashRoom = asyncHandler(async (req, res) => {
  // Use req.params if your route is /flash-room/:roomID/check-destroyed
  const roomID = req.query.roomID || req.params.roomID;
  console.log("Checking if flash room is destroyed with ID:", roomID);

  const flashRoom = await FlashRoom.findOne({ roomID });

  if (!flashRoom) {
    return res.status(404).json({
      message: "Flash room not found",
      isDestroyed: true,
    });
  }

  const checkingDate = new Date();

  if (flashRoom.isDestroyed || flashRoom.roomDestructionDate < checkingDate) {
    if (!flashRoom.isDestroyed) {
      flashRoom.isDestroyed = true;
      flashRoom.destroyedAt = checkingDate;
      await flashRoom.save();
      console.log("Flash room has been destroyed:", flashRoom);
    }
    return res.status(200).json({
      message: "This flash room has been destroyed",
      isDestroyed: true,
      roomID: flashRoom.roomID,
    });
  }

  return res.status(200).json({
    message: "This flash room is still active",
    isDestroyed: false,
  });
});

export const deleteFlashRoomController = asyncHandler(async (req, res) => {
  const { roomID } = req.params;
  const myID = req.myID;

  if (!roomID) {
    return res.status(400).json({
      error: "Room ID is required",
    });
  }

  const flashRoom = await FlashRoom.findOneAndDelete({ roomID });

  if (!flashRoom) {
    return res.status(404).json({
      error: "Flash room not found",
    });
  }

  if (flashRoom.admin.toString() !== myID) {
    return res.status(403).json({
      error: "You are not authorized to delete this flash room",
    });
  }

  console.log("Flash room deleted successfully");
  console.log("Deleted flash room details:", flashRoom.roomID);

  return res.status(200).json({
    message: "Flash room deleted successfully",
    roomID: flashRoom.roomID,
  });
});

// add to flasroom
export const addMemberToFlashRoom = asyncHandler(async (req, res) => {
  const { roomID, members } = req.body;
  console.log("Adding members to flash room:", roomID, members);

  if (!roomID || !Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ error: "Invalid data provided" });
  }

  // Fetch flash room
  const flashRoom = await FlashRoom.findOne({ roomID });
  if (!flashRoom) {
    return res.status(404).json({ error: "Flash room not found" });
  }

  // Extract existing member IDs
  const existingIds = flashRoom.members.map((m) => m.toString());

  // check if addedfriends were removed recently and removed them from flashroom.removedContacts
  const removedContacts = flashRoom.removedContacts?.map((m) => m.toString());
  const filteredAddedFriends = members.filter((friend) =>
    removedContacts.includes(friend._id.toString())
  );

  // if they were removed, remove them from removedContacts
  if (filteredAddedFriends.length > 0) {
    flashRoom.removedContacts = flashRoom.removedContacts.filter(
      (contact) =>
        !filteredAddedFriends.some(
          (friend) => friend._id.toString() === contact.toString()
        )
    );
    await flashRoom.save();
  }

  // map added friends and populate them to send to frontend
  const addedFriendsWithDetails = await User.find({
    _id: { $in: members.map((friend) => friend._id.toString()) },
  });

  // Filter out already existing members and extract only _id
  const newMemberIDs = members
    .map((friend) => friend._id)
    .filter((id) => !existingIds.includes(id.toString()));
  console.log("hwere o", newMemberIDs);

  // Push only new ObjectIDs
  flashRoom.members.push(...newMemberIDs);
  await flashRoom.save();

  // Populate members for frontend
  const updatedRoom = await FlashRoom.findById(flashRoom._id).populate(
    "members"
  );

  console.log("Members added successfully");

  res.status(200).json({
    message: "success",
    members: updatedRoom.members,
    roomID: updatedRoom.roomID,
    flashroom: flashRoom,
  });
});

export const deleteMemberFromFlashRoom = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const { roomID } = req.body;

  console.log(req.body,req.params, req.query);
  const memberToRemove = await User.findById(memberId);

  if (!memberToRemove) {
    return res.status(404).json({
      error: "Member not found",
    });
  }

  const flashRoom = await FlashRoom.findOne({ roomID });
  console.log(flashRoom);

  if (!flashRoom) {
    return res.status(404).json({
      error: "unable to remove member as flashRoom was not found",
    });
  }

  flashRoom.members = flashRoom.members.filter(
    (member) => member.toString() !== memberToRemove._id.toString()
  );
  flashRoom.removedContacts.push(memberToRemove._id);
  // add the roomId to removed contects to differentiate between different rooms
  flashRoom.removedContacts = flashRoom.removedContacts.map((contact) => {
    return {
      _id: contact._id,
      roomID: flashRoom.roomID,
    };
  });

  await flashRoom.save();
  const updatedRemovedContacts = await FlashRoom.findOne({
    roomID,
  }).populate("removedContacts");
  const updatedRoom = await FlashRoom.findById(flashRoom._id).populate(
    "members"
  );
  console.log(
    "member successfully removed,new members: ",
    updatedRemovedContacts.removedContacts
  );
  res.status(200).json({
    message: `Successfully deleted ${memberToRemove.fname} from ${flashRoom.roomName}`,
    newMembers: updatedRoom.members,
    removedContacts: updatedRemovedContacts.removedContacts,
  });
});
