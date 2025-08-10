import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

export const requireProfileComplete = (req, res, next) => {
  if (!req.user.isProfileComplete) {
    return res.status(403).json({
      success: false,
      message: "Profile must be completed before accessing this resource",
    });
  }
  next();
};
