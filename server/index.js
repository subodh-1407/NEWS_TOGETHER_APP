// const express = require("express");
// const app = express();
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const connectDB = require("./config/connectDB");
// require("dotenv").config();

// const PORT = process.env.PORT || 4000;

// // CORS Configuration
// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://news-together-app.vercel.app"
// ];

// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true,
// }));

// app.use(express.json());
// app.use(cookieParser());

// // Connect to MongoDB
// connectDB();

// // Debugging incoming requests
// app.use((req, res, next) => {
//     console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//     next();
// });

// // Routes
// const apiRoutes = require("./routes/news");
// app.use("/api/v1", apiRoutes);

// // Test Route
// app.get("/", (req, res) => {
//     res.status(200).json({ message: "📰 Welcome to News Together API" });
// });

// app.listen(PORT, () => {
//     console.log(`✅ Server is running on http://localhost:${PORT}`);
// });
const express = require("express")
const app = express()
const cors = require("cors")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/connectDB")
require("dotenv").config()

const PORT = process.env.PORT || 4000

// Enhanced CORS Configuration for deployment
const allowedOrigins = [
  "http://localhost:3000",
  "https://news-together-app.vercel.app",
  "https://your-vercel-domain.vercel.app", // Add your actual Vercel domain
  process.env.FRONTEND_URL, // Add this to your environment variables
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true)

      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
  }),
)

// Handle preflight requests
app.options("*", cors())

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

// Connect to MongoDB
connectDB()

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Debugging middleware (only in development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
    console.log("Origin:", req.get("Origin"))
    next()
  })
}

// Routes
const apiRoutes = require("./routes/news")
app.use("/api/v1", apiRoutes)

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "📰 Welcome to News Together API",
    version: "1.0.0",
    status: "running",
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err)
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
})
