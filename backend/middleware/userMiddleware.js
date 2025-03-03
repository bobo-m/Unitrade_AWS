// middleware/userMiddleware.js
exports.attachUserData = (req, res, next) => {
  console.log("User data in middleware:", req.user); // Add this line for debugging
  if (req.user) {
    res.locals.user = req.user;
  } else {
    res.locals.user = null;
  }
  next();
};
