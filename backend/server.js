require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const webpush = require("web-push");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const User = require("./models/User");
const Pandit = require("./models/Pandit");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://uat.sanskaar.co"],
    credentials: true,
  },
});

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// CORS Configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "https://uat/sanskaar.co"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Logging
app.use(morgan("dev"));

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Family Tree Routes
app.use("/api", require("./routes/familyTree"));
// Create uploads directory if it doesn't exist
const fs = require("fs");
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory");
}

// ============================================
// MONGODB CONNECTION
// ============================================

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/sanskar", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// MongoDB Connection Events
mongoose.connection.on("connected", () => {
  console.log("🔗 Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️  Mongoose disconnected from MongoDB");
});

// ============================================
// WEB PUSH SETUP (OPTIONAL)
// ============================================

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@sanskaar.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log("✅ Push Notifications READY!");
} else {
  console.log("⚠️  VAPID keys not configured - Push notifications disabled");
}

// ============================================
// API ROUTES
// ============================================

// Health Check Route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// API Base Route
app.get("/api", (req, res) => {
  res.json({
    message: "Sanskaar API Server",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      admin: "/api/admin",
      poojas: "/api/poojas",
      products: "/api/shop",
      pandits: "/api/pandits",
      waste: "/api/waste",
      temples: "/api/temples",
      chat: "/api/chat",
      search: "/api/search",
    },
  });
});

// Authentication Routes
app.use("/api/auth", require("./routes/authRoutes"));

// Admin Routes - UPDATED ROUTE
app.use("/api/admin", require("./routes/admin"));

// Admin Master Data Routes (Pooja System)
app.use("/api/admin/master", require("./routes/adminMaster"));

// Pooja Routes
app.use("/api/poojas", require("./routes/pooja"));

// New Pooja System Routes (Templates with Step Player)
app.use("/api/pooja-system", require("./routes/userPooja"));

// Shop/Product Routes
app.use("/api/shop", require("./routes/shop"));

// Pandit Routes
app.use("/api/pandits", require("./routes/pandit"));

// Waste Collection Routes
app.use("/api/waste", require("./routes/waste"));

// Temple Routes
app.use("/api/temples", require("./routes/temple"));

// Sanskrit Learning Routes
app.use("/api/sanskrit", require("./routes/sanskrit"));

// Chat Routes
app.use("/api/chat", require("./routes/chat"));

// Family Tree Routes
app.use("/api", require("./routes/familyTree"));

// Upload Routes
app.use("/api/upload", require("./routes/upload"));

// Search Routes
app.use("/api/search", require("./routes/search"));

// ============================================
// SOCKET.IO REAL-TIME FEATURES
// ============================================

io.on("connection", (socket) => {
  console.log(`🔌 New socket connection: ${socket.id}`);

  // User joins their own room
  socket.on("join-user", (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their room`);
  });

  // Chat messages
  socket.on("chat", (data) => {
    io.to(data.to).emit("chat", data);
    console.log(`💬 Chat message from ${data.from} to ${data.to}`);
  });

  // Booking updates with push notifications
  socket.on("booking-update", async (data) => {
    try {
      // Emit to user's room
      io.to(data.userId).emit("booking-update", data);

      // Send push notification if subscription exists
      if (data.subscription && process.env.VAPID_PUBLIC_KEY) {
        await webpush.sendNotification(
          data.subscription,
          JSON.stringify({
            title: "Booking Update",
            body: data.message || "Your booking status has been updated",
            icon: "/logo192.png",
          })
        );
      }
      console.log(`📢 Booking update sent to user ${data.userId}`);
    } catch (error) {
      console.error("❌ Error sending booking update:", error);
    }
  });

  // Notification events
  socket.on("notification", (data) => {
    io.to(data.userId).emit("notification", data);
    console.log(`🔔 Notification sent to user ${data.userId}`);
  });

  // Disconnect event
  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: {
      auth: "/api/auth",
      admin: "/api/admin",
      poojas: "/api/poojas",
      shop: "/api/shop",
      pandits: "/api/pandits",
      waste: "/api/waste",
      temples: "/api/temples",
    },
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value",
      field: Object.keys(err.keyPattern)[0],
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Multer file upload errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: "File upload error",
      error: err.message,
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ============================================
// SERVE FRONTEND IN PRODUCTION
// ============================================

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
  });

  console.log("✅ Serving frontend in production mode");
}

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 SERVER STARTED SUCCESSFULLY");
  console.log("=".repeat(50));
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`📍 API Base: http://localhost:${PORT}/api`);
  console.log(`📍 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`⚡ Socket.IO: Enabled`);
  console.log("=".repeat(50) + "\n");
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on("SIGTERM", () => {
  console.log("⚠️  SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("✅ HTTP server closed");
    mongoose.connection.close(false, () => {
      console.log("✅ MongoDB connection closed");
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  console.log("\n⚠️  SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("✅ HTTP server closed");
    mongoose.connection.close(false, () => {
      console.log("✅ MongoDB connection closed");
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

module.exports = { app, server, io };
