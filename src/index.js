// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express";
// const app = express();
import connectDB from "./db/index.js";

// require('dotenv').config({path: './env'}) this require stmt gives inconsistency in our code
import dotenv from "dotenv";

dotenv.config({
    path: './env' 
})



// APPROACH 2:

connectDB();











// APPROACH 1:
// async function connectDb(){
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on('error', ()=>{
//             console.log("ERRR:",error)
//             throw error;
//         })

//         app.listen(process.env.PORT, ()=>{
//             console.log(`Server is running on port ${process.env.PORT}`)
//         })
//     }
//     catch(error){
//         console.error("Error: ", error)
//         throw err
//     }
// }

// connectDb()