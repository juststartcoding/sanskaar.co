const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Basic authentication middleware - verifies JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

// Role-based access control middleware
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

// Admin only middleware (shorthand)
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (!["admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  next();
};

// Pandit only middleware
const panditOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (!["pandit", "admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Pandit access required.",
    });
  }

  next();
};

// Seller only middleware
const sellerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (!["seller", "admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Seller access required.",
    });
  }

  next();
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.replace("Bearer ", "");
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (user) {
      req.user = user;
      req.userId = user._id;
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  adminOnly,
  panditOnly,
  sellerOnly,
  optionalAuth,
};
