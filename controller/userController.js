import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../model/userModel.js";
import formidable from "formidable";
import validator from "validator";
import jwt from "jsonwebtoken";
import { error } from "console";
import cookieParser from "cookie-parser";

// Registering the user //
export const userRegisterController = asyncHandler((req, res) => {
  const form = formidable();

  console.log("🔍 Hitting userRegisterController");

  form.parse(req, async (err, fields) => {
    if (err) {
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
      const newUser = await User.create({
        fname: newFname,
        lname: newLname,
        email: email,
        pword: hashedPassword,
        confirmPword: hashedConfirmPassword,
        rememberMe,
        image: "",
        bio: "Lets Chat on fort....😁",
        status: ""
      });

      const token = jwt.sign(
        {
          id: newUser._id,
          email: newUser.email,
          fname: newUser.fname,
          lname: newUser.lname,
          RegDate: newUser.createdAt,
          image: "",
          bio: newUser.bio,
          status: newUser.status,
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

      return res.status(201).cookie("userToken", token, cookieOptions).json({
        successMessage: "User registered successfully✅✅",
        token,
        newUser,
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
        bio: UserBio,
        status: user.status,
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

    console.log("loggedin", user);
    return res.status(200).cookie("userToken", token, cookieOptions).json({
      successMessage: "User Logged In successfully✅✅",
      token,
      user,
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
