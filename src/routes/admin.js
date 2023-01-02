const express = require("express");
const router = express.Router();

// importing controller
const adminController = require('../controllers/admin');

// //admin -> find activities of all users on admin dashboard
router.get("/dashboard/:page", adminController.postDashboard);

// //admin -> update book
// router.post("/admin/book/update/:book_id", adminController.postUpdateBook);

// //admin -> delete book
// router.get("/admin/book/delete/:book_id", adminController.getDeleteBook);

// //admin -> users list 
router.post("/users/:page", adminController.findUsers);

// // admin -> delete a user
// router.get("/admin/users/delete/:user_id", adminController.getDeleteUser);

module.exports = router;