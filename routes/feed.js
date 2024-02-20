const express = require('express');
const { body } = require('express-validator');

const feedController = require('../controllers/feed');

const router = express.Router();

// GET /feed/posts
router.get('/posts', feedController.getPosts);

// POST /feed/post
router.post(
	'/post',
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
router.get('/posts/:postId', feedController.getPost);

// POST /feed/posts/postId - edit
router.post('/posts/:postId',
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
    feedController.postEditPost
);

// DELETE /feed/posts/postId
router.delete('/posts/:postId', feedController.deletePost);

module.exports = router;
