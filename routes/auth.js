const express = require("express");
const router = express.Router();

const {registerUser,loginUser  } =require('./../controller/auth')
router.route('/login').post(loginUser)
router.route('/signup').post(registerUser)



module.exports = router;
