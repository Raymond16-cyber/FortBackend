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

      const hashedPassword = await bcrypt.hash(pword, 10);
      const hashedConfirmPassword = await bcrypt.hash(confirmPword, 10);
      const newUser = await User.create({
        fname,
        lname,
        email,
        pword: hashedPassword,
        confirmPword: hashedConfirmPassword,
        rememberMe,
      });

      const token = jwt.sign(
        {
          id: newUser._id,
          email: newUser.email,
          fname: newUser.fname,
          lname: newUser.lname,
          RegDate: newUser.createdAt,
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
    return res.status(400).json({
      error: errors,
    });
  } else {
    try {
      const user = await User.findOne({ email }).select("+pword");
      if (!user) {
        res.status(404).json({
          error:
            "There's no account linked with this email,try registering with us",
        });
      }
      // Check if user's password is correct
      const matchedPassword = await bcrypt.compare(pword, user.pword);
      if (matchedPassword) {
        const token = jwt.sign(
          {
            id: user._id,
            email: user.email,
            fname: user.fname,
            lname: user.lname,
            RegDate: user.createdAt,
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
        return res.status(200).cookie("userToken", token, cookieOptions).json({
          successMessage: "User Logged In successfully✅✅",
          token,
          user,
        });
      } else {
        return res.status(400).json({
          error: "Your email or password is invalid",
        });
      }
    } catch (error) {
      return res.status(404).json({
        error: "Internal server Error",
      });
    }
  }
});


// Logout controller
export const userLogoutController = asyncHandler(async (req, res) => {
  console.log("logout successful");
  
  return res.status(200).cookie("userToken","").json({
    success: "true",
  });
});
