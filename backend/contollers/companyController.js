const Model = require("../models/companyModel");
const QueryModel = require("../models/queryModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const db = require("../config/mysql_database");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const mysqlPool = require("../config/mysql_database"); // Adjust the path if necessary
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { log } = require("console");
const moment = require("moment-timezone");
const table_name = Model.table_name;
const module_title = Model.module_title;
const module_single_title = Model.module_single_title;
const module_add_text = Model.module_add_text;
const module_edit_text = Model.module_edit_text;
const module_slug = Model.module_slug;
const module_layout = Model.module_layout;
const sellTransactionSchema = Joi.object({
  company_id: Joi.string().required(),
  transaction_coin: Joi.string().required(),
  transaction_rate: Joi.number().required(),
  transaction_amount: Joi.number().required(),
});

exports.allUsers = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch user data along with company_data
    const users = await db.query(
      `SELECT 
            u.id,
            u.user_name,
            u.email,
            u.mobile,
            DATE_FORMAT(u.date_created, "%d-%m-%Y") AS date_created,
            u.user_type,
            u.status,
            cd.coin_rate,
            cd.company_coin
         FROM users u
         JOIN company_data cd
         ON u.id = cd.company_id  -- Relating users.id with company_data.company_id
         WHERE u.user_type = ?`, // Fetch only where user_type is 'company'
      ["company"] // Directly passing the value 'company'
    );

    console.log(users);
    // Render the response with the fetched user data
    res.render(module_slug + "/index", {
      layout: module_layout,
      title: module_single_title + " " + module_add_text,
      module_slug,
      users, // Pass the users array directly
      originalUrl: req.originalUrl, // Pass the original URL here
    });
  } catch (error) {
    // Handle any potential errors
    console.error("Error fetching users:", error);
    return next(new ErrorHandler("Error while fetching user data.", 500));
  }
});

exports.createRecord = catchAsyncErrors(async (req, res, next) => {
  console.log(req.body);

  try {
    // Validate the request body with Joi schema
    await Model.insertSchema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.details.map((d) => d.message).join(", "), 400)
    );
  }

  const date_created = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (req.file) {
    req.body.image = req.file.filename;
  }

  // Prepare data for insertion into the user table
  const insertData = {
    user_name: req.body.user_name,
    email: req.body.email,
    mobile: req.body.mobile,
    password: await bcrypt.hash(req.body.password, 10),
    status: "1",
    date_created: date_created,
    user_type: "company",
    date_modified: date_created,
  };

  try {
    // Insert the user data into the database
    const user = await QueryModel.saveData(table_name, insertData, next);

    if (!user || !user.id) {
      throw new Error("Failed to create user.");
    }

    // Prepare data for the company_data table
    const companyInsertData = {
      company_id: user.id,
      description: req.body.description,
    };

    await QueryModel.saveData("company_data", companyInsertData, next);

    // Process and insert coin rate ranges into coin_rate_ranges table
    if (req.body.coin_rate_ranges) {
      const { start, end, rate } = req.body.coin_rate_ranges;

      if (
        start &&
        end &&
        rate &&
        start.length === end.length &&
        start.length === rate.length
      ) {
        for (let i = 0; i < start.length; i++) {
          const rangeData = {
            company_id: user.id,
            min_coins: parseFloat(start[i]),
            max_coins: parseFloat(end[i]),
            rate: parseFloat(rate[i]),
          };

          // Insert the range into the coin_rate_ranges table
          try {
            await QueryModel.saveData("coin_rate_ranges", rangeData, next);
            console.log("Inserted range:", rangeData);
          } catch (err) {
            console.error("Failed to insert range:", rangeData, err);
            return next(
              new ErrorHandler("Failed to insert coin rate range.", 500)
            );
          }
        }
      } else {
        console.error("Coin rate ranges are invalid or mismatched.");
        return next(new ErrorHandler("Invalid coin rate ranges.", 400));
      }
    }

    // Success response
    req.flash("msg_response", {
      status: 200,
      message: `Successfully added ${module_single_title}`,
    });

    res.redirect(`/${process.env.ADMIN_PREFIX}/${module_slug}`);
  } catch (err) {
    console.error("Error saving data:", err);
    return next(new ErrorHandler("Error while saving user data.", 500));
  }
});

const coinRateSchema = Joi.object({
  company_id: Joi.number().integer().required(),
  coin_rate: Joi.string().required(),
  description: Joi.string().optional(),
});

exports.addFrom = catchAsyncErrors(async (req, res, next) => {
  res.render(module_slug + "/add", {
    layout: module_layout,
    title: module_single_title + " " + module_add_text,
    module_slug,
  });
});
exports.addCoinRate = catchAsyncErrors(async (req, res, next) => {
  // Step 1: Validate the request body
  try {
    await coinRateSchema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        error.details.map((d) => d.message), // Map validation errors
        400
      )
    );
  }

  // Step 2: Extract company_id from request body
  const companyId = req.body.company_id;

  // Step 3: Check if the company exists in the users table
  const companyExists = await QueryModel.findOne("users", { id: companyId });

  if (!companyExists) {
    return next(new ErrorHandler("Company not found.", 404));
  }

  // Step 4: Prepare data for insertion into the company_data table
  const insertData = {
    company_id: companyId,
    coin_rate: req.body.coin_rate,
    description: req.body.description || "", // Optional description
  };

  // Step 5: Insert the coin rate data into the company_data table
  try {
    const coinRate = await QueryModel.saveData(
      "company_data",
      insertData,
      next
    );

    // Success response
    req.flash("msg_response", {
      status: 200,
      message: "Coin rate added successfully for the company.",
    });

    // Redirect to the users page after successful insert
    res.redirect(`/admin/users`);
  } catch (err) {
    console.error("Error saving coin rate data:", err);
    return next(new ErrorHandler("Error while saving coin rate data.", 500));
  }
});

///////////////////////////////////////////////

// API to get a single user record
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id; // Get user ID from request parameters
  console.log("Fetching user with ID:", userId); // Log user ID

  try {
    // Main query to get user and company details
    const userQuery = `
      SELECT
        u.user_name,
        u.email,
        u.date_created,
        u.user_type,
        u.status,
        u.mobile,
        c.description
      FROM
        users u
      INNER JOIN
        company_data c ON u.id = c.company_id
      WHERE
        u.id = ?;
    `;

    // Query to get coin_rate_ranges
    const coinRateRangesQuery = `
      SELECT
        min_coins,
        max_coins,
        rate
      FROM
        coin_rate_ranges
      WHERE
        company_id = ?;
    `;

    console.log("Executing user query:", userQuery);
    const [userResult] = await mysqlPool.query(userQuery, [userId]);

    // Check if the user exists
    if (!userResult || userResult.length === 0) {
      console.log(`User with ID ${userId} not found in database.`);
      return res.status(404).send("User not found");
    }

    // Fetch user details
    const user = userResult[0];
    console.log("User data retrieved:", user);

    // Fetch coin_rate_ranges for the user
    console.log("Executing coin_rate_ranges query:", coinRateRangesQuery);
    const [coinRateRangesResult] = await mysqlPool.query(coinRateRangesQuery, [
      userId,
    ]);

    // Combine user data with coin rate ranges
    user.coin_rate_ranges = coinRateRangesResult;
    console.log("Combined user data with coin rate ranges:", user);

    // Render the user detail page with the user data
    res.render(module_slug + "/detail", {
      layout: module_layout,
      title: module_single_title,
      user,
    });
  } catch (error) {
    console.error("Database query error:", error); // Log the detailed error
    return res.status(500).send("Server Error: " + error.message); // Return error message
  }
});

////////////////////
exports.editUserForm = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id; // Get user ID from request parameters
  console.log("User ID:", userId); // Log the user ID for debugging

  // Fetch the user data from the 'users' table by userId
  const userQuery = `
    SELECT
      u.user_name,
      u.email,
      u.date_created,
      u.user_type,
      u.status,
      u.mobile
    FROM
      users u
    WHERE
      u.id = ?
  `;

  // Execute the query to fetch the user data
  const userResult = await mysqlPool.query(userQuery, [userId]);
  const user = userResult[0][0]; // Get the user data

  if (!user) {
    // Return an error if the user is not found
    console.log("User not found");
    return next(new ErrorHandler("User not found", 404));
  }

  // Log the user data for debugging
  console.log("User Data:", user);

  // Fetch the company data using the same user.id as company_id from the 'company_data' table
  const companyQuery = `
    SELECT
      c.coin_rate,
      c.description
    FROM
      company_data c
    WHERE
      c.company_id = ?
  `;

  // Execute the query to fetch the company data
  const companyResult = await mysqlPool.query(companyQuery, [userId]); // user.id is used as company_id
  const companyData = companyResult[0][0]; // Get the company data

  if (!companyData) {
    // Return an error if the company data is not found
    console.log("Company data not found");
    return next(new ErrorHandler("Company not found", 404));
  }

  // Log the company data for debugging
  console.log("Company Data:", companyData);

  // Fetch the coin rate ranges
  const coinRateQuery = `
    SELECT
      min_coins,
      max_coins,
      rate
    FROM
      coin_rate_ranges
    WHERE
      company_id = ?
  `;

  // Execute the query to fetch the coin rate ranges
  const coinRateResult = await mysqlPool.query(coinRateQuery, [userId]);
  const coinRateRanges = coinRateResult[0]; // Get the coin rate ranges

  // Render the 'edit' view and pass the necessary data
  res.render(module_slug + "/edit", {
    layout: module_layout,
    title: module_single_title + " " + module_edit_text, // Title for the page
    userId,
    user, // Pass the user details to the view
    companyData, // Pass the company data to the view
    coinRateRanges, // Pass the coin rate ranges to the view
    module_slug, // Pass the module_slug to the view
  });
});

////////////////////////////

// The function to update the user and company details in the database
exports.updateUserRecord = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id; // Get user ID from the request parameters

  // Extract updated data from the request body
  const { user_name, email, status, coin_rate, description, coin_rate_ranges } =
    req.body;

  // Prepare the query for updating the `users` table
  const updateUserQuery = `
    UPDATE users
    SET 
      user_name = ?, 
      email = ?, 
      status = ?
    WHERE 
      id = ?
  `;

  try {
    // Execute the query to update user data
    const updateUserResult = await mysqlPool.query(updateUserQuery, [
      user_name,
      email,
      status,
      userId,
    ]);

    // Check if any rows were affected in the `users` table
    if (updateUserResult[0].affectedRows === 0) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Prepare the query for updating the `company_data` table
    const updateCompanyQuery = `
      UPDATE company_data
      SET 
        coin_rate = ?, 
        description = ?
      WHERE 
        company_id = ?
    `;

    // Execute the query to update company data
    const updateCompanyResult = await mysqlPool.query(updateCompanyQuery, [
      coin_rate,
      description,
      userId, // Use user ID as the company ID for consistency
    ]);

    // Check if any rows were affected in the `company_data` table
    if (updateCompanyResult[0].affectedRows === 0) {
      return next(new ErrorHandler("Company data not found", 404));
    }

    // Update the coin rate ranges
    if (coin_rate_ranges) {
      // Delete the existing coin rate ranges for the company
      const deleteRangesQuery = `
        DELETE FROM coin_rate_ranges
        WHERE company_id = ?
      `;
      await mysqlPool.query(deleteRangesQuery, [userId]);

      // Insert the new coin rate ranges
      for (let i = 0; i < coin_rate_ranges.start.length; i++) {
        const rangeData = {
          company_id: userId,
          min_coins: parseFloat(coin_rate_ranges.start[i]),
          max_coins: parseFloat(coin_rate_ranges.end[i]),
          rate: parseFloat(coin_rate_ranges.rate[i]),
        };

        const insertRangeQuery = `
          INSERT INTO coin_rate_ranges (company_id, min_coins, max_coins, rate)
          VALUES (?, ?, ?, ?)
        `;
        await mysqlPool.query(insertRangeQuery, [
          rangeData.company_id,
          rangeData.min_coins,
          rangeData.max_coins,
          rangeData.rate,
        ]);
      }
    }

    // Send success response with a flash message
    req.flash("msg_response", {
      status: 200,
      message: "Successfully updated user, company, and coin rate ranges.",
    });

    // Redirect to the admin module page
    res.redirect(`/admin/${module_slug}`);
  } catch (error) {
    console.error(
      "Error in updating user, company, or coin rate ranges:",
      error
    );
    return next(new ErrorHandler("An error occurred while updating data", 500));
  }
});
///////////////////////////////////////////////

exports.deleteRecord = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id; // Get the user ID from the request parameters

  const deleteUserQuery = `
    DELETE FROM users WHERE id = ?
  `;

  const deleteCompanyQuery = `
    DELETE FROM company_data WHERE company_id = ?
  `;

  try {
    // Delete from the users table
    const deleteUserResult = await mysqlPool.query(deleteUserQuery, [userId]);

    if (deleteUserResult[0].affectedRows === 0) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Delete from the company_data table using the same userId as company_id
    const deleteCompanyResult = await mysqlPool.query(deleteCompanyQuery, [
      userId,
    ]);

    if (deleteCompanyResult[0].affectedRows === 0) {
      return next(new ErrorHandler("Company data not found", 404));
    }

    req.flash("msg_response", {
      status: 200,
      message: "Successfully deleted " + module_single_title,
    });

    res.redirect(`/${process.env.ADMIN_PREFIX}/${module_slug}`);
  } catch (error) {
    console.error("Error in deleting user and company data:", error);
    return next(new ErrorHandler("An error occurred while deleting data", 500));
  }
});
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
      // Check if the company already exists in the accumulator
      let existingCompany = acc.find(
        (item) => item.company_id === company.company_id
      );

      if (!existingCompany) {
        // Create a new company object if it doesn't exist
        existingCompany = {
          company_id: company.company_id,
          company_name: company.company_name,
          description: company.description || "",
          coin_ranges: [],
        };
        acc.push(existingCompany);
      }

      // Validate and add coin ranges if the data exists
      if (
        company.min_coins !== null &&
        company.max_coins !== null &&
        company.range_rate !== null
      ) {
        existingCompany.coin_ranges.push({
          min_coins: parseFloat(company.min_coins),
          max_coins: parseFloat(company.max_coins),
          rate: parseFloat(company.range_rate),
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
    console.error("Error fetching companies:", error.message);
    return next(
      new ErrorHandler("An error occurred while fetching companies", 500)
    );
  }
});

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

//////////////////////////

exports.loginCompanyApi = catchAsyncErrors(async (req, res, next) => {
  const { mobile, password } = req.body; // Change to mobile instead of emailOrMobile

  // Checking that mobile number and password are provided
  if (!mobile || !password) {
    return next(
      new ErrorHandler("Please enter mobile number and password", 400)
    );
  }

  // Find user by mobile number only
  const userData = await db.query(
    "SELECT * FROM users WHERE mobile = ? AND user_type = 'company' LIMIT 1",
    [mobile] // Query only with mobile and user_type = 'company'
  );
  const user = userData[0][0];

  // If user not found
  if (!user) {
    return next(new ErrorHandler("Invalid mobile number or password", 400));
  }

  // Debugging: Log user to check the values
  console.log(user); // Add this to check the user data being fetched

  // Ensure status is a number and check if the user is active
  if (parseInt(user.status) === 0) {
    // parseInt to ensure we compare number values
    return next(
      new ErrorHandler(
        "Your account is deactivated. Please contact support.",
        403
      )
    );
  }

  // Compare passwords
  const isPasswordMatched = await User.comparePasswords(
    password,
    user.password
  );

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid mobile number or password", 400));
  }

  // Generate token for the authenticated user
  const token = User.generateToken(user.id); // Adjust as per your user object structure

  // Send the token and user details in the response
  res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      mobile: user.mobile,
      // Add any other user details you want to include in the response
    },
  });
});

/////////////////////

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

///////////////////

exports.updatePasswordApi = catchAsyncErrors(async (req, res, next) => {
  const userDetail = await db.query("SELECT * FROM users WHERE id = ?", [
    req.user.id,
  ]);
  const user = userDetail[0][0];

  const isPasswordMatched = await User.comparePasswords(
    req.body.oldPassword,
    user.password
  );

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("password does not matched", 400));
  }

  // user.password = req.body.newPassword;

  // await user.save();

  const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
  const query = "UPDATE users SET password = ? WHERE id = ?";
  // Execute the update query
  const result = await db.query(query, [hashedPassword, user.id]);

  const token = User.generateToken(user.id);
  sendToken(user, token, 200, res);
});

////////////////////////////////////
exports.getCompanyProfileApi = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch the user's ID from the request
    const userId = req.user.id;

    // Check if userId is undefined or null
    if (!userId) {
      return next(new ErrorHandler("User ID is missing", 400));
    }

    // Fetch user details from the 'users' table
    const [userDetails] = await db.query(
      "SELECT user_name, email, mobile FROM users WHERE id = ?",
      [userId]
    );

    if (!userDetails || userDetails.length === 0) {
      return next(new ErrorHandler("User not found", 404));
    }

    const user = userDetails[0]; // Extract user details

    // Fetch additional details from the 'company_data' table
    const [userData] = await db.query(
      "SELECT coin_rate, company_coin FROM company_data WHERE company_id = ?",
      [userId]
    );

    if (!userData || userData.length === 0) {
      return next(new ErrorHandler("Company data not found", 404));
    }

    const { coin_rate = 0, company_coin = 0 } = userData[0]; // Extract and handle null values

    // Fetch coin rate ranges from the 'coin_rate_ranges' table, including the 'id'
    const [coinRanges] = await db.query(
      "SELECT id, min_coins, max_coins, rate FROM coin_rate_ranges WHERE company_id = ?",
      [userId]
    );

    // If no ranges found, default to an empty array
    const ranges = coinRanges.length > 0 ? coinRanges : [];

    // Construct the response object with all the necessary details
    const userProfile = {
      user_name: user.user_name,
      email: user.email,
      mobile: user.mobile,
      company_coin, // If company_coin is null, it will be set to 0
      coin_rate, // If coin_rate is null, it will be set to 0
      coin_ranges: ranges, // Include the coin ranges with IDs
    };

    // Send the response with the user's profile
    res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return next(
      new ErrorHandler("An error occurred while fetching company profile", 500)
    );
  }
});

///////////////////////////////////////////
exports.updateCoinRateApi = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id; // Assuming the user is authenticated and user ID is available in req.user
  const { coin_ranges = [] } = req.body; // Extract coin_ranges, default to an empty array if not provided

  // Debug: Log the received body and extracted coin_ranges
  console.log("DEBUG: Received request body:", req.body);
  console.log("DEBUG: Extracted coin_ranges:", coin_ranges);

  // Ensure coin_ranges is a non-empty array
  if (!Array.isArray(coin_ranges) || coin_ranges.length === 0) {
    console.error("ERROR: coin_ranges should be a non-empty array.");
    return next(
      new ErrorHandler("coin_ranges should be a non-empty array", 400)
    );
  }

  // Validate each coin range
  for (let range of coin_ranges) {
    const { min_coins, max_coins, rate } = range;

    const numericRate = parseFloat(rate);
    if (isNaN(numericRate)) {
      console.error("ERROR: Invalid numeric rate in range:", range);
      return next(
        new ErrorHandler(
          "Each coin range must have a valid numeric rate value",
          400
        )
      );
    }

    if (isNaN(min_coins) || isNaN(max_coins)) {
      console.error("ERROR: Invalid min_coins or max_coins in range:", range);
      return next(
        new ErrorHandler(
          "Each coin range must have valid min_coins, max_coins values",
          400
        )
      );
    }

    if (
      min_coins <= 0 ||
      max_coins <= 0 ||
      numericRate <= 0 ||
      min_coins > max_coins
    ) {
      console.error(
        "ERROR: Invalid coin range values (min_coins, max_coins, rate):",
        range
      );
      return next(
        new ErrorHandler(
          "Invalid coin range values (min_coins, max_coins, rate)",
          400
        )
      );
    }
  }

  try {
    // Fetch user details
    console.log("DEBUG: Fetching user details for userId:", userId);
    const [userDetails] = await db.query(
      "SELECT user_type FROM users WHERE id = ?",
      [userId]
    );

    if (!userDetails || userDetails.length === 0) {
      console.error("ERROR: User not found for userId:", userId);
      return next(new ErrorHandler("User not found", 404));
    }

    const { user_type } = userDetails[0];
    console.log("DEBUG: User type:", user_type);

    if (user_type !== "company") {
      console.error("ERROR: Unauthorized access by userId:", userId);
      return next(
        new ErrorHandler(
          "Unauthorized: Only company users can update the coin rate",
          403
        )
      );
    }

    // Process each coin range
    for (let range of coin_ranges) {
      const { id, min_coins, max_coins, rate } = range;

      if (id) {
        // Debug: Log the update operation
        console.log(
          `DEBUG: Updating coin range with id ${id} for userId ${userId}:`,
          range
        );

        // Update the existing range
        await db.query(
          `UPDATE coin_rate_ranges 
           SET min_coins = ?, max_coins = ?, rate = ? 
           WHERE id = ? AND company_id = ?`,
          [min_coins, max_coins, rate, id, userId]
        );
      } else {
        // Debug: Log the insert operation
        console.log(
          `DEBUG: Inserting new coin range for userId ${userId}:`,
          range
        );

        // Insert a new coin range
        await db.query(
          `INSERT INTO coin_rate_ranges 
           (company_id, min_coins, max_coins, rate) 
           VALUES (?, ?, ?, ?)`,
          [userId, min_coins, max_coins, rate]
        );
      }
    }

    // Success response
    console.log(
      "DEBUG: Successfully updated/inserted coin ranges for userId:",
      userId
    );
    res.status(200).json({
      success: true,
      message: "Coin ranges updated successfully",
      data: {
        company_id: userId,
        coin_ranges,
      },
    });
  } catch (error) {
    console.error("ERROR: Database update failed:", error);
    return next(new ErrorHandler("Database update failed", 500));
  }
});

exports.addCoinRangeApi = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id; // Extract user ID from the authenticated user
  const { coin_ranges = [] } = req.body; // Extract coin ranges from the request body (default to empty array)

  console.log("DEBUG: Received request body:", req.body);

  // Validate that coin_ranges is a non-empty array
  if (!Array.isArray(coin_ranges) || coin_ranges.length === 0) {
    return next(new ErrorHandler("coin_ranges should be a non-empty array", 400));
  }

  // Validate each range
  for (const range of coin_ranges) {
    const { min_coins, max_coins, rate } = range;

    const numericRate = parseFloat(rate);
    if (
      isNaN(min_coins) || 
      isNaN(max_coins) || 
      isNaN(numericRate) || 
      min_coins <= 0 || 
      max_coins <= 0 || 
      numericRate <= 0 || 
      min_coins > max_coins
    ) {
      return next(
        new ErrorHandler(
          "Invalid coin range values: Each range must have valid positive min_coins, max_coins, and rate, and min_coins should not exceed max_coins.",
          400
        )
      );
    }
  }

  try {
    // Fetch user details to verify authorization
    const [userDetails] = await db.query(
      "SELECT user_type FROM users WHERE id = ?",
      [userId]
    );

    if (!userDetails || userDetails.length === 0) {
      return next(new ErrorHandler("User not found", 404));
    }

    const { user_type } = userDetails[0];
    if (user_type !== "company") {
      return next(new ErrorHandler("Unauthorized: Only company users can add coin ranges", 403));
    }

    // Insert each coin range into the database
    const insertedRanges = [];
    for (const range of coin_ranges) {
      const { min_coins, max_coins, rate } = range;

      const [result] = await db.query(
        `
        INSERT INTO coin_rate_ranges 
        (company_id, min_coins, max_coins, rate) 
        VALUES (?, ?, ?, ?)
        `,
        [userId, min_coins, max_coins, rate]
      );

      // Add the inserted range with its ID to the response data
      insertedRanges.push({
        id: result.insertId,
        min_coins,
        max_coins,
        rate,
      });
    }

    // Send success response
    res.status(201).json({
      success: true,
      message: "Coin ranges added successfully",
      data: {
        company_id: userId,
        coin_ranges: insertedRanges,
      },
    });
  } catch (error) {
    console.error("ERROR: Failed to add coin ranges:", error);
    return next(new ErrorHandler("Database insert failed", 500));
  }
});
exports.reqGetAllReqApi = async (req, res, next) => {
  try {
    // Extract user_id from the request (e.g., from query params or session)
    const userId = req.user.id;

    // Check if user_id is provided
    if (!userId) {
      return next(new ErrorHandler("User ID is required", 400));
    }

    // Query the database for transactions where trans_doc is null and status is unapproved
    const userTransactions = await db.query(
      `SELECT 
        ut.id AS transaction_id, 
        ut.*, 
        u.user_name, 
        ud.upi_id 
      FROM 
        user_transction ut
      JOIN 
        users u 
      ON 
        ut.user_id = u.id
      JOIN 
        user_data ud
      ON 
        ut.user_id = ud.user_id
      WHERE 
        ut.company_id = ? 
        AND ut.trans_doc IS NULL 
    AND ut.status NOT IN ('approved', 'waiting')`, // Exclude transactions with status 'approved' or 'waiting'
      [userId]
    );

    // Flatten the result if it’s an array of arrays
    const flattenedTransactions = userTransactions.flat();

    // Filter out any unwanted Buffer data
    const filteredTransactions = flattenedTransactions.filter((transaction) => {
      return !transaction._buf; // Remove transactions that contain binary data
    });

    // Check if any transactions were found
    if (!filteredTransactions || filteredTransactions.length === 0) {
      return res.status(201).json({
        message:
          "No unapproved user requests without documents found for the specified company",
      });
    }

    // Log retrieved transactions for debugging
    console.log(
      "Filtered Unapproved User Transactions without Documents:",
      filteredTransactions
    );

    // Send the user transactions as JSON response
    return res.status(200).json({
      message:
        "Unapproved user transactions without documents retrieved successfully",
      transactions: filteredTransactions,
    });
  } catch (error) {
    console.error("Error retrieving user transactions:", error); // Log any error

    // Send an error response as JSON
    return res.status(500).json({
      message: "Failed to retrieve user requests",
      error: error.message,
    });
  }
};

exports.reqGetUnapprovedWithDocApi = async (req, res, next) => {
  try {
    // Extract user_id from the request (e.g., from query params or session)
    const userId = req.user.id;

    // Check if user_id is provided
    if (!userId) {
      return next(new ErrorHandler("User ID is required", 400));
    }

    // Query the database for transactions where trans_doc is not null and status is unapproved
 const userTransactions = await db.query(
  `SELECT 
    ut.id AS transaction_id, 
    ut.*, 
    u.user_name, 
    ud.upi_id 
  FROM 
    user_transction ut
  JOIN 
    users u 
  ON 
    ut.user_id = u.id
  JOIN 
    user_data ud
  ON 
    ut.user_id = ud.user_id
  WHERE 
    ut.company_id = ? 
    AND ut.trans_doc IS NOT NULL 
    AND ut.status != 'approved'`,
  [userId] // Pass the userId as the parameter here
);


    // Flatten the result if it’s an array of arrays
    const flattenedTransactions = userTransactions.flat();

    // Filter out any unwanted Buffer data
    const filteredTransactions = flattenedTransactions.filter((transaction) => {
      return !transaction._buf; // Remove transactions that contain binary data
    });

    // Check if any transactions were found
    if (!filteredTransactions || filteredTransactions.length === 0) {
      return res.status(404).json({
        message:
          "No unapproved user requests with documents found for the specified company",
      });
    }

    // Log retrieved transactions for debugging
    console.log(
      "Filtered Unapproved User Transactions with Documents:",
      filteredTransactions
    );

    // Send the user transactions as JSON response
    return res.status(200).json({
      message:
        "Unapproved user transactions with documents retrieved successfully",
      transactions: filteredTransactions,
    });
  } catch (error) {
    console.error("Error retrieving user transactions:", error); // Log any error

    // Send an error response as JSON
    return res.status(500).json({
      message: "Failed to retrieve user requests",
      error: error.message,
    });
  }
};

exports.reqGetAllHistoryApiReqApi = async (req, res, next) => {
  try {
    // Extract user_id from the request (e.g., from query params or session)
    const userId = req.user.id;

    // Check if user_id is provided
    if (!userId) {
      return next(new ErrorHandler("User ID is required", 400));
    }

    // Query the database for user transactions with the 'approved' status
    const userTransactions = await db.query(
      `SELECT 
        ut.id AS transaction_id, 
        ut.*, 
        u.user_name, 
        ud.upi_id 
      FROM 
        user_transction ut
      JOIN 
        users u 
      ON 
        ut.user_id = u.id
      JOIN 
        user_data ud
      ON 
        ut.user_id = ud.user_id
      WHERE 
        ut.company_id = ? 
        AND ut.status = 'approved'`, // Filter by 'approved' status
      [userId]
    );

    // Flatten the result if it’s an array of arrays
    const flattenedTransactions = userTransactions.flat();

    // Filter out any unwanted Buffer data
    const filteredTransactions = flattenedTransactions.filter((transaction) => {
      return !transaction._buf; // Remove transactions that contain binary data
    });

    // Check if any transactions were found
    if (!filteredTransactions || filteredTransactions.length === 0) {
      return res.status(404).json({
        message: "No approved user requests found for the specified company",
      });
    }

    // Log retrieved transactions for debugging
    console.log("Filtered Approved User Transactions:", filteredTransactions);

    // Send the user transactions as JSON response
    return res.status(200).json({
      message: "Approved user transactions retrieved successfully",
      transactions: filteredTransactions,
    });
  } catch (error) {
    console.error("Error retrieving user transactions:", error); // Log any error

    // Send an error response as JSON
    return res.status(500).json({
      message: "Failed to retrieve user requests",
      error: error.message,
    });
  }
};

// exports.uploadTransactionDocApi = catchAsyncErrors(async (req, res, next) => {
//   // Get user ID from route parameters and transaction ID from request body
//   const user_id = req.params.id;
//   const { transaction_id } = req.body;

//   // Check if `transaction_id` is provided
//   if (!transaction_id) {
//     return next(new ErrorHandler("Transaction ID is required", 400));
//   }

//   // Get the uploaded file's filename, if present
//   let trans_doc = req.file ? req.file.filename : null;

//   // Debugging: Log user ID, image filename (if present), and transaction ID
//   console.log(`User ID from params: ${user_id}`);
//   console.log(`Document Filename: ${trans_doc || "No file uploaded"}`);
//   console.log(`Transaction ID: ${transaction_id}`);

//   try {
//     // Now, update the transaction based on id (not transaction_id) and company_id
//     let userQuery =
//       "UPDATE user_transction SET trans_doc = ?, status = ? WHERE id = ?";
//     let userData = [trans_doc, "waiting", transaction_id]; // assuming id is the unique identifier

//     const updateResult = await db.query(userQuery, userData);

//     if (updateResult.affectedRows === 0) {
//       return next(
//         new ErrorHandler(
//           "No transaction found with the provided ID and company ID",
//           404
//         )
//       );
//     }
//     // Send a success response back to the client
//     res.status(200).json({
//       success: true,
//       message:
//         "Transaction document uploaded successfully and status updated to 'waiting'.",
//       data: {
//         trans_doc: trans_doc || "No document uploaded", // Optional in response
//         status: "waiting",
//       },
//     });
//   } catch (error) {
//     console.error("Database operation error:", error); // Log the error for debugging
//     return next(new ErrorHandler("Database operation failed", 500));
//   }
// });
exports.uploadTransactionDocApi = catchAsyncErrors(async (req, res, next) => {
  // Get user ID from route parameters and required fields from request body
  const user_id = req.params.id;
  const { transaction_id, trans_id, utr_no } = req.body;

  // Check if `transaction_id`, `trans_id`, and `utr_no` are provided
  if (!transaction_id) {
    return next(new ErrorHandler("Transaction ID is required", 400));
  }

  if (!trans_id) {
    return next(new ErrorHandler("Trans ID is required", 400));
  }

  if (!utr_no) {
    return next(new ErrorHandler("UTR number is required", 400));
  }

  // Get the uploaded file's filename, if present (optional field)
  let trans_doc = req.file ? req.file.filename : null;

  // Debugging: Log user ID, transaction details, and uploaded file (if any)
  console.log(`User ID from params: ${user_id}`);
  console.log(`UTR Number: ${utr_no}`);
  console.log(`Transaction ID: ${transaction_id}`);
  console.log(`Trans ID: ${trans_id}`);
  console.log(`Document Filename: ${trans_doc || "No file uploaded"}`);

  try {
    // Now, update the transaction based on user ID, transaction ID, and trans_id
    let userQuery =
      // "UPDATE user_transction SET utr_no = ?, trans_doc = ?, trans_id = ?, status = ? WHERE transaction_id = ? AND user_id = ?";
      "UPDATE user_transction SET utr_no = ?, trans_id = ?, status = ?";
    let userData = [utr_no, trans_id, "waiting"];

   if (trans_doc) {
      userQuery += ", trans_doc = ?";
      userData.push(trans_doc);
    }

   userQuery += " WHERE id = ?";
    userData.push(transaction_id);

    const updateResult = await db.query(userQuery, userData);

    if (updateResult.affectedRows === 0) {
      return next(
        new ErrorHandler(
          "No transaction found with the provided transaction ID and user ID",
          404
        )
      );
    }

    // Send a success response back to the client
    res.status(200).json({
      success: true,
      message:
        "Transaction document uploaded successfully and status updated to 'waiting'.",
      data: {
        utr_no,
        trans_doc: trans_doc || "No document uploaded", // Optional in response
        trans_id,
        status: "waiting",
      },
    });
  } catch (error) {
    console.error("Database operation error:", error); // Log the error for debugging
    return next(new ErrorHandler("Database operation failed", 500));
  }
});
// exports.uploadTransactionDocApi = catchAsyncErrors(async (req, res, next) => {
//   // Get user ID from route parameters and required fields from request body
//   const user_id = req.params.id; // Assuming this is optional; adjust if required.
//   const { transaction_id, trans_id, utr_no } = req.body;

//   // Check if `transaction_id`, `trans_id`, and `utr_no` are provided
//   if (!transaction_id) {
//     return next(new ErrorHandler("Transaction ID is required", 400));
//   }

//   if (!trans_id) {
//     return next(new ErrorHandler("Trans ID is required", 400));
//   }

//   if (!utr_no) {
//     return next(new ErrorHandler("UTR number is required", 400));
//   }
//   if (!req.file) {
//     return next(new ErrorHandler("Transaction document is required", 400));
//   }
//   // Get the uploaded file's filename, if present (optional field)
//   const trans_doc = req.file.filename;

//   // Debugging: Log user ID, transaction details, and uploaded file (if any)
//   console.log(`User ID from params: ${user_id}`);
//   console.log(`UTR Number: ${utr_no}`);
//   console.log(`Transaction ID: ${transaction_id}`);
//   console.log(`Trans ID: ${trans_id}`);
//   console.log(`Document Filename: ${trans_doc || "No file uploaded"}`);
//   console.log(`File object from multer:`, req.file);  // Check if req.file contains the file

//   try {
//     // Initialize the base query
//     let userQuery = "UPDATE user_transction SET utr_no = ?, trans_id = ?, status = ?,  trans_doc = ?";
//     const userData = [utr_no, trans_id, "waiting", trans_doc];

//    userQuery += " WHERE id = ?";
//     userData.push(transaction_id); // Assuming `transaction_id` is the `id` column in your table

//     // Execute the query
//     const [updateResult] = await db.query(userQuery, userData);


//     // Check if any rows were affected
//     if (updateResult.affectedRows === 0) {
//       return next(
//         new ErrorHandler(
//           "No transaction found with the provided transaction ID",
//           404
//         )
//       );
//     }

//     // Send a success response back to the client
//     res.status(200).json({
//       success: true,
//       message: "Transaction document uploaded successfully and status updated to 'waiting'.",
//       data: {
//         utr_no,
//         trans_doc: trans_doc || "No document uploaded", // Optional in response
//         trans_id,
//         status: "waiting",
//       },
//     });
//   } catch (error) {
//     // Log the error for debugging
//     console.error("Database operation error:", error.message);

//     return next(new ErrorHandler("Database operation failed", 500));
//   }
// });

exports.createCompanySellTransaction = async (req, res, next) => {
  try {
    console.log("Request Body:", req.body);

    // Step 1: Get company_id from logged-in user
    const company_id = req.user?.id; // Assuming req.user has company_id
    console.log("Company ID:", company_id);

    if (!company_id) {
      return next(
        new ErrorHandler(
          "Company ID is required for the logged-in company",
          401
        )
      );
    }

    // Step 2: Validate incoming request
    const { sell_coin, upi_id } = req.body;

    if (!sell_coin || !upi_id) {
      return next(new ErrorHandler("Sell coin and UPI ID are required", 400));
    }

    // Step 3: Check company_data for available coins
    const [companyData] = await db.query(
      "SELECT company_coin FROM company_data WHERE company_id = ?",
      [company_id]
    );

    if (!companyData || companyData.length === 0) {
      return next(new ErrorHandler("Company not found", 404));
    }

    const availableCoins = parseInt(companyData[0].company_coin);

    if (sell_coin > availableCoins) {
      return next(
        new ErrorHandler("Insufficient coins in company account", 400)
      );
    }

    // Step 4: Insert transaction into company_transaction
    const [transactionResult] = await db.query(
      `INSERT INTO company_transaction 
      (company_id, sell_coin, upi_id, sell_date, status) 
      VALUES (?, ?, ?, NOW(), 'unapproved')`,
      [company_id, sell_coin, upi_id]
    );

    console.log("Transaction Inserted Successfully");

    // Step 5: Update company_data to deduct coins
    const updatedCoins = availableCoins - sell_coin;

    await db.query(
      "UPDATE company_data SET company_coin = ? WHERE company_id = ?",
      [updatedCoins, company_id]
    );

    console.log(`Company coins updated. Remaining coins: ${updatedCoins}`);

    // Step 6: Send Success Response
    res.status(201).json({
      success: true,
      message:
        "Sell transaction created successfully and company coins updated!",
    });
  } catch (error) {
    console.error("Error creating sell transaction:", error);

    return next(
      new ErrorHandler("Failed to create transaction: " + error.message, 500)
    );
  }
};

