const express = require('express');
const { body } = require('express-validator');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// POST /feed/post
router.post(
	'/post',
	isAuth,
	[
		body('title', 'Please enter a valid title')
			.isString()
			.isLength({ min: 5, max: 45 })
			.trim(),
		body('content', 'Please enter a valid content')
			.isString()
			.isLength({ min: 5 })
			.trim(),
	],
	feedController.createPost
);

// GET /feed/posts
router.get('/posts/:postId', isAuth, feedController.getPost);

// PUT /feed/posts/postId - edit
router.put(
	'/posts/:postId',
	isAuth,
	[
		body('title', 'Please enter a valid title')
			.isString()
			.isLength({ min: 5, max: 45 })
			.trim(),
		body('content', 'Please enter a valid content')
			.isString()
			.isLength({ min: 5 })
			.trim(),
	],
	feedController.updatePost
);

// DELETE /feed/posts/postId
router.delete('/posts/:postId', isAuth, feedController.deletePost);

module.exports = router;
