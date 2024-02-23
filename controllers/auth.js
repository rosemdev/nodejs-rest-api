const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

exports.postLogin = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	let loadedUser;

	User.findOne({ email: email })
		.then((user) => {
			if (!user) {
				const error = new Error('The user is not found!');
				error.statusCode = 401; // Not authenticated

				throw error;
			}

			loadedUser = user;

			return bcrypt.compare(password, user.password);
		})
		.then((isEqual) => {
			if (!isEqual) {
				const error = new Error('Wrong password!');
				error.statusCode = 401; // Not authenticated

				throw error;
			}
			const token = jwt.sign(
				{
					email: loadedUser.email,
					userId: loadedUser._id.toString(),
				},
				'secret',
				{ expiresIn: '1h' }
			);

			res.status(200).json({ token: token, userId: loadedUser._id.toString() });
		})
		.catch((err) => next(new Error(err)));
};
