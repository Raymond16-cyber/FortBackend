import asyncHandler from "express-async-handler";
import User from "../model/userModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import formidable from "formidable";
import jwt from "jsonwebtoken";
import uploadImageToCloudinary from "../services/gcsUploader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Endpoint: Save image to public & update user
export const editProfileController = asyncHandler(async (req, res) => {
  const { fname, lname, bio, id, status } = req.body;

  const isUser = await User.findById(id);
  if (!isUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const updateData = {};
  if (fname) updateData.fname = fname.toLowerCase();
  if (lname) updateData.lname = lname.toLowerCase();
  if (bio) updateData.bio = bio;
  if (status) updateData.status = status;

  const changed = await User.findByIdAndUpdate(id, updateData, { new: true });

  const newToken = jwt.sign(
    {
      id: changed._id,
      email: changed.email,
      fname: changed.fname,
      lname: changed.lname,
      RegDate: changed.createdAt,
      image: changed.image,
      localImage: changed.localImage,
      bio: changed.bio,
      status: changed.status,
      organisation: changed.organisation,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  if (!changed) {
    return res.status(404).json({ error: "Failed to update user" });
  }
  console.log("User info updated", changed);
  res
    .status(200)
    .json({ message: "Profile updated", user: changed, token: newToken });
  console.log("User updated successfully", changed);
});

// edit profile pic
export const editProfilePicController = asyncHandler(async (req, res) => {
  console.log("In the profile pic controller");

  const senderID = req.myID;
  console.log("User ID:", senderID);

  const form = formidable({ multiples: false });
  form.parse(req, async (error, fields, files) => {
    if (error) {
      console.error("❌ Error parsing the image:", error);
      return res.status(400).json({ error: "Error parsing the image" });
    }

    console.log("fields", fields);
    console.log("files", files);

    const uploadedFile = files.profilepic?.[0];

    // Check file exists
    if (!uploadedFile || !uploadedFile.filepath) {
      console.error("❌ No uploaded file or filepath is missing", uploadedFile);
      return res.status(400).json({ error: "File upload failed or no file" });
    }

    try {
      // Read file buffer
      const fileBuffer = fs.readFileSync(uploadedFile.filepath);
      const originalName = uploadedFile.originalFilename;
      const mimetype = uploadedFile.mimetype;

      // Generate a unique filename for local storage
      const timestamp = Date.now();
      const fileExtension = path.extname(originalName);
      const localImageName = `${timestamp}_${originalName.replace(/\s+/g, "")}`;

      // Define the local save path
      const uploadsDir = path.join(
        __dirname,
        "../../client/public/userProfilePic"
      );
      const localImagePath = path.join(uploadsDir, localImageName);

      console.log("📤 Uploading to Cloudinary:", originalName);
      console.log("💾 Saving locally as:", localImageName);

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadImageToCloudinary(
        fileBuffer,
        originalName,
        mimetype
      );

      console.log("✅ Cloudinary upload successful:", cloudinaryUrl);

      // Save locally as backup/fallback
      try {
        // Ensure the uploads directory exists
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Copy the uploaded file to the local directory
        fs.copyFileSync(uploadedFile.filepath, localImagePath);
        console.log("✅ Local save successful:", localImagePath);
      } catch (localSaveError) {
        console.warn(
          "⚠️ Local save failed (continuing with Cloudinary only):",
          localSaveError.message
        );
      }

      // Update user record with Cloudinary URL (primary) and local path (fallback)
      const updatedUser = await User.findByIdAndUpdate(
        senderID,
        {
          image: cloudinaryUrl, // Primary: Cloudinary URL
          localImage: `/userProfilePic/${localImageName}`, // Fallback: Local path
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate new JWT token
      const newToken = jwt.sign(
        {
          id: updatedUser._id,
          email: updatedUser.email,
          fname: updatedUser.fname,
          lname: updatedUser.lname,
          RegDate: updatedUser.createdAt,
          image: updatedUser.image,
          localImage: updatedUser.localImage,
          bio: updatedUser.bio,
          status: updatedUser.status,
          organisation: updatedUser.organisation,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Clean up temp file
      fs.unlink(uploadedFile.filepath, (unlinkErr) => {
        if (unlinkErr) console.log("⚠️ Failed to delete temp file:", unlinkErr);
      });

      return res.status(200).json({
        message: "ProfilePic Updated Successfully",
        pic: updatedUser.image,
        user: updatedUser,
        token: newToken,
      });
    } catch (uploadError) {
      console.error("❌ Cloudinary upload failed:", uploadError);
      return res.status(500).json({
        error: "Image upload failed",
        details: uploadError.message,
      });
    }
  });
});

// Change Theme
export const changeThemeController = asyncHandler(async (req, res) => {
  console.log("hello");
  const { theme, MyId } = req.body;
  const isUser = await User.findByIdAndUpdate(
    MyId,
    {
      MyTheme: theme,
    },
    { new: true }
  );
  if (!isUser) {
    return res.status(404).json({
      error: "User not found",
    });
  }
  res.status(201).json({
    message: `Theme changed to ${theme}`,
    theme: theme,
    user: isUser,
  });
});
