const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/connectDB");
require("dotenv").config();

const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Optional: log each incoming request (for debugging)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// API routes
const news = require("./routes/news");
app.use("/api/v1", news);

// Root route (test/debug)
app.get("/", (req, res) => {
    res.status(200).json({ message: "📰 Welcome to News Together API" });
});

// Server start log
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
