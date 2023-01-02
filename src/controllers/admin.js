const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// importing models
const User = require("../models/user");
const Activity = require("../models/activity");
const Book = require("../models/book");
const PER_PAGE = 5;


exports.postDashboard = catchAsync(async (req, res) => {

    var page = req.params.page || 1;
    const perPage = Number(req.query.limit) || 10;
 
    try {
       const acti = await Activity
          .find()
          .sort({_id: -1})
          .skip((perPage * page) - perPage)
          .limit(perPage)
 
       const count = await Activity.find().countDocuments();

       const bookCount = await Book.find().countDocuments();
       const userCount = await User.find({role: 'user'}).countDocuments();
 
       res.send({
          activity: acti,
          current: page,
          pages: Math.ceil(count / perPage),
          success: true,
          count: { book: bookCount, user: userCount }
       })
    } catch (err) {
       console.log(err)
       throw new ApiError(httpStatus.OK, err.message);
    }
 })


exports.findUsers = catchAsync(async (req, res) => {

    var page = req.params.page || 1;
    const searchTerm = req.body.search;
    const perPage = Number(req.query.limit) || PER_PAGE;
 
    try {
       const users = await User
          .find({ $or: [{ username: { $regex: new RegExp(searchTerm, 'igm') } }, { email: { $regex: new RegExp(searchTerm, 'igm') } }, { firstName: { $regex: new RegExp(searchTerm, 'igm') } }, { lastName: { $regex: new RegExp(searchTerm, 'igm') } }], role: 'user' })
          .select({password: 0, bookIssueInfo: 0})
          .skip((perPage * page) - perPage)
          .limit(perPage)
 
       const count = await User.find({ $or: [{ username: { $regex: new RegExp(searchTerm, 'igm') } }, { email: { $regex: new RegExp(searchTerm, 'igm') } }, { firstName: { $regex: new RegExp(searchTerm, 'igm') } }, { lastName: { $regex: new RegExp(searchTerm, 'igm') } }], role: 'user' }).countDocuments();
 
       res.send({
          users: users,
          current: page,
          pages: Math.ceil(count / perPage),
          success: true
       })
    } catch (err) {
       console.log(err)
       throw new ApiError(httpStatus.OK, err.message);
    }
 })
