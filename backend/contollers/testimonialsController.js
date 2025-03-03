const Model = require("../models/testimonialModel");
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


exports.getAllRecords = catchAsyncErrors(async (req, res) => {
  try {
    // const query = `SELECT * FROM usercoin_audit WHERE type = 'quest'`;
    const query = `
  SELECT qa.*, q.quest_name, q.quest_type, q.activity, u.user_name
  FROM usercoin_audit qa
  JOIN users u ON qa.user_id = u.id
  LEFT JOIN quest q ON qa.quest_id = q.id
  WHERE qa.type = 'quest'
`;
  
    const questEntries = await db.query(query);
    // console.log("Quest Entries:", questEntries);
    res.render('testimonials/index', { 
      layout: module_layout,
      title: 'User Quest Entries', 
      module_slug, 
      questEntries 
    });
  } catch (error) {
    console.error("Error fetching quest entries:", error);
    res.status(500).send("Error fetching data");
  }
});



exports.approveQuest = catchAsyncErrors(async (req, res, next) => {
  const { quest_id } = req.params;

  try {
    // Fetch the coin_earn value from the quest table
    const [questData] = await db.query(
      `SELECT coin_earn FROM quest WHERE id = ?`,
      [quest_id]
    );

    // Check if the quest exists
    if (questData.length === 0) {
      return next(new ErrorHandler("Quest not found", 404));
    }

    const coinEarned = questData[0].coin_earn;

    // Check if the quest has a positive coin_earn value
    if (coinEarned <= 0) {
      return next(
        new ErrorHandler("Coin earn value must be greater than zero.", 400)
      );
    }

    // Update the pending_coin in usercoin_audit based on coinEarned
    const result = await db.query(
      `UPDATE usercoin_audit 
       SET pending_coin = pending_coin + ?, 
           quest_screenshot = NULL 
       WHERE quest_id = ? AND quest_screenshot IS NOT NULL`,
      [coinEarned, quest_id]
    );

    // Check if the update affected any rows
    if (result.affectedRows === 0) {
      return next(
        new ErrorHandler(
          "No matching quest found or screenshot already processed",
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      message: "Quest approved, pending coins updated successfully.",
    });
  } catch (error) {
    console.error("Database update error:", error); // Log specific error for troubleshooting
    return next(
      new ErrorHandler("Approval process failed: " + error.message, 500)
    );
  }
});

exports.disapproveQuest = catchAsyncErrors(async (req, res, next) => {
  const { quest_id } = req.params;

  try {
    // Remove the quest screenshot only from the usercoin_audit table
    await db.query(
      `UPDATE usercoin_audit 
       SET quest_screenshot = NULL 
       WHERE quest_id = ? AND quest_screenshot IS NOT NULL`,
      [quest_id]
    );

    res.status(200).json({
      success: true,
      message: "Quest disapproved, screenshot removed.",
    });
  } catch (error) {
    console.error("Database update error:", error);
    return next(new ErrorHandler("Disapproval process failed", 500));
  }
});

