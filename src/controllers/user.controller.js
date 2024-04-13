import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";
import { uploadOnCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { registerUser };