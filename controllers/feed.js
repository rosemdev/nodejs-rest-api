const { validationResult } = require('express-validator');
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
	Post.find()
		.then((posts) => {
			res.status(200).json({ message: 'Posts are fetched', posts: posts });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.createPost = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = new Error('Validation Failed!');
		error.statusCode = 422;

		throw error;
	}

	if (!req.file) {
		const error = new Error('No image provided');
		error.statusCode = 422;

		throw error;
	}

	const imageUrl = req.file.path.replace('\\', '/');
	const title = req.body.title;
	const content = req.body.content;

	const post = new Post({
		title: title,
		content: content,
		imageUrl: imageUrl,
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
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.getPost = (req, res, next) => {
	const postId = req.params.postId;

	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error('No post foound with the id: ' + postId);
				error.statusCode = 404;
				throw error;
			}

			res.status(200).json({ message: 'Post is fetched', post: post });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.postEditPost = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = new Error('Validation Failed!');
		error.statusCode = 422;

		throw error;
	}

	const postId = req.params.postId;
	const newTitle = req.body.title;
	const newImageUrl = req.file && req.file.path.replace('\\', '/');
	const newContent = req.body.content;

	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error('No post foound with the id: ' + postId);
				error.statusCode = 404;
				throw error;
			}

			post.title = newTitle;
			post.content = newContent;

			if (newImageUrl) {
				post.imageUrl = newImageUrl;
			}

			return post.save();
		})
		.then((updatedPost) => {
			res.status(200).json({ message: 'Post is updated', post: updatedPost });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};
