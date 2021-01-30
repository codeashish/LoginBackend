const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncResponse");

const errorResponse = require("../utils/errorResponse");
const User = require("../models/User");

//Protect Routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  //   else if(req.cookies.token){
  //       token=req.cookies.token

  //   }
  //! Make sure token send
  if (!token) return next(new errorResponse("Not Authorize to access ", 401));
  try {
    //? Verify Token
    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(decode);
    req.user = await User.findById(decode.id);
    next();
  } catch (e) {
    return next(new errorResponse("Not Authorize to access ", 401));
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new errorResponse("You are not allowed to do this ", 401));
    }
    next();
  };
};