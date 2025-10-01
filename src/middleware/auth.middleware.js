import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const protectRoute = async (req, res, next) => {
  try {
    console.log("Cookies received:", req.cookies);
    console.log("Headers:", req.headers);

    const token = req.cookies.jwt;
    if (!token) {
      console.log("No token found in cookies");
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, ENV.JWT_SECRET);
    } catch (jwtError) {
      console.error("JWT Verification failed:", jwtError);
      return res.status(401).json({ message: "Token verification failed" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("User not found for ID:", decoded.userId);
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: "Internal server error" });
  }
};