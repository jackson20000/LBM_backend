const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config/config');
const { tokenTypes } = require('../config/tokens');

const generateToken = (user, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
    _id: user._id, // We are gonna use this in the middleware 'isAuth'
    role: user.role,
    username: user.username
  };
  return jwt.sign(payload, secret);
};


const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'days');
  const accessToken = generateToken(user, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

module.exports = {
  generateToken,
  generateAuthTokens,
};
