import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async(req,res)=>{
    // res.status(200).json({
        // message: "OK"        //Testing
    // })

    // -----------------------------------------
    // get user details from front end
    const {fullName,email,username,password}=req.body
    console.log("email", email);
    
    // -----------------------------------------
    // Validation -not empty
    if(!fullName || !password || !username || !email){
        // console.log("Hello")
        throw new ApiError(400,"All Fields are required")
    }

    // -----------------------------------------
    //check if user already exist :username,email
    const existedUser = User.find({
        $or:[{username},{email}]
    })

    console.log(existedUser)
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

    // -----------------------------------------
    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;       //if (req.files && req.files.avatar && req.files.avatar[0])
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    // -----------------------------------------    
    //upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Error while uploading avatar to cloudinary")
    }


    // -----------------------------------------
    // create user object -create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password
    })

    // remove password and refresh token field from response


    // -----------------------------------------
    // check for user creation
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while creating user")
    }

    // -----------------------------------------
    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully!")
    )





})

export {registerUser}