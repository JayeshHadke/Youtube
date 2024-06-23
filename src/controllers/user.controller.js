import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";
import { uploadOnCloud,deleteFromCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    // get user details from frontend
    const { fullName, email, userName, password } = req.body;
    // validation - not empty
    if ([
        fullName,
        email,
        userName,
        password
    ].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    // check if user already exists: username, email
    var existedUser = await User.findOne({ $or: [{ email }, { userName }] });

    if (existedUser) {
        throw new ApiError(400, "User already exists");
    }
    // check for images, check for avatar
    const avatarLocalPath = req.files.avatar ? req.files.avatar[0]?.path : null;
    const coverLocalPath = req.files.coverImage ? req.files.coverImage[0]?.path : null;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }
    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloud(avatarLocalPath);
    const cover = await uploadOnCloud(coverLocalPath);
    // create user object - create entry in db
    var user = await User.create({
        fullName,
        email,
        userName,
        password,
        avatar: avatar.url,
        coverImage: cover ? cover.url : null
    });
    //  check for user creation and remove password and refresh token field from response
    var createdUser = await User.findById({ _id: user._id }).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong, please try again later");
    }
    // return res
    res.status(201).json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    // req body -> data
    const { username, password } = req.body;
    // username or email
    if (!username || !password) {
        throw new ApiError(400, "Username and password are required");
    }
    //find the user
    var user = await User.findOne({ $or: [{ userName: username }, { email: username }] });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }
    //password check
    if (!(await user.isPasswordCorrect(password))) {
        throw new ApiError(401, "Invalid username or password");
    }
    //access and referesh token
    var { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    //send cookie

    var loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    var cookieOptions = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("accessToken", accessToken, cookieOptions).cookie("refreshToken", refreshToken, cookieOptions).json(new ApiResponse(200, {
        user: loggedInUser, accessToken, refreshToken
    }, "Login successful"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    }, {
        new: true
    });
    var options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "Logout successful"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    var incomingRefreshToken = req.cookies.refreshAccessToken || req.headers.authorization.replace("Bearer ", "");
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized");
    }
    var decodedToken = jwt.verify(incomingRefreshToken, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
        throw new ApiError(401, "Unauthorized");
    }
    var user = await User.findById(decodedToken?._id);
    if (!user) {
        throw new ApiError(401, "Unauthorized");
    }

    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Unauthorized");
    }

    var { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    var cookieOptions = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("accessToken", accessToken, cookieOptions).cookie("refreshToken", refreshToken, cookieOptions).json(new ApiResponse(200, {
        accessToken, refreshToken: refreshToken
    }, "Token refreshed successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    var { oldPassword, newPassword } = req.body;
    const user = await user.findById(req.user?._id);
    var isPasswordCorrect = user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, {}, "Password Changed Successfully"))
});

const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, req.user, "Current User"));
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    var { fullName, email } = req.body;
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required!");
    }
    const user = await user.findByIdAndUpdate(req.user?._id, { $set: { fullName: fullName, email: email } }, { new: true }).select("-password -refreshToken")
    res.status(200).json(new ApiResponse(200, user, "Account Updated Successfully"));
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    var avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avator File not found");
    }
    await deleteFromCloud(req.user.avatar);
    var avatar = await uploadOnCloud(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Error while uploading avatar");
    }
    const user = await User.findByIdAndUpdate(req.user?._id, { $set: { avatar: avatar.url } }, { new: true }).select("-password -refreshToken")

    res.status(200).json(new ApiResponse(200, user, "Updated Account"));

});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    var coverLocalPath = req.file?.path;
    if (!coverLocalPath) {
        throw new ApiError(400, "Avator File not found");
    }
    await deleteFromCloud(req.user.coverImage);
    var cover = await uploadOnCloud(coverLocalPath);
    if (!cover) {
        throw new ApiError(400, "Error while uploading Cover");
    }
    const user = await User.findByIdAndUpdate(req.user?._id, { $set: { coverImage: cover.url } }, { new: true }).select("-password -refreshToken")

    res.status(200).json(new ApiResponse(200, user, "Updated Account"));

});
const generateAccessAndRefreshToken = async (userId) => {
    try {
        var user = await User.findById(userId);
        var accessToken = await user.generateAccessToken();
        var refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong, please try again later");
    }
};

const getUserChannelProfile = asyncHandler((req,res) => {
    const { username } = req.params;
    if(!user?.trim()){
        throw new ApiError(404,"User name is missing");
    }
    const channel = User.aggregate([
        {
            $match : {
                userName: username
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup : {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscription",
                as: "subscriptions"
            
            }
        },
        {
            $addFields : {
                subscriberCount: { $size: "$subscribers" },
                subscriptionCount: { $size: "$subscriptions" },
                isSubscribed: {
                    $cond : {
                        $if : {$in: [req.user?._id, "$subscribers.subscription"]},
                        $then : true,
                        $else : false
                    }
                }            
            }
        },
        {
            $project : {
                fullName : 1,
                username: 1,
                subscriberCount  :1,
                subscriptionCount : 1,
                email : 1,
                avatar : 1,
                coverImage : 1
            }
        }
    ]);
    if(!channel){
        throw new ApiError(404,"Channel not found");
    }
    res.status(200).json(new ApiResponse(200,channel[0],"Channel Profile"));
});

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile };