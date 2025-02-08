import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { User } from "../models/user.model.js";
const eventSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,

        },
        userid: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        organizer: {
            type: String,
            required: true

        },
        date: {
            type: String,

        },
        time: {
            type: String,
            required: true,
        },
       
    },
    {
        timestamps: true,
    }
);



export const Event = mongoose.model("Event", eventSchema);
