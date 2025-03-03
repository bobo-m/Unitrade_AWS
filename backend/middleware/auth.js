const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const db = require("../config/mysql_database");
const { render } = require("../app");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    req.flash("msg_response", {
      status: 400,
      message: "Please login to access this resource.",
    });
    //console.log("ioioio");

    return res.redirect(`/${process.env.ADMIN_PREFIX}/login`);
  }

  try {
    const decodeData = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
      decodeData.id,
    ]);

    if (rows.length === 0) {
      req.flash("msg_response", { status: 400, message: "User not found" });
      return res.redirect(`/${process.env.ADMIN_PREFIX}/login`);
    }

    req.user = rows[0];
    next();
  } catch (error) {
    req.flash("msg_response", {
      status: 400,
      message: "Invalid or expired token. Please login again.",
    });
    return res.redirect(`/${process.env.ADMIN_PREFIX}/login`);
  }
});

// exports.isApiAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
//   const token = req.cookies.token;

//   if (!token) {
//     return next(new ErrorHandler("Please login to access this resource.", 401));
//   }

//   const decodeData = jwt.verify(token, process.env.JWT_SECRET);

//   const loginUser = await db.query("SELECT * FROM users WHERE id = ?", [
//     decodeData.id,
//   ]);
//   req.user = loginUser[0][0];
//   //req.user =  await User.findById(decodeData.id);

//   next();
// });
exports.isApiAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get token from "Authorization" header

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource.", 401));
  }

  const decodeData = jwt.verify(token, process.env.JWT_SECRET);


  const loginUser = await db.query("SELECT * FROM users WHERE id = ?", [
    decodeData.id,
  ]);
  req.user = loginUser[0][0];

  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ErrorHandler("Unauthorized: User not authenticated", 401)
      );
    }

    if (!roles.includes(req.user.user_type)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.user_type} is not allowed to access this resource`,
          403
        )
      );
    }

    next();
  };
};
