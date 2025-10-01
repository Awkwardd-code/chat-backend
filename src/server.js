
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

app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);
app.get("/", (req, res) => {
    res.send("API is running...");
});

app.listen(PORT, () => {
    console.log("Server running on port: " + PORT);
    connectDB();
});