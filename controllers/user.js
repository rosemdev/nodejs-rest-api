const User = require('../models/user');
const { validationResult } = require('express-validator');

exports.getStatus = (req, res, next) => {
	User.findById({ _id: req.userId })
		.then((user) => {
			if (!user) {
				const error = new Error('No user found');
				error.statusCode = 404;

				throw error;
			}

			res.status(200).json({ status: user.status });
		})
		.catch((err) => next(new Error(err)));
};

exports.updateStatus = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = new Error('Validation Failed!');
		error.statusCode = 422;

		throw error;
	}

	const status = req.body.status;

	return User.findById({ _id: req.userId })
		.then((user) => {
			if (!user) {
				const error = new Error('No user found');
				error.statusCode = 404;

				throw error;
			}

			user.status = status;

			return user.save();
		})
		.then((user) => {
			res
				.status(200)
				.json({ message: 'The user`s status is updated', status: user.status });
		})
		.catch((err) => next(new Error(err)));
};
