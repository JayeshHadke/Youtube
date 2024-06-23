import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshToken").post(verifyJWT, refreshAccessToken);
router.route("/changePassword").post(verifyJWT, changeCurrentPassword);
router.route("/getCurrentUser").post(verifyJWT, getCurrentUser);
router.route("/updateAccountDetails").post(verifyJWT, updateAccountDetails);
router.route("/updateUserAvatar").post(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/updateUserCoverImage").post(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/c/:username").post(verifyJWT, getUserChannelProfile);

export default router;