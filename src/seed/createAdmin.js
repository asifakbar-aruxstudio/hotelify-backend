// Run this once with: node src/seed/createAdmin.js
// Creates (or updates) a single built-in Super Admin account using
// credentials from your .env file. This account is NOT created through
// the public /register route — it's the one fixed login for the
// website owner.

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { DB_NAME } from "../constants.js";

const createAdmin = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("Connected to MongoDB");

    const {
      ADMIN_USERNAME,
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
      ADMIN_FULLNAME,
    } = process.env;

    if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "Set ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD (and optionally ADMIN_FULLNAME) in your .env file"
      );
    }

    const existingAdmin = await User.findOne({
      $or: [{ email: ADMIN_EMAIL }, { username: ADMIN_USERNAME }],
    });

    if (existingAdmin) {
      // update role/password in case they changed in .env, keep everything else
      existingAdmin.role = "admin";
      existingAdmin.password = ADMIN_PASSWORD; // pre-save hook re-hashes it
      await existingAdmin.save();
      console.log(`Existing user updated to admin: ${existingAdmin.email}`);
    } else {
      const admin = await User.create({
        username: ADMIN_USERNAME.toLowerCase(),
        email: ADMIN_EMAIL,
        fullName: ADMIN_FULLNAME || "Website Owner",
        password: ADMIN_PASSWORD,
        role: "admin",
      });
      console.log(`Super admin created: ${admin.email}`);
    }

    console.log("Done. You can now log in with these credentials.");
  } catch (error) {
    console.error("Failed to create admin:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();
