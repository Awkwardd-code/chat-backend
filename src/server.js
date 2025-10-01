
import express from "express";

import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import path from "path";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { apiLimiter } from "./middleware/rateLimiter.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
    origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://chat-eosin-seven.vercel.app"   // ✅ your frontend domain
  ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Apply rate limiting to all API routes
app.use("/api", apiLimiter);

app.use(express.json({ limit: "5mb" })); // req.body
app.use(cookieParser());

// Basic security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});

// Error handling - after all routes
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({ 
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal Server Error' 
            : err.message || 'Something went wrong!' 
    });
});

app.listen(PORT, () => {
    console.log("Server running on port: " + PORT);
    connectDB();
});