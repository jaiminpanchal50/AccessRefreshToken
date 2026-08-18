import { config } from "dotenv";

config()

const normalizeOrigin = (origin) => origin.replace(/\/+$/, "");


if (!process.env.PORT) {
    throw new Error("PORT is not defined in env file")
}


if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in env file")
}


if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not defined in env file")
}


if (!process.env.JWT_ACCESS_EXPIRE) {
    throw new Error("JWT_ACCESS_EXPIRE is not defined in env file")
}


if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("MONGO_URI is not defined in env file")
}


if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("MONGO_URI is not defined in env file")
}


if (!process.env.NODE_ENVIRONMENT) {
    throw new Error("NODE_ENVIRONMENT is not defined in env file")
}


if (!process.env.CORS_ORIGIN) {
    throw new Error("CORS_ORIGIN is not defined in env file")
}



export const appConfig = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRE,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE,
    NODE_ENVIRONMENT: process.env.NODE_ENVIRONMENT,
    CORS_ORIGIN: normalizeOrigin(process.env.CORS_ORIGIN),
}