import dotenv from "dotenv";
dotenv.config({
  path: "./config.env",
});

import http from "http";
import app from "./app/app.js";
import fs from "fs";
import { initializeCloudinary } from "./config/cloudinary.js";

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);
console.log("PORT:", process.env.PORT);
console.log(
  "CLOUDINARY_CLOUD_NAME:",
  process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Missing"
);
console.log(
  "CLOUDINARY_API_KEY:",
  process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing"
);
console.log(
  "CLOUDINARY_API_SECRET:",
  process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing"
);

// Initialize Cloudinary after env vars are loaded
initializeCloudinary()
  .then(() => {
    console.log("🎉 Cloudinary initialization complete");
  })
  .catch((error) => {
    console.error("❌ Failed to initialize Cloudinary:", error.message);
    // Don't exit the process, just log the error
  });

server.listen(PORT, () => {
  console.log("🚀 Sever currently running on port 4000");
});
