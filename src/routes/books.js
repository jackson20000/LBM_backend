const express = require("express");
const router = express.Router();
const auth = require('../middlewares/auth');


// Importing controller
const bookController = require('../controllers/books');

// Add new Book
router.post("/new", auth('admin'), bookController.postAddNewBook);

// Browse books
router.get("/:filter/:value/:page", bookController.getBooks);

// Fetch individual book details
router.get("/details/:book_id", bookController.getBookDetails);

router.post("/search/:page", bookController.findBooks);

//user -> issue a book
router.post("/issue", bookController.postIssueBook);

// //user -> show return-renew page
router.post("/issue-list/:user_id/:page", bookController.getShowRenewReturn);

// //user -> renew book
router.post("/renew", bookController.postRenewBook);

// // user -> return book
router.post("/return", bookController.postReturnBook);

module.exports = router;