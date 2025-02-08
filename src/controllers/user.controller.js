import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating access and refresh tokens");
    }
};

// User Registration
const registerUser = asyncHandler(async (req, res) => {
    try {
        const { email, password, phoneNo, role } = req.body;

        // Validate required fields
        if (!email || !password || !phoneNo) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate email format
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }

        // Validate role
        if (!["0", "1", "2"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create new user
        const newUser = new User({ email, password, phoneNo, role });
        await newUser.save();

        // Generate access token
        const accessToken = jwt.sign(
            { _id: newUser._id, role: newUser.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        return res.status(201).json({
            message: "User registered successfully",
            accessToken,
            user: { _id: newUser._id, email: newUser.email, phoneNo: newUser.phoneNo, role: newUser.role },
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// User Login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json(new ApiError(400, null, "Email and password are required"));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json(new ApiError(404, null, "User does not exist"));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json(new ApiError(401, null, "Invalid user credentials"));
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -createdAt -updatedAt -__v");

    const options = { httpOnly: true, secure: true }; // Ensure this is set for both tokens

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, loggedInUser, "userInfo", "User logged In Successfully", accessToken, refreshToken));
});

// Get Current User (with access token)
const getCurrentUser = asyncHandler(async (req, res) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json(new ApiError(401, null, "Access token is required"));
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
   if (err) {
       return res.status(401).json(new ApiError(401, null, "Token expired or invalid"));
   }
   return decoded;
});


        const user = await User.findById(decoded._id).select("-password -refreshToken -createdAt -updatedAt -__v");

        if (!user) {
            return res.status(404).json(new ApiError(404, null, "User not found"));
        }

        return res.status(200).json(new ApiResponse(200, user, "userInfo", "User data fetched successfully"));
    } catch (error) {
        return res.status(401).json(new ApiError(401, null, "Invalid or expired access token"));
    }
});

export { registerUser, loginUser, getCurrentUser };
