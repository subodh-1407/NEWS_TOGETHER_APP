const mongoose = require('mongoose');
const Bookmark = require('../models/Bookmark');
const User = require('../models/User');

exports.addToBookmarkedNews = async (req, res) => {
  try {
    const {title, description = '', author, urlToImage, image, url, publishedAt} = req.body;
    if (typeof title !== 'string' || !title.trim() || typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
      return res.status(400).json({success:false,message:'A title and valid article URL are required.'});
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({success:false,message:'Please sign in again.'});
    const existing = await Bookmark.findOne({_id:{$in:user.bookmarkedNews},url});
    if (existing) return res.json({success:true,message:'News already bookmarked.',savedArticle:existing});
    const article = await Bookmark.create({title,description,author,image:urlToImage || image,url,publishedAt,bookmarkedAt:Date.now()});
    let updatedUser;
    try {
      updatedUser = await User.findByIdAndUpdate(user._id,{$addToSet:{bookmarkedNews:article._id}},{new:true});
      if (!updatedUser) throw new Error('Account no longer available');
    } catch (error) {
      await Bookmark.findByIdAndDelete(article._id);
      throw error;
    }
    return res.status(200).json({success:true,message:'News Bookmarked Successfully',savedArticle:article,updatedUserData:{_id:updatedUser._id,bookmarkedNews:updatedUser.bookmarkedNews}});
  } catch (error) {
    return res.status(500).json({success:false,message:'Unable to save the article. Please try again.'});
  }
};

exports.getAllBookmarkedNews = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({path:'bookmarkedNews',options:{sort:{bookmarkedAt:-1}}}).exec();
    if (!user) return res.status(401).json({success:false,message:'Please sign in again.'});
    return res.json({success:true,bookmarkedNews:(user.bookmarkedNews || []).filter(Boolean),message:'Bookmarked news fetched.'});
  } catch (error) {
    return res.status(500).json({success:false,message:'Unable to load favourites. Please try again.'});
  }
};

exports.deleteBookmarkedNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    if (!mongoose.isValidObjectId(newsId)) return res.status(400).json({success:false,message:'Invalid bookmark ID.'});
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({success:false,message:'Please sign in again.'});
    const ownsBookmark = (user.bookmarkedNews || []).some(id => String(id) === newsId);
    // A repeated request is successful, but must never delete another account's bookmark.
    if (!ownsBookmark) return res.json({success:true,message:'Bookmark already removed.'});
    // Also clean up the user's reference when a legacy bookmark document is already missing.
    await Bookmark.findByIdAndDelete(newsId);
    await User.findByIdAndUpdate(user._id,{$pull:{bookmarkedNews:newsId}});
    return res.json({success:true,message:'News deleted successfully'});
  } catch (error) {
    return res.status(500).json({success:false,message:'Unable to remove the article. Please try again.'});
  }
};
