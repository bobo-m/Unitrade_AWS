// const Model = require("../models/faqModel");
const QueryModel = require("../models/queryModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const db = require("../config/mysql_database");
const Joi = require("joi");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");

// const table_name = user_transction;
// const module_title = Model.module_title;
// const module_single_title = Model.module_single_title;
// const module_add_text = Model.module_add_text;
// const module_edit_text = Model.module_edit_text;
// const module_slug = Model.module_slug;
// const module_layout = Model.module_layout;

// Define the GET API to retrieve all user requests and render them in a view
// Define the API to fetch transactions

// exports.approveTransaction = catchAsyncErrors(async (req, res, next) => {
//   const { user_id } = req.body;

//   // Validate input
//   if (!user_id) {
//     return res
//       .status(400)
//       .json({ success: false, message: "User ID is required" });
//   }

//   try {
//     const dateApprove = new Date().toISOString().slice(0, 19).replace("T", " "); // Current date & time

//     // Update the transaction in the database
//     const result = await db.query(
//       `UPDATE user_transction
//            SET status = 'approved',
//                date_approved = ?
//            WHERE user_id = ?`,
//       [dateApprove, user_id]
//     );

//     if (result.affectedRows === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Transaction not found" });
//     }

//     res.json({ success: true, message: "Transaction approved successfully" });
//   } catch (error) {
//     console.error("Error approving transaction:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// });

exports.allCompanyTransactions = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch data from company_transaction table with username from users table
    const [companytransactions] = await db.query(
      `SELECT 
            ct.transaction_id,
            ct.company_id,
            ct.sell_coin,
            ct.upi_id,
            DATE_FORMAT(ct.sell_date, "%d-%m-%Y %H:%i:%s") AS sell_date,
            ct.status,
            u.user_name
         FROM company_transaction ct
         JOIN users u ON ct.company_id = u.id
         ORDER BY ct.sell_date DESC`
    );

    console.log("Transactions:", companytransactions); // Log for debugging

    // Send response
    res.render("companytransactions/index", {
      layout: "layouts/main",
      title: "Company Transactions",
      companytransactions, // Pass transactions data to frontend
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return next(
      new ErrorHandler("Failed to fetch transactions: " + error.message, 500)
    );
  }
});

exports.approveTransaction = catchAsyncErrors(async (req, res, next) => {
  const { transaction_id } = req.body;

  // Validate input
  if (!transaction_id) {
    return res
      .status(400)
      .json({ success: false, message: "Transaction ID is required" });
  }

  console.log("Received transaction_id:", transaction_id); // Log received transaction_id for debugging

  try {
    // Get sell_coin and company_id using transaction_id from company_transaction table
    const [transactionData] = await db.query(
      `SELECT transaction_id, company_id, sell_coin
         FROM company_transaction 
         WHERE transaction_id = ? AND status = 'unapproved'`,
      [transaction_id]
    );

    console.log("Transaction Data:", transactionData); // Log query result for debugging

    if (!transactionData || transactionData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or not in 'unapproved' status",
      });
    }

    const { company_id, sell_coin } = transactionData[0]; // Extract company_id and sell_coin

    // Update the transaction status to 'approved' in company_transaction table
    const [updateTransactionResult] = await db.query(
      `UPDATE company_transaction 
         SET status = 'approved' 
         WHERE transaction_id = ? AND status = 'unapproved'`,
      [transaction_id]
    );

    if (updateTransactionResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or already approved",
      });
    }

    // Proceed to update the user's coins in the user_data table
    const [updateUserResult] = await db.query(
      `UPDATE user_data 
         SET coins = coins + ? 
         WHERE company_id = ?`,
      [sell_coin, company_id]
    );

    if (updateUserResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found to update coins",
      });
    }

    // // Add the sell_coin to the company's coins in user_data table
    // const updateUserResult = await db.query(
    //   `UPDATE user_data
    //        SET coins = coins + ?
    //        WHERE company_id = ?`,
    //   [sell_coin, company_id]
    // );

    // if (updateUserResult[0].affectedRows === 0) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "User not found to update coins" });
    // }

    res.json({
      success: true,
      message: "Transaction approved and coins added successfully",
    });
  } catch (error) {
    console.error("Error approving transaction:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
