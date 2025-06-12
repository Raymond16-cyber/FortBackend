import asyncHandler from "express-async-handler";
import User from "../model/userModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import formidable from "formidable";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Endpoint: Save image to public & update user
export const editProfileController = asyncHandler(async (req, res) => {
  const { fname, lname, bio, id,status } = req.body;

  const isUser = await User.findById(id);
  if (!isUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const updateData = {};
  if (fname) updateData.fname = fname.toLowerCase();
  if (lname) updateData.lname = lname.toLowerCase();
  if (bio) updateData.bio = bio;
  if(status) updateData.status = status

  const changed = await User.findByIdAndUpdate(id, updateData, { new: true });

  const newToken = jwt.sign(
    {
      id: changed._id,
      email: changed.email,
      fname: changed.fname,
      lname: changed.lname,
      RegDate: changed.createdAt,
      image: changed.image,
      bio: changed.bio,
      status: changed.status
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  if (!changed) {
    return res.status(404).json({ error: "Failed to update user" });
  }
  console.log("User info updated", changed);
  res.status(200).json({ message: "Profile updated", user: changed, token: newToken });
  console.log("User updated successfully", changed);
});

// edit profile pic

export const editProfilePicController = asyncHandler(async (req, res) => {
  console.log("In the controller");

  const senderID = req.myID;
  console.log("User ID:", senderID);

  const form = formidable({ multiples: false });
  form.parse(req, async (error, fields, files) => {
    if (error) {
      return res.status(400).json({ error: "Error parsing the image" });
    }

    console.log("fields", fields);

    console.log("files", files);

    const uploadedFile = files.profilepic[0];

    // Check file exists
    if (!uploadedFile || !uploadedFile.filepath) {
      console.error("❌ No uploaded file or filepath is missing", uploadedFile);
      return res.status(400).json({ error: "File upload failed or no file" });
    }

    const imageName = fields.imageName?.[0];
    const tempFilePath = uploadedFile.filepath;

    const newFilePath = path.join(
      __dirname,
      `../../front-end/public/userProfilePic/${imageName}`
    );

    // ✅ Copy file
    fs.copyFile(tempFilePath, newFilePath, async (err) => {
      if (err) {
        console.error("❌ Failed to copy file:", err);
        return res.status(500).json({ error: "Image Upload Failed" });
      }

      // ✅ Update user record
      const updatedUser = await User.findByIdAndUpdate(
        senderID,
        { image: imageName },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const newToken = jwt.sign(
        {
          id: updatedUser._id,
          email: updatedUser.email,
          fname: updatedUser.fname,
          lname: updatedUser.lname,
          RegDate: updatedUser.createdAt,
          image: updatedUser.image,
          bio: updatedUser.bio,
           status: updatedUser.status
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        message: "ProfilePic Updated Successfully",
        pic: updatedUser.image,
        token: newToken,
      });
    });
  });
});
