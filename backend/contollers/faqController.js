const Model = require("../models/faqModel");
const QueryModel = require("../models/queryModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const db = require("../config/mysql_database");
const Joi = require("joi");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");

const table_name = Model.table_name;
const module_title = Model.module_title;
const module_single_title = Model.module_single_title;
const module_add_text = Model.module_add_text;
const module_edit_text = Model.module_edit_text;
const module_slug = Model.module_slug;
const module_layout = Model.module_layout;

// Define the GET API to retrieve all user requests and render them in a view
exports.reqGetAllUsers = async (req, res, next) => {
  try {
    // Extract company_id from the request (e.g., from query params or session)
    const company_id = localStorage.getItem("userdatA_n");

    // Check if company_id is provided
    if (!company_id) {
      return next(new ErrorHandler("Company ID is required", 400));
    }

    // Query the database for user transactions related to the specified company
    const userTransactions = await db.query(
      "SELECT * FROM user_transction WHERE company_id = ?",
      [company_id]
    );

    // Check if any transactions were found
    if (!userTransactions || userTransactions.length === 0) {
      return res.status(404).render("noResults", {
        layout: module_layout,
        title: "No Results Found",
        module_slug,
        message: "No user requests found for the specified company",
      });
    }
    // Log retrieved transactions for debugging
    console.log("User Transactions:", userTransactions);

    // Render the user transactions in the desired view template
    res.render(module_slug + "/index", {
      layout: module_layout,
      title: module_title,
      module_slug,
      users: userTransactions, // Pass the users array directly
    });
  } catch (error) {
    console.error("Error retrieving user transactions:", error); // Log any error

    // Send a rendered error response
    return res.status(500).render("error", {
      layout: module_layout,
      title: "Error",
      module_slug,
      message: "Failed to retrieve user requests: " + error.message,
    });
  }
};
exports.uploadScreenshotApi = catchAsyncErrors(async (req, res, next) => {
  // Get user ID from the request body
  const { user_id } = req.body;

  // Validate if user_id is provided
  if (!user_id) {
    return next(new ErrorHandler("User ID is required", 400));
  }

  // Check if the file is uploaded
  if (!req.file) {
    return next(new ErrorHandler("Image file is required", 400)); // Respond if no file is uploaded
  }

  const imageBuffer = req.file.buffer; // Accessing the buffer from memory storage
  console.log(
    "Image buffer size:",
    imageBuffer ? imageBuffer.length : "No image buffer"
  ); // Log to check buffer length

  // Debugging: Log user ID and check if file is present
  console.log(`User ID from body: ${user_id}`);
  console.log(`Image uploaded: ${req.file.originalname}`);

  // Update the user_transaction table with the image
  try {
    console.log("Attempting to update user transaction...");

    // Corrected table name
    const query = "UPDATE user_transction SET trans_doc = ? WHERE user_id = ?";
    const data = [imageBuffer, user_id];

    const [result] = await db.query(query, data);
    console.log("Query result:", result);

    if (result.affectedRows === 0) {
      throw new Error("No user found with the provided user ID");
    }

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: { user_id, image: req.file.originalname },
    });
  } catch (error) {
    console.error("Error updating database:", error);
    return next(new ErrorHandler("Database update failed", 500));
  }
});
