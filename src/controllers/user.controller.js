import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken= async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refreshToken = user.generateRefrehToken()
        
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {refreshToken, accessToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access token and refresh token")
    }
}

const registerUser= asyncHandler(async(req, res)=>{
      
    const {username, fullname, email, password} = req.body

    if([username, fullname, email, password].some((field)=>
        field?.trim()==="")
    ){
       throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{email}, {username}]
    })
         if(existedUser){
            throw new ApiError(409, "User with usename or email Already Exists")
         }

         const avatarLocalpath = req.files?.avatar[0]?.path;
         
         const coverImageLocalpath = req.files?.coverImage[0]?.path;

         if(!avatarLocalpath){
            throw new ApiError(400, "Avatar file is required")
         }
       
         const avatar = await uploadonCloudinary(avatarLocalpath)

         const coverImage = await uploadonCloudinary(coverImageLocalpath)

         if(!avatar){
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

         return res.status(200).json(
            new ApiResponse(200, createdUser, "User Registered Successfully")
          )
})

   const loginUser = asyncHandler(async (req, res) =>{
     // req body se data aaega
     // username or email ke basis pe login ka logic 
     // email or username ke basis pe data base mein search hoga ki user exist karta hai ya ni
     // agr karta hai toh password ka access lo
     // fr data base call karo aur check karo
     // access token and refresh token gen kar do
     // send cookies 
    
     const {username, email, password} = req.body
      if(!username && !email){
        throw new ApiError(400, "Emial or Usename is required")
      }

      const user = await User.findOne({
        $or: [{username}, {email}]
      })

      if(!user){
        throw new ApiError(404, "user does not exist")
      }
    
      const isPasswordValidate= await user.isPasswordCorrect(password)
      if(!isPasswordValidate){
        throw new ApiError(401, "password is incorrect")
      }

      const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)


        const loggedInuser = await User.findById(user._id).select("-password, -refreshToken")
        
        const option ={
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
           new ApiResponse(
            200,
            {
                user: loggedInuser, accessToken, refreshToken
            },
            "User Logged In Successfully"
           )
         )
   })


         const logoutUser = asyncHandler(async(req, res)=>{
          User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    refreshToken:undefined
                }
            },
            {
                new: true
            }
          )

          const option ={
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .clearCookie("accessToken", accessToken, option)
        .clearCookie("refreshToken", refreshToken, option)
        .json(
           new ApiResponse(
            200,
            {},
            "User Logged Out Successfully"
           )
         )
        
         })

       const resfreshAccessToken = asyncHandler(async (req, res)=>{
           try {
             const incommingRefreshToken=(req.cookie.refreshToken || req.body.refreshToken)
 
             if(!incommingRefreshToken){
                 throw new ApiError(401, "Unotharized User Access")
             }
          
         const decodedToken= jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
          
         const user = User.findById(decodedToken?._id)
 
         if(!user){
             throw new ApiError(401, "Invalid User")
         }
 
         if(incommingRefreshToken !== user.refreshToken){
             throw new ApiError(401, "Refresh Token is Wxpired or Used")
         }
 
         const {newaccessToken, newrefreshToken} = await generateAccessAndRefreshToken(user._id)
 
         const options={
             httpOnly:true,
             secure:true
         }
         return res
         .status(200)
         .cookie("accessToken", newaccessToken, options)
         .cookie("refreshToken",newrefreshToken, options)
         .json(
             new ApiResponse(
                 200,
                 {accessToken: newaccessToken, refreshToken: newrefreshToken},
                 "Access Token refreshed"
             )
         )
        } catch (error) {
            new ApiError(401, error?.message || "Invalid Refresh Token")
        }
        })
 




    //    res.status(200).json(
    //     new ApiResponse(200, createdUser, "User Registered Successfully")
    //   )


export {
    registerUser,
    loginUser,
    logoutUser,
    resfreshAccessToken
}