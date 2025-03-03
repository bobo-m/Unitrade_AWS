const Joi = require("joi");

const table_name = "users";

const module_title = "Companies";
const module_single_title = "Service";
const module_add_text = "Add";
const module_edit_text = "Edit";
const module_slug = "companies";
const module_layout = "layouts/main";

const insertSchema = Joi.object({
  user_name: Joi.string().required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

module.exports = {
  table_name,
  insertSchema,
  module_title,
  module_single_title,
  module_add_text,
  module_edit_text,
  module_slug,
  module_layout,
};
