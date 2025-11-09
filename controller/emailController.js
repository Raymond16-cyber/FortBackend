import nodemailer from "nodemailer";
import User from "../model/userModel.js";
import { sendMail } from "../services/nodemailer.js";

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

// Send password change notification
export const sendPasswordChangeNotification = async (req, res) => {
  try {
    console.log("🔍 Hitting sendPasswordChangeNotification");
    const userId = req.myID; // From auth middleware
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "🔐 Fort Chat - Password Changed Successfully",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed - Fort Chat</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 12px;
              padding: 1px;
              margin: 20px 0;
            }
            .content {
              background: white;
              border-radius: 11px;
              padding: 40px;
              text-align: center;
            }
            .logo {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              font-size: 24px;
              color: white;
              font-weight: bold;
            }
            .title {
              color: #2d3748;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #718096;
              font-size: 16px;
              margin-bottom: 30px;
            }
            .info-box {
              background: #f7fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: left;
            }
            .info-title {
              font-weight: 600;
              color: #2d3748;
              margin-bottom: 8px;
            }
            .info-item {
              margin: 8px 0;
              color: #4a5568;
            }
            .warning {
              background: #fff5f5;
              border: 1px solid #fed7d7;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              color: #c53030;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #718096;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">🛡️</div>
              <h1 class="title">Password Changed Successfully</h1>
              <p class="subtitle">Your Fort Chat account password has been updated</p>
              
              <div class="info-box">
                <div class="info-title">Account Details:</div>
                <div class="info-item"><strong>Name:</strong> ${user.fname} ${
        user.lname
      }</div>
                <div class="info-item"><strong>Email:</strong> ${
                  user.email
                }</div>
                <div class="info-item"><strong>Change Date:</strong> ${new Date().toLocaleString()}</div>
                <div class="info-item"><strong>IP Address:</strong> ${
                  req.ip || "Unknown"
                }</div>
              </div>

              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong><br>
                If you did not make this change, please contact our support team immediately and secure your account.
              </div>

              <a href="${
                process.env.FRONTEND_URL || "http://localhost:3000"
              }/login" class="button">
                Access Your Account
              </a>

              <div class="footer">
                <p>This email was sent automatically. Please do not reply to this email.</p>
                <p>If you have any questions, contact our support team.</p>
                <p><strong>Fort Chat Team</strong><br>Keeping your conversations secure</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("🔔 Password change notification sent to:", user.email);
    res.status(200).json({
      message: "Password change notification sent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({
      message: "Failed to send notification email",
      error: error.message,
    });
  }
};

// Send password reset email (sends a 6-digit code in the message)
export const sendPasswordResetEmail = async (
  req,
  res,
  email,
  resetCode,
  user
) => {
  console.log("🔍 Hitting sendPasswordResetEmail");
  try {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Reset Code - Fort Chat</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; padding: 20px; }
          .container{ background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); border-radius:12px; padding:1px; margin:20px 0 }
          .content{ background:white; border-radius:11px; padding:40px; text-align:center }
          .logo{ width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:24px;color:white;font-weight:bold; background: linear-gradient(135deg,#667eea 0%,#764ba2 100%) }
          .title{ color:#2d3748;font-size:28px;font-weight:700;margin-bottom:10px }
          .subtitle{ color:#718096;font-size:16px;margin-bottom:18px }
          .code{ display:inline-block; letter-spacing:6px; font-size:36px; font-weight:700; background:#f7fafc; padding:14px 22px; border-radius:8px; border:1px dashed #e2e8f0 }
          .note{ margin-top:16px; color:#4a5568 }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="logo">🔑</div>
            <div class="title">Password Reset Code</div>
            <div class="subtitle">Use the code below to reset your Fort Chat password. It expires in 1 hour.</div>
            <div class="code">${resetCode}</div>
            <div class="note">If you did not request this, please ignore this email.</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const targetEmail = email || user.email;
    console.log("🔔 Sending password reset code to:", targetEmail);
    await sendMail({
      to: targetEmail,
      subject: "🔑 Fort Chat - Password Reset Code",
      html,
    });
    const payload = {};
    if (resetCode) payload.resetCode = resetCode;
    payload.message = "Password reset code sent"
    payload.success = true
    return payload;
  } catch (error) {
    const payload = {};
    console.error("Email sending error:", error);
    payload.error = error.message;
    payload.success = false 
    return payload
  }
};

// Send welcome email for new users
export const sendWelcomeEmail = async (req, res, email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🎉 Welcome to Fort Chat!",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Fort Chat</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 12px;
              padding: 1px;
              margin: 20px 0;
            }
            .content {
              background: white;
              border-radius: 11px;
              padding: 40px;
              text-align: center;
            }
            .logo {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              font-size: 24px;
              color: white;
              font-weight: bold;
            }
            .title {
              color: #2d3748;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #718096;
              font-size: 16px;
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
              font-size: 16px;
            }
            .features {
              text-align: left;
              margin: 30px 0;
            }
            .feature {
              margin: 15px 0;
              padding: 10px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #718096;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">🎉</div>
              <h1 class="title">Welcome to Fort Chat!</h1>
              <p class="subtitle">Your secure messaging journey starts here</p>
              
              <p>Hi ${name},</p>
              <p>Welcome to Fort Chat! We're excited to have you join our community of secure communicators.</p>

              <div class="features">
                <div class="feature">
                  <strong>🔒 End-to-End Encryption:</strong> Your messages are secure and private
                </div>
                <div class="feature">
                  <strong>👥 Group Chats:</strong> Connect with friends and colleagues
                </div>
                <div class="feature">
                  <strong>📱 Cross-Platform:</strong> Access your chats anywhere
                </div>
                <div class="feature">
                  <strong>🛡️ Fort Team Support:</strong> Official team members are here to help
                </div>
              </div>

              <a href="${
                process.env.FRONTEND_URL || "http://localhost:3000"
              }/login" class="button">
                Start Chatting
              </a>

              <div class="footer">
                <p>Need help getting started? Check out our help center or contact support.</p>
                <p><strong>Fort Chat Team</strong><br>Keeping your conversations secure</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Welcome email sent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Email sending error:", error);
  }
};
