import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: [true, "email already exist"],
            lowecase: true,
            trim: true,
            validate: [validator.isEmail, "Invalid Email Address"],
        },
        password: {
            type: String,

        },
        role: {
            type: String,
            enum: ["0", "1", "2"], //0 Admin 1 eventorganizer 2 user
            required: [true, "Role is required"],

        },
        phoneNo: {
            type: String,
            required: [true, "Phone number is required"],
            match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role:this.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);
