const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const User = require("../models/user");

const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const user = await User.create(userBody);
  return user;
};


const loginUser = async (email, username, password) => {
  const user = await User.findOne({
    $or: [
      { email },
      { username }
    ], isActive: true
  });
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.OK, 'Incorrect email or password');
  }
  return JSON.parse(JSON.stringify(user));
};

module.exports = {
  createUser,
  loginUser,
};
