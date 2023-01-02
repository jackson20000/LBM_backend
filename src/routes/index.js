const express = require('express');
const admin = require('./admin');
const auth = require('./auth');
const books = require('./books');
const users = require('./users');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/admin',
    route: admin,
  },
  {
   path: '/auth',
   route: auth,
 },
 {
   path: '/books',
   route: books,
 },
 {
   path: '/users',
   route: users,
 },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
