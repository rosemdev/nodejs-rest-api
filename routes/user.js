const express = require('express');
const { body } = require('express-validator');

const userController = require('../controllers/user');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

// GET /user/status
router.get('/status', isAuth, userController.getStatus);

// PUT /user/status
router.patch(
	'/status',
	isAuth,
	body('status', 'Please enter a valid status')
		.isString()
		.isLength({ min: 3, max: 45 })
		.trim(),
	userController.updateStatus
);

module.exports = router;
