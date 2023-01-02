// importing modules
const express = require("express");
const router = express.Router();
const auth = require('../middlewares/auth');

// importing controller
const userController = require('../controllers/user');

// user -> dashboard
// router.get("/user/:page", auth(['admin', 'user']), userController.getUserDashboard);

//user -> update password
router.put("/user/update-password", auth('admin'), userController.putUpdatePassword);

//user -> update profile
router.put("/user/update-profile", auth('admin'), userController.putUpdateUserProfile);

// user -> delete user account
router.delete("/user/delete-profile/:user_id", auth('admin'), userController.deleteUserAccount);

module.exports = router;