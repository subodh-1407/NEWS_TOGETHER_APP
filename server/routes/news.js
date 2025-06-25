const express = require("express") ;
const router = express.Router() ;

const {signup, login} = require("../controllers/Auth") ;
const {auth} = require("../middlewares/auth") ;
const {addToBookmarkedNews, getAllBookmarkedNews, deleteBookmarkedNews} = require("../controllers/Bookmark") ;

// api route
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
