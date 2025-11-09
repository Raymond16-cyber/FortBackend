import express from "express";
import {
  sendPasswordChangeNotification,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../controller/emailController.js";
import authMIddleware from "../utils/authMIddleware.js";

const router = express.Router();

// Send password change notification (requires authentication)
router.post(
  "/send-password-change-notification",
  authMIddleware,
  sendPasswordChangeNotification
);

// Send password reset email (public endpoint)
router.post("/send-password-reset-email", sendPasswordResetEmail);

// Send welcome email (public endpoint)
router.post("/send-welcome-email", sendWelcomeEmail);

export default router;
