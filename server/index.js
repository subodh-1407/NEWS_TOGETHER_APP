const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/connectDB");
require("dotenv").config();

const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: "http://localhost:3000", // Change to your frontend domain in production
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Mount routes
const news = require("./routes/news");
app.use("/api/v1", news);

// Root route for health check or browser visit
app.get("/", (req, res) => {
    res.status(200).json({ message: "📰 Welcome to News Together API" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
