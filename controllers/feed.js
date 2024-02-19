const { validationResult } = require('express-validator');
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
	res.status(200).json({
		posts: [
			{
				_id: '123',
				title: 'First Post',
				content: 'This is the first post!',
				imageUrl: 'images/gift.jpg',
				createdAt: new Date(),
				creator: {
					name: 'Roma',
				},
			},
		],
	});
};

exports.createPost = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res
			.status(422)
			.json({ message: 'Validation Failed!', errors: errors.array() });
	}
	const title = req.body.title;
	const content = req.body.content;

	const post = new Post({
		title: title,
		content: content,
		imageUrl: 'images/gift.jpg',
		creator: {
			name: 'Roma',
		},
	});

	return post
		.save()
		.then((post) => {
			res.status(201).json({
				message: 'Post created successfully!',
				post: post,
			});
		})
		.catch((err) => next(new Error(err)));
};
