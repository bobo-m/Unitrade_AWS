const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/userModel");
const crypto = require("crypto");
const db = require("../config/mysql_database");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const QueryModel = require("../models/queryModel");
const { log } = require("console");
const moment = require("moment-timezone");

const registerSchema = Joi.object({
  user_name: Joi.string().required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().length(10).required(), // Assuming mobile is a 10-digit number
  password: Joi.string().required(),
  user_type: Joi.string().valid("user", "admin").required(), // Adjust as needed
  // referral_by: Joi.string().optional(), // If this field is optional
});


const generateReferralCode = (userId) => {
  const referralCode = `UNITRADE${userId}`; // Prefix "UNITRADE" with the user's user_id
  return referralCode;
};


// exports.checkUser = catchAsyncErrors(async (req, res, next) => {
//   const { mobile } = req.body;
//   console.log("Request Body:", req.body); // For debugging purposes
//   // Validate input
//   if (!mobile) {
//     return next(new ErrorHandler("Mobile number is required", 400));
//   }
//   try {
//     // Query to find user by mobile
//     const [userData] = await db.query(
//       "SELECT * FROM users WHERE mobile = ? AND user_type = 'user' LIMIT 1",
//       [mobile]
//     );
//     const user = userData[0]; // Access the first user in the result
//     console.log("User Data:", user); // For debugging purposes
//     // If user not found
//     if (!user) {
//       return next(
//         new ErrorHandler("Mobile number not found in the database", 404)
//       );
//     }
//     // Check user status
//     const status = parseInt(user.status); // Parse status once
//     if (status === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "User found successfully",
//         user: {
//           id: user.id,
//           mobile: user.mobile,
//           status: user.status,
//           user_type: user.user_type,
//         },
//       });
//     } else if (status === 1) {
//       return res.status(200).json({
//         success: true,
//         message: "You have already paid",
//         user: {
//           id: user.id,
//           mobile: user.mobile,
//           status: user.status,
//           user_type: user.user_type,
//         },
//       });
//     } else {
//       return next(new ErrorHandler("Invalid user status", 400));
//     }
//   } catch (error) {
//     console.error("Error in checkUser:", error); // Log the error for debugging
//     return next(
//       new ErrorHandler("An unexpected error occurred", 500, error.message)
//     );
//   }
// });


exports.registerUserApi = catchAsyncErrors(async (req, res, next) => {
  // Validate request body with Joi schema
  try {
    await registerSchema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
  } catch (error) {
    const errorMessages = error.details
      ? error.details.map((d) => d.message)
      : ["Validation failed"];
    return res.status(400).json({ success: false, error: errorMessages });
  }

  const dateCreated = new Date().toISOString().slice(0, 19).replace("T", " ");
  if (req.file) req.body.image = req.file.filename;
  // Check if email, mobile, or UPI ID already exists
  const { email, mobile } = req.body;
  const existingUserQuery = `
  SELECT email, mobile FROM users WHERE email = ? OR mobile = ?
`;
  const [existingUserRows] = await db.query(existingUserQuery, [email, mobile]);

  if (existingUserRows.length > 0) {
    const existingUser = existingUserRows[0];
    if (existingUser.email === email) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }
    if (existingUser.mobile === mobile) {
      return res.status(400).json({
        success: false,
        error: "Mobile number already exists",
      });
    }
  }

  const insertData = {
    user_name: req.body.user_name,
    email: req.body.email,
    mobile: req.body.mobile,
    password: await bcrypt.hash(req.body.password, 10),
    date_created: dateCreated,
    status: "0",
    user_type: req.body.user_type,
    date_modified: dateCreated,
  };

  // User Data Model for insertion
  const UserDataModel = {
    async create(userData) {
      const query = `
        INSERT INTO user_data (user_id, upi_id, referral_by, referral_code, parent_id, leftchild_id, rightchild_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const result = await db.query(query, [
        userData.user_id,
        userData.upi_id,
        userData.referral_by,
        userData.referral_code,
        userData.parent_id,
        userData.leftchild_id,
        userData.rightchild_id,
      ]);
      return result;
    },
    async updateData(table, data, condition) {
      const query = `UPDATE ${table} SET ? WHERE ?`;
      const result = await db.query(query, [data, condition]);
      return result;
    },
  };
  // Function to check if a user has both children
  async function hasBothChildren(userId) {
    const query = `SELECT leftchild_id, rightchild_id FROM user_data WHERE user_id = ?`;
    const [rows] = await db.query(query, [userId]);
    const user = rows[0];
    return user && user.leftchild_id !== null && user.rightchild_id !== null;
  }

  // Main function to find the available parent
  async function findAvailableParent(referralCode = null) {
    // If a referral code is provided, check for the user associated with it
    if (referralCode) {
      const userQuery = `SELECT user_id as parent_id FROM user_data WHERE referral_code = ?`;
      const [userRows] = await db.query(userQuery, [referralCode]);
      const currentUser = userRows[0];

      if (currentUser) {
        // Check if the current parent already has both children
        if (await hasBothChildren(currentUser.parent_id)) {
          console.log("Referred user's parent already has both children.");
        } else {
          // Attempt to find an available spot in the referred user's subtree
          const result = await findAvailableSpotInSubtree(currentUser.parent_id);
          if (result) {
            return result;
          }
          console.log("Referred user's subtree is fully occupied.");
        }
      } else {
        console.log("No user found for the given referral code.");
      }
    }

    // If referral is not provided, or the referred user's subtree is fully occupied, find the next available parent
    const rootQuery = `SELECT user_id FROM user_data WHERE parent_id IS NULL`;
    const [rootRows] = await db.query(rootQuery);
    const root = rootRows[0];

    if (!root) return null;

    const queue = [root.user_id];
    while (queue.length > 0) {
      const currentParentId = queue.shift();
      const parentQuery = `SELECT leftchild_id, rightchild_id FROM user_data WHERE user_id = ?`;
      const [parentRows] = await db.query(parentQuery, [currentParentId]);

      if (!parentRows.length) continue;

      const parent = parentRows[0];

      // Check for available child position
      if (parent.leftchild_id === null) {
        return { parentId: currentParentId, position: "leftchild_id" };
      }
      if (parent.rightchild_id === null) {
        return { parentId: currentParentId, position: "rightchild_id" };
      }

      queue.push(parent.leftchild_id);
      queue.push(parent.rightchild_id);
    }

    console.log("No available parent found");
    return null;
  }

  // Helper function to find an available spot in the subtree
  async function findAvailableSpotInSubtree(userId) {
    const queue = [userId];
    while (queue.length > 0) {
      const currentUserId = queue.shift();
      const childQuery = `SELECT leftchild_id, rightchild_id FROM user_data WHERE user_id = ?`;
      const [childRows] = await db.query(childQuery, [currentUserId]);

      if (!childRows.length) continue;

      const user = childRows[0];

      // Check for available child positions
      if (user.leftchild_id === null) {
        return { parentId: currentUserId, position: "leftchild_id" };
      }
      if (user.rightchild_id === null) {
        return { parentId: currentUserId, position: "rightchild_id" };
      }

      queue.push(user.leftchild_id);
      queue.push(user.rightchild_id);
    }

    return null; // No available spot found
  }
  // Main logic for user registration

  let referralBy = req.body.referral_by; // Use 'let' to allow reassignment
  let parentId = null;
  let position = null;

  if (referralBy) {
    const parentInfo = await findAvailableParent(referralBy);
    if (parentInfo) {
      parentId = parentInfo.parentId;
      position = parentInfo.position;
    } else {
      const nextParentInfo = await findAvailableParent();
      if (nextParentInfo) {
        parentId = nextParentInfo.parentId;
        position = nextParentInfo.position;
      }
    }
  } else {
    // If referralBy is not provided, fetch the referral_code of the user where user_id = 2
    // const defaultUser = await db.query(
    //   "SELECT referral_code FROM user_data WHERE user_id = ?",
    //   [2]
    // );

    const defaultUser = await db.query(
      "SELECT referral_code FROM user_data WHERE parent_id IS NULL LIMIT 1"
    );

    const referralCode = defaultUser[0]?.[0]?.referral_code || null;
    console.log(defaultUser);

    const nextParentInfo = await findAvailableParent();
    if (nextParentInfo) {
      parentId = nextParentInfo.parentId;
      position = nextParentInfo.position;
    }

    referralBy = referralCode; // Set the referralBy to the referral_code of user_id = 2
  }

  // const UserDataModel = {
  //   async create(userData) {
  //     const query = `
  //       INSERT INTO user_data (user_id, upi_id, referral_by, referral_code, parent_id, leftchild_id, rightchild_id)
  //       VALUES (?, ?, ?, ?, ?, ?, ?)`;
  //     const result = await db.query(query, [
  //       userData.user_id,
  //       userData.upi_id,
  //       userData.referral_by,
  //       userData.referral_code,
  //       userData.parent_id,
  //       userData.leftchild_id,
  //       userData.rightchild_id,
  //     ]);
  //     return result;
  //   },
  //   async updateData(table, data, condition) {
  //     const query = `UPDATE ${table} SET ? WHERE ?`;
  //     const result = await db.query(query, [data, condition]);
  //     return result;
  //   },
  // };

  try {
    // Insert user data into the users table
    const user = await QueryModel.saveData("users", insertData);
    const userId = user.id;
    const generatedReferralCode = generateReferralCode(userId);

    // Prepare additional data for the user_data table
    const insertData2 = {
      user_id: userId,
      upi_id: req.body.upi_id,
      referral_by: referralBy,
      referral_code: req.body.referral_code || generatedReferralCode,
      parent_id: parentId,
      leftchild_id: null,
      rightchild_id: null,
    };

    // Insert additional user data into user_data table
    const newUserData = await UserDataModel.create(insertData2);
    if (!newUserData) {
      return res
        .status(500)
        .json({ success: false, error: "Error inserting user data" });
    }

    // Update parent record with the new child ID if parentId and position are set
    if (parentId && position) {
      const updateData = { [position]: userId };
      await UserDataModel.updateData("user_data", updateData, {
        user_id: parentId,
      });
    }
    // Insert a notification into the notifications table
    const notificationMessage = `${req.body.user_name} successfully registered.`;
    const notificationQuery = `
    INSERT INTO notifications (user_id, user_name, activity, message, message_status, date_created)
    VALUES (?, ?, ?, ?, ?, ?)`;

    await db.query(notificationQuery, [
      userId, // user_id
      req.body.user_name, // user_name
      "register", // activity
      notificationMessage, // message
      "unread", // message_status
      dateCreated, // date_created
    ]);
    // Fetch the newly inserted user to generate the token
    const userDetail = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    const newUser = userDetail[0][0];

    // Generate token for the new user
    const token = User.generateToken(newUser.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        ...newUser,
        referral_by: referralBy, // Include referral_by in the response (it will have the referral_code of user_id = 2)
      },
    });
    return;
  } catch (error) {
    console.error("Error during user registration:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});
////////////////////////////////////////////////////////////////////////////////////////////

// Login user
// Login user using mobile number
// exports.loginUserApi = catchAsyncErrors(async (req, res, next) => {
//   const { mobile, password } = req.body; // Change to mobile instead of emailOrMobile

//   // Checking that mobile number and password are provided
//   if (!mobile || !password) {
//     return next(
//       new ErrorHandler("Please enter mobile number and password", 400)
//     );
//   }

//   // Find user by mobile number only
//   const userData = await db.query(
//     "SELECT * FROM users WHERE mobile = ? LIMIT 1",
//     [mobile] // Query only with mobile
//   );
//   const user = userData[0][0];

//   // If user not found
//  if (!user) {
//     return next(new ErrorHandler("Invalid mobile number", 400));
//   }


//   // Debugging: Log user to check the values
//   console.log(user); // Add this to check the user data being fetched

//   // Ensure status is a number and check if the user is active
//   if (parseInt(user.status) === 0) {
//     // parseInt to ensure we compare number values
//     return next(
//       new ErrorHandler(
//         "Your account is deactivated. Please contact support.",
//         403
//       )
//     );
//   }

//   // Compare passwords
//   const isPasswordMatched = await User.comparePasswords(
//     password,
//     user.password
//   );
//   if (!isPasswordMatched) {
//     return next(new ErrorHandler("Invalid password", 400));
//   }
//   // Generate token for the authenticated user
//   const token = User.generateToken(user.id); // Adjust as per your user object structure

//   // Send the token and user details in the response
//   res.status(200).json({
//     success: true,
//     token,
//     user: {
//       id: user.id,
//       mobile: user.mobile,
//       // Add any other user details you want to include in the response
//     },
//   });
// });
exports.loginUserApi = catchAsyncErrors(async (req, res, next) => {
  const { mobile, password } = req.body;

  // Check that mobile number and password are provided
  if (!mobile || !password) {
    return next(
      new ErrorHandler("Please enter both mobile number and password", 400)
    );
  }

  try {
    // Fetch user by mobile
    const userData = await db.query(
      "SELECT * FROM users WHERE mobile = ? LIMIT 1",
      [mobile]
    );
    const user = userData[0][0];

    // Check if mobile number is invalid
    if (!user) {
      return next(new ErrorHandler("Invalid mobile number", 400));
    }

    // Debugging to check user details
    console.log(user);

    // Password checking
    const isPasswordMatched = await User.comparePasswords(
      password,
      user.password
    );

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid password", 400));
    }

    // Handle pay_confirm and status logic
    const payConfirm = parseInt(user.pay_confirm);
    const status = parseInt(user.status);

    if (payConfirm === 1 && status === 0) {
      // Account is pending activation
      return res.status(200).json({
        success: false,
        message: "Your account is not active yet. Please wait for activation.",
        status,          // Send status in response
        pay_confirm: payConfirm // Send pay_confirm in response
      });
    }


    if (payConfirm === 1 && status === 1) {
      // Login success
      const token = User.generateToken(user.id);

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          mobile: user.mobile,
          userType: user.user_type
        },
        status,          // Send status in response
        pay_confirm: payConfirm // Send pay_confirm in response
      });
    }

    if (payConfirm === 0 && status === 0) {
      // User not allowed to log in but return 200 OK
      return res.status(200).json({
        success: false,
        message:
          "Your account is not yet confirmed or active. Please complete the necessary steps.",
        status,          // Send status in response
        pay_confirm: payConfirm, // Send pay_confirm in response
        user: {
          id: user.id,
          mobile: user.mobile,
        }
      });
    }

    // Default fallback
    return next(new ErrorHandler("Something went wrong. Please try again.", 500));
  } catch (error) {
    console.error("Error during login:", error);
    return next(new ErrorHandler("Internal server error", 500));
  }
});

exports.logoutApi = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logout successfully",
  });
});
exports.forgotPasswordApi = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body; // Get email from request body

  // Find user by email
  const userDetail = await db.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  // If no user found
  if (userDetail[0].length === 0) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  const user = userDetail[0][0];

  // Generate a new random password
  const newPassword = crypto.randomBytes(3).toString("hex"); // Generate a random 8-byte password

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the password in the database
  const query = "UPDATE users SET password = ? WHERE id = ?";
  await db.query(query, [hashedPassword, user.id]);

  // Send email to the user with the new password using sendEmail function
  const emailOptions = {
    email: user.email, // User's email from the database
    subject: "Your new password",
    message: `Your new password is: ${newPassword}. Please use it to login to your account.`,
  };

  try {
    await sendEmail(emailOptions); // Call sendEmail to send the email
    res.status(200).json({
      success: true,
      message: "New password has been sent to your email.",
    });
  } catch (error) {
    return next(new ErrorHandler("Error sending email", 500));
  }
});

exports.updatePasswordApi = catchAsyncErrors(async (req, res, next) => {
  // Retrieve the user details from the database using the user ID from the request
  const userDetail = await db.query("SELECT * FROM users WHERE id = ?", [
    req.user.id,
  ]);
  const user = userDetail[0][0];

  // Check if the old password entered by the user matches the current password in the database
  const isPasswordMatched = await User.comparePasswords(
    req.body.oldPassword,
    user.password
  );

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  // Ensure the new password and confirm password match
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  // Hash the new password before storing it
  const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

  // SQL query to update the password in the database
  const query = "UPDATE users SET password = ? WHERE id = ?";

  // Execute the update query
  await db.query(query, [hashedPassword, user.id]);

  // Send a success response to the client
  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});
//////////////////////////////////////////

// update user profile
exports.updateProfileApi = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  // Extract fields from the request body
  const { user_name, email, upi_id } = req.body;

  // Get the uploaded file's filename, if present
  let userPhotoFilename = req.file ? req.file.filename : null;

  // Debugging: Log user ID, user photo filename, and other fields
  console.log(`User ID: ${userId}`);
  console.log(`User Photo Filename: ${userPhotoFilename || "No file uploaded"}`);
  console.log(`Name: ${user_name}, Email: ${email}, UPI ID: ${upi_id}`);

  try {
    // Update the users table for user_name, email, and 
    await db.query(
      "UPDATE users SET user_name = ?, email = ? WHERE id = ?",
      [user_name, email, userId]
    );

    // Prepare the user_data table update query and data
    let query = "UPDATE user_data SET upi_id = ?";
    let data = [upi_id, userId];

    if (userPhotoFilename) {
      query += ", user_photo = ?";
      data.splice(1, 0, userPhotoFilename); // Insert `user_photo` before `user_id`
    }

    query += " WHERE user_id = ?";

    // Execute the user_data table update query
    const result = await db.query(query, data);

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return next(new ErrorHandler("No user found with the provided user ID", 404));
    }

    // Send a success response back to the client
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user_id: userId,
        user_name,
        email,
        upi_id,
        user_photo: userPhotoFilename || "No image uploaded", // Optional in response
      },
    });
  } catch (error) {
    console.error("Database update error:", error); // Log the error for debugging
    return next(new ErrorHandler("Database update failed", 500));
  }
});

exports.uploadScreenshotApi = catchAsyncErrors(async (req, res, next) => {
  // Get user ID from route parameters
  const user_id = req.params.id;

  // Get UTR number and transaction ID from request body
  const { utr_no, transaction_id } = req.body;

  // Check if `utr_no` and `transaction_id` are provided
  if (!utr_no || !transaction_id) {
    return next(
      new ErrorHandler("UTR number and transaction ID are required", 400)
    );
  }

  // Get the uploaded file's filename, if present
  let pay_image = req.file ? req.file.filename : null;

  // Debugging: Log user ID, image filename (if present), UTR number, and transaction ID
  console.log(`User ID from params: ${user_id}`);
  console.log(`Image Filename: ${pay_image || "No file uploaded"}`);
  console.log(`UTR Number: ${utr_no}`);
  console.log(`Transaction ID: ${transaction_id}`);

  try {
    // Fetch `user_name` from `users` table using `user_id`
    const [userResult] = await db.query(
      `SELECT u.user_name 
       FROM users u
       JOIN user_data ud ON u.id = ud.user_id
       WHERE ud.user_id = ?`,
      [user_id]
    );

    // Log the raw query result for debugging
    console.log("Raw query result:", userResult);

    if (!userResult || userResult.length === 0 || !userResult[0].user_name) {
      return next(
        new ErrorHandler(
          "No user found with the provided user ID in users table",
          404
        )
      );
    }

    // Extract the user_name from the first result
    const userName = userResult[0].user_name;

    // Update the user data in the `user_data` table
    let userQuery = "UPDATE user_data SET utr_no = ?, transaction_id = ?";
    let userData = [utr_no, transaction_id];

    if (pay_image) {
      userQuery += ", pay_image = ?";
      userData.push(pay_image);
    }

    userQuery += " WHERE user_id = ?";
    userData.push(user_id);

    const updateResult = await db.query(userQuery, userData);

    if (updateResult.affectedRows === 0) {
      return next(
        new ErrorHandler(
          "No user found with the provided user ID in user_data table",
          404
        )
      );
    }

    //       const updatePayConfirmQuery = "UPDATE users SET pay_confirm = ? WHERE id = ?";
    // const payConfirmResult = await db.query(updatePayConfirmQuery, [parseInt(1), user_id]);
    const updatePayConfirmQuery = "UPDATE users SET pay_confirm = 1 WHERE id = ?";
    const payConfirmResult = await db.query(updatePayConfirmQuery, [user_id]);
    // Log result to debug
    console.log("Pay confirm update result:", payConfirmResult);

    if (payConfirmResult.affectedRows === 0) {
      return next(
        new ErrorHandler(
          "Failed to update pay_confirm field in users table",
          500
        )
      );
    }

    // Insert notification data into the notifications table
    const notificationQuery = `
      INSERT INTO notifications 
      (user_id, user_name, activity, message, message_status, date_created) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const activity = "Payment";
    const message = `${userName} requested to activate the account.`;
    const messageStatus = "Unread";
    const dateCreated = new Date();

    await db.query(notificationQuery, [
      user_id,
      userName,
      activity,
      message,
      messageStatus,
      dateCreated,
    ]);

    // Send a success response back to the client
    res.status(200).json({
      success: true,
      message: "Data updated successfully and notification created.",
      data: {
        user_id,
        user_name: userName,
        pay_image: pay_image || "No image uploaded", // Optional in response
        utr_no,
        transaction_id,
      },
    });
  } catch (error) {
    console.error("Database operation error:", error); // Log the error for debugging
    return next(new ErrorHandler("Database operation failed", 500));
  }
});


exports.uploadQuestScreenshotApi = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id; // Get the user ID from the request
  const quest_id = req.params.quest_id;

  // Check if the user already has an entry with status "waiting" for this quest
  const [existingStatusResult] = await db.query(
    "SELECT status FROM usercoin_audit WHERE quest_id = ? AND user_id = ? AND status = 'waiting'",
    [quest_id, userId]
  );

  if (existingStatusResult.length > 0) {
    // If status is already "waiting", prevent new uploads
    return res.status(400).json({
      success: false,
      message: "Image already uploaded. Status is still 'waiting'.",
    });
  }

  // Check if files were uploaded
  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("No files uploaded", 400));
  }

  // Map each uploaded file to get the filename
  const quest_screenshot = req.files.map((file) => file.filename);

  try {
    await db.query("START TRANSACTION");

    // Step 2: Fetch quest details
    const [questResult] = await db.query(
      "SELECT id, coin_earn, activity, quest_name FROM quest WHERE id = ?",
      [quest_id]
    );

    if (questResult.length === 0) {
      await db.query("ROLLBACK");
      return next(new ErrorHandler("Quest not found", 404));
    }

    const {
      id: fetchedQuestId,
      coin_earn: coinEarn,
      activity,
      quest_name: fetchedQuestName,
    } = questResult[0];
    console.log("Quest details fetched:", {
      fetchedQuestId,
      coinEarn,
      activity,
      fetchedQuestName,
    });

    const coinEarnValue = Math.floor(parseFloat(coinEarn));
    if (isNaN(coinEarnValue) || coinEarnValue < 0) {
      await db.query("ROLLBACK");
      return next(new ErrorHandler("Invalid coin earn value", 400));
    }

    let pendingCoinValue = coinEarnValue; // Default value
    let status = "completed"; // Default status

    if (activity === "follow") {
      // If activity is "follow"
      pendingCoinValue = 0;
      status = "waiting";
    }

    console.log("Pending Coin Value:", pendingCoinValue, "Status:", status);

    // Step 3: Insert into usercoin_audit
    const insertAuditData = {
      user_id: userId,
      quest_id: fetchedQuestId,
      pending_coin: pendingCoinValue,
      coin_operation: "cr",
      type: "quest",
      title: "quest",
      description: "quest",
      status: status,
      date_entered: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    const [insertAuditResult] = await db.query(
      "INSERT INTO usercoin_audit SET ?",
      insertAuditData
    );

    if (insertAuditResult.affectedRows === 0) {
      await db.query("ROLLBACK");
      return next(new ErrorHandler("Failed to complete quest", 500));
    }

    console.log("Audit log entry created for quest completion.");
    console.log("hhjhjhjhj===>" + quest_screenshot);
    // Step 1: Update screenshots in usercoin_audit
    const updateResult = await db.query(
      "UPDATE usercoin_audit SET quest_screenshot= ?,screenshot_upload_date = NOW(), status = 'waiting' WHERE quest_id = ? AND user_id = ?",
      [JSON.stringify(quest_screenshot), quest_id, userId]
    );

    if (updateResult.affectedRows === 0) {
      await db.query("ROLLBACK");
      return next(
        new ErrorHandler(
          "No quest found with the provided quest ID or user ID",
          404
        )
      );
    }

    console.log("Quest screenshots updated successfully in usercoin_audit.");
    // Step 4: Update pending_coin in user_data (only if activity is not "follow")
    if (activity !== "follow") {
      const [currentCoinResult] = await db.query(
        "SELECT pending_coin FROM user_data WHERE user_id = ?",
        [userId]
      );

      const currentPendingCoin = currentCoinResult[0]?.pending_coin || 0;
      const newPendingCoin = currentPendingCoin + coinEarnValue;

      const updateUserDataQuery = `
        UPDATE user_data
        SET pending_coin = ?
        WHERE user_id = ?
      `;

      const [updateUserResult] = await db.query(updateUserDataQuery, [
        newPendingCoin,
        userId,
      ]);

      if (updateUserResult.affectedRows === 0) {
        await db.query("ROLLBACK");
        return next(
          new ErrorHandler("Failed to update pending_coin in user_data", 500)
        );
      }

      console.log("Pending_coin updated successfully for user.");
    }

    // Step 5: Commit the transaction
    await db.query("COMMIT");

    let responseMessage = `Quest completed successfully. ${coinEarnValue} coins recorded in audit log.`;
    if (activity === "follow") {
      responseMessage = "Quest completed successfully. Approve by admin.";
    }

    // Final response
    res.status(200).json({
      success: true,
      message: responseMessage,
      data: {
        user_id: userId,
        quest_id: fetchedQuestId,
        quest_name: fetchedQuestName,
        quest_screenshot: quest_screenshot,
        coin_earn: coinEarnValue,
        status,
        date_entered: new Date(),
      },
    });
  } catch (error) {
    console.error("Error during quest completion:", error);
    await db.query("ROLLBACK");
    return next(new ErrorHandler("Database query failed", 500));
  }
});

// exports.getUserDetailApi = catchAsyncErrors(async (req, res, next) => {
//   try {
//     // Fetch the user's ID from the request
//     const userId = req.user.id;

//     // Check if userId is undefined or null
//     if (!userId) {
//       return next(new ErrorHandler("User ID is missing", 400));
//     }

//     // Fetch user details from the 'users' table
//     const userDetailsQuery = await db.query(
//       "SELECT user_name, email, mobile FROM users WHERE id = ?",
//       [userId]
//     );

//     if (userDetailsQuery[0].length === 0) {
//       return next(new ErrorHandler("User not found", 404));
//     }

//     const user = userDetailsQuery[0][0]; // Extract user details

//     // Fetch additional details from the 'user_data' table
//     const userDataQuery = await db.query(
//       "SELECT coins, pending_coin, upi_id, user_photo, referral_code FROM user_data WHERE user_id = ?",
//       [userId]
//     );

//     if (userDataQuery[0].length === 0) {
//       return next(new ErrorHandler("User data not found", 404));
//     }

//     const userData = userDataQuery[0][0]; // Extract user_data details
//     const referralCode = userData.referral_code; // Get the referral code of the logged-in user

//     // Count how many users have used this referral code
//     const referralCountQuery = await db.query(
//       "SELECT COUNT(*) AS referral_count FROM user_data WHERE referral_by = ?",
//       [referralCode]
//     );

//     const referralCount = referralCountQuery[0][0].referral_count || 0; // Extract referral count

//     // Construct the response object with all the necessary details
//     const userProfile = {
//       user_name: user.user_name,
//       email: user.email,
//       mobile: user.mobile,
//       coins: userData.coins || 0, // If coins are null, set to 0
//       pending_coin: userData.pending_coin || 0, // If pending coins are null, set to 0
//       upi_id: userData.upi_id || "", // If upi_id is null, set to an empty string
//       user_photo: userData.user_photo
//         ? `${process.env.BACKEND_URL}uploads/${userData.user_photo}`
//         : null, // Full URL for user photo or null if not set
//       referral_count: referralCount, // Include referral count in the response
//       referral_code: userData.referral_code,
//     };
//     console.log(userProfile);

//     // Send the response with the user's profile
//     res.status(200).json({
//       success: true,
//       data: userProfile,
//     });
//   } catch (error) {
//     console.error("Error fetching user profile:", error);
//     return next(
//       new ErrorHandler("An error occurred while fetching user profile", 500)
//     );
//   }
// });

exports.getUserDetailApi = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch the user's ID from the request
    const userId = req.user.id;

    // Check if userId is undefined or null
    if (!userId) {
      return next(new ErrorHandler("User ID is missing", 400));
    }
    const settingsResult = await db.query(
      "SELECT reduce_coin_rate FROM settings LIMIT 1" // Assuming there's only one row in the settings table
    );

    const reduceCoinRate = settingsResult[0][0]?.reduce_coin_rate || 0;

    // Fetch user details from the 'users' table
    const userDetailsQuery = await db.query(
      "SELECT user_name, email, mobile FROM users WHERE id = ?",
      [userId]
    );

    if (userDetailsQuery[0].length === 0) {
      return next(new ErrorHandler("User not found", 404));
    }

    const user = userDetailsQuery[0][0]; // Extract user details

    // Fetch additional details from the 'user_data' table
    const userDataQuery = await db.query(
      "SELECT coins, pending_coin, upi_id, user_photo, referral_code FROM user_data WHERE user_id = ?",
      [userId]
    );

    if (userDataQuery[0].length === 0) {
      return next(new ErrorHandler("User data not found", 404));
    }

    const userData = userDataQuery[0][0]; // Extract user_data details
    const referralCode = userData.referral_code; // Get the referral code of the logged-in user

    const referralCountQuery = await db.query(
      `SELECT COUNT(*) AS referral_count
      FROM user_data 
      JOIN users 
      ON user_data.user_id = users.id
      WHERE user_data.referral_by = ? 
      AND users.status = 1`,
      [referralCode]
    );

    const referralCount = referralCountQuery[0][0].referral_count || 0;


    // Construct the response object with all the necessary details
    const userProfile = {
      user_name: user.user_name,
      email: user.email,
      mobile: user.mobile,
      coins: userData.coins || 0, // If coins are null, set to 0
      pending_coin: userData.pending_coin || 0, // If pending coins are null, set to 0
      upi_id: userData.upi_id || "", // If upi_id is null, set to an empty string
      user_photo: userData.user_photo
        ? `${process.env.BACKEND_URL}uploads/${userData.user_photo}`
        : null, // Full URL for user photo or null if not set
      referral_count: referralCount, // Include referral count in the response
      referral_code: userData.referral_code,
      reduce_coin_rate: reduceCoinRate
    };
    console.log(userProfile);

    // Send the response with the user's profile
    res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return next(
      new ErrorHandler("An error occurred while fetching user profile", 500)
    );
  }
});
////////////////////////////////////
exports.getCompanyDetailApi = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch the company ID from the request, assuming it's passed as a parameter
    const companyId = req.params.id;

    // Log the companyId to verify it
    console.log("Company ID being fetched:", companyId);

    // Check if companyId is undefined or null
    if (!companyId) {
      return next(new ErrorHandler("Company ID is missing", 400));
    }

    // Fetch user details from the 'users' table where user_type is 'company'
    const userQuery = await db.query(
      "SELECT user_name FROM users WHERE id = ? AND user_type = 'company'",
      [companyId]
    );

    console.log("User query result:", userQuery);

    // If the user doesn't exist or is not a company
    if (userQuery[0].length === 0) {
      return next(new ErrorHandler("Company user not found", 404));
    }

    const user = userQuery[0][0]; // Extract user details

    // Fetch company data and coin rate ranges using the companyId
    const companyDataQuery = await db.query(
      `SELECT c.description, cr.min_coins, cr.max_coins, cr.rate AS range_rate
       FROM company_data c
       LEFT JOIN coin_rate_ranges cr ON c.company_id = cr.company_id
       WHERE c.company_id = ?`,
      [companyId]
    );

    console.log("Company data query result:", companyDataQuery);

    // If company data doesn't exist
    if (companyDataQuery[0].length === 0) {
      return next(new ErrorHandler("Company data not found", 404));
    }

    const companyData = companyDataQuery[0][0]; // Extract company data details

    // Map the coin ranges if they exist
    const coinRanges = companyDataQuery[0].map((row) => ({
      min_coins: row.min_coins,
      max_coins: row.max_coins,
      rate: row.range_rate,
    }));

    // Construct the response object with all the necessary details
    const companyProfile = {
      company_name: user.user_name,
      description: companyData.description || "", // If description is null, set to an empty string
      coin_ranges: coinRanges, // Add the coin ranges to the response
    };

    // Send the response with the company's profile and coin ranges
    res.status(200).json({
      data: companyProfile,
    });
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return next(
      new ErrorHandler("An error occurred while fetching company profile", 500)
    );
  }
});
//////////////////////////////

exports.getAllCompaniesApi = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch all companies and their coin rate ranges
    const companiesQuery = await db.query(
      `SELECT u.id AS company_id, u.user_name AS company_name, 
            c.description,
              cr.min_coins, cr.max_coins, cr.rate AS range_rate
       FROM users u
       LEFT JOIN company_data c ON u.id = c.company_id
       LEFT JOIN coin_rate_ranges cr ON c.company_id = cr.company_id
       WHERE u.user_type = 'company'`
    );

    console.log("Companies query result:", companiesQuery[0]);

    // If no companies are found
    if (companiesQuery[0].length === 0) {
      return next(new ErrorHandler("No companies found", 404));
    }

    // Map the results to a structured array of companies with coin ranges
    const companies = companiesQuery[0].reduce((acc, company) => {
      let existingCompany = acc.find(
        (item) => item.company_id === company.company_id
      );

      // If company doesn't exist yet in the accumulator, create it
      if (!existingCompany) {
        existingCompany = {
          company_id: company.company_id,
          company_name: company.company_name,
          description: company.description || "",
          coin_ranges: [],
        };
        acc.push(existingCompany);
      }

      // If there is a coin range, add it to the company's coin_ranges
      if (company.min_coins && company.max_coins && company.range_rate) {
        existingCompany.coin_ranges.push({
          min_coins: company.min_coins,
          max_coins: company.max_coins,
          rate: company.range_rate,
        });
      }

      return acc;
    }, []);

    // Send the response with the companies data including their coin ranges
    res.status(200).json({
      success: true,
      data: companies,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return next(
      new ErrorHandler("An error occurred while fetching companies", 500)
    );
  }
});

////////////////////////////////////////

exports.getUserReferralCode = catchAsyncErrors(async (req, res, next) => {
  // Get the user_id from the logged-in user's session
  const user_id = req.user.id; // Assuming req.user.id contains the authenticated user's ID

  console.log("Fetching referral code for user:", user_id);

  try {
    // Query to get the referral code for the user
    const result = await db.query(
      "SELECT referral_code FROM user_data WHERE user_id = ?",
      [user_id]
    );

    const referralCode = result[0][0]?.referral_code || null; // If no referral code is found, default to null

    console.log("Referral code fetched:", referralCode);

    // Respond with the referral code
    res.status(200).json({
      success: true,
      message: "Referral code fetched successfully.",
      data: {
        user_id,
        referral_code: referralCode,
      },
    });
  } catch (error) {
    console.error("Error fetching referral code:", error);
    return next(new ErrorHandler("Database query failed", 500));
  }
});

//////////////////////////////////////

// exports.transferCoins = catchAsyncErrors(async (req, res, next) => {
//   const { amount, recipientReferralCode } = req.body;
//   const senderId = req.user.id; // Sender's user ID

//   try {
//     // Input validation
//     if (!amount || !recipientReferralCode) {
//       return next(
//         new ErrorHandler("Amount and recipient referral code are required", 400)
//       );
//     }

//     if (amount <= 0) {
//       return next(new ErrorHandler("Amount must be greater than 0", 400));
//     }

//     // Step 1: Fetch sender's coins
//     const senderCoinsQuery = await db.query(
//       "SELECT coins FROM user_data WHERE user_id = ?",
//       [senderId]
//     );
//     const senderCoins = senderCoinsQuery[0][0]?.coins || 0;

//     // Check if the sender has enough coins
//     if (senderCoins < amount) {
//       return next(new ErrorHandler("Insufficient coins to transfer", 400));
//     }

//     // Step 2: Fetch recipient's user ID based on referral code
//     const recipientQuery = await db.query(
//       "SELECT user_id FROM user_data WHERE referral_code = ?",
//       [recipientReferralCode]
//     );
//     const recipient = recipientQuery[0][0];

//     if (!recipient) {
//       return next(new ErrorHandler("Recipient not found", 404));
//     }

//     const recipientId = recipient.user_id;

//     // Step 3: Begin a transaction
//     await db.query("START TRANSACTION");

//     // Step 4: Update sender's coins by deducting the amount
//     const senderUpdateResult = await db.query(
//       "UPDATE user_data SET coins = coins - ? WHERE user_id = ?",
//       [amount, senderId]
//     );
//     console.log("Sender Update Result:", senderUpdateResult);

//     // Step 5: Update recipient's pending coins
//     const recipientUpdateResult = await db.query(
//       "UPDATE user_data SET pending_coin = pending_coin + ? WHERE user_id = ?",
//       [amount, recipientId]
//     );
//     console.log("Recipient Update Result:", recipientUpdateResult);

//     // Check if the updates were successful
//     if (
//       senderUpdateResult[0].affectedRows === 0 ||
//       recipientUpdateResult[0].affectedRows === 0
//     ) {
//       await db.query("ROLLBACK"); // Rollback transaction if any update fails
//       return next(
//         new ErrorHandler("Failed to update sender or recipient's coins", 500)
//       );
//     }

//     // Step 6: Insert entries into usercoin_audit table with status 'completed'
//     const currentTime = new Date();

//     // Entry 1: Sender's transaction
//     const senderAuditResult = await db.query(
//       "INSERT INTO usercoin_audit (user_id, pending_coin, transaction_id, date_entered, coin_operation, description, earn_coin, type, status, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//       [
//         senderId,
//         0, // Sender's pending_coin as 0
//         recipientId, // Recipient ID as transaction_id
//         currentTime,
//         "cr", // Sender's coin_operation "cr"
//         "Amount sent", // Description
//         amount, // earn_coin set to transferred amount
//         "transfer",
//         "completed", // Status set to 'completed'
//         "Coins Transferred", // Title for sender
//       ]
//     );
//     console.log("Sender Audit Result:", senderAuditResult);

//     const recipientAuditResult = await db.query(
//       "INSERT INTO usercoin_audit (user_id, pending_coin, transaction_id, date_entered, coin_operation, description, earn_coin, type, status, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//       [
//         recipientId,
//         amount, // Recipient's pending_coin as received amount
//         senderId, // Sender ID as transaction_id
//         currentTime,
//         "dr", // Recipient's coin_operation "dr"
//         "Amount received", // Description
//         0, // earn_coin set to 0
//         "transfer",
//         "completed", // Status set to 'completed'
//         "Coins Received", // Title for recipient
//       ]
//     );
//     console.log("Recipient Audit Result:", recipientAuditResult);


//     // Step 7: Commit the transaction
//     await db.query("COMMIT");

//     // Step 8: Respond with success
//     res.status(200).json({
//       success: true,
//       message: `${amount} coins successfully transferred to user with referral code ${recipientReferralCode}.`,
//     });
//   } catch (error) {
//     // Rollback transaction in case of error
//     await db.query("ROLLBACK");
//     console.error("Error transferring coins:", error);
//     return next(
//       new ErrorHandler("An error occurred while transferring coins", 500)
//     );
//   }
// });

// exports.transferCoins = catchAsyncErrors(async (req, res, next) => {
//   const { amount, recipientReferralCode } = req.body;
//   const senderId = req.user.id; // Sender's user ID

//   try {
//     // Input validation
//     if (!amount || !recipientReferralCode) {
//       return next(
//         new ErrorHandler("Amount and recipient referral code are required", 400)
//       );
//     }

//     if (amount <= 0) {
//       return next(new ErrorHandler("Amount must be greater than 0", 400));
//     }

//     // Step 1: Fetch sender's coins
//     const senderCoinsQuery = await db.query(
//       "SELECT coins FROM user_data WHERE user_id = ?",
//       [senderId]
//     );
//     const senderCoins = senderCoinsQuery[0][0]?.coins || 0;

//     // Check if the sender has enough coins
//     if (senderCoins < amount) {
//       return next(new ErrorHandler("Insufficient coins to transfer", 400));
//     }

//     // Step 2: Fetch recipient's user ID based on referral code
//     const recipientQuery = await db.query(
//       "SELECT user_id FROM user_data WHERE referral_code = ?",
//       [recipientReferralCode]
//     );
//     const recipient = recipientQuery[0][0];

//     if (!recipient) {
//       return next(new ErrorHandler("Recipient not found", 404));
//     }

//     const recipientId = recipient.user_id;

//     // Step 3: Begin a transaction
//     await db.query("START TRANSACTION");

//     // Step 4: Update sender's coins by deducting the amount
//     const senderUpdateResult = await db.query(
//       "UPDATE user_data SET coins = coins - ? WHERE user_id = ?",
//       [amount, senderId]
//     );
//     console.log("Sender Update Result:", senderUpdateResult);

//     // Step 5: Update recipient's pending coins
//     const recipientUpdateResult = await db.query(
//       "UPDATE user_data SET pending_coin = pending_coin + ? WHERE user_id = ?",
//       [amount, recipientId]
//     );
//     console.log("Recipient Update Result:", recipientUpdateResult);

//     // Check if the updates were successful
//     if (
//       senderUpdateResult[0].affectedRows === 0 ||
//       recipientUpdateResult[0].affectedRows === 0
//     ) {
//       await db.query("ROLLBACK"); // Rollback transaction if any update fails
//       return next(
//         new ErrorHandler("Failed to update sender or recipient's coins", 500)
//       );
//     }

//     // Step 6: Insert entries into usercoin_audit table with status 'completed'
//     const currentTime = new Date();
// const updatedrecieverAmount = '-' + String(amount) ;

//     // Entry 1: Sender's transaction
//     const senderAuditResult = await db.query(
//       "INSERT INTO usercoin_audit (user_id, pending_coin, transaction_id, date_entered, coin_operation, description, earn_coin, type, status, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//       [
//         senderId,
//         0, // Sender's pending_coin as 0
//         recipientId, // Recipient ID as transaction_id
//         currentTime,
//         "dr", // Sender's coin_operation "dr"
//         "Amount sent", // Description
//         updatedrecieverAmount, // earn_coin set to transferred amount
//         "transfer",
//         "completed", // Status set to 'completed'
//         "Coins Transferred", // Title for sender
//       ]
//     );
//     console.log("Sender Audit Result:", senderAuditResult);
// const updatedAmount = '+' + String(amount) ;

//     const recipientAuditResult = await db.query(
//       "INSERT INTO usercoin_audit (user_id, pending_coin, transaction_id, date_entered, coin_operation, description, earn_coin, type, status, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//       [
//         recipientId,
//         0,
//         senderId, // Sender ID as transaction_id
//         currentTime,
//         "cr", // Recipient's coin_operation "cr"
//         "Amount received", // Description
//         updatedAmount,
//         "transfer",
//         "completed", // Status set to 'completed'
//         "Coins Received", // Title for recipient
//       ]
//     );
//     console.log("Recipient Audit Result:", recipientAuditResult);

//     // Step 7: Commit the transaction
//     await db.query("COMMIT");

//     // Step 8: Respond with success
//     res.status(200).json({
//       success: true,
//       message: `${amount} coins successfully transferred to user with referral code ${recipientReferralCode}.`,
//     });
//   } catch (error) {
//     // Rollback transaction in case of error
//     await db.query("ROLLBACK");
//     console.error("Error transferring coins:", error);
//     return next(
//       new ErrorHandler("An error occurred while transferring coins", 500)
//     );
//   }
// });
// exports.transferCoins = catchAsyncErrors(async (req, res, next) => {
//   const { amount, recipientReferralCode } = req.body;
//   const senderId = req.user.id; // Sender's user ID

//   try {
//     // Input validation
//     if (!amount || !recipientReferralCode) {
//       return next(
//         new ErrorHandler("Amount and recipient referral code are required", 400)
//       );
//     }

//     if (amount <= 0) {
//       return next(new ErrorHandler("Amount must be greater than 0", 400));
//     }

//     // Step 1: Fetch sender's coins
//     const senderCoinsQuery = await db.query(
//       "SELECT coins FROM user_data WHERE user_id = ?",
//       [senderId]
//     );
//     const senderCoins = senderCoinsQuery[0][0]?.coins || 0;

//     // Check if the sender has enough coins
//     if (senderCoins < amount) {
//       return next(new ErrorHandler("Insufficient coins to transfer", 400));
//     }

//     // Step 2: Fetch recipient's user ID based on referral code
//     const recipientQuery = await db.query(
//       "SELECT user_id FROM user_data WHERE referral_code = ?",
//       [recipientReferralCode]
//     );
//     const recipient = recipientQuery[0][0];

//     if (!recipient) {
//       return next(new ErrorHandler("Recipient not found", 404));
//     }

//     const recipientId = recipient.user_id;

//     // Step 3: Check if sender and recipient are the same
//     if (senderId === recipientId) {
//       return next(new ErrorHandler("You cannot transfer coins to your own referral code", 400));
//     }

//     // Step 4: Begin a transaction
//     await db.query("START TRANSACTION");

//     // Step 5: Update sender's coins by deducting the amount
//     const senderUpdateResult = await db.query(
//       "UPDATE user_data SET coins = coins - ? WHERE user_id = ?",
//       [amount, senderId]
//     );
//     console.log("Sender Update Result:", senderUpdateResult);

//     // Step 6: Update recipient's pending coins
//     const recipientUpdateResult = await db.query(
//       "UPDATE user_data SET pending_coin = pending_coin + ? WHERE user_id = ?",
//       [amount, recipientId]
//     );
//     console.log("Recipient Update Result:", recipientUpdateResult);

//     // Check if the updates were successful
//     if (
//       senderUpdateResult[0].affectedRows === 0 ||
//       recipientUpdateResult[0].affectedRows === 0
//     ) {
//       await db.query("ROLLBACK"); // Rollback transaction if any update fails
//       return next(
//         new ErrorHandler("Failed to update sender or recipient's coins", 500)
//       );
//     }

//     // Step 7: Insert entries into usercoin_audit table with status 'completed'
//     const currentTime = new Date();
//     const updatedrecieverAmount = '-' + String(amount);

//     // Entry 1: Sender's transaction
//     const senderAuditResult = await db.query(
//       "INSERT INTO usercoin_audit (user_id, pending_coin, transaction_id, date_entered, coin_operation, description, earn_coin, type, status, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//       [
//         senderId,
//         0, // Sender's pending_coin as 0
//         recipientId, // Recipient ID as transaction_id
//         currentTime,
//         "dr", // Sender's coin_operation "dr"
//         "Amount sent", // Description
//         updatedrecieverAmount, // earn_coin set to transferred amount
//         "transfer",
//         "completed", // Status set to 'completed'
//         "Coins Transferred", // Title for sender
//       ]
//     );
//     console.log("Sender Audit Result:", senderAuditResult);

//     const updatedAmount = '+' + String(amount);

//     const recipientAuditResult = await db.query(
//       "INSERT INTO usercoin_audit (user_id, pending_coin, transaction_id, date_entered, coin_operation, description, earn_coin, type, status, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//       [
//         recipientId,
//         0,
//         senderId, // Sender ID as transaction_id
//         currentTime,
//         "cr", // Recipient's coin_operation "cr"
//         "Amount received", // Description
//         updatedAmount,
//         "transfer",
//         "completed", // Status set to 'completed'
//         "Coins Received", // Title for recipient
//       ]
//     );
//     console.log("Recipient Audit Result:", recipientAuditResult);

//     // Step 8: Commit the transaction
//     await db.query("COMMIT");

//     // Step 9: Respond with success
//     res.status(200).json({
//       success: true,
//       message: `${amount} coins successfully transferred to user with referral code ${recipientReferralCode}.`,
//     });
//   } catch (error) {
//     // Rollback transaction in case of error
//     await db.query("ROLLBACK");
//     console.error("Error transferring coins:", error);
//     return next(
//       new ErrorHandler("An error occurred while transferring coins", 500)
//     );
//   }
// });

exports.transferCoins = catchAsyncErrors(async (req, res, next) => {
  const { amount, recipientReferralCode } = req.body;
  const senderId = req.user.id; // Sender's user ID

  try {
    // Input validation
    if (!amount || !recipientReferralCode) {
      return next(
        new ErrorHandler("Amount and recipient referral code are required", 400)
      );
    }

    if (amount <= 0) {
      return next(new ErrorHandler("Amount must be greater than 0", 400));
    }

    // Step 1: Fetch sender's coins
    const senderCoinsQuery = await db.query(
      "SELECT coins FROM user_data WHERE user_id = ?",
      [senderId]
    );
    const senderCoins = senderCoinsQuery[0][0]?.coins || 0;

    // Check if the sender has enough coins
    if (senderCoins < amount) {
      return next(new ErrorHandler("Insufficient coins to transfer", 400));
    }

    // Step 2: Fetch recipient's user ID based on referral code
    const recipientQuery = await db.query(
      "SELECT user_id FROM user_data WHERE referral_code = ?",
      [recipientReferralCode]
    );
    const recipient = recipientQuery[0][0];

    if (!recipient) {
      return next(new ErrorHandler("Recipient not found", 404));
    }

    const recipientId = recipient.user_id;

    // Step 3: Check if sender and recipient are the same
    if (senderId === recipientId) {
      return next(new ErrorHandler("You cannot transfer coins to your own referral code", 400));
    }

    // Step 4: Begin a transaction
    await db.query("START TRANSACTION");

    // Step 5: Update sender's coins by deducting the amount
    const senderUpdateResult = await db.query(
      "UPDATE user_data SET coins = coins - ? WHERE user_id = ?",
      [amount, senderId]
    );
    console.log("Sender Update Result:", senderUpdateResult);

    // Step 6: Update recipient's pending coins
    const recipientUpdateResult = await db.query(
      "UPDATE user_data SET pending_coin = pending_coin + ? WHERE user_id = ?",
      [amount, recipientId]
    );
    console.log("Recipient Update Result:", recipientUpdateResult);

    // Check if the updates were successful
    if (
      senderUpdateResult[0].affectedRows === 0 ||
      recipientUpdateResult[0].affectedRows === 0
    ) {
      await db.query("ROLLBACK"); // Rollback transaction if any update fails
      return next(
        new ErrorHandler("Failed to update sender or recipient's coins", 500)
      );
    }

    // Step 7: Insert entries into usercoin_audit table with status 'completed'
    const currentTime = new Date();
    const updatedrecieverAmount = '-' + String(amount);

    // Entry 1: Sender's transaction
    const senderAuditResult = await db.query(
      "INSERT INTO usercoin_audit (user_id, pending_coin, transaction_id, date_entered, coin_operation, description, earn_coin, type, status, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        senderId,
        0, // Sender's pending_coin as 0
        recipientId, // Recipient ID as transaction_id
        currentTime,
        "dr", // Sender's coin_operation "dr"
        "Amount sent", // Description
        updatedrecieverAmount, // earn_coin set to transferred amount
        "transfer",
        "completed", // Status set to 'completed'
        "Coins Transferred", // Title for sender
      ]
    );
    console.log("Sender Audit Result:", senderAuditResult);

    const updatedAmount = '+' + String(amount);

    const recipientAuditResult = await db.query(
      "INSERT INTO usercoin_audit (user_id, pending_coin, transaction_id, date_entered, coin_operation, description, earn_coin, type, status, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        recipientId,
        0,
        senderId, // Sender ID as transaction_id
        currentTime,
        "cr", // Recipient's coin_operation "cr"
        "Amount received", // Description
        updatedAmount,
        "transfer",
        "completed", // Status set to 'completed'
        "Coins Received", // Title for recipient
      ]
    );
    console.log("Recipient Audit Result:", recipientAuditResult);

    // Step 8: Commit the transaction
    await db.query("COMMIT");

    // Step 9: Respond with success
    res.status(200).json({
      success: true,
      message: `${amount} coins successfully transferred to user with referral code ${recipientReferralCode}.`,
    });
  } catch (error) {
    // Rollback transaction in case of error
    await db.query("ROLLBACK");
    console.error("Error transferring coins:", error);
    return next(
      new ErrorHandler("An error occurred while transferring coins", 500)
    );
  }
});

/////////////////////////////////////
exports.createSellTransaction = async (req, res, next) => {
  try {
    console.log("Request Body:", req.body);

    // Step 1: Validate incoming request (making sure required fields are present)
    const schema = Joi.object({
      upi_id: Joi.string().required(),
      company_id: Joi.string().required(),
      tranction_coin: Joi.number().required(),
      transction_amount: Joi.number().required(),
    });

    await schema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    const user_id = req.user?.id; // Get the user ID from the request (assuming middleware provides user)
    console.log("User ID:", user_id);

    // Check if user ID exists
    if (!user_id) {
      return next(new ErrorHandler("User ID is required", 401));
    }

    // Step 2: Fetch company data from coin_rate_ranges table
    const [rateData] = await db.query(
      "SELECT rate FROM coin_rate_ranges WHERE company_id = ?",
      [req.body.company_id]
    );

    // Check if the rate data was found for the company ID
    if (!rateData || rateData.length === 0) {
      return next(
        new ErrorHandler("Rate not found or invalid company ID", 404)
      );
    }

    // Parse the rate value from the fetched data
    const transactionRate = parseFloat(rateData[0]?.rate);
    if (isNaN(transactionRate)) {
      return next(
        new ErrorHandler('"tranction_rate" must be a valid number', 400)
      );
    }

    // Step 3: Check user's coin balance
    const [userData] = await db.query(
      `
      SELECT 
        u.user_name, 
        ud.coins 
      FROM 
        users u 
      INNER JOIN 
        user_data ud 
      ON 
        u.id = ud.user_id 
      WHERE 
        u.id = ?
      `,
      [user_id]
    );

    // Check if user data exists
    if (!userData || userData.length === 0) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Parse user's coins and transaction coins
    const userCoins = parseFloat(userData[0]?.coins);
    const transactionCoins = parseFloat(req.body.tranction_coin);

    // Validate if the user has enough coins
    if (userCoins < transactionCoins) {
      return next(new ErrorHandler("Insufficient coins", 400));
    }

    const userName = userData[0]?.user_name;

    // Step 4: Create transaction in the database
    const [transactionResult] = await db.query(
      `INSERT INTO user_transction 
      (user_id, company_id, tranction_coin, tranction_rate, transction_amount, data_created, status, upi_id) 
      VALUES (?, ?, ?, ?, ?, NOW(), "unapproved", ?)`,
      [
        user_id,
        req.body.company_id,
        transactionCoins,
        transactionRate,
        req.body.transction_amount,
        req.body.upi_id
      ]
    );

    const transactionId = transactionResult?.insertId;
    if (!transactionId) {
      throw new Error("Failed to generate transaction ID.");
    }
    console.log("Generated Transaction ID:", transactionId);

    // Step 5: Deduct coins from the user's balance
    const updatedCoins = userCoins - transactionCoins;
    await db.query("UPDATE user_data SET coins = ? WHERE user_id = ?", [
      updatedCoins,
      user_id,
    ]);

    console.log(`Coins updated. Remaining Coins: ${updatedCoins}`);

    // Step 6: Create an audit entry
    const auditParams = [
      user_id,
      req.body.company_id,
      "withdrawal", // Audit type: withdrawal
      "sell coins", // Title for the audit entry
      "waiting", // Status of the transaction
      -transactionCoins, // Negative value for withdrawal
      transactionId, // Transaction ID for audit tracking
    ];
    console.log("Audit Query Parameters:", auditParams);

    await db.query(
      `INSERT INTO usercoin_audit 
      (user_id, company_id, type, title, status, earn_coin, transaction_id, date_entered) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      auditParams
    );

    console.log("Audit Entry Created Successfully");

    // Step 7: Fetch company data to get the company mobile number
    const [companyData] = await db.query(
      "SELECT email FROM users WHERE id = ?",
      [req.body.company_id]
    );

    // Ensure company mobile number exists
    if (!companyData || companyData.length === 0) {
      return next(new ErrorHandler("Company email not found", 404));
    }


    const companyEmail = companyData[0]?.email;
    // Step 8: Construct the concise message body
    const emailMessage = `
<html>
  <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
    <p>Hi ${userName},</p>

    <p>🎉 <strong>Transaction Request Received!</strong></p>

    <p>We have received your request to sell coins. Here's a quick summary of your transaction:</p>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">User:</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${userName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Coins Requested to Sell:</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${req.body.tranction_coin} Coins</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Transaction Amount:</td>
        <td style="padding: 10px; border: 1px solid #ddd;">₹${req.body.transction_amount}</td>
      </tr>
    </table>

    <p style="margin-top: 20px;">To complete your transaction and make the payment, please click the link below:</p>

    <p>
      💳 <a href="https://t.me/unitrade_company_bot" target="_blank" style="color: #007BFF;">Click here to make the payment</a>
    </p>

    <p>We are processing your request and will update you once the transaction is completed. Feel free to reach out if you have any questions or need further assistance.</p>

    <p>Thank you for using Unitradehub!</p>

    <p>Best regards,<br>Team Unitradehub</p>
  </body>
</html>
    `;

    // Step 9: Send the message via UltraMsg API
    const emailOptions = {
      email: companyEmail, // Company email address
      subject: "Sell Coin Transaction Request",
      message: emailMessage,
    };

    await sendEmail(emailOptions); // Send the email to the company's email address


    // Step 10: Respond with success message
    res.status(201).json({
      success: true,
      message: "Transaction, audit entry, and message sent successfully!",
    });
  } catch (error) {
    console.error("Error creating sell transaction:", error);

    // Handle validation errors from Joi
    if (error.isJoi) {
      return next(
        new ErrorHandler(error.details.map((d) => d.message).join(", "), 400)
      );
    }

    // Handle other errors (e.g., database issues)
    return next(
      new ErrorHandler("Failed to create transaction: " + error.message, 500)
    );
  }
};

// exports.createSellTransaction = async (req, res, next) => {
//   try {
//     console.log("Request Body:", req.body);

//     // Step 1: Validate incoming request (making sure required fields are present)
//     const schema = Joi.object({
//       company_id: Joi.string().required(),
//       tranction_coin: Joi.number().required(),
//       transction_amount: Joi.number().required(),
//     });

//     await schema.validateAsync(req.body, {
//       abortEarly: false,
//       allowUnknown: true,
//     });

//     const user_id = req.user?.id; // Get the user ID from the request (assuming middleware provides user)
//     console.log("User ID:", user_id);

//     // Check if user ID exists
//     if (!user_id) {
//       return next(new ErrorHandler("User ID is required", 401));
//     }

//     // Step 2: Fetch company data from coin_rate_ranges table
//     const [rateData] = await db.query(
//       "SELECT rate FROM coin_rate_ranges WHERE company_id = ?",
//       [req.body.company_id]
//     );

//     // Check if the rate data was found for the company ID
//     if (!rateData || rateData.length === 0) {
//       return next(
//         new ErrorHandler("Rate not found or invalid company ID", 404)
//       );
//     }

//     // Parse the rate value from the fetched data
//     const transactionRate = parseFloat(rateData[0]?.rate);
//     if (isNaN(transactionRate)) {
//       return next(
//         new ErrorHandler('"tranction_rate" must be a valid number', 400)
//       );
//     }

//     // Step 3: Check user's coin balance
//     const [userData] = await db.query(
//       "SELECT coins FROM user_data WHERE user_id = ?",
//       [user_id]
//     );

//     // Check if user data exists
//     if (!userData || userData.length === 0) {
//       return next(new ErrorHandler("User not found", 404));
//     }

//     // Parse user's coins and transaction coins
//     const userCoins = parseFloat(userData[0]?.coins);
//     const transactionCoins = parseFloat(req.body.tranction_coin);

//     // Validate if the user has enough coins
//     if (userCoins < transactionCoins) {
//       return next(new ErrorHandler("Insufficient coins", 400));
//     }

//     // Step 4: Create transaction in the database
//     const [transactionResult] = await db.query(
//       `INSERT INTO user_transction 
//       (user_id, company_id, tranction_coin, tranction_rate, transction_amount, data_created, status) 
//       VALUES (?, ?, ?, ?, ?, NOW(), "unapproved")`,

//       [
//         user_id,
//         req.body.company_id,
//         transactionCoins,
//         transactionRate,
//         req.body.transction_amount,
//       ]
//     );

//     const transactionId = transactionResult?.insertId;
//     if (!transactionId) {
//       throw new Error("Failed to generate transaction ID.");
//     }
//     console.log("Generated Transaction ID:", transactionId);

//     // Step 5: Deduct coins from the user's balance
//     const updatedCoins = userCoins - transactionCoins;
//     await db.query("UPDATE user_data SET coins = ? WHERE user_id = ?", [
//       updatedCoins,
//       user_id,
//     ]);

//     console.log(`Coins updated. Remaining Coins: ${updatedCoins}`);

//     // Step 6: Create an audit entry
//     const auditParams = [
//       user_id,
//       req.body.company_id,
//       "withdrawal", // Audit type: withdrawal
//       "sell coins", // Title for the audit entry
//       "waiting", // Status of the transaction
//       -transactionCoins, // Negative value for withdrawal
//       transactionId, // Transaction ID for audit tracking
//     ];
//     console.log("Audit Query Parameters:", auditParams);

//     await db.query(
//       `INSERT INTO usercoin_audit 
//       (user_id, company_id, type, title, status, earn_coin, transaction_id, date_entered) 
//       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
//       auditParams
//     );

//     console.log("Audit Entry Created Successfully");

//     // Step 7: Respond with success message
//     res.status(201).json({
//       success: true,
//       message: "Transaction and audit entry created successfully!",
//     });
//   } catch (error) {
//     console.error("Error creating sell transaction:", error);

//     // Handle validation errors from Joi
//     if (error.isJoi) {
//       return next(
//         new ErrorHandler(error.details.map((d) => d.message).join(", "), 400)
//       );
//     }

//     // Handle other errors (e.g., database issues)
//     return next(
//       new ErrorHandler("Failed to create transaction: " + error.message, 500)
//     );
//   }
// };

////////////////////////////////////
exports.getUserHistory = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;

  try {
    const result = await db.query(
      `SELECT 
          uca.user_id, 
          uca.transaction_id, 
          uca.coin_operation, 
          uca.status, 
          uca.earn_coin, 
          uca.pending_coin, 
          uca.type, 
          uca.company_id, 
          uca.title,
          u.user_name,
          CASE 
              WHEN type = 'withdrawal' THEN uca.date_approved 
              ELSE uca.date_entered 
          END AS transaction_date -- Using a clean alias for better handling
       FROM usercoin_audit AS uca 
       LEFT JOIN users AS u on uca.transaction_id=u.id
       WHERE uca.user_id = ? 
         AND uca.type != 'tap' 
     AND NOT (
         uca.status = 'waiting' 
         AND (type = 'withdrawal' OR type = 'quest')
     )
     ORDER BY date_entered DESC`,
      [user_id]
    );
    if (result[0].length === 0) {
      return res.status(404).json({
        success: true,
        message: "No history found for the user",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "User history fetched successfully.",
      data: result[0],
    });
  } catch (error) {
    console.error("Error fetching user history:", error);
    return next(new ErrorHandler("Database query failed", 500));
  }
});

exports.getFilteredUserHistory = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;

  try {
    // const result = await db.query(
    //   `SELECT user_id, transaction_id, coin_operation, status, earn_coin, pending_coin, type, company_id, date_entered, title
    //    FROM usercoin_audit
    //    WHERE user_id = ? AND status = 'waiting' AND type = 'withdrawal'
    //    ORDER BY date_entered DESC`,
    //   [user_id]
    // );
    const result = await db.query(
      `
      SELECT 
        uca.user_id, 
        uca.transaction_id, 
        uca.coin_operation, 
        uca.status, 
        uca.earn_coin, 
        uca.pending_coin, 
        uca.type, 
        uca.company_id, 
        uca.date_entered, 
        uca.title,
        ut.trans_id, 
        ut.utr_no,
  ut.transction_amount,
    ut.tranction_rate,
         u.user_name 
      FROM 
        usercoin_audit uca
      LEFT JOIN 
        user_transction ut
      ON 
        uca.transaction_id = ut.id
LEFT JOIN 
    users u
  ON 
    uca.company_id = u.id
      WHERE 
        uca.user_id = ? 
        AND uca.status = 'waiting' 
        AND uca.type = 'withdrawal'
      ORDER BY 
        uca.date_entered DESC
      `,
      [user_id]
    );

    if (result[0].length === 0) {
      return res.status(200).json({
        success: true,
        message: "No filtered history found for the user",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Filtered user history fetched successfully.",
      data: result[0],
    });
  } catch (error) {
    console.error("Error fetching filtered user history:", error);
    return next(new ErrorHandler("Database query failed", 500));
  }
});

exports.approveUserTransaction = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("req.body:", req.body);

    // Extract transaction ID from request body
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    // Get current date and time in the desired format
    const dateApprove = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Retrieve transaction details for the given transaction_id
    const transactionDetails = await db.query(
      `SELECT company_id, tranction_coin 
       FROM user_transction 
       WHERE id = ? AND status != 'approved'`,
      [transaction_id]
    );

    if (!transactionDetails || transactionDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No pending transaction found with the provided ID",
      });
    }

    const { company_id, tranction_coin } = transactionDetails[0][0];

    if (!company_id || !tranction_coin) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid transaction details (company_id or tranction_coin missing)",
      });
    }

    // Update the specific transaction in the user_transction table
    const transactionResult = await db.query(
      `UPDATE user_transction 
       SET status = 'approved', 
           date_approved = ? 
       WHERE id = ?`,
      [dateApprove, transaction_id]
    );

    if (transactionResult.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to approve the transaction",
      });
    }

    // Update the corresponding entry in the usercoin_audit table, including date_approved
    const auditResult = await db.query(
      `UPDATE usercoin_audit 
       SET status = 'completed', 
           date_approved = ? 
       WHERE transaction_id = ?`,
      [dateApprove, transaction_id]
    );

    if (auditResult.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to update the audit entry",
      });
    }

    // Check if company_id exists in company_data
    const companyExists = await db.query(
      `SELECT company_id 
       FROM company_data 
       WHERE company_id = ?`,
      [company_id]
    );

    if (!companyExists || companyExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found in company_data table",
      });
    }

    // Add transaction coins to company_coin in the company_data table
    const companyCoinUpdateResult = await db.query(
      `UPDATE company_data 
       SET company_coin = COALESCE(company_coin, 0) + ? 
       WHERE company_id = ?`,
      [tranction_coin, company_id]
    );

    if (companyCoinUpdateResult.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to update the company's coin balance",
      });
    }

    // Respond with success
    res.json({
      success: true,
      message:
        "Transaction approved, audit updated, and company coins added successfully!",
    });
  } catch (error) {
    console.error("Error approving transaction:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// exports.getUserStats = catchAsyncErrors(async (req, res, next) => {
//   try {
//     // Fetch total users count with status = 1 from the users table
//     const totalStatsResult = await db.query(`
//     SELECT 
//         COUNT(*) AS total_users
//       FROM users
//       WHERE status = 1
//         AND user_type = 'user'
//         AND id != 2
//     `);

//     // Fetch the sum of pending_coins from usercoin_audit where type is 'quest' or 'referral'
//     const totalPendingCoinsResult = await db.query(`
//       SELECT 
//         SUM(pending_coin) AS total_pending_coins
//       FROM usercoin_audit
//       WHERE type IN ('quest')
//     `);

//     // Fetch monthly users count with status = 1 from the users table (last month)
//     const monthlyStatsResult = await db.query(`
//   SELECT 
//         COUNT(*) AS monthly_users
//       FROM users
//       WHERE status = 1
//         AND user_type = 'user'
//         AND id != 2
//         AND date_created >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
//     `);

//     // Fetch the sum of pending_coins from usercoin_audit for the past month where type is 'quest' or 'referral'
//     const monthlyPendingCoinsResult = await db.query(`
//       SELECT 
//         SUM(pending_coin) AS monthly_pending_coins
//       FROM usercoin_audit
//       WHERE type IN ('quest')
//       AND date_entered >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
//     `);

//     // Parse total stats
//     const totalUsers = totalStatsResult[0][0].total_users - 1; // Subtract 2 from the total users count
//     const totalPendingCoins =
//       totalPendingCoinsResult[0][0].total_pending_coins || 0;
//     const totalMultiplier = totalUsers * 6000 + totalPendingCoins;

//     // Parse monthly stats
//     const monthlyUsers = monthlyStatsResult[0][0].monthly_users - 1; // Subtract 2 from the monthly users count
//     const monthlyPendingCoins =
//       monthlyPendingCoinsResult[0][0].monthly_pending_coins || 0;
//     const monthlyMultiplier = monthlyUsers * 6000 + monthlyPendingCoins;

//     // Send both stats in the response
//     res.status(200).json({
//       success: true,
//       message: "User stats fetched successfully.",
//       data: {
//         total: {
//           users: totalUsers,
//           multiplier: totalMultiplier,
//         },
//         monthly: {
//           users: monthlyUsers,
//           multiplier: monthlyMultiplier,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching user stats:", error);
//     return next(new ErrorHandler("Database query failed", 500));
//   }
// });

exports.getUserStats = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch total users count with status = 1 from the users table
    const totalStatsResult = await db.query(`
    SELECT 
        COUNT(*) AS total_users
      FROM users
      WHERE status = 1
        AND user_type = 'user'
    `);

    // Fetch the sum of pending_coins from usercoin_audit where type is 'quest' or 'referral'
    const totalPendingCoinsResult = await db.query(`
      SELECT 
        SUM(pending_coin) AS total_pending_coins
      FROM usercoin_audit
      WHERE type IN ('quest')
    `);

    // Fetch monthly users count with status = 1 from the users table (last month)
    const monthlyStatsResult = await db.query(`
  SELECT 
        COUNT(*) AS monthly_users
      FROM users
      WHERE status = 1
        AND user_type = 'user'
        AND date_created >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    `);

    // Fetch the sum of pending_coins from usercoin_audit for the past month where type is 'quest' or 'referral'
    const monthlyPendingCoinsResult = await db.query(`
      SELECT 
        SUM(pending_coin) AS monthly_pending_coins
      FROM usercoin_audit
      WHERE type IN ('quest')
      AND date_entered >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    `);

    const questCoinEarnResult = await db.query(`
      SELECT 
        SUM(coin_earn) AS total_coin_earn
      FROM quest
    `);

    // Starting value
    const baseValue = 6291450000;

    // If no coin_earn found, set it to 0
    const totalCoinEarn = questCoinEarnResult[0][0].total_coin_earn || 0;

    // Add the total coin_earn from quests to the base value
    const finalValue = baseValue + totalCoinEarn;
    // Parse total stats
    const totalUsers = totalStatsResult[0][0].total_users - 1; // Subtract 2 from the total users count
    const totalPendingCoins =
      totalPendingCoinsResult[0][0].total_pending_coins || 0;
    const totalMultiplier = (parseInt(totalUsers, 10) * 6000) + parseInt(totalPendingCoins, 10);
    // Parse monthly stats
    const monthlyUsers = monthlyStatsResult[0][0].monthly_users - 1; // Subtract 2 from the monthly users count
    const monthlyPendingCoins =
      monthlyPendingCoinsResult[0][0].monthly_pending_coins || 0;
    const monthlyMultiplier = (parseInt(monthlyUsers, 10) * 6000) + parseInt(monthlyPendingCoins, 10);


    // Send both stats in the response
    res.status(200).json({
      success: true,
      message: "User stats fetched successfully.",
      data: {
        total: {
          users: totalUsers,
          multiplier: totalMultiplier,
        },
        monthly: {
          users: monthlyUsers,
          multiplier: monthlyMultiplier,
        },
        final_value: finalValue,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return next(new ErrorHandler("Database query failed", 500));
  }
});

exports.getUserNameFromReferralCode = catchAsyncErrors(async (req, res) => {
  const { referralCode } = req.body;

  if (!referralCode) {
    res.status(400).json({ error: "Referral Code missing" })
  }

  const [user] = await db.query(`
    SELECT u.user_name
    FROM user_data as ud
    JOIN users as u ON ud.user_id=u.id
    WHERE referral_code = ?
    LIMIT 1
  `, [referralCode])

  // console.log(user)

  if (!user.length) {
    res.status(400).json({ error: "No user with the referral code" });
  }

  res.status(200).json({ userName: user[0].user_name });
})
