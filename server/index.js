require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/connectDB');
const app = express();
const configuredOrigins = process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || process.env.CORS_ORIGIN || '';
const allowedOrigins = new Set(['http://localhost:3000','https://news-together-app.vercel.app',...configuredOrigins.split(',').map(origin=>origin.trim()).filter(Boolean)]);
app.use(cors({origin(origin,callback){if(!origin || allowedOrigins.has(origin)) return callback(null,true);const error=new Error('Origin not allowed');error.status=403;return callback(error);},credentials:true,methods:['GET','POST','PUT','DELETE','OPTIONS'],allowedHeaders:['Content-Type','Authorization','X-Requested-With']}));
app.use(express.json({limit:'256kb'}));
app.use(cookieParser());
app.get('/health',(req,res)=>res.json({status:'OK',environment:process.env.NODE_ENV || 'development'}));
app.use('/api/v1',require('./routes/news'));
app.get('/',(req,res)=>res.json({message:'Welcome to NewTogether API',status:'running'}));
app.use((req,res)=>res.status(404).json({success:false,message:'Route not found.'}));
app.use((error,req,res,next)=>res.status(error.status || 500).json({success:false,message:error.status===403?'Origin not allowed.':error.status===400?'Invalid request.':'Internal server error.'}));
async function start(){await connectDB();app.listen(process.env.PORT || 4000,()=>console.log('NewTogether API listening on port '+(process.env.PORT || 4000)));}
if(require.main===module)start().catch(()=>{console.error('Unable to start API. Check database configuration.');process.exit(1);});
module.exports=app;
