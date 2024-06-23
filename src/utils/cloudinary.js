import { v2 as cloudinary } from 'cloudinary';
import exp from 'constants';
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const uploadOnCloud = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteFromCloud = async (cloudURL) => {
    try{
        const publicId = cloudURL.split('/').at(-1).split('.')[0];
        return cloudinary.uploader.destroy(publicId);
    } catch(error){
        return error;
    }
}
export { uploadOnCloud,deleteFromCloud };