const Joi = require("joi");

const table_name = "user_transaction";

const module_title = "Faqs";
const module_single_title = "Faq";
const module_add_text = "Add";
const module_edit_text = "Edit";
const module_slug = "faqs";
const module_layout = "layouts/main";

const insertSchema = Joi.object({
  description: Joi.string().required(),
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
