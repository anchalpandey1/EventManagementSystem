import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return next(new ApiError(401, "Unauthorized request"));
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            return next(new ApiError(401, "Invalid Access Token"));
        }

        req.user = user;
        req.userID = user._id;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(new ApiError(401, "Token has expired"));
        }
        return next(new ApiError(401, error?.message || "Invalid access token"));
    }
});

export const isAdmin = asyncHandler(async (req, res, next) => {
    try {
        const user = req.user; // Get user information attached to the request

        if (user.role !== "admin") {
            throw new ApiError(403, "You are not authorized to perform this action");
        }

        next(); // User is admin, proceed to the next middleware or route handler
    } catch (error) {
        next(error); // Pass any errors to the error handler middleware
    }
});

export const isSuperAdmin = asyncHandler(async (req, res, next) => {
    try {
        const user = req.user; // Get user information attached to the request

        if (user.role !== "0") {
            throw new ApiError(403, "You are not authorized to perform this action. This is for superadmins only.");
        }

        next(); // User is superadmin, proceed to the next middleware or route handler
    } catch (error) {
        next(error); // Pass any errors to the error handler middleware
    }
});
