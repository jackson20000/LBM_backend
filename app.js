const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./src/config/config');
const morgan = require('./src/config/morgan');
const { jwtStrategy } = require('./src/config/passport');
const routes = require('./src/routes');
const { errorConverter, errorHandler } = require('./src/middlewares/error');
const ApiError = require('./src/utils/ApiError');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

app.get('/status', (req,res)=>{
  return res.status(200).json({success: 'true' });
});

// api routes
app.use('/api', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  if (`${req.url}`.includes('/api')) {
    next(new ApiError(httpStatus.NOT_FOUND, `404 Not found - ${req.url}`));
  }
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
