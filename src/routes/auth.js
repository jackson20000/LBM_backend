const express = require("express");
const router = express.Router();
const auth = require('../middlewares/auth');


// Import index controller
const authController = require('../controllers/auth');

router.post("/login", authController.loginUser);

router.post("/signup", auth('admin'), authController.createUser);

module.exports = router;