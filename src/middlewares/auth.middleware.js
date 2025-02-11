import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        var token = req.cookies?.accessToken || req.headers?.authorization?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized");
        }
        var decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        var user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Unauthorized");
        }
        req.user = user;
        next();
    } catch (error) {
        return new ApiError(401, "Unauthorized");
    }
});