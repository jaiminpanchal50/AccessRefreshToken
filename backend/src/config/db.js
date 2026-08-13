import mongoose from "mongoose";
import { appConfig } from "./config.js";

export function connectDB() {
    try {
        mongoose.connect(appConfig.MONGO_URI)
        console.log("DB connected")
    } catch (error) {
        console.log("Error while connecting to DB", error)
    }
}