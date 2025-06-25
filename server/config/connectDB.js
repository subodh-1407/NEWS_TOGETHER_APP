   const mongoose = require('mongoose');

   const connectDB = async () => {
       try {
           await mongoose.connect(process.env.MONGODB_URI);
           console.log('DB Connection Successful');
       } catch (error) {
           console.error('DB Connection Issues', error);
           process.exit(1); // Exit the process with failure
       }
   };

   module.exports = connectDB;
   