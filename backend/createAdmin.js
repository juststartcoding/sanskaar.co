require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/sanskar")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

const createAdmin = async () => {
  try {
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: "admin@sanskaar.com" });

    if (existingAdmin) {
      console.log("Admin already exists!");
      console.log("Email: admin@sanskaar.com");
      console.log("Updating password...");
      existingAdmin.password = "admin123";
      await existingAdmin.save();
      console.log("Password updated to: admin123");
    } else {
      // Create admin
      const admin = new User({
        name: "Admin",
        email: "admin@sanskaar.com",
        password: "admin123",
        phone: "9999999999",
        role: "admin",
      });

      await admin.save();
      console.log("✅ Admin created successfully!");
      console.log("Email: admin@sanskaar.com");
      console.log("Password: admin123");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

createAdmin();
