import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/Event.model.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const createEvent = asyncHandler(async (req, res) => {
    const { name, description, date, time, organizer } = req.body;
    console.log(req.body);
    if (!name || !time || !organizer) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const user = await User.findById(req.userID);
        console.log(user);
        console.log(req.userID);

        if (!user) {
            return res.status(404).json(new ApiError(404, null, "User not found"));
        }

        if (user.role !== "1") { // role "1" is for event organizers
            return res.status(403).json(new ApiError(403, null, "Only event organizers can create events"));
        }

        // Create a new event
        const newEvent = new Event({
            name,
            description,
            date,
            time,
            organizer,
            userid: user._id,  // Associate the event with the logged-in user
        });

        await newEvent.save();

        return res.status(201).json({
            message: "Event created successfully",
            event: newEvent,
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});



const getEventsByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch events created by the user
        const events = await Event.find({ userid: userId }).exec();

        if (!events.length) {
            return res.status(404).json(new ApiError(404, null, "No events found for this user"));
        }

        return res.status(200).json({
            message: "Events fetched successfully",
            data: events,
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


const getAllEvents = asyncHandler(async (req, res) => {
    try {
        // Fetch all events
        const events = await Event.find().exec();

        if (!events.length) {
            return res.status(404).json(new ApiError(404, null, "No events found"));
        }

        return res.status(200).json({
            message: "All events fetched successfully",
            data: events,
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


const updateEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, date, time, organizer } = req.body;

    try {
        const user = await User.findById(req.userID);

        if (!user) {
            return res.status(404).json(new ApiError(404, null, "User not found"));
        }
        if (user.role !== "1") {
            return res.status(403).json(new ApiError(403, null, "Only event organizers can update events"));
        }
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json(new ApiError(404, null, "Event not found"));
        }
        if (event.userid.toString() !== user._id.toString()) {
            return res.status(403).json(new ApiError(403, null, "You can only update your own events"));
        }
        if (name) event.name = name;
        if (description) event.description = description;
        if (date) event.date = date;
        if (time) event.time = time;
        if (organizer) event.organizer = organizer;

        await event.save();

        return res.status(200).json({
            message: "Event updated successfully",
            event,
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});
// Delete Event
const deleteEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json(new ApiError(404, null, "Event not found"));
        }
        await Event.deleteOne({ _id: id });
        return res.status(200).json({
            message: "Event deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

export {
    createEvent,
    getEventsByUserId,
    getAllEvents,
    updateEvent,
    deleteEvent
};
