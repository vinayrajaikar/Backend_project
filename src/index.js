// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express";
// const app = express();
import connectDB from "./db/index.js";
import { app } from "./app.js";

// require('dotenv').config({path: './env'}) this require stmt gives inconsistency in our code

// As early as possible, when u make project import dot env in main file, to give access of env to
// to all other files.
import dotenv from "dotenv";

dotenv.config({
    path: './.env' 
})

// As early as possible, when u make project import dot env in main file, to give access of env to
// to all other files.

// APPROACH 2:

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongo db connection failed!!! ",err);
})









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