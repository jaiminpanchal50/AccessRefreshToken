import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { appConfig } from '../config/config.js';

const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Email is required"],
        select: false
    },
    refreshToken: {
        type: String,
    }
}, { timestamps: true })


userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return
    }

    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.compairPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async (id) => {
    return await jwt.sign({ id }, appConfig.JWT_ACCESS_SECRET, { expiresIn: appConfig.JWT_ACCESS_EXPIRE })
}

userSchema.methods.generateRefreshToken = async (id) => {
    return await jwt.sign({ id }, appConfig.JWT_REFRESH_SECRET, { expiresIn: appConfig.JWT_REFRESH_EXPIRE })
}

export const userModel = mongoose.model('user', userSchema)