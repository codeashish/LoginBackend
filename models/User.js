const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Username cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add a email"],
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please add a valid email",
      ],
    },

 
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Min 6 digit password is needed"],
    },
    resetpasswordtoken: String,
    resetpassworddate: Date,
  },
  { timestamps: true }
);

//Hashing password
UserSchema.pre("save", async function (next) {
  if(!this.isModified('password')){
    next()
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getJwtToken = function () {
  return jwt.sign(
    { id: this._id, username: this.username },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES,
    }
  );
};
//!Generate and hash password Schema
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  //?hash and set to resetPasswordToken Field
  this.resetpasswordtoken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
    //! Set expire
    this.resetpassworddate=Date.now()+(10*60*1000)
    console.log(resetToken,this)
    return resetToken
};

module.exports = mongoose.model("User", UserSchema);