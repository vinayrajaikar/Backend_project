import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken =async(userId)=>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // adding refresh token to model
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
    }
    catch(error){
        throw new ApiError(500, "Something went wrong while generating access and referesh token")
    }
}

const registerUser = asyncHandler( async(req,res)=>{
    // res.status(200).json({
        // message: "OK"        //Testing
    // })

    // -----------------------------------------
    // get user details from front end
    const {fullName,email,username,password}=req.body
    console.log("email", email);
    console.log("fullName", fullName)
    
    // -----------------------------------------
    // Validation -not empty
    if(!fullName || !password || !username || !email){
        // console.log("Hello")
        throw new ApiError(400,"All Fields are required")
    }

    // -----------------------------------------
    //check if user already exist :username,email
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    console.log(existedUser)
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

    // -----------------------------------------
    // check for images, check for avatar
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;       //if (req.files && req.files.avatar[0] && req.files.avatar[0].path)
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
    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password
    })

    // -----------------------------------------
    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // -----------------------------------------
    // check for user creation

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while creating user")
    }

    // -----------------------------------------
    // return response
    return res.status(201).json(
        // creating Api response object
        new ApiResponse(200, createdUser, "User registered Successfully!")
    )

})

const loginUser = asyncHandler( async(req, res) => {
    // Bring data from req.body
    const {username,email,password} = req.body

    // username or email
    if(!(username || email)){
        throw new ApiError(400,"Username or email is required")
    }

    // find user
    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    // check password
    // if password valid then=> acsess and referesh token
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Incorrect password")
    }

    // access and referesh token
    const {accessToken,refreshToken}= await generateAccessAndRefreshToken(user._id)

    // send cookie
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
               user: loggedInUser.accessToken.refreshToken 
            },
            "User logged in successfully"
        )
    )

})

const logoutUser = asyncHandler( async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new Response(200, {}, "User logged Out Successfully!"))
})

export {
    registerUser,
    loginUser,
    logoutUser
}