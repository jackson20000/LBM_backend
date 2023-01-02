const fs = require('fs');
const deleteImage = require('../utils/delete_image');
const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { ObjectId } = require('mongoose').Types;

// importing models
const User = require("../models/user"),
    Activity = require("../models/activity"),
    Issue = require("../models/issue");

// GLOBAL_VARIABLES
const PER_PAGE = 5;

// user -> update/change password
exports.putUpdatePassword = catchAsync(async (req, res, next) => {
    const id = req.user;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.password;

    try {
        const user = await User.findById(id);
        if (!user || !(await user.isPasswordMatch(oldPassword))) {
            throw new ApiError(httpStatus.OK, 'Incorrect password');
        }
        await User.updateOne({ _id: id }, { $set: { password: await bcrypt.hash(newPassword, 8) } });

        // logging activity
        const activity = new Activity({
            info: `${user.firstName} has updated password`,
            category: "Update Password",
        });
        await activity.save();
        res.send({ message: 'Password updated', success: true });
    } catch (err) {
        console.log(err)
        throw new ApiError(httpStatus.OK, err.message);
    }
})

// user -> update profile
exports.putUpdateUserProfile = catchAsync(async (req, res, next) => {
    try {
        const userUpdateInfo = {
            "firstName": req.body.firstName,
            "lastName": req.body.lastName,
            "email": req.body.email,
            "gender": req.body.gender,
            "address": req.body.address,
        }
        await User.findByIdAndUpdate(req.user, userUpdateInfo);

        // logging activity
        const activity = new Activity({
            info: `${req.body.firstName} has updated his profile`,
            category: "Update Profile",
        });
        await activity.save();

        res.send({ message: 'Profile updated', success: true });
    } catch (err) {
        console.log(err);
        throw new ApiError(httpStatus.OK, 'Incorrect email or password');
    }
})

// user -> delete user account
exports.deleteUserAccount = async (req, res) => {
    try {
        const { user_id } = req.params;

        const user = await User.findById(user_id);
        if(!user){
            res.send({ message: 'User not found', success: false });
        }
        await user.remove();

        let imagePath = `images/${user.image}`;
        if (fs.existsSync(imagePath)) {
            deleteImage(imagePath);
        }

        await Issue.deleteMany({ "user_id": ObjectId(user_id) });
        res.send({ message: 'User Removed', success: true });
    } catch (err) {
        console.log(err);
        throw new ApiError(httpStatus.OK, err.message);
    }
}
