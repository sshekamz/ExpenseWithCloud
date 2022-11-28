const express = require('express');

const userRoutes = express.Router();

const userController = require('../controller/userController');

//login and signup
userRoutes.post('/sign-up', userController.signUp);

userRoutes.post('/login', userController.login);

//reset-password
// userRoutes.post('/forgot-password', userController.forgotPassword);

// userRoutes.get('/reset-password/:id', userController.resetPassword);

// userRoutes.get('/update-password/:resetPassId', userController.updatepassword);

module.exports = userRoutes;