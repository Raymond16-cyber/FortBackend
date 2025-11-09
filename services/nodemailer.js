import nodemailer from "nodemailer";

/**
 * Create and return a nodemailer transporter.
 * Supports either explicit SMTP settings (EMAIL_HOST / EMAIL_PORT / EMAIL_SECURE)
 * or a named service (EMAIL_SERVICE, e.g., 'gmail').
 */
export const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // If explicit SMTP host/port provided, prefer that
  if (process.env.EMAIL_HOST && process.env.EMAIL_PORT) {
    const port = parseInt(process.env.EMAIL_PORT, 10);
    const secure = process.env.EMAIL_SECURE === "true" || port === 465;
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  // Otherwise, allow using a service name (like 'gmail')
  if (process.env.EMAIL_SERVICE) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user,
        pass,
      },
    });
  }

  // Last resort: try Gmail with user/pass
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send an email using the configured transporter.
 * @param {{ to: string, subject: string, html?: string, text?: string, from?: string }} options
 */
export const sendMail = async (options) => {
  const transporter = createTransporter();

  // Verify transporter configuration (helps surface auth problems early)
  try {
    await transporter.verify();
  } catch (err) {
    console.error("Mail transporter verification failed:", err.message || err);
    // Still attempt to send; let nodemailer return a detailed error
  }

  const mailOptions = {
    from: options.from || process.env.EMAIL_USER,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  return transporter.sendMail(mailOptions);
};

export default { createTransporter, sendMail };
