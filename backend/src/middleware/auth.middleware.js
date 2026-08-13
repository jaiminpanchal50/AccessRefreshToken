import jwt from 'jsonwebtoken'
import { appConfig } from '../config/config.js'
import { userModel } from '../model/user.model.js'



export async function authUser(req, res, next) {

    try {
        const accessToken = req.cookies.accessToken

        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access"
            })
        }

        const decode = jwt.verify(accessToken, appConfig.JWT_ACCESS_SECRET)

        const user = await userModel.findById(decode.id).select('-refreshToken')

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }


        req.user = user
        next()

    } catch (err) {
        if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            })
        }
        next(err)
    }

}