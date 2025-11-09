import { v2 as cloudinary } from "cloudinary";

// Function to initialize Cloudinary configuration
export const initializeCloudinary = () => {
  // Validate environment variables
  const requiredEnvVars = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };

  // Check if all required environment variables are present
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error(
      `❌ Missing Cloudinary environment variables: ${missingVars.join(", ")}`
    );
    console.error("Please check your config.env file contains:");
    console.error("CLOUDINARY_CLOUD_NAME=your_cloud_name");
    console.error("CLOUDINARY_API_KEY=your_api_key");
    console.error("CLOUDINARY_API_SECRET=your_api_secret");
    throw new Error(
      `Missing Cloudinary environment variables: ${missingVars.join(", ")}`
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log("🔧 Cloudinary configured with:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? "***hidden***" : "missing",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "***hidden***" : "missing",
  });

  // Test connection
  return cloudinary.api
    .ping()
    .then((res) => {
      console.log("✅ Cloudinary connected successfully:", res);
      return cloudinary;
    })
    .catch((err) => {
      console.error("❌ Cloudinary connection failed:", err.message);
      throw err;
    });
};

export default cloudinary;
