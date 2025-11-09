import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";

async function uploadImageToCloudinary(fileBuffer, filename, mimetype) {
  const base64 = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;
  const publicId = `profiles/${uuidv4()}-${filename}`;

  const result = await cloudinary.uploader.upload(base64, {
    public_id: publicId,
    folder: "profiles", // Optional if included in publicId
    resource_type: "image",
  });

  return result.secure_url;
}

export default uploadImageToCloudinary;
