import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
    const {fullName, email,userName, password} = res.body;
    console.log(fullName, email, userName, password);
    res.status(200).json({ message: "ok" });
});

export { registerUser };