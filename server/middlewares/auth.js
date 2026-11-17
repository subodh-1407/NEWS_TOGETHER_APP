




const User = require("../models/User")
require("dotenv").config()
const jwt = require("jsonwebtoken")

exports.auth = async (req, res, next) => {
  try {
    let token = null

    const authorization = req.header('Authorization');
    if (authorization?.startsWith('Bearer ')) token = authorization.slice(7);
    else if (req.cookies?.token) token = req.cookies.token;

    console.log("Extracted token:", token ? "Token found" : "No token")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      })
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET)
      console.log("Token decoded successfully for user:", decode.id)
      req.user = decode
      next()
    } catch (err) {
      console.log("Token verification failed:", err.message)
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      })
    }
  } catch (err) {
    console.error("Auth middleware error:", err)
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    })
  }
}
