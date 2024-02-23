const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.put(
	'/signup',
	[
		body('name', 'Please enter a valid name')
			.isString()
			.isLength({ min: 5 })
			.trim(),
		body('email', 'Please enter a valid email')
			.isString()
			.custom((value, { req }) => {
				return User.findOne({ email: value }).then((user) => {
					if (user) {
						Promise.reject('Email address alredy exists');
					}
				});
			})
			.normalizeEmail(),
		body('password', 'Please enter a valid password').isString().trim(),
	],
	authController.signup
);

router.post('/login', authController.postLogin);

module.exports = router;
