if (process.env.NODE_ENV !== "production") require("dotenv").config();

// importing models
const tokenService = require("../services/token");
const loginService = require("../services/login");
const pick = require("../utils/pick");
const catchAsync = require("../utils/catchAsync");
const httpStatus = require('http-status');


const createUser = catchAsync(async (req, res) => {
  const user = await loginService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const loginUser = catchAsync(async (req, res) => {
  const { email, password, username } = req.body;
  const user = await loginService.loginUser(email, username, password);
  const userDetails = pick(user, ['_id', 'firstName', 'lastName', 'role', 'username', 'email']);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user: userDetails, token: tokens.access.token, message: 'Login successful', success: true });
});

module.exports = {
  createUser,
  loginUser,
};