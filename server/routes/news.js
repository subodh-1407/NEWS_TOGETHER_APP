const express = require("express") ;
const router = express.Router() ;

const {signup, login} = require("../controllers/Auth") ;
const {auth} = require("../middlewares/auth") ;
const {addToBookmarkedNews, getAllBookmarkedNews, deleteBookmarkedNews} = require("../controllers/Bookmark") ;

// api route
// In routes/news.js or create a new file if needed
const axios = require("axios");

router.get("/external-news", async (req, res) => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines`,
      {
        params: {
          country: "us",
          category: "general",
          pageSize: 6,
          page: 1,
          apiKey: process.env.NEWS_API_KEY, // store safely in .env
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching external news:", error.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

router.post("/signup", signup) ;
router.post("/login", login) ;

// bookmarked news route
router.post("/addToBookmarkedNews", auth, addToBookmarkedNews) ;
router.get("/getAllBookmarkedNews", auth, getAllBookmarkedNews) ;
// Old
// router.delete("/deleteBookmarkedNews", auth, deleteBookmarkedNews);

// New - Use ID in URL
router.delete("/deleteBookmarkedNews/:id", auth, deleteBookmarkedNews);



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



module.exports = router ;
