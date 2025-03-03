const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare entered password with hashed password
const comparePasswords = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

// Generate reset password token
const getResetPasswordToken = () => {
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const resetPasswordExpire = Date.now() + 15 * 60 * 1000; // Example expiration time

  return { resetToken, resetPasswordToken, resetPasswordExpire };
};

const Joi = require("joi");

const table_name = "users";
const table_name2 = "user_data";
const table_name3 = "company_data";

const module_title = "Users";
const module_single_title = "User";
const module_add_text = "Add";
const module_edit_text = "Edit";
const module_slug = "users";
const module_layout = "layouts/main";

const insertSchema = Joi.object({
  user_name: Joi.string().required().max(255),
  email: Joi.string().required(),
});
module.exports = {
  generateToken,
  comparePasswords,
  getResetPasswordToken,
  table_name,
  table_name2,
  table_name3,
  insertSchema,
  module_title,
  module_single_title,
  module_add_text,
  module_edit_text,
  module_slug,
  module_layout,
};
