import Messages from "../model/messageModel.js";
import User from "../model/userModel.js";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const sendMessageController = async (req, res) => {
  const { senderName, receiverID, message } = req.body;
  const senderID = req.myID;
  console.log("Sender ID:", senderID);

  try {
    const insertMessage = await Messages.create({
      senderName: senderName,
      senderID: senderID,
      receiverID: receiverID,
      message: {
        text: message?.text || "",
        image: message?.image || "",
      },
    });

    res.status(201).json({
      success: "true",
      message: insertMessage,
    });
  } catch (error) {
    res.status(500).json({
      error: "An error occured while sending your message",
      error: error,
    });
  }
};

export const getMessageController = async (req, res) => {
  const myID = req.myID;
  const friendID = req.params.friendid;
  console.log(friendID);
  // console.log("friend",friendID);

  try {
    const getAllMessages = await Messages.find({
      $or: [
        {
          $and: [
            {
              senderID: {
                $eq: myID,
              },
            },
            {
              receiverID: {
                $eq: friendID,
              },
            },
          ],
        },
        {
          $and: [
            {
              senderID: {
                $eq: friendID,
              },
            },
            {
              receiverID: {
                $eq: myID,
              },
            },
          ],
        },
      ],
    });

    console.log(getAllMessages);
    res.status(200).json({
      success: true,
      messages: getAllMessages,
    });
  } catch (error) {
    res.status(400).json({
      error: "Unable to get Messages",
    });
  }
};

// sending images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendImageController = async (req, res) => {
  const senderID = req.myID;
  const form = formidable();

  form.parse(req, async (error, fields, files) => {
    console.log("FIELDS:", fields);
    console.log("FILES:", files.originalFilename);
    if (error) {
      return res.status(400).json({ message: "Error parsing the image" });  
    }

    const senderName = fields.senderName?.[0];
    const receiverID = fields.receiverID?.[0];
    const imageName = fields.imageName?.[0];

    const file = files.image?.[0]; // ✅ safely grab the first file in the array

    if (!file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const newPath = path.join(
      __dirname,
      `../../client/public/userSentImages/${imageName}`
    );

    file.originalFilename = imageName;

    try {
      fs.copyFile(file.filepath, newPath, async (err) => {
        if (err) {
          return res.status(500).json({
            error: "Image Upload Failed",
          });
        } else {
          const insertMessage = await Messages.create({
            senderName: senderName,
            senderID: senderID,
            receiverID: receiverID,
            message: {
              text: "",
              image: file.originalFilename || "",
            },
          });

          res.status(201).json({
            success: "true",
            message: insertMessage,
          });
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Error uploading this file" });
    }
  });
};

export const seenMessageController = async (req, res) => {
  const messageID = await req.body?._id;
  console.log("Message ID:", messageID);

  await Messages.findByIdAndUpdate(messageID, {
    status: "seen",
  })
    .then(() => {
      // console.log("Message seen successfully");
      res.status(200).json({
        success: true,
        
      });
    })
    .catch(() => {
      res.status(500).json({
        error: "Message not seen due to an error",
      });
    });
};


export const deliverMessageController = async (req, res) => {
  const messageID = await req.body?._id;
  console.log("Message ID:", messageID);

  await Messages.findByIdAndUpdate(messageID, {
    status: "delivered",
  })
    .then(() => {
      console.log("Message delivered successfully");
      res.status(200).json({
        success: true,
        
      });
    })
    .catch(() => {
      res.status(500).json({
        error: "Message not delivered due to an error",
      });
    });
};
