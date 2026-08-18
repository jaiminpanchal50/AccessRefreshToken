import { appConfig } from "../config/config.js"
import { userModel } from "../model/user.model.js"
import jwt from 'jsonwebtoken'
const baseCookieOption = {
    httpOnly: true,
    secure: appConfig.NODE_ENVIRONMENT === "production",          // HTTPS only in production
    sameSite: appConfig.NODE_ENVIRONMENT === "production" ? "strict" : "lax", // "strict" in prod = blocks CSRF,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7days
}


export async function registerController(req, res, next) {
    const { name, email, password } = req.body
    try {

        const isEmailExist = await userModel.findOne({ email })

        if (isEmailExist) {
            return res.status(401).json({
                success: false,
                message: "User already exist with this email"
            })
        }

        const user = await userModel({
            name, email, password
        })

        const accessToken = await user.generateAccessToken(user._id)
        const refreshToken = await user.generateRefreshToken(user._id)

        user.refreshToken = refreshToken;
        user.save()

        res.cookie("accessToken", accessToken, baseCookieOption)
        res.cookie("refreshToken", refreshToken, baseCookieOption)


        return res.status(201).json({
            success: true,
            message: "User registerd successfully",
            user: {
                name: user.name,
                email: user.email,
                _id: user._id,
                refreshToken: user.refreshToken
            }
        })

    } catch (err) {
        next(err)
    }
}


export async function loginController(req, res, next) {
    const { email, password } = req.body
    try {

        const isEmailExist = await userModel.findOne({ email }).select("+password");

        if (!isEmailExist) {
            return res.status(404).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        const isCorrectPass = await isEmailExist.compairPassword(password)


        if (!isCorrectPass) {
            return res.status(409).json({
                sucess: false,
                message: "Invalid email or password"
            })
        }


        const accessToken = await isEmailExist.generateAccessToken(isEmailExist._id)
        const refreshToken = await isEmailExist.generateRefreshToken(isEmailExist._id)

        isEmailExist.refreshToken = refreshToken;
        await isEmailExist.save()

        res.cookie("accessToken", accessToken, baseCookieOption)
        res.cookie("refreshToken", refreshToken, baseCookieOption)


        return res.status(200).json({
            success: true,
            message: "User LoggedIn successfully",
            user: {
                name: isEmailExist.name,
                email: isEmailExist.email,
                _id: isEmailExist._id,
                refreshToken: isEmailExist.refreshToken
            }
        })


    } catch (err) {
        next(err)
    }
}

export async function getMe(req, res, next) {
    return res.status(200).json({ success: true, user: req.user })
}

export async function newAccessToken(req, res, next) {
    try {
        const incomingRefreshToken = req.cookies.refreshToken

        if (!incomingRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token missing, please log in again"
            })
        }

        let decoded
        try {
            decoded = jwt.verify(incomingRefreshToken, appConfig.JWT_REFRESH_SECRET)
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token, please log in again"
            })
        }

        const user = await userModel.findById(decoded.id).select('+refreshToken')

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // reuse/rotation check — the presented token must match what's stored
        if (user.refreshToken !== incomingRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is invalid, please log in again"
            })
        }

        const accessToken = await user.generateAccessToken(user._id)
        const newRefreshToken = await user.generateRefreshToken(user._id)

        user.refreshToken = newRefreshToken
        await user.save()

        res.cookie("accessToken", accessToken, baseCookieOption)
        res.cookie("refreshToken", newRefreshToken, baseCookieOption)

        const userResponse = user.toObject()
        delete userResponse.password
        delete userResponse.refreshToken

        return res.status(200).json({
            success: true,
            message: "New access token generated",
            user: userResponse
        })

    } catch (err) {
        next(err)
    }
}