import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../model/userModel.js";
import formidable from "formidable";
import validator from "validator";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import {
  sendPasswordChangeNotification,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "./emailController.js";
import { sendMail } from "../services/nodemailer.js";
import Settings from "../model/userSettingsModal.js";

// Registering the user //
export const userRegisterController = asyncHandler((req, res) => {
  const form = formidable();

  console.log("🔍 Hitting userRegisterController");

  form.parse(req, async (err, fields) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ message: "Error parsing the form data" });
    }

    console.log("✅ Inside formidable parse");
    console.log("📦 Fields received:", fields);

    const {
      fname: [fname] = [""],
      lname: [lname] = [""],
      email: [email] = [""],
      password: [pword] = [""],
      confirmPassword: [confirmPword] = [""],
      remember: [rememberMe] = ["false"],
    } = fields;

    // ✅ Optional validation (if needed)
    const errors = [];
    if (!fname) errors.push("First name is required.");
    if (!lname) errors.push("Last name is required.");
    if (!email) errors.push("Email is required.");
    if (email === "uchennaraymond70@gmail.com")
      errors.push("You have been blocked");
    if (!validator.isEmail(email)) errors.push("Invalid email format.");
    if (!pword || !confirmPword)
      errors.push("Password and confirmation are required.");
    if (pword !== confirmPword) errors.push("Passwords do not match.");

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    try {
      const userExists = await User.findOne({ email: email });

      if (userExists) {
        return res.status(400).json({
          error: "User with this email already exists",
        });
      }

      const newFname = fname.toLowerCase().trim();
      const newLname = lname.toLowerCase().trim();

      const hashedPassword = await bcrypt.hash(pword, 10);
      const hashedConfirmPassword = await bcrypt.hash(confirmPword, 10);
      // also create user settings
      const newUser = await User.create({
        fname: newFname,
        lname: newLname,
        email: email,
        pword: hashedPassword,
        confirmPword: hashedConfirmPassword,
        rememberMe,
        image: "",
        bio: "Lets Chat on fort....😁",
        status: "",
        MyTheme: "LightMode",
      });
      const isUserSettings = await Settings.create({
        user: newUser._id,
        PrivacySecurity: [
          {
            ProfileVisibility: true,
            readReceipts: true,
            twoFactorAuth: false,
          },
        ],
        NotificationPreference: [
          {
            PushNotifications: false,
            vibrate: true,
            muteChats: false,
          },
        ],
        archiveChats: [
          {
            monthlyArchive: false,
            unarchiveOnMessage: true,
            generateArchiveSummary: true,
          },
        ],
      });
      newUser.settings = isUserSettings._id;
      await newUser.save();
      const simplifiedSettings = {
        _id: isUserSettings._id,
        user: isUserSettings.user,
        ProfileVisibility: isUserSettings.PrivacySecurity[0].ProfileVisibility,
        ReadReceipts: isUserSettings.PrivacySecurity[0].readReceipts,
        TwoFactorauth: isUserSettings.PrivacySecurity[0].twoFactorAuth,
        PushNotification:
          isUserSettings.NotificationPreference[0].PushNotifications,
        MuteChats: isUserSettings.NotificationPreference[0].muteChats,
        Vibration: isUserSettings.NotificationPreference[0].vibrate,
        isMonthlyArchived: isUserSettings.archiveChats[0].monthlyArchive,
        UnarchiveOnMessage: isUserSettings.archiveChats[0].unarchiveOnMessage,
        GenerateSummary: isUserSettings.archiveChats[0].generateArchiveSummary,
      };
      console.log("created user settings alongside");

      // Auto-add Fort Team members as friends for new users
      try {
        const fortTeamMembers = await User.find({ organisation: "fortTeam" });

        if (fortTeamMembers && fortTeamMembers.length > 0) {
          // Add Fort Team members to new user's friends list
          const fortTeamIds = fortTeamMembers.map((member) => member._id);
          newUser.friends.push(...fortTeamIds);
          await newUser.save();

          // Add new user to Fort Team members' friends lists
          await User.updateMany(
            { organisation: "fortTeam" },
            { $addToSet: { friends: newUser._id } }
          );

          console.log(
            `✅ Auto-added ${fortTeamMembers.length} Fort Team members as friends for new user: ${newUser.email}`
          );
        }
      } catch (friendError) {
        console.error("⚠️ Error auto-adding Fort Team friends:", friendError);
        // Don't fail registration if friend-adding fails
      }

      const token = jwt.sign(
        {
          id: newUser._id,
          email: newUser.email,
          fname: newUser.fname,
          lname: newUser.lname,
          RegDate: newUser.createdAt,
          image: "",
          localImage: "",
          bio: newUser.bio,
          status: newUser.status,
          organisation: newUser.organisation,
          Theme: newUser.MyTheme,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h" || process.env.JWT_EXPIRES_IN,
        }
      );

      const cookieOptions = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        // httpOnly: true,
      };
      //   res.status(201).cookie("userToken", token, cookieOptions);
      //   console.log("✅ Registration complete successfully");
      //   console.log(token);

      sendWelcomeEmail(req, res, newUser?.email, newUser?.fname);
      return res.status(201).cookie("userToken", token, cookieOptions).json({
        successMessage: "User registered successfully✅✅",
        token,
        newUser,
        userSettings: simplifiedSettings,
      });
    } catch (error) {
      console.error("🔥 Error during registration:", error);
      return res.status(500).json({
        error: "An internal server error occurred",
      });
    }
  });
});

//       Controller for when the user logs in
export const userLoginController = asyncHandler(async (req, res) => {
  const errors = [];
  const { email, pword } = req.body;

  if (!email) errors.push("Email is required.");
  if (!pword) errors.push("Password is required.");
  if (!validator.isEmail(email)) errors.push("Invalid email format.");

  if (errors.length > 0) {
    return res.status(400).json({ error: errors });
  }

  try {
    const user = await User.findOne({ email }).select("+pword");
    console.log("logged in", user);

    if (!user) {
      return res.status(404).json({
        error: "There's no account linked with this email, try registering.",
      });
    }

    const matchedPassword = await bcrypt.compare(pword, user.pword);
    if (!matchedPassword) {
      return res
        .status(400)
        .json({ error: "Your email or password is invalid" });
    }

    const UserImage = user.image;
    const UserBio = user.bio;
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        fname: user.fname,
        lname: user.lname,
        RegDate: user.createdAt,
        image: UserImage,
        localImage: user.localImage,
        bio: UserBio,
        status: user.status,
        organisation: user.organisation,
        Theme: user.MyTheme,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      }
    );

    // for production
    // const cookieOptions = {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production", // Only secure in production
    //   sameSite: "Lax", // Use "None" + secure: true if frontend is hosted on a different domain
    //   expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    // };
    const cookieOptions = {
      httpOnly: true,
      secure: true, // 🔥 REQUIRED for cross-site cookies (especially on Render)
      sameSite: "None", // 🔥 REQUIRED for cross-origin
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    };
    // get user settings on login
    // Try multiple strategies to locate settings so login doesn't fail if a settings doc is missing
    let isUserSettings = await Settings.findOne({ user: user._id });
    if (!isUserSettings && user.settings) {
      // some older records may have settings stored as an ObjectId on the user
      try {
        isUserSettings = await Settings.findById(user.settings);
      } catch (findErr) {
        console.warn(
          "Failed to find settings by user.settings id:",
          findErr?.message || findErr
        );
      }
    }

    if (!isUserSettings) {
      // Create a default settings document instead of blocking login
      try {
        isUserSettings = await Settings.create({ user: user._id });
        // attach to user for future lookups
        user.settings = isUserSettings._id;
        await user.save();
        console.log("Created default settings for user:", user._id.toString());
      } catch (createErr) {
        console.error(
          "Failed to create default settings for user:",
          createErr?.message || createErr
        );
        // proceed with sensible defaults if saving settings failed
        isUserSettings = null;
      }
    }

    const simplifiedSettings = {
      _id: isUserSettings?._id || null,
      user: isUserSettings?.user || user._id,
      ProfileVisibility:
        isUserSettings?.PrivacySecurity?.[0]?.ProfileVisibility ?? true,
      ReadReceipts: isUserSettings?.PrivacySecurity?.[0]?.readReceipts ?? true,
      TwoFactorauth:
        isUserSettings?.PrivacySecurity?.[0]?.twoFactorAuth ?? false,
      PushNotification:
        isUserSettings?.NotificationPreference?.[0]?.PushNotifications ?? false,
      MuteChats:
        isUserSettings?.NotificationPreference?.[0]?.muteChats ?? false,
      Vibration: isUserSettings?.NotificationPreference?.[0]?.vibrate ?? true,
      isMonthlyArchived:
        isUserSettings?.archiveChats?.[0]?.monthlyArchive ?? false,
      UnarchiveOnMessage:
        isUserSettings?.archiveChats?.[0]?.unarchiveOnMessage ?? true,
      GenerateSummary:
        isUserSettings?.archiveChats?.[0]?.generateArchiveSummary ?? true,
    };
    console.log("loggedin", user);
    return res.status(200).cookie("userToken", token, cookieOptions).json({
      successMessage: "User Logged In successfully✅✅",
      token,
      user,
      userSettings: simplifiedSettings,
    });
  } catch (error) {
    console.error("❌ Backend Login Crash:", error.message);
    return res
      .status(500)
      .json({ error: "Internal server Error from backend controller" });
  }
});

// Logout controller
export const userLogoutController = asyncHandler(async (req, res) => {
  console.log("logout successful");
  res.clearCookie("userToken", {
    httpOnly: true,
    secure: true, // 🔥 REQUIRED for cross-site cookies (especially on Render)
    sameSite: "None", // 🔥 REQUIRED for cross-origin
  });
  return res.status(200).json({
    successMessage: "User logged out successfully",
  });
});

export const forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log("email", email);

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    return res
      .status(404)
      .json({ error: "email does not exist", success: false });
  }
  // Generate a 6-digit numeric code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  // Save the code and its expiration time (e.g., 15 minutes) to the user's record
  user.passwordResetCode = resetCode;
  // Mark as not yet verified until the user submits the code
  user.passwordResetVerified = false;
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  await user.save();
  const payload = await sendPasswordResetEmail(
    req,
    res,
    email,
    resetCode,
    user
  );
  console.log("payload", payload.message);
  if (payload.error) {
    res.status(500).json(payload);
  } else {
    console.log(payload.message);
    res.status(200).json({ payload });
  }
});

// Verify reset code controller
export const verifyResetCodeController = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "code are required" });
  }

  const user = await User.findOne({ email }).select(
    "passwordResetCode passwordResetExpires resetPasswordToken resetPasswordExpiry passwordResetVerified email _id"
  );
  if (!user) {
    return res.status(400).json({ error: "user not found" });
  }

  // Support both possible field names (passwordResetCode or resetPasswordToken)
  const storedCode = user.passwordResetCode || user.resetPasswordToken;
  const expiresAt = user.passwordResetExpires || user.resetPasswordExpiry;

  if (!storedCode || !expiresAt) {
    return res
      .status(400)
      .json({ error: "No reset code found for this account" });
  }

  if (Date.now() > new Date(expiresAt).getTime()) {
    return res.status(400).json({ error: "Reset code has expired" });
  }

  if (String(code).trim() !== String(storedCode).trim()) {
    return res.status(400).json({ error: "Invalid reset code" });
  }

  // Code is valid — issue a short-lived reset token (JWT) the client can use to reset the password
  const resetToken = jwt.sign(
    { id: user._id, email: user.email, purpose: "password-reset" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  // Mark verified and clear stored code so it can't be reused
  user.passwordResetVerified = true;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();
  const data = {
    email: user.email,
    passwordResetVerified: user.passwordResetVerified,
  };
  console.log("user", data);
  return res.status(200).json({ success: true, resetToken });
});

// Reset password using short-lived reset JWT
export const resetPasswordController = asyncHandler(async (req, res) => {
  // Accept reset token either in Authorization header (Bearer <token>) or in the request body
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  let token = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  const { resetToken: bodyResetToken, newPassword } = req.body;
  token = token || bodyResetToken;
  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ error: "resetToken and newPassword are required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.purpose !== "password-reset") {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const user = await User.findById(decoded.id).select(
      "+pword passwordResetVerified email"
    );
    console.log("user found for reset", user.email);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Require that the user has verified the reset code first
    if (!user.passwordResetVerified) {
      return res.status(403).json({ error: "Reset code not verified" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.pword = hashed;
    // Optionally clear confirmPword or set it too
    user.confirmPword = hashed;

    // Clear any stored reset codes/tokens
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    // Clear verification flag after successful password change
    user.passwordResetVerified = false;

    await user.save();

    // Send notification email for password change (don't use controller that writes to res)
    try {
      if (user.email) {
        const html = `
          <p>Your Fort Chat password was changed successfully.</p>
          <p>If you did not perform this action, please contact support immediately.</p>
        `;
        await sendMail({
          to: user.email,
          subject: "🔐 Fort Chat - Password Changed",
          html,
        });
      } else {
        console.warn(
          `Skipping password change email because user.email is missing for user id=${user._id}`
        );
      }
    } catch (emailErr) {
      // non-fatal
      console.warn(
        "Failed to send password change notification:",
        emailErr?.message || emailErr
      );
    }

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(400).json({ error: "Invalid or expired reset token" });
  }
});

// uodate user password
export const updateUserPassword = asyncHandler(async (req, res) => {
  const myId = req.myID;
  const user = await User.findById(myId);
  console.log("updating user password");
  // Configure nodemailer transporter
  const createTransporter = () => {
    return nodemailer.createTransport({
      service: "gmail", // or use your preferred email service
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });
  };

  // sendPasswordChangeNotification(req, res, createTransporter)
  sendPasswordResetEmail(req, res, user?.email, createTransporter);
});
