const errorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

 
  //Monggose key error
  if (err.name == "CastError") {
    const message = `Shop not find with the id of ${err.value} `;
    error = new errorResponse(message, 404);
  }

  //Mongoose dublicate key
  if (err.code === 11000) {
    const message = `Dublicate Field Value Entered`;
    error = new errorResponse(message, 400);
  }

  //Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new errorResponse(message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || "Server Error" });
};

module.exports = errorHandler;