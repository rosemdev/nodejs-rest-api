const { validationResult } = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');
const removeFile = require('../utils/removeFile');

exports.getPosts = async (req, res, next) => {
	const currentPage = req.query.page || 1;
	const perPage = 2;

	try {
		const totalItems = await Post.find().countDocuments();
		const posts = await Post.find()
			.skip((currentPage - 1) * perPage)
			.limit(perPage);

		res.status(200).json({
			message: 'Posts are fetched',
			posts: posts,
			totalItems: totalItems,
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.createPost = async (req, res, next) => {
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
		creator: req.userId,
	});

	try {
		await post.save();
		const user = await User.findById(req.userId);

		user.posts.push(post);
		await user.save();

		res.status(201).json({
			message: 'Post created successfully!',
			post: post,
			creator: { _id: user._id, name: user.name },
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getPost = async (req, res, next) => {
	const postId = req.params.postId;

	try {
		let post = await Post.findById(postId);

		if (!post) {
			const error = new Error('No post foound with the id: ' + postId);
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json({ message: 'Post is fetched', post: post });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.updatePost = async (req, res, next) => {
	const errors = validationResult(req);

	console.log(errors);

	if (!errors.isEmpty() || !req.file) {
		const error = new Error('Validation Failed!');
		error.statusCode = 422;

		throw error;
	}

	const postId = req.params.postId;
	const newTitle = req.body.title;
	const newImageUrl = req.file.path.replace('\\', '/');
	const newContent = req.body.content;

	try {
		let post = await Post.findById(postId);

		if (!post) {
			const error = new Error('No post foound with the id: ' + postId);
			error.statusCode = 404;
			throw error;
		}

		if (post.creator.toString() !== req.userId) {
			const error = new Error('Not Authorized!');
			error.statusCode = 403;
			throw error;
		}

		if (newImageUrl !== post.imageUrl) {
			removeFile('images', post.imageUrl.slice(7));
		}

		post.title = newTitle;
		post.content = newContent;
		post.imageUrl = newImageUrl;

		const updatedPost = await post.save();
		res.status(200).json({ message: 'Post is updated', post: updatedPost });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.deletePost = async (req, res, next) => {
	const postId = req.params.postId;

	try {
		let post = await Post.findById({ _id: postId });

		if (!post) {
			const error = new Error('No post foound with the id: ' + postId);
			error.statusCode = 404;
			throw error;
		}

		if (post.creator.toString() !== req.userId) {
			const error = new Error('Not Authorized!');
			error.statusCode = 403;
			throw error;
		}

		removeFile('images', post.imageUrl.slice(7));

		await Post.deleteOne({ _id: postId });

		let user = await User.findById({ _id: req.userId });

		if (!user) {
			const error = new Error('No user found');
			error.statusCode = 404;
			throw error;
		}

		user.posts.pull(postId);

		await user.save();

		res.status(200).json({ message: 'Post is removed!' });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};
