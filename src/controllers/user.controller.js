import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadonCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser= asyncHandler(async(req, res)=>{
      
    const {username, fullname, email, password} = req.body

    if([username, fullname, email, password].some(()=>
        field?.trim()==="")
    ){
       throw new ApiError(400, "All fields are required")
    }

    const existedUser=User.findOne({
        $or: [{email}, {username}]
    })
         if(existedUser){
            throw new ApiError(409, "User with usename or email Already Exists")
         }

         const avatarLocalpath = req.files?.avatar[0]?.path;
         
         const coverImageLocalpath=req.files?.coverImage[0]?.path;

         if(!avatarLocalpath){
            throw new ApiError(400, "Avatar file is required")
         }
       
         const avatar = await uploadonCloudinary(avatarLocalpath)

         const coverImage = await uploadonCloudinary(coverImageLocalpath)

         if(avatar){
            throw new ApiError(400, "Avatar file is required")
         }
         
         const user= await User.create({
            fullname,
            username: username.toLowerCase(),
            email,
            password,
            avatar: avatar.url,
            coverImage: coverImage.url || ""
         })

         const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
         )

         if(!createdUser){
            throw new ApiError(500, "Somthing went wrong while registering user")
         }
})
      return res.status(200).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
      )


export {registerUser}