// const express = require("express");
// const axios = require("axios");
// const router = express.Router();

// const { signup, login } = require("../controllers/Auth");
// const { auth } = require("../middlewares/auth");
// const {
//     addToBookmarkedNews,
//     getAllBookmarkedNews,
//     deleteBookmarkedNews
// } = require("../controllers/Bookmark");

// // Auth routes
// router.post("/signup", signup);
// router.post("/login", login);

// // Bookmark routes
// router.post("/addToBookmarkedNews", auth, addToBookmarkedNews);
// router.get("/getAllBookmarkedNews", auth, getAllBookmarkedNews);
// router.delete("/deleteBookmarkedNews/:id", auth, deleteBookmarkedNews);

// // Dummy images route
// router.get('/getImages', async (req, res) => {
//     try {
//         const images = [
//             { url: 'https://example.com/image1.jpg' },
//             { url: 'https://example.com/image2.jpg' }
//         ];
//         res.status(200).json(images);
//     } catch (error) {
//         res.status(500).json({ error: "Failed to fetch images" });
//     }
// });

// // ✅ NewsAPI proxy route (this prevents frontend CORS errors)
// router.get("/news", async (req, res) => {
//     try {
//         const { category = "general", country = "us", page = 1, pageSize = 10 } = req.query;

//         const response = await axios.get("https://newsapi.org/v2/top-headlines", {
//             params: {
//                 category,
//                 country,
//                 page,
//                 pageSize,
//                 apiKey: process.env.NEWS_API_KEY
//             }
//         });

//         res.status(200).json(response.data);
//     } catch (error) {
//         console.error("Error fetching news:", error.message);
//         res.status(500).json({ error: "Failed to fetch news" });
//     }
// });

// module.exports = router;
const express = require("express")
const axios = require("axios")
const router = express.Router()

const { signup, login } = require("../controllers/Auth")
const { auth } = require("../middlewares/auth")
const { addToBookmarkedNews, getAllBookmarkedNews, deleteBookmarkedNews } = require("../controllers/Bookmark")

// Add CORS headers to all routes
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true")
  next()
})

// Auth routes
router.post("/signup", signup)
router.post("/login", login)

// Bookmark routes
router.post("/addToBookmarkedNews", auth, addToBookmarkedNews)
router.get("/getAllBookmarkedNews", auth, getAllBookmarkedNews)
router.delete("/deleteBookmarkedNews/:id", auth, deleteBookmarkedNews)

// Dummy images route
router.get("/getImages", async (req, res) => {
  try {
    const images = [{ url: "https://example.com/image1.jpg" }, { url: "https://example.com/image2.jpg" }]
    res.status(200).json(images)
  } catch (error) {
    console.error("Error fetching images:", error)
    res.status(500).json({ error: "Failed to fetch images" })
  }
})

// NewsAPI proxy route with better error handling
router.get("/news", async (req, res) => {
  try {
    const { category = "general", country = "us", page = 1, pageSize = 10, q } = req.query

    // Check if API key exists
    if (!process.env.NEWS_API_KEY) {
      return res.status(500).json({
        error: "News API key not configured",
        articles: [],
        totalResults: 0,
      })
    }

    const params = {
      category,
      country,
      page,
      pageSize,
      apiKey: process.env.NEWS_API_KEY,
    }

    // Add search query if provided
    if (q) {
      params.q = q
    }

    const response = await axios.get("https://newsapi.org/v2/top-headlines", {
      params,
      timeout: 10000, // 10 second timeout
    })

    res.status(200).json(response.data)
  } catch (error) {
    console.error("Error fetching news:", error.message)

    // Return fallback data instead of error
    res.status(200).json({
      status: "error",
      code: "apiError",
      message: "Unable to fetch latest news",
      articles: [],
      totalResults: 0,
    })
  }
})

// Search news route
router.get("/search", async (req, res) => {
  try {
    const { q, page = 1, pageSize = 10 } = req.query

    if (!q) {
      return res.status(400).json({ error: "Search query is required" })
    }

    if (!process.env.NEWS_API_KEY) {
      return res.status(500).json({
        error: "News API key not configured",
        articles: [],
        totalResults: 0,
      })
    }

    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q,
        page,
        pageSize,
        sortBy: "publishedAt",
        apiKey: process.env.NEWS_API_KEY,
      },
      timeout: 10000,
    })

    res.status(200).json(response.data)
  } catch (error) {
    console.error("Error searching news:", error.message)
    res.status(200).json({
      status: "error",
      code: "searchError",
      message: "Unable to search news",
      articles: [],
      totalResults: 0,
    })
  }
})

module.exports = router
