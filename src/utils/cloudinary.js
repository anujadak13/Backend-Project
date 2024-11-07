import {v2 as cloudinary} from "cloudinary"

import fs from "fs"

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
    api_key: process.env.CLOUDNARY_CLOUD_KEY,
    api_secret: process.env.CLOUDNARY_CLOUD_SECRET
});

const uploadonCloudinary= async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
       fs.unlinkSync(localFilePath) // ressmoving the uploaded file from our local termial.
       return null;
    }
}

export {uploadonCloudinary}