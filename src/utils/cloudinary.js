import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "hotelify",
    });

    // file uploaded successfully, remove the local temp copy
    fs.unlinkSync(localFilePath);

    return response; // response.secure_url is what you store in the DB
  } catch (error) {
    // upload failed — still remove the local temp file to avoid clutter
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (publicUrl) => {
  try {
    if (!publicUrl) return null;

    // extract public_id from the cloudinary url
    const publicId = publicUrl.split("/").pop().split(".")[0];
    const response = await cloudinary.uploader.destroy(`hotelify/${publicId}`);
    return response;
  } catch (error) {
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
