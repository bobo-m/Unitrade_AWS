const Model = require("../models/settingModel");
const QueryModel = require("../models/queryModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const db = require("../config/mysql_database");
const Joi = require("joi");

const table_name = Model.table_name;
const module_title = Model.module_title;
const module_single_title = Model.module_single_title;
const module_add_text = Model.module_add_text;
const module_edit_text = Model.module_edit_text;
const module_slug = Model.module_slug;
const module_layout = Model.module_layout;

exports.editForm = catchAsyncErrors(async (req, res, next) => {
  const id = 1;
  const blog = await QueryModel.findById(table_name, id, next);

  if (!blog) {
    return;
  }
  res.render(module_slug + "/edit", {
    layout: module_layout,
    title: module_single_title + " " + module_edit_text,
    blog,
    module_slug,
  });
});

exports.updateRecord = catchAsyncErrors(async (req, res, next) => {
  //console.log(req.body); return false;

  // Update header_logo
  req.body.header_logo = req.body.old_header_logo;
  if (req.files && req.files.header_logo) {
    req.body.header_logo = req.files.header_logo[0].filename;
  }

  // Update qr_code
  req.body.qr_code = req.body.old_qr_code;
  if (req.files && req.files.qr_code) {
    req.body.qr_code = req.files.qr_code[0].filename;
  }

  const updateData = {
    site_title: req.body.site_title,
    // email: req.body.email,
    // phone: req.body.phone,
    header_logo: req.body.header_logo,
    // address: req.body.address,
    // fb_url: req.body.fb_url,
    upi: req.body.upi,
    qr_code: req.body.qr_code,
    reduce_coin_rate: req.body.reduce_coin_rate,
    one_coin_price: req.body.one_coin_price,
  };

  const blog = await QueryModel.findByIdAndUpdateData(
    table_name,
    req.params.id,
    updateData,
    next
  );

  req.flash("msg_response", {
    status: 200,
    message: "Successfully updated " + module_single_title,
  });

  res.redirect(`/${process.env.ADMIN_PREFIX}/${module_slug}`);
});

exports.deleteImage = catchAsyncErrors(async (req, res, next) => {
  const updateData = {
    image: "",
  };

  const blog = await QueryModel.findByIdAndUpdateData(
    table_name,
    req.params.id,
    updateData,
    next
  );

  req.flash("msg_response", {
    status: 200,
    message: "Successfully updated " + module_single_title,
  });

  res.redirect(
    `/${process.env.ADMIN_PREFIX}/${module_slug}/edit/${req.params.id}`
  );
});

exports.apiGetSingleRecord = catchAsyncErrors(async (req, res, next) => {
  let settings = await QueryModel.findBySpecific(table_name, "id", 1, next);

  if (!settings) {
    return next(new ErrorHandler("Record not found", 500));
  }
  settings.header_logo =
    process.env.BACKEND_URL +
    "uploads/" +
    module_slug +
    "/" +
    settings.header_logo;

  settings.qr_code =
    process.env.BACKEND_URL +
    "uploads/" +
    module_slug +
    "/" +
    settings.qr_code;
  res.status(200).json({
    success: true,
    settings,
  });
});
