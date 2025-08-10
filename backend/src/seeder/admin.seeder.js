import User from "../models/user.model.js";
import { connectDB } from "../connections/db.js";
import mongoose from "mongoose";

const createAdminUser = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "phredcross0@gmail.com" });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const adminUser = new User({
      familyName: "Cross",
      givenName: "Phred",
      middleName: "Admin",
      dateOfBirth: new Date("1990-01-01"), // Default date of birth
      email: "phredcross0@gmail.com",
      password: "Password2025@@",
      role: "admin",
      isEmailVerified: true, // Set as verified for admin
      isActive: true,
      isProfileComplete: true,
    });

    await adminUser.save();
    console.log("Admin user created successfully");

    // Disconnect from database
    await mongoose.connection.close();
    console.log("Database connection closed");

  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

// Run the seeder
createAdminUser();
