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
const crypto = require("crypto");
const { distributeCoins } = require("../contollers/userController");
const sendEmail = require("../utils/sendEmail");
const { Cashfree } = require("cashfree-pg");
const { randomUUID } = require("crypto");

// const twilio = require("twilio");

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
        ut.trans_id,                           -- Transcation ID for selling
        ut.utr_no,                             -- UTR number
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

const activateUser = async (userId) => {
  const newStatus = 1;
  console.log("automated activate user function called");
  console.log("Activating user with user id: ", userId);
  try {
    //update pay_confirm in the database
    const updatePayConfirmQuery =
      "UPDATE users SET pay_confirm = 1 WHERE id = ?";
    const [payConfirmResult] = await db.query(updatePayConfirmQuery, [userId]);
    // Log result to debug
    console.log("Pay confirm update result:", payConfirmResult);

    if (!payConfirmResult || payConfirmResult.affectedRows === 0) {
      return {
        error: true,
        message: "Failed to update pay_confirm field in users table",
      };
    }

    // Update user status in the database
    await QueryModel.updateData("users", { status: newStatus }, { id: userId });
    console.info(`User status updated for User ID: ${userId}`);

    // Distribute coins based on activation
    await distributeCoins(userId);

    const [userData] = await db.query(
      "SELECT email, user_name, mobile FROM users WHERE id = ?",
      [userId]
    );
    if (!userData || userData.length === 0) {
      return { error: true, message: "User email not found" };
    }
    const userEmail = userData[0]?.email;
    const userName = userData[0]?.user_name;
    // const userPhone = userData[0]?.mobile;

    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    // const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    // if (
    //   !accountSid ||
    //   !authToken ||
    //   !twilioPhoneNumber ||
    //   !twilioWhatsAppNumber
    // ) {
    //   console.error(
    //     "Twilio credentials are missing. Please check your .env file."
    //   );
    //   return { error: true, message: "Twilio credentials are missing" };
    // }
    // // Initialize Twilio client
    // const client = new twilio(accountSid, authToken);
    // Step 2: Construct the email body
    const emailMessage = `
<html>
  <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
    <p>Hi ${userName},</p>

    <p>🎉 <strong>Congratulations!</strong> Your Unitradehub account has been successfully activated. We're thrilled to have you on board.</p>

    <p>🌟 <strong>Here's what you can do now:</strong></p>

    <p>💰 <strong>2000 Coins Awaiting You!</strong><br>
       You’ve received 2000 coins in your pending balance. Complete fun tasks, earn more coins, and transfer them to your total balance by tapping!</p>

    <p>🙌 <strong>Earn More Coins!</strong><br>
       Invite your friends and earn referral rewards 🤑.<br>
       Complete exciting tasks to earn even more coins.</p>

    <p>💼 <strong>Share Coins & Earn Money!</strong><br>
       Once you've accumulated enough coins, share them with companies at the best rates. We'll ensure the payment is transferred directly to your account.</p>

    <p>👉 <strong>Ready to get started?</strong> Log in to Unitradehub via Telegram now!</p>

    <p>
      <a href="https://t.me/TheUnitadeHub_bot?startapp=1" 
         style="color: #1a73e8; text-decoration: none; font-weight: bold;">🔗 Click here to access Unitradehub</a>
    </p>

    <p>If you have any questions, feel free to contact our support team. We're here to help you every step of the way!</p>

    <p>Welcome to the world of trading, earning, and growing 🚀.<br>Team Unitradehub</p>
  </body>
</html>
`;

    const emailOptions = {
      email: userEmail, // User's email address
      subject: "Welcome to Unitradehub! Your Account is Now Activated 🚀",
      message: emailMessage, // Passing the HTML message content here
    };

    await sendEmail(emailOptions); // Send the email to the user's email address

    //     if (userPhone) {
    //       const textMessage = `Hi ${userName}, 👋

    //       🎉 *Congratulations!* Your Unitradehub account has been activated.

    //       💰 *2000 Coins Credited!*
    //       You have received 2000 coins in your pending balance. Earn more by completing tasks and inviting friends!

    //       🚀 *Start Earning Now:*
    //       🔗 https://t.me/TheUnitadeHub_bot?startapp=1

    //       For support, contact us. Welcome aboard! 🚀
    //       *Team Unitradehub*`;

    //       const whatsappMessage = `Hi ${userName}, 👋

    // 🎉 *Congratulations!* Your Unitradehub account has been successfully activated.

    // 🔐 *Your Registered Password:* ${userPassword}
    // (Keep this safe and do not share it with anyone.)

    // 💰 *2000 Coins Credited!*
    // You have received 2000 coins in your pending balance. Earn more by completing tasks and inviting friends!

    // 🚀 *Start Earning Now:*
    // Tap below to log in and explore Unitradehub:
    // 🔗 https://t.me/TheUnitadeHub_bot?startapp=1

    // For any support, feel free to reach out. Welcome aboard! 🚀

    // *Team Unitradehub*`;

    //       await client.messages.create({
    //         from: twilioWhatsAppNumber,
    //         to: `whatsapp:+91${userPhone}`, // User's phone number with country code
    //         body: whatsappMessage,
    //       });

    //       console.info(`WhatsApp message sent to ${userPhone}`);
    //     }

    //     await client.messages.create({
    //       from: twilioPhoneNumber,
    //       to: `+91${userPhone}`,
    //       body: textMessage,
    //     });
    //     console.info(`✅ SMS sent to ${userPhone}`);

    return { message: "success" };
  } catch (error) {
    console.error("Error updating user status:", error);
    return { error: `Error updating user status: ${error}` };
  }
};

// exports.createOrder = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
//     const options = req.body;
//     const order = await razorpay.orders.create(options);

//     if (!order) {
//       res.status(500).send("Error");
//     }

//     res.json(order)
//   } catch (err) {
//     res.status(500).send("Error");
//   }
// })

// exports.verifyPayment = catchAsyncErrors(async (req, res, next) => {
//   const { userId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
//   console.log(userId)
//   try {
//     const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
//     sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
//     generated_signature = sha.digest("hex");

//     console.log("Generated signature: ", generated_signature, "inside verification fucntion")
//     console.log("generated the signnature")
//     if (generated_signature !== razorpay_signature) {
//       res.status(400).json({ message: "Transaction is not verified" });
//     }

//     console.log("signature verified");
//     const activateResponse = await activateUser(userId);
//     console.log("user activated", activateResponse)

//     if (activateResponse.message !== "success") {
//       res.status(400).json({ message: "Error Activating User" });
//     }

//     res.status(200).json({
//       message: "success",
//       orderId: razorpay_order_id,
//       paymentId: razorpay_payment_id
//     })
//   } catch (error) {
//     res.status(400).json({
//       error, message: "Transaction is not verified"
//     })
//   }
// })

exports.createOrder = catchAsyncErrors(async (req, res) => {
  Cashfree.XClientId = process.env.CASHFREE_KEY_ID;
  Cashfree.XClientSecret = process.env.CASHFREE_KEY_SECRET;
  Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;
  const { userId } = req.body;
  const order_id = `order_${randomUUID()}`;
  if (!userId) {
    console.log("User Id Missing");
    return;
  }
  try {
    const [users] = await db.query(
      `
      SELECT user_name, mobile, email
      FROM users
      WHERE id=?  
    `,
      [userId]
    );
    if (!users.length) {
      throw new Error("User not found in database");
    }

    const user = users[0];

    var request = {
      order_amount: "370",
      order_currency: "INR",
      order_id: order_id,
      customer_details: {
        customer_id: `unitrade-${userId}`,
        customer_name: user.user_name,
        customer_email: user.email,
        customer_phone: user.mobile,
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment-status?order_id=${order_id}&user_id=${userId}`,
      },
      order_note: "",
    };

    console.log("Create cashfree order response for user: ", userId)

    const response = await Cashfree.PGCreateOrder("2023-08-01", request);
    const a = response.data;
    console.log(`Cashfree create order response for user: ${userId} is `, a)
    res.status(200).json({ ...a });
  } catch (error) {
    console.error("Error setting up order request:", error.response?.data || error);
    res
      .status(400)
      .json({ error: error.response?.data || "Payment order failed" });
  }
});

exports.verifyPayment = catchAsyncErrors(async (req, res) => {
  const { orderId, userId } = req.body;
  if (!orderId || !userId) {
    console.log("order or user id missing")
    console.log("order_id: ", orderId, ", user_id: ", userId)
    res.status(400).json({ error: "Invalid Request. Order Id missing" });
    return;
  }
  Cashfree.XClientId = process.env.CASHFREE_KEY_ID;
  Cashfree.XClientSecret = process.env.CASHFREE_KEY_SECRET;
  Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;
  let version = "2023-08-01";
  try {
    console.log(`Verifying payment for order_id: ${orderId}, user: ${userId}`);
    const response = await Cashfree.PGFetchOrder(version, orderId);

    const paymentData = response.data;
    console.log("Payment data for user: ", userId, ": ", paymentData);

    if (paymentData.order_status === "PAID") {
      const activateResponse = await activateUser(userId);
      console.log("User activated: ", activateResponse);

      if (activateResponse.message !== "success") {
        res.status(400).json({ message: "Error Activating User" });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Payment Verified Successfully. User Activated",
      });
    } else {
      throw new Error("Verificaton Failed.");
    }
  } catch (error) {
    console.error("Error verifing payment:", error.response?.data || error);
    res.status(400).json({
      success: false,
      error: error.response?.data || "Payment verification failed",
    });
  }
});
