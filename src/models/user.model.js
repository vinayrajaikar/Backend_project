import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,      
            required: true,     
            unique: true,       // The value must be unique across all documents
            lowercase: true,    
            trim: true,         // Whitespace will be removed from both ends of the value before saving
            index: true         // An index will be created on this field to optimize queries
       },

        email: {
            type: String,      
            required: true,     
            unique: true,      
            lowercase: true,    
            trim: true,               
       },

        fullName: {
            type: String,      
            required: true,           
            trim: true,   
            index:true            
        },

        avatar:{
            type: String, // Cloudi nary url
            required: true,
        },

        coverImage: {
            type: String, // Cloudinary url
        },

        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],

        password:{
            type: String,
            required: [true,'Password is required'], 
        },

        refreshToken:{
            type: String
        }


    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// To validate the encrypted password and user password 
userSchema.methods.isPasswordCorrect =async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return  jwt.sign(
            {
                _id: this._id,
                email: this.email,
                username: this.username,
                fullName: this.fullName
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        )
}
userSchema.methods.generateRefreshToken = function(){
    return  jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);