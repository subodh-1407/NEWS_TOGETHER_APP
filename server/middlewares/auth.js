// const User = require("../models/User") ;
// require("dotenv").config() ;
// const jwt = require("jsonwebtoken") ;

// exports.auth = async(req, res, next) => {
//     try{    
        
//         // extract token

//         console.log("Cookies : ", req.cookies.token) ;
//         console.log("Body : ", req.body.token) ;
//         console.log(req.header("Authorization")) ;
//         const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");

//         console.log("token : ", token) ;

//         // if token missing then return response
//         if(!token){
//             return res.status(401).json({
//                 success: false,
//                 message: "Token is missing" 
//             }) ;
//         }

//         // verify the token
//         try{
//             const decode = jwt.verify(token, process.env.JWT_SECRET) ;
//             console.log("Decode : ", decode) ;

//             req.user = decode ;
//         }catch(err){
//             // verification issue
//             console.log(err.message) ;
//             return res.status(401).json({
//                 success: false,
//                 message: "Token is invalid"
//             }) ;
//         }
//         next() ;
        
//     }catch(err){
//         console.error(err) ;
//         console.log(err.message) ;
//         return res.status(403).json({
//             success: false,
//             message: "Something went wrong while validating the token"
//         }) ;
//     }
// }

const User = require("../models/User")
require("dotenv").config()
const jwt = require("jsonwebtoken")

exports.auth = async (req, res, next) => {
  try {
    // Extract token from multiple sources
    let token = null

    // Check cookies first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token
    }
    // Check body
    else if (req.body && req.body.token) {
      token = req.body.token
    }
    // Check Authorization header
    else if (req.header("Authorization")) {
      const authHeader = req.header("Authorization")
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.replace("Bearer ", "")
      }
    }

    console.log("Extracted token:", token ? "Token found" : "No token")

    // If token missing then return response
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      })
    }

    // Verify the token
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
