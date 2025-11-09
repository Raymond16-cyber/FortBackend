import express from "express";
import {
  forgotPasswordController,
  verifyResetCodeController,
  resetPasswordController,
  updateUserPassword,
  userLoginController,
  userLogoutController,
  userRegisterController,
} from "../controller/userController.js";
import authMiddleware from "../utils/authMIddleware.js";
const userRouter = express.Router();

// register router
userRouter.post("/user-register", userRegisterController);

//login router
userRouter.post("/user-login", userLoginController);

// logout router
userRouter.post("/user-logout", userLogoutController);

//forget password
userRouter.post("/forgot-password", forgotPasswordController);

// verify code (from email)
userRouter.post("/verify-reset-code", verifyResetCodeController);
// reset password using short-lived reset token returned by verifyResetCode
userRouter.post("/reset-password", resetPasswordController);
// update password
userRouter.put("/update-password/:userId", authMiddleware, updateUserPassword);

export default userRouter;
