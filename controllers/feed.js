const { validationResult } = require('express-validator');
const Post = require('../models/post');
const removeFile = require('../utils/removeFile');

exports.getPosts = (req, res, next) => {
	const currentPage = req.query.page || 1;
	const perPage = 2;
	let totalItems;

	Post.find()
		.countDocuments()
		.then((count) => {
			totalItems = count;

			return Post.find()
				.skip((currentPage - 1) * perPage)
				.limit(perPage);
		})
		.then((posts) => {
			res.status(200).json({
				message: 'Posts are fetched',
				posts: posts,
				totalItems: totalItems,
			});
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

exports.updatePost = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = new Error('Validation Failed!');
		error.statusCode = 422;

		throw error;
	}

	const postId = req.params.postId;
	const newTitle = req.body.title;
	const newImageUrl = req.file.path.replace('\\', '/');
	const newContent = req.body.content;

	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error('No post foound with the id: ' + postId);
				error.statusCode = 404;
				throw error;
			}

			if (newImageUrl !== post.imageUrl) {
				removeFile('images', post.imageUrl.slice(7));
			}

			post.title = newTitle;
			post.content = newContent;
			post.imageUrl = newImageUrl;

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

exports.deletePost = (req, res, next) => {
	const postId = req.params.postId;

	Post.findById({ _id: postId })
		.then((post) => {
			if (!post) {
				const error = new Error('No post foound with the id: ' + postId);
				error.statusCode = 404;
				throw error;
			}

			removeFile('images', post.imageUrl.slice(7));
			return Post.deleteOne({ _id: postId });
		})
		.then((deletedCount) => {
			console.log(deletedCount);
			res.status(200).json({ message: 'Post is removed!' });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};
