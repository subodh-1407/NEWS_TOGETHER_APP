const { default: mongoose } = require("mongoose");
const Bookmark = require("../models/Bookmark") ;
const User = require("../models/User") ;

// store bookmarked news
exports.addToBookmarkedNews = async(req, res) => {
    try{
        // get data -- title, description, author, url
        console.log(req.user.id) ;
        let userId = req.user.id ;
        console.log("User id : ", userId) ;
        console.log("Type of User id : ", typeof(userId)) ;

        const {title, description = "", author, urlToImage, url, publishedAt} = req.body ;
        
        // validate data
        if(!userId || !title || !url){
            return res.status(403).json({
                success: false,
                message: "All fields are required.",
                userId,
                title,
                url
            }) ;    
        }

        // store news in Bookmark
        const bookmarkedNews = await Bookmark.create({title: title,
            description: description,
            author: author,
            image: urlToImage,
            url: url,
            publishedAt: publishedAt,
            bookmarkedAt: Date.now(),
            // user: userId
        }) ;

        console.log("Newly created bookmarked news data : ", bookmarkedNews) ;

        const bookmarkedNewsId = bookmarkedNews._id ;

        console.log(bookmarkedNewsId) ;
        
        // store the bookmarked news id in user schema
        const updatedUserData = await User.findByIdAndUpdate(userId,
            {
                $push: {
                    bookmarkedNews: bookmarkedNewsId,
                }
            },
            {new: true}
        ) ;

        console.log("Updated User Data : ", updatedUserData) ;

        return res.status(200).json({
    success: true,
    message: "News Bookmarked Successfully",
    updatedUserData,
    savedArticle: bookmarkedNews   // ✅ return _id to frontend
});

    }catch(err){
        console.log(err) ;
        return res.status(500).json({
            success: false,
            message: err.message
        }) ;
    }
}

// get all bookmarked news
exports.getAllBookmarkedNews = async(req, res) => {
    try{
        // get user id
        const userId = req.user.id ;

        // get the bookmarked news of the user
        const userData = await User.findById({_id: userId}).populate({
            path: "bookmarkedNews",
            options: { sort: { bookmarkedAt: -1 } }
          }).exec() ;

        // which of the below 2 will work
        // const bookmarkedNews = user.bookmarkedNews.populate("bookmarkedNews").exec() ;
        const bookmarkedNews = userData.bookmarkedNews ;

        // check is bookmarkedNews[] length is 0
        if(bookmarkedNews.length == 0){
            return res.status(200).json({
                success: true,
                message: "No news liked yet."
            }) ;
        }

        // return response
        return res.status(200).json({
            success: true,
            message: "User's bookmarked news fetched.",
            bookmarkedNews
        }) ;
    }catch(err){
        console.log(err) ;
        console.log(err.message) ;
        return res.status(500).json({
            success: false,
            message: err.message
        }) ;
    }
}

// TODO: done -- delete bookmarked news
exports.deleteBookmarkedNews = async (req, res) => {
  try {
    const userId = req.user.id;
    const newsId = req.params.id; // ✅ Get the article ID from route param

    // Check if the news exists and belongs to the user
    const news = await Bookmark.findById(newsId);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    // Remove the news from Bookmark collection
    const deletedNews = await Bookmark.findByIdAndDelete(newsId);
    console.log("Deleted News:", deletedNews);

    // Remove the reference from the User
    const updatedUserData = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { bookmarkedNews: newsId },
      },
      { new: true }
    );

    console.log("Updated User data:", updatedUserData);

    return res.status(200).json({
      success: true,
      message: "News deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

