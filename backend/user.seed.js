const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// 🔹 MongoDB connection
mongoose.connect(
  "mongodb+srv://poojapath:jaishreeram@cluster0.dct9sul.mongodb.net/",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const seedUsers = async () => {
  try {
    // ❌ Clear existing users (optional)
    await User.deleteMany();
    console.log("🗑 Existing users removed");

    // 🔐 Hash password
    const hashPassword = await bcrypt.hash("123456", 10);

    const users = [
      {
        name: "Guest User",
        email: "guest@example.com",
        phone: "9000000001",
        password: hashPassword,
        role: "guest",
      },
      {
        name: "Normal User",
        email: "user@example.com",
        phone: "9000000002",
        password: hashPassword,
        gender: "male",
        address: "Bhopal, MP",
        role: "user",
        walletBalance: 200,
      },
      {
        name: "Seller One",
        email: "seller@example.com",
        phone: "9000000003",
        password: hashPassword,
        role: "seller",
        kycStatus: "verified",
        walletBalance: 1500,
      },
      {
        name: "Pandit Ji",
        email: "pandit@example.com",
        phone: "9000000004",
        password: hashPassword,
        role: "pandit",
        languagePref: "hi",
        kycStatus: "verified",
      },
      {
        name: "Admin User",
        email: "admin@example.com",
        phone: "9000000005",
        password: hashPassword,
        role: "admin",
        kycStatus: "verified",
      },
      {
        name: "Super Admin",
        email: "superadmin@example.com",
        phone: "9000000006",
        password: hashPassword,
        role: "superadmin",
        kycStatus: "verified",
      },
    ];

    await User.insertMany(users);
    console.log("✅ Users seeded successfully");

    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedUsers();
