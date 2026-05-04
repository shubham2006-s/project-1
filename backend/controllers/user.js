import User from "../model/User.js"
import bcrypt from "bcryptjs"

export const getUser = async (req, res, next) => {
    const userId = req.userId
    try {
        const user = await User.findById(userId)
        if (!user) {
            const error = new Error('User not found')
            error.statusCode = 404
            throw error
        }
        res.status(200).json({ message: 'User found', user: user })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error)
    }
}

export const postChangePassword = async (req, res, next) => {
    const userId = req.userId
    const currentPassword = String(req.body.currentPassword || "")
    const newPassword = String(req.body.newPassword || "")

    try {
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters." })
        }
        if (newPassword === currentPassword) {
            return res.status(400).json({ message: "New password must be different from current password." })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const isEqual = await bcrypt.compare(currentPassword, user.password)
        if (!isEqual) {
            return res.status(401).json({ message: "Current password is incorrect." })
        }

        user.password = await bcrypt.hash(newPassword, 12)
        await user.save()

        return res.status(200).json({ message: "Password updated successfully." })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error)
    }
}