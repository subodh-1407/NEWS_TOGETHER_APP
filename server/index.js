const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/connectDB");
require("dotenv").config();

const PORT = process.env.PORT || 4000;

// CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://news-together-app.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Debugging incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
const apiRoutes = require("./routes/news");
app.use("/api/v1", apiRoutes);

// Test Route
app.get("/", (req, res) => {
    res.status(200).json({ message: "📰 Welcome to News Together API" });
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
