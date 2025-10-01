import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../emails/emailHandlers.js";
import { createWelcomeEmailTemplate } from "../emails/emailTemplate.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  console.log("Signup attempt for:", email);

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ fullName, email, password: hashedPassword });
    const savedUser = await newUser.save();
    console.log("User created:", savedUser._id);

    // Send welcome email safely
    try {
      const emailHtml = createWelcomeEmailTemplate(savedUser.fullName, process.env.CLIENT_URL);
      await sendEmail({ to: savedUser.email, subject: "Welcome to Messenger 🎉", html: emailHtml });
      console.log("Welcome email sent");
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr.message);
    }

    // Generate JWT cookie
    try {
      generateToken(savedUser._id, res);
    } catch (jwtErr) {
      console.error("JWT generation failed:", jwtErr.message);
      return res.status(500).json({ message: "Server error generating token" });
    }

    res.status(201).json({
      _id: savedUser._id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      profilePic: savedUser.profilePic,
    });
  } catch (err) {
    console.error("Signup controller error:", err.message);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email);

  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    try {
      generateToken(user._id, res);
    } catch (jwtErr) {
      console.error("JWT generation failed:", jwtErr.message);
      return res.status(500).json({ message: "Server error generating token" });
    }

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (err) {
    console.error("Login controller error:", err.message);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

export const logout = (_, res) => {
  res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic) return res.status(400).json({ message: "Profile pic is required" });

    const userId = req.user._id;
    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in update profile:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
