const express = require("express") ;
const app = express() ;
const cors=require('cors');
const connectDB = require('./config/connectDB');
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

const cookieParser = require("cookie-parser") ;

require("dotenv").config() ;
const PORT = process.env.PORT || 4000 ;

// middleware to parse the objects from the req body
app.use(express.json()) ;
app.use(cookieParser()) ;
// try adding cookie parser


connectDB() ;

// route import and mount
const news = require("./routes/news") ;
app.use("/api/v1", news) ;


app.get("/", () => {
    console.log(`App is running on port no. ${PORT}`)
})
// app.get("/", async (req, res) => {
//   res.status(200).json({
//     message: "Hello from server",
//   })
// })
// activate
app.listen(PORT, () => {
    console.log(`App is currently listening at ${PORT}`) ;
})
