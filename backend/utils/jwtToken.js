//creating token and saving in cookie
const sendToken = (user, token, statusCode, res) => {
  //const token = token;
  console.log(user.user_type);

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.cookie("token", token, options);

  // res.status(statusCode).cookie('token',token,options).json({
  //     success: true,
  //     user,
  //     token
  // })
};

//creating token and saving in cookie
const sendAuthToken = (user, token, statusCode, res) => {
  //const token = token;

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

module.exports = sendToken;
