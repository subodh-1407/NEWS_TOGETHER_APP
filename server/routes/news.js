const express = require("express");
const axios = require("axios");
const router = express.Router();

const { signup, login } = require("../controllers/Auth");
const { auth } = require("../middlewares/auth");
const {
    addToBookmarkedNews,
    getAllBookmarkedNews,
    deleteBookmarkedNews
} = require("../controllers/Bookmark");

// Auth routes
router.post("/signup", signup);
router.post("/login", login);

// Bookmark routes
router.post("/addToBookmarkedNews", auth, addToBookmarkedNews);
router.get("/getAllBookmarkedNews", auth, getAllBookmarkedNews);
router.delete("/deleteBookmarkedNews/:id", auth, deleteBookmarkedNews);

// Dummy images route
router.get('/getImages', async (req, res) => {
    try {
        const images = [
            { url: 'https://example.com/image1.jpg' },
            { url: 'https://example.com/image2.jpg' }
        ];
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch images" });
    }
});

// ✅ NewsAPI proxy route (this prevents frontend CORS errors)
router.get("/news", async (req, res) => {
    try {
        const { category = "general", country = "us", page = 1, pageSize = 10 } = req.query;

        const response = await axios.get("https://newsapi.org/v2/top-headlines", {
            params: {
                category,
                country,
                page,
                pageSize,
                apiKey: process.env.NEWS_API_KEY
            }
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching news:", error.message);
        res.status(500).json({ error: "Failed to fetch news" });
    }
});

module.exports = router;
