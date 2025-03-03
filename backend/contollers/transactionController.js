// const Model = require("../models/faqModel");
const QueryModel = require("../models/queryModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const db = require("../config/mysql_database");
const Joi = require("joi");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");
const dotenv = require("dotenv");
dotenv.config({ path: "backend/config/config.env" });
const Razorpay = require("razorpay");

// const table_name = user_transction;
// const module_title = Model.module_title;
// const module_single_title = Model.module_single_title;
// const module_add_text = Model.module_add_text;
// const module_edit_text = Model.module_edit_text;
// const module_slug = Model.module_slug;
// const module_layout = Model.module_layout;

// Define the GET API to retrieve all user requests and render them in a view
// Define the API to fetch transactions
// exports.allTransactions = catchAsyncErrors(async (req, res, next) => {
//   // Fetch transaction data with related user info
//   const [transactions] = await db.query(
//     `SELECT 
//         ut.user_id,
//         ut.company_id,
//         ut.tranction_coin,
//         ut.tranction_rate,
//         ut.transction_amount,
//         ut.trans_doc,
//         DATE_FORMAT(ut.data_created, "%d-%m-%Y %H:%i:%s") AS data_created,
//         ut.status,
//         u.user_name,
//         ud.upi_id -- Added field from user_data table
//      FROM user_transction ut
//      JOIN users u ON ut.user_id = u.id
//      LEFT JOIN user_data ud ON u.id = ud.user_id` );


//   console.log("transactions:", transactions); // Log for debugging

//   res.render("transactions/index", {
//     layout: "layouts/main",
//     title: "User Transactions", 
//     transactions, // Pass transactions array to the frontendsdg
//   });
// });
// exports.allTransactions = catchAsyncErrors(async (req, res, next) => {
//   // Fetch transaction data with related user info
//   const [transactions] = await db.query(
//     `SELECT 
//         ut.id, -- Include the 'id' field (unique transaction identifier)
//         ut.user_id,
//         ut.company_id,
//         ut.tranction_coin,
//         ut.tranction_rate,
//         ut.transction_amount,
//         ut.trans_doc,
//         DATE_FORMAT(ut.data_created, "%d-%m-%Y %H:%i:%s") AS data_created,
//         ut.status,
//         u.user_name,
//         ud.upi_id -- Added field from user_data table
//      FROM user_transction ut
//      JOIN users u ON ut.user_id = u.id
//      LEFT JOIN user_data ud ON u.id = ud.user_id` 
//   );

//   console.log("transactions:", transactions); // Log for debugging

//   res.render("transactions/index", {
//     layout: "layouts/main",
//     title: "User Transactions", 
//     transactions, // Pass transactions array to the frontend
//   });
// });
// exports.approveTransaction = catchAsyncErrors(async (req, res, next) => {
//   const { id } = req.body; // Use `id` instead of `transaction_id`

//   // Validate the input
//   if (!id) {
//     return res.status(400).json({
//       success: false,
//       message: "Transaction ID (id) is required",
//     });
//   }

//   const connection = await db.getConnection();

//   try {
//     await connection.beginTransaction();

//     // Step 1: Retrieve the transaction details using `id`
//     const [transactionDetails] = await connection.query(
//       `SELECT company_id, tranction_coin FROM user_transction WHERE id = ? AND status != 'approved'`,
//       [id]
//     );

//     if (!transactionDetails || transactionDetails.length === 0) {
//       throw new Error("No pending transaction found for the provided ID");
//     }

//     const { company_id, tranction_coin } = transactionDetails;

//     // Step 2: Update the transaction in the `user_transction` table
//     const [updateTransaction] = await connection.query(
//       `UPDATE user_transction SET status = 'approved' WHERE id = ?`,
//       [id]
//     );

//     // Check if the transaction was updated
//     if (updateTransaction.affectedRows === 0) {
//       throw new Error("Failed to approve the transaction");
//     }

//     // Step 3: Update the corresponding entry in the `usercoin_audit` table
//     const [updateAudit] = await connection.query(
//       `UPDATE usercoin_audit SET status = 'completed' WHERE transaction_id = ?`,
//       [id]
//     );

//     // Check if the audit record was updated
//     if (updateAudit.affectedRows === 0) {
//       throw new Error("Failed to update the audit entry");
//     }

// // Update the company's coin balance by adding the transaction_coin
// const [companyCoinUpdateResult] = await connection.query(
//   `UPDATE company_data 
//    SET company_coin = COALESCE(company_coin, 0) + ? 
//    WHERE company_id = ?`,
//   [tranction_coin, company_id]
// );

// // Check if the company data was updated successfully
// if (companyCoinUpdateResult.affectedRows === 0) {
//   throw new Error("Failed to update the company's coin balance");
// }


//     // Commit the transaction
//     await connection.commit();

//     // Respond with success
//     res.json({
//       success: true,
//       message: "Transaction approved, audit updated, and company coins added successfully!",
//     });
//   } catch (error) {
//     // Rollback the transaction in case of an error
//     await connection.rollback();

//     // Log the error for debugging
//     console.error("Error approving transaction:", { message: error.message, stack: error.stack });

//     // Send an error response
//     res.status(500).json({ success: false, message: error.message || "Internal server error" });
//   } finally {
//     // Release the connection
//     connection.release();
//   }
// });


exports.allTransactions = catchAsyncErrors(async (req, res, next) => {
  // Fetch transaction data with related user info
  const [transactions] = await db.query(`
    SELECT 
        ut.id AS transaction_id,              -- Transaction ID
        ut.user_id AS user_id,                -- User ID
        ut.company_id AS company_id,          -- Company ID (maps to users table)
        ut.tranction_coin AS transaction_coin, -- Transaction Coin
        ut.tranction_rate AS transaction_rate, -- Transaction Rate
        ut.transction_amount AS transaction_amount, -- Transaction Amount
        ut.trans_doc,
        DATE_FORMAT(ut.data_created, "%d-%m-%Y %H:%i:%s") AS created_date, -- Created Date
        ut.status AS transaction_status,      -- Transaction Status
        u.user_name AS user_name,             -- User's Name (from users table)
        ud.upi_id AS upi_id,                  -- UPI ID (from user_data)
        c.user_name AS company_name           -- Company's Name (from users table)
    FROM user_transction ut
    JOIN users u ON ut.user_id = u.id         -- Join to get user info
    LEFT JOIN user_data ud ON u.id = ud.user_id -- Join to get user_data (optional)
    JOIN users c ON ut.company_id = c.id      -- Join to get company name from company_id
  `);

  res.render("transactions/index", {
    layout: "layouts/main",
    title: "User Transactions",
    transactions, // Pass transactions array to the frontend
  });
});


exports.approveTransaction = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.body; // Use `id` instead of `transaction_id`
  console.log("id:", id);

  // Validate the input
  if (!id) {
    console.log("Error: Transaction ID (id) is required");
    return res.status(400).json({
      success: false,
      message: "Transaction ID (id) is required",
    });
  }

  const connection = await db.getConnection();
  const dateApprove = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    await connection.beginTransaction();

    // Step 1: Retrieve the transaction details using `id`
    const [transactionDetails] = await connection.query(
      `SELECT company_id, tranction_coin FROM user_transction WHERE id = ? AND status != 'approved'`,
      [id]
    );

    // Log the transaction details for debugging
    console.log("Transaction Details:", transactionDetails);

    if (!transactionDetails || transactionDetails.length === 0) {
      console.log(`Error: No pending transaction found for ID: ${id}`);
      throw new Error("No pending transaction found for the provided ID");
    }

    // Ensure the data is extracted correctly
    const { company_id, tranction_coin } = transactionDetails[0]; // Access the first result if the query returns an array

    // Log extracted values
    console.log(
      "Extracted Data - Company ID:",
      company_id,
      "Transaction Coin:",
      tranction_coin
    );

    // Check if tranction_coin is null, set it to 0 if necessary
    if (tranction_coin === null) {
      console.log("Error: Transaction coin value is missing");
      throw new Error("Transaction coin value is missing");
    }

    // Step 2: Update the transaction in the `user_transction` table
    const [updateTransaction] = await connection.query(
      `UPDATE user_transction SET status = 'approved', date_approved = ?  WHERE id = ?`,
      [dateApprove, id]
    );

    // Log the transaction update result
    console.log("Transaction Update Result:", updateTransaction);

    // Check if the transaction was updated
    if (updateTransaction.affectedRows === 0) {
      console.log("Error: Failed to approve the transaction");
      throw new Error("Failed to approve the transaction");
    }

    // Step 3: Update the corresponding entry in the `usercoin_audit` table
    const [updateAudit] = await connection.query(
      `UPDATE usercoin_audit SET status = 'completed', date_approved = ?  WHERE transaction_id = ?`,
      [dateApprove, id]
    );

    // Log the audit update result
    console.log("Audit Update Result:", updateAudit);

    // Check if the audit record was updated
    if (updateAudit.affectedRows === 0) {
      console.log("Error: Failed to update the audit entry");
      throw new Error("Failed to update the audit entry");
    }

    // Step 4: Check if company_id exists in company_data table
    const [companyData] = await connection.query(
      `SELECT 1 FROM company_data WHERE company_id = ?`,
      [company_id]
    );

    // Log the company data check
    console.log("Company Data Check:", companyData);

    if (companyData.length === 0) {
      console.log(
        `Error: Company ID ${company_id} does not exist in company_data table`
      );
      throw new Error("Company ID does not exist in company_data table");
    }

    // Step 5: Update the company's coin balance by adding the transaction_coin
    const [companyCoinUpdateResult] = await connection.query(
      `UPDATE company_data 
       SET company_coin = COALESCE(company_coin, 0) + ? 
       WHERE company_id = ?`,
      [tranction_coin, company_id]
    );

    // Log the company coin update result
    console.log("Company Coin Update Result:", companyCoinUpdateResult);

    // Check if the company data was updated successfully
    if (companyCoinUpdateResult.affectedRows === 0) {
      console.log("Error: Failed to update the company's coin balance");
      throw new Error("Failed to update the company's coin balance");
    }

    // Commit the transaction
    await connection.commit();

    // Respond with success
    console.log("Transaction approved successfully");
    res.json({
      success: true,
      message:
        "Transaction approved, audit updated, and company coins added successfully!",
    });
  } catch (error) {
    // Rollback the transaction in case of an error
    await connection.rollback();

    // Log the error for debugging
    console.error("Error approving transaction:", {
      message: error.message,
      stack: error.stack,
    });

    // Send an error response
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  } finally {
    // Release the connection
    connection.release();
  }
});


// exports.approveTransaction = catchAsyncErrors(async (req, res, next) => {
//   const { id } = req.body; // Use `id` instead of `transaction_id`

//   // Validate the input
//   if (!id) {
//     return res.status(400).json({
//       success: false,
//       message: "Transaction ID (id) is required",
//     });
//   }

//   const connection = await db.getConnection();

//   try {
//     await connection.beginTransaction();

//     // Step 1: Retrieve the transaction details using `id`
//     const [transactionDetails] = await connection.query(
//       `SELECT company_id, tranction_coin FROM user_transction WHERE id = ? AND status != 'approved'`,
//       [id]
//     );

//     if (!transactionDetails || transactionDetails.length === 0) {
//       throw new Error("No pending transaction found for the provided ID");
//     }

//     const { company_id, tranction_coin } = transactionDetails;

//     // Check if tranction_coin is null, set it to 0 if necessary
//     if (tranction_coin === null) {
//       throw new Error("Transaction coin value is missing");
//     }

//     // Step 2: Update the transaction in the `user_transction` table
//     const [updateTransaction] = await connection.query(
//       `UPDATE user_transction SET status = 'approved' WHERE id = ?`,
//       [id]
//     );

//     // Check if the transaction was updated
//     if (updateTransaction.affectedRows === 0) {
//       throw new Error("Failed to approve the transaction");
//     }

//     // Step 3: Update the corresponding entry in the `usercoin_audit` table
//     const [updateAudit] = await connection.query(
//       `UPDATE usercoin_audit SET status = 'completed' WHERE transaction_id = ?`,
//       [id]
//     );

//     // Check if the audit record was updated
//     if (updateAudit.affectedRows === 0) {
//       throw new Error("Failed to update the audit entry");
//     }

//     // Check if company_id exists in company_data table
//     const [companyData] = await connection.query(
//       `SELECT 1 FROM company_data WHERE company_id = ?`,
//       [company_id]
//     );

//     if (companyData.length === 0) {
//       throw new Error("Company ID does not exist in company_data table");
//     }

//     // Step 4: Update the company's coin balance by adding the transaction_coin
//     const [companyCoinUpdateResult] = await connection.query(
//       `UPDATE company_data 
//        SET company_coin = COALESCE(company_coin, 0) + ? 
//        WHERE company_id = ?`,
//       [tranction_coin, company_id]
//     );

//     // Check if the company data was updated successfully
//     if (companyCoinUpdateResult.affectedRows === 0) {
//       throw new Error("Failed to update the company's coin balance");
//     }

//     // Commit the transaction
//     await connection.commit();

//     // Respond with success
//     res.json({
//       success: true,
//       message: "Transaction approved, audit updated, and company coins added successfully!",
//     });
//   } catch (error) {
//     // Rollback the transaction in case of an error
//     await connection.rollback();

//     // Log the error for debugging
//     console.error("Error approving transaction:", { message: error.message, stack: error.stack });

//     // Send an error response
//     res.status(500).json({ success: false, message: error.message || "Internal server error" });
//   } finally {
//     // Release the connection
//     connection.release();
//   }
// });

exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  try {
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
    const options = req.body;
    const order = await razorpay.orders.create(options);

    if (!order) {
      res.status(500).send("Error");
    }

    res.json(order)
  } catch (err) {
    res.status(500).send("Error");
  }
})