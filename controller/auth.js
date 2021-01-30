const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { sendWelcomeEmail } = require('../emails/account');
const asyncHandler = require('../middleware/async');
const errorResponse = require('../utils/errorResponse');
exports.registerUser = asyncHandler(async (req, res, next) => {
	const { username, email, password } = req.body;

	const usernameexist = await User.findOne({
		username: req.body.username,
	});
	if (usernameexist) return next(new errorResponse('Username Already Taken', 400));
	const emailexist = await User.findOne({
		email: req.body.email,
	});
	if (emailexist) return next(new errorResponse('Email Already Taken', 400));

	const user = await User.create({
		username,
		email: email.trim().toLowerCase(),
		password,
	});
	sendTokenResponse(user, 200, res);
});
exports.loginUser = asyncHandler(async (req, res, next) => {
	const { username, email, password } = req.body;
	let user;
	if ((!username && !email) || !password) return next(new errorResponse('Please provide credientials', 400));
	if (username)  user = await User.findOne({ username }).select('+password');
	else  user = await User.findOne({ email }).select('+password');

	if (!user) return next(new errorResponse('Invalid Credientials', 401));
	if (!(await bcrypt.compare(password, user.password))) return next(new errorResponse('Invalid Credientials', 401));
	sendTokenResponse(user, 200, res);
});

const sendTokenResponse = (user, statuscode, res) => {
	const token = user.getJwtToken();
	const options = {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
		httpOnly: true,
	};
	res.status(statuscode).cookie('token', token, options).send({ success: true, token, user });
};
