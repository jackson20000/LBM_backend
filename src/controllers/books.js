const Book = require('../models/book');
const User = require('../models/user');
const Issue = require('../models/issue');
const Activity = require('../models/activity');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');

const PER_PAGE = 9;


exports.getBooks = catchAsync(async (req, res, next) => {
   var page = req.params.page || 1;
   const filter = req.params.filter;
   const value = req.params.value;
   let searchObj = {};

   // constructing search object
   if (filter != 'all' && value != 'all') {
      // fetch books by search value and filter
      searchObj[filter] = value;
   }

   try {
      // Fetch books from database
      const books = await Book
         .find(searchObj)
         .skip((PER_PAGE * page) - PER_PAGE)
         .limit(PER_PAGE);

      // Get the count of total available book of given filter
      const count = await Book.find(searchObj).countDocuments();

      res.send({
         books: books,
         current: page,
         pages: Math.ceil(count / PER_PAGE),
         filter: filter,
         value: value,
         success: true
      })
   } catch (err) {
      console.log(err)
      throw new ApiError(httpStatus.OK, err.message);
   }
})

exports.findBooks = catchAsync(async (req, res) => {

   const page = req.params.page || 1;
   const perPage = Number(req.query.limit) || PER_PAGE;
   const searchTerm = req.body.search;

   try {
      // Fetch books from database
      const books = await Book
         .find({ $or: [{ title: { $regex: new RegExp(searchTerm, 'igm') } }, { description: { $regex: new RegExp(searchTerm, 'igm') } }, { ISBN: { $regex: new RegExp(searchTerm, 'igm') } }, { author: { $regex: new RegExp(searchTerm, 'igm') } }] })
         .skip((perPage * page) - perPage)
         .limit(perPage)

      // Get the count of total available book of given filter
      const count = await Book.find({ $or: [{ title: { $regex: new RegExp(searchTerm, 'igm') } }, { description: { $regex: new RegExp(searchTerm, 'igm') } }, { ISBN: { $regex: new RegExp(searchTerm, 'igm') } }, { author: { $regex: new RegExp(searchTerm, 'igm') } }] }).countDocuments();

      res.send({
         books: books,
         current: page,
         pages: Math.ceil(count / perPage),
         success: true
      })
   } catch (err) {
      console.log(err)
      throw new ApiError(httpStatus.OK, err.message);
   }
})

exports.postAddNewBook = catchAsync(async (req, res, next) => {
   try {
      const book_info = req.body;

      const isDuplicate = await Book.find({ ISBN: book_info.ISBN });

      if (isDuplicate.length > 0) {
         return res.send({ message: 'This book is already registered in inventory', success: false });
      }

      const new_book = new Book(book_info);
      await new_book.save();
      res.send({ message: `A new book named ${new_book.title} is added to the inventory`, success: true });
   } catch (err) {
      console.log(err);
      throw new ApiError(httpStatus.OK, err.message);
   }
});

exports.getBookDetails = catchAsync(async (req, res, next) => {
   try {
      const book_id = req.params.book_id;
      const book = await Book.findById(book_id);
      res.send({ book: book, success: true });
   } catch (err) {
      console.log(err);
      throw new ApiError(httpStatus.OK, err.message);
   }
})

//user -> issue a book
exports.postIssueBook = async (req, res, next) => {
   try {

      const book = await Book.findById(req.body.book_id);
      const user = await User.findById(req.body.user_id);
      const issuedBooksCount = await Issue.find({user_id: req.body.user_id}).countDocuments();
      if (user.violationFlag) {
         return res.send({ message: `${user.firstName} are flagged for violating rules/delay on returning books/paying fines. Untill the flag is lifted, ${user.firstName} can't issue any books`, success: false });
      }

      if (issuedBooksCount >= 5) {
         return res.send({ message: `${user.firstName} can't issue more than 5 books at a time`, success: false });
      }

      if (book.stock <= 0) {
         return res.send({ message: `${book.title} is out of stock`, success: false });
      }

      book.stock -= 1;
      const issue = new Issue({
         book_id: book._id,
         user_id: req.body.user_id
      });


      const activity = new Activity({
         info: `${book.title} issued to ${user.firstName}`,
         category: "Issue",
      });

      await issue.save();
      await book.save();
      await activity.save();

      return res.send({ message: `${book.title} has been issued to ${user.firstName}`, success: true });
   } catch (err) {
      console.log(err);
      throw new ApiError(httpStatus.OK, err.message);
   }
}

exports.getShowRenewReturn = async (req, res) => {
   const { user_id } = req.params;
   const page = req.params.page || 1;
   const perPage = Number(req.query.limit) || PER_PAGE;
   try {
      const filter = user_id !== 'all' ? { "user_id": user_id } : {};
      const issuedBooks = await Issue
         .find(filter)
         .populate('book_id user_id')
         .skip((perPage * page) - perPage)
         .limit(perPage)

      // Get the count of total available book of given filter
      const count = await Issue.find(filter).countDocuments();

      res.send({
         issues: issuedBooks,
         current: page,
         pages: Math.ceil(count / perPage),
         success: true
      })
   } catch (err) {
      console.log(err);
      throw new ApiError(httpStatus.OK, err.message);
   }
}

exports.postRenewBook = async (req, res) => {
   try {
      const searchObj = {
         "user_id": req.body.user_id,
         "book_id": req.body.book_id,
      }
      const issue = await Issue.findOne(searchObj);
      if(!Boolean(issue)){
         return res.send({ message: `Book not issued to you`, success: false });
      }
      let time = issue.returnDate.getTime();
      issue.returnDate = time + 7 * 24 * 60 * 60 * 1000;
      issue.isRenewed = true;
      const book = await Book.findById(req.body.book_id);

      // logging the activity
      const activity = new Activity({
         info: `${book.title} Renewed`,
         category: "Renew",
      });

      await activity.save();
      await issue.save();

      return res.send({ message: `${book.title} has been Renewd`, success: true });
   } catch (err) {
      console.log(err);
      throw new ApiError(httpStatus.OK, err.message);
   }
}

exports.postReturnBook = async (req, res) => {
   try {
      const { user_id, book_id } = req.body;
      const user = await User.findById(user_id);
      if(!Boolean(user)){
         return res.send({ message: `User not found`, success: false });
      }

      const book = await Book.findById(book_id);
      if(!Boolean(book)){
         return res.send({ message: `Book not found`, success: false });
      }
      book.stock += 1;
      await book.save();

      const issue = await Issue.findOne({ user_id, book_id });
      if(!Boolean(issue)){
         return res.send({ message: `Book not issued to you`, success: false });
      }
      await issue.remove();

      const activity = new Activity({
         info: `${book.title} Returned`,
         category: "Return",
      });
      await activity.save();

      return res.send({ message: `${book.title} has been returned`, success: true });
   } catch (err) {
      console.log(err);
      throw new ApiError(httpStatus.OK, err.message);
   }
}
