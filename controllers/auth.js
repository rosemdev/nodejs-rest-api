const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

exports.signup = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = new Error('Validation Failed!');
		error.statusCode = 422;
		error.data = errors.array();

		throw error;
	}

	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;

	bcrypt
		.hash(password, 12)
		.then((hashedPassword) => {
			const user = new User({
				email,
				password: hashedPassword,
				name,
			});

			return user.save();
		})
		.then((user) => {
			res
				.status(201)
				.json({ message: 'User created', userId: user._id.toString() });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};
