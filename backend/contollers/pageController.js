const Model = require("../models/pageModel");
const QueryModel = require("../models/queryModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const db = require("../config/mysql_database");
const Joi = require("joi");
const moment = require("moment-timezone");
const sanitizeHtml = require("sanitize-html");

const table_name = Model.table_name;
const module_title = Model.module_title;
const module_single_title = Model.module_single_title;
const module_add_text = Model.module_add_text;
const module_edit_text = Model.module_edit_text;
const module_slug = Model.module_slug;
const module_layout = Model.module_layout;

exports.addFrom = catchAsyncErrors(async (req, res, next) => {
  res.render(module_slug + "/add", {
    layout: module_layout,
    title: module_single_title + " " + module_add_text,
    module_slug,
  });
});

exports.createRecord = async (req, res, next) => {
  try {
    // Validate input data
    await Model.insertSchema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
  } catch (error) {
    console.error("Validation error:", error);
    return next(
      new ErrorHandler(error.details.map((d) => d.message).join(", "), 400)
    );
  }
  const timezone = "Asia/Kolkata"; // Use your valid timezone

  // const date_created = moment()
  //   .tz("Your/Timezone")
  //   .format("YYYY-MM-DD HH:mm:ss");
  const date_created = moment().tz(timezone).format("YYYY-MM-DD HH:mm:ss");

  const start_date = req.body.start_date
    ? moment(req.body.start_date)
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss")
    : null;
  const end_date = req.body.end_date
    ? moment(req.body.end_date).tz(timezone).format("YYYY-MM-DD HH:mm:ss")
    : null;
  if (req.file) {
    req.body.image = req.file.filename;
  }

  const sanitizedDescription = sanitizeHtml(req.body.description, {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Handle the screenshot_required field (default to 0 if not provided)
  const screenshotRequired = req.body.screenshot_required === '1' ? 1 : 0;

  const insertData = {
    quest_name: req.body.quest_name,
    quest_type: req.body.quest_type === "banner" ? "banner" : "non-banner",
    activity: req.body.activity === "watch" ? "watch" : "follow",
    quest_url: req.body.quest_url,
    date_created: date_created,
    start_date: req.body.start_date,
    image: req.body.image || null, // Fix body.image to req.body.image
    description: sanitizedDescription,
    status: req.body.status,
    duration: req.body.duration,
    coin_earn: req.body.coin_earn || 0,
    end_date: req.body.end_date,
    social_media: req.body.social_media || null, // Ensure this field is handled
    screenshot_required: screenshotRequired, // Include screenshot_required field
  };

  console.log("Data to be inserted:", insertData); // Log the data to be inserted

  try {
    const blog = await QueryModel.saveData("quest", insertData);

    if (!blog) {
      console.error("Failed to insert data:", blog); // Log if insertion fails
      return next(new ErrorHandler("Failed to add record", 500));
    }

    req.flash("msg_response", {
      status: 200,
      message: "Successfully added the quest.",
    });

    res.redirect(`/${process.env.ADMIN_PREFIX}/${module_slug}`);
  } catch (error) {
    console.error("Error in createRecord:", error.message);
    return next(new ErrorHandler("An error occurred while saving data", 500));
  }
};

exports.editForm = catchAsyncErrors(async (req, res, next) => {
  const blog = await QueryModel.findById(table_name, req.params.id, next);

  if (!blog) {
    return next(new ErrorHandler("Blog not found", 404));
  }

  // Handle start_date formatting
  console.log("Original Start Date:", blog.start_date);
  if (blog.start_date) {
    const startDate = new Date(blog.start_date);
    if (!isNaN(startDate.getTime())) {
      const utcOffset = startDate.getTimezoneOffset();
      const localStartDate = new Date(
        startDate.getTime() - utcOffset * 60 * 1000
      );
      blog.start_date = localStartDate.toISOString().slice(0, 16);
    } else {
      console.error("Invalid date:", blog.start_date);
      blog.start_date = ""; // Handle invalid date
    }
  }
  console.log("Formatted Start Date:", blog.start_date);

  // Handle end_date formatting
  console.log("Original End Date:", blog.end_date);
  if (blog.end_date) {
    const endDate = new Date(blog.end_date);
    if (!isNaN(endDate.getTime())) {
      const utcOffset = endDate.getTimezoneOffset();
      const localEndDate = new Date(endDate.getTime() - utcOffset * 60 * 1000);
      blog.end_date = localEndDate.toISOString().slice(0, 16);
    } else {
      console.error("Invalid date:", blog.end_date);
      blog.end_date = ""; // Handle invalid date
    }
  }
  console.log("Formatted End Date:", blog.end_date);

  res.render(module_slug + "/edit", {
    layout: module_layout,
    title: module_single_title + " " + module_edit_text,
    blog,
    module_slug,
  });
});
exports.updateRecord = catchAsyncErrors(async (req, res, next) => {
  const date_created = new Date().toISOString().slice(0, 19).replace("T", " ");

  req.body.image = req.body.old_image;
  if (req.file) {
    req.body.image = req.file.filename;
  }

  // Log the incoming dates
  console.log("Incoming Start Date:", req.body.start_date);
  console.log("Incoming End Date:", req.body.end_date);

  // Sanitize the description to remove HTML tags
  const sanitizedDescription = sanitizeHtml(req.body.description, {
    allowedTags: [], // No tags allowed
    allowedAttributes: {}, // No attributes allowed
  });

  const updateData = {
    quest_name: req.body.quest_name,
    quest_type: req.body.quest_type,
    activity: req.body.activity,
    quest_url: req.body.quest_url,
    start_date: req.body.start_date, // New field for start date
    end_date: req.body.end_date, // New field for end date
    date_created: date_created,
    image: req.body.image,
    duration: req.body.duration,
    description: sanitizedDescription,
    coin_earn: req.body.coin_earn,
    social_media: req.body.social_media, // Ensure this field is handled
  };

  // Update the record in the database
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

exports.deleteRecord = catchAsyncErrors(async (req, res, next) => {
  await QueryModel.findByIdAndDelete(table_name, req.params.id, next);

  req.flash("msg_response", {
    status: 200,
    message: "Successfully deleted " + module_single_title,
  });

  res.redirect(`/${process.env.ADMIN_PREFIX}/${module_slug}`);
});

exports.getAllRecords = catchAsyncErrors(async (req, res, next) => {
  try {
      // Fetch quest data with formatted dates
      const quests = await db.query(
          `SELECT 
              id,
              quest_name,
              DATE_FORMAT(start_date, "%d-%m-%Y") AS start_date,
              DATE_FORMAT(end_date, "%d-%m-%Y") AS end_date,
              coin_earn,
              status
           FROM quest
           ORDER BY id DESC`
      );

      res.render(module_slug + "/index", {
          layout: module_layout,
          title: module_single_title + " " + module_add_text,
          module_slug,
          quests, // Pass the quests array to the view
          originalUrl: req.originalUrl, // Pass the original URL here
      });
  } catch (error) {
      return next(new ErrorHandler('Failed to fetch quests', 500));
  }
});


exports.getSingleRecord = catchAsyncErrors(async (req, res, next) => {
  const blog = await QueryModel.findById(table_name, req.params.id, next);

  if (!blog) {
    return next(new ErrorHandler("Blog not found", 404)); // Handle not found error
  }

  // Handle start_date formatting
  console.log("Original Start Date:", blog.start_date);
  if (blog.start_date) {
    const startDate = new Date(blog.start_date);
    if (!isNaN(startDate.getTime())) {
      blog.start_date = moment(startDate)
        .tz("Your_Time_Zone") // Replace 'Your_Time_Zone' with the actual timezone, e.g., 'Asia/Kolkata'
        .format("YYYY-MM-DDTHH:mm");
    } else {
      console.error("Invalid date:", blog.start_date);
      blog.start_date = ""; // Handle invalid date
    }
  }
  console.log("Formatted Start Date:", blog.start_date);

  // Handle end_date formatting
  console.log("Original End Date:", blog.end_date);
  if (blog.end_date) {
    const endDate = new Date(blog.end_date);
    if (!isNaN(endDate.getTime())) {
      blog.end_date = moment(endDate)
        .tz("Your_Time_Zone") // Replace 'Your_Time_Zone' with the actual timezone, e.g., 'Asia/Kolkata'
        .format("YYYY-MM-DDTHH:mm");
    } else {
      console.error("Invalid date:", blog.end_date);
      blog.end_date = ""; // Handle invalid date
    }
  }
  console.log("Formatted End Date:", blog.end_date);

  res.render(module_slug + "/detail", {
    layout: module_layout,
    title: module_single_title,
    blog,
    module_slug,
  });
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

function generateSlug(quest_name) {
  return quest_name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "") // Remove invalid characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+$/g, ""); // Remove trailing hyphens
}

// exports.apiGetAllRecords = catchAsyncErrors(async (req, res, next) => {
//   const resultPerPage = 10; // Set number of records per page
//   const page = parseInt(req.query.page) || 1; // Current page from query parameters
//   const searchQuery = req.query.search || ""; // Search term from query parameters

//   // Calculate offset for pagination
//   const offset = (page - 1) * resultPerPage;

//   try {
//     // Count total quests with optional search filter
//     const totalQuestsResult = await db.query(
//       "SELECT COUNT(*) as count FROM quest WHERE quest_name LIKE ? OR description LIKE ?",
//       [`%${searchQuery}%`, `%${searchQuery}%`]
//     );
//     const totalQuests = totalQuestsResult[0][0].count;

//     // Fetch quests with pagination and filtering, including activity and end_date
//     const [quest_records] = await db.query(
//       "SELECT id, quest_name, quest_type, activity,start_date, quest_url, date_created, end_date, description, status, coin_earn, image FROM quest WHERE quest_name LIKE ? OR description LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?",
//       [`%${searchQuery}%`, `%${searchQuery}%`, resultPerPage, offset]
//     );

//     // Process rows to structure the data correctly
//     const quests = quest_records.map((row) => ({
//       quest_id: row.id,
//       quest_name: row.quest_name,
//       quest_type: row.quest_type, // Directly use the quest_type from the database
//       activity: row.activity, // Ensure activity is fetched from the database
//       quest_url: row.quest_url,
//       date_created: row.date_created.toLocaleString(),
//       end_date: row.end_date.toLocaleString(), // Include end_date in the response
//       description: row.description,
//       status: row.status,
//       image:
//         process.env.BACKEND_URL + "uploads/" + module_slug + "/" + row.image,
//       coin_earn: row.coin_earn,
//       start_date: row.start_date
//         ? new Date(row.start_date).toLocaleString()
//         : null,
//     }));

//     // Send the response
//     res.status(200).json({
//       success: true,
//       totalQuests,
//       resultPerPage,
//       page,
//       quests,
//     });
//   } catch (error) {
//     console.error("Error in apiGetAllRecords:", error.message);
//     return next(new ErrorHandler("Database query failed", 500));
//   }
// });


// exports.getQuestHistory = async (req, res) => {
//   try {
//     const userId = req.user.id; // Assuming the user ID is available in req.user

//     // Pagination parameters
//     const resultPerPage = parseInt(req.query.limit) || 10;
//     const page = parseInt(req.query.page) || 1;
//     const offset = (page - 1) * resultPerPage;

//     // Query to fetch quest data with user-specific completion status
//     const questHistoryQuery = `
//       SELECT 
//         q.id AS quest_id,
//         q.quest_name,
//         q.quest_type,
//         CASE 
//           WHEN q.activity = 'watch' THEN 'watch'
//           WHEN q.activity = 'follow' THEN 'follow'
//           ELSE 'unknown'
//         END AS activity,
//         q.quest_url,
//         q.date_created,
//         q.start_date,
//         q.end_date,
//         q.description,
//         q.status,
//         q.image,
//         q.coin_earn,
//         IFNULL(uca.status, 'not_completed') AS completion_status
//       FROM quest q
//       LEFT JOIN usercoin_audit uca 
//         ON q.id = uca.quest_id 
//         AND uca.user_id = ? 
//         AND uca.status = 'completed' 
//         AND uca.deleted = 0
//       WHERE q.deleted = 0
//       LIMIT ? OFFSET ?;
//     `;

//     // Execute the query to fetch paginated quests
//     const [questHistory] = await db.query(questHistoryQuery, [
//       userId,
//       resultPerPage,
//       offset,
//     ]);

//     // Query to get total quest count for pagination
//     const totalQuestQuery = `
//       SELECT COUNT(*) AS totalQuests 
//       FROM quest 
//       WHERE deleted = 0;
//     `;
//     const [totalQuestResult] = await db.query(totalQuestQuery);
//     const totalQuests = totalQuestResult[0].totalQuests;

//     // Format quest data
//     const formattedQuests = questHistory.map((quest) => ({
//       quest_id: quest.quest_id,
//       quest_name: quest.quest_name,
//       quest_type: quest.quest_type,
//       activity: quest.activity,
//       quest_url: quest.quest_url,
//       date_created: moment(quest.date_created).format("MM/DD/YYYY, h:mm:ss A"),
//       start_date: moment(quest.start_date).format("MM/DD/YYYY, h:mm:ss A"),
//       end_date: moment(quest.end_date).format("MM/DD/YYYY, h:mm:ss A"),
//       description: quest.description,
//       status: quest.completion_status === "completed" ? "completed" : "not_completed",
//       image: process.env.BACKEND_URL + "uploads/" + module_slug + "/" + quest.image,
//       coin_earn: parseFloat(quest.coin_earn).toFixed(2),
//     }));

//     // Construct response
//     return res.status(200).json({
//       success: true,
//       message: "Quest history fetched successfully.",
//       totalQuests,
//       resultPerPage,
//       page,
//       quests: formattedQuests,
//     });
//   } catch (error) {
//     console.error("Error fetching quest history:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching quest history.",
//       error: error.message,
//     });
//   }
// };


// exports.getQuestHistory = async (req, res) => {
//   try {
//     const userId = req.user.id; // Assuming the user ID is available in req.user

//     // Pagination parameters
//     const resultPerPage = parseInt(req.query.limit) || 10;
//     const page = parseInt(req.query.page) || 1;
//     const offset = (page - 1) * resultPerPage;

//     // Query to fetch quest data with user-specific completion status
//     const questHistoryQuery = `
//         SELECT 
//         q.id AS quest_id,
//         q.quest_name,
//         q.quest_type,
//         CASE 
//           WHEN q.activity = 'watch' THEN 'watch'
//           WHEN q.activity = 'follow' THEN 'follow'
//           ELSE 'unknown'
//         END AS activity,
//         q.quest_url,
//         q.date_created,
//         q.start_date,
//         q.end_date,
//         q.description,
//         q.status,
//         q.image,
//         q.coin_earn,
//         q.social_media,  -- Include social_media field in the query
//         CASE 
//           WHEN uca.status = 'completed' THEN 'completed'
//           WHEN uca.status = 'waiting' THEN 'waiting'
//           ELSE 'not_completed'
//         END AS completion_status
//       FROM quest q
//       LEFT JOIN usercoin_audit uca 
//         ON q.id = uca.quest_id 
//         AND uca.user_id = ? 
//         AND uca.deleted = 0
//       WHERE q.deleted = 0
//       LIMIT ? OFFSET ?;
//     `;

//     // Execute the query to fetch paginated quests
//     const [questHistory] = await db.query(questHistoryQuery, [
//       userId,
//       resultPerPage,
//       offset,
//     ]);

//     // Query to get total quest count for pagination
//     const totalQuestQuery = `
//       SELECT COUNT(*) AS totalQuests 
//       FROM quest 
//       WHERE deleted = 0;
//     `;
//     const [totalQuestResult] = await db.query(totalQuestQuery);
//     const totalQuests = totalQuestResult[0].totalQuests;

//     // Format quest data
//     const formattedQuests = questHistory.map((quest) => ({
//       quest_id: quest.quest_id,
//       quest_name: quest.quest_name,
//       quest_type: quest.quest_type,
//       activity: quest.activity,
//       quest_url: quest.quest_url,
//       date_created: moment(quest.date_created).format("MM/DD/YYYY, h:mm:ss A"),
//       start_date: moment(quest.start_date).format("MM/DD/YYYY, h:mm:ss A"),
//       end_date: moment(quest.end_date).format("MM/DD/YYYY, h:mm:ss A"),
//       description: quest.description,
//       status: quest.completion_status,
//       image: process.env.BACKEND_URL + "uploads/" + module_slug + "/" + quest.image,
//       coin_earn: parseFloat(quest.coin_earn).toFixed(2),
//       social_media: quest.social_media, // Include social_media in the response
//     }));

//     // Construct response
//     return res.status(200).json({
//       success: true,
//       message: "Quest history fetched successfully.",
//       totalQuests,
//       resultPerPage,
//       page,
//       quests: formattedQuests,
//     });
//   } catch (error) {
//     console.error("Error fetching quest history:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching quest history.",
//       error: error.message,
//     });
//   }
// };

exports.getQuestHistory = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming the user ID is available in req.user

    // Query to fetch quest data with user-specific completion status and additional condition for start_date
    const questHistoryQuery = `
        SELECT 
        q.id AS quest_id,
        q.quest_name,
        q.quest_type,
         q.screenshot_required,
        CASE 
          WHEN q.activity = 'watch' THEN 'watch'
          WHEN q.activity = 'follow' THEN 'follow'
          ELSE 'unknown'
        END AS activity,
        q.quest_url,
        q.date_created,
        q.start_date,
        q.end_date,
        q.description,
        q.status,
        q.image,
       q.duration,
        q.coin_earn,
        q.social_media,  -- Include social_media field in the query
        CASE 
          WHEN uca.status = 'completed' THEN 'completed'
          WHEN uca.status = 'waiting' THEN 'waiting'
          ELSE 'not_completed'
        END AS completion_status
      FROM quest q
      LEFT JOIN usercoin_audit uca 
        ON q.id = uca.quest_id 
        AND uca.user_id = ? 
    AND uca.deleted = 0
  WHERE q.deleted = 0
    AND q.end_date >= CURDATE() 
    AND DATE(q.start_date) <= CURDATE()  
    `;

    // Execute the query to fetch all matching quests
    const [questHistory] = await db.query(questHistoryQuery, [userId]);

    // Format quest data
    const formattedQuests = questHistory.map((quest) => ({
      quest_id: quest.quest_id,
      quest_name: quest.quest_name,
      quest_type: quest.quest_type,
      activity: quest.activity,
      screenshot_required: quest.screenshot_required,
      quest_url: quest.quest_url,
      date_created: moment(quest.date_created).format("MM/DD/YYYY, h:mm:ss A"),
      start_date: moment(quest.start_date).format("MM/DD/YYYY, h:mm:ss A"),
      end_date: moment(quest.end_date).format("MM/DD/YYYY, h:mm:ss A"),
      description: quest.description,
      status: quest.completion_status,
      image:
        process.env.BACKEND_URL + "uploads/" + module_slug + "/" + quest.image,
duration: quest.duration,
      coin_earn: parseFloat(quest.coin_earn).toFixed(2),
      social_media: quest.social_media, // Include social_media in the response
    }));

    // Construct response
    return res.status(200).json({
      success: true,
      message: "Quest history fetched successfully.",
      quests: formattedQuests,
    });
  } catch (error) {
    console.error("Error fetching quest history:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching quest history.",
      error: error.message,
    });
  }
};
exports.apiGetSingleRecord = catchAsyncErrors(async (req, res, next) => {
  const questId = req.params.id; // Assuming quest ID is passed as a URL parameter
  const userId = req.user.id; // Assuming user ID is available from the request object

  try {
    const [quest_records] = await db.query(
      `
      SELECT q.quest_name, q.quest_type, q.quest_url, q.date_created, q.description, q.status, q.coin_earn, q.image, 
             q.screenshot_required, -- Added screenshot_required to the query
             COALESCE(u.status, 'not_completed') AS user_status
      FROM quest q
      LEFT JOIN usercoin_audit u ON u.quest_id = q.id AND u.user_id = ?
      WHERE q.id = ? 
      LIMIT 1
    `,
      [userId, questId]
    );

    const quest = quest_records[0]; // Get the first (and should be the only) record

    if (!quest) {
      return next(new ErrorHandler("Record not found", 404)); // Changed status code to 404 for not found
    }

    // Process the image URL
    quest.image =
      process.env.BACKEND_URL + "/uploads/" + module_slug + "/" + quest.image;

    // Send the response with the screenshot_required field
    res.status(200).json({
      success: true,
      quest,
    });
  } catch (error) {
    console.error("Error fetching quest record:", error);
    return next(new ErrorHandler("Database query failed", 500));
  }
});


/////////////////

// exports.completeQuest = catchAsyncErrors(async (req, res, next) => {
//   const user_id = req.user.id;
//   const { quest_id } = req.body;

//   console.log("Received request to complete quest:", { user_id, quest_id });

//   if (!quest_id) {
//     console.log("Validation failed: Missing quest_id");
//     return next(new ErrorHandler("Quest ID is required", 400));
//   }

//   try {
//     // Check if the quest is already completed
//     const [completedQuestCheck] = await db.query(
//       "SELECT id FROM usercoin_audit WHERE user_id = ? AND quest_id = ? AND status = 'completed'",
//       [user_id, quest_id]
//     );

//     if (completedQuestCheck.length > 0) {
//       console.log("Quest already completed by user:", { user_id, quest_id });
//       return res.status(200).json({
//         success: false,
//         message: "Quest already completed.",
//       });
//     }

//     // Fetch quest details, including activity type, coin_earn value, and quest_name
//     const [questResult] = await db.query(
//       "SELECT id, coin_earn, activity, quest_name FROM quest WHERE id = ?",
//       [quest_id]
//     );

//     if (questResult.length === 0) {
//       console.log("Quest not found for quest_id:", quest_id);
//       return next(new ErrorHandler("Quest not found", 404));
//     }

//     const {
//       id: fetchedQuestId,
//       coin_earn: coinEarn,
//       activity,
//       quest_name: fetchedQuestName,
//     } = questResult[0];
//     console.log("Quest ID, Coin Earn, Activity, Quest Name:", {
//       fetchedQuestId,
//       coinEarn,
//       activity,
//       fetchedQuestName,
//     });

//     const coinEarnValue = Math.floor(parseFloat(coinEarn));
//     if (isNaN(coinEarnValue) || coinEarnValue < 0) {
//       console.error(
//         "Coin earn value is NaN or negative, cannot update user_data"
//       );
//       return next(new ErrorHandler("Invalid coin earn value", 400));
//     }

//     // Determine pending_coin based on activity type
//     let pendingCoinValue = coinEarnValue; // Default value for non-follow activity
//     let status = "completed"; // Default status for non-follow activity

//     // Check if the activity is "follow" (activity = 2)
//     if (activity === "follow") {
//       // If activity is "follow"
//       pendingCoinValue = 0; // Set pending_coin to 0 for "follow"
//       status = "not_completed"; // Set status to "not completed" for "follow"
//     }

//     // Log the value of pendingCoinValue and status for debugging purposes
//     console.log("Pending Coin Value Set To:", pendingCoinValue);
//     console.log("Status Set To:", status);

//     // Check if the value is correctly set to 0 when activity is follow
//     if (activity === 2 && pendingCoinValue !== 0) {
//       console.error(
//         "Unexpected pendingCoinValue when activity is 'follow':",
//         pendingCoinValue
//       );
//     }

//     await db.query("START TRANSACTION");
//     const date_created = new Date()
//       .toISOString()
//       .slice(0, 19)
//       .replace("T", " ");

//     // Insert into usercoin_audit with the determined pending_coin value and status
//     const insertAuditData = {
//       user_id,
//       quest_id: fetchedQuestId,
//       pending_coin: pendingCoinValue, // Either coinEarnValue or 0 based on activity
//       coin_operation: "cr",
//       type: "quest",
//       title: "quest",
//       description: "quest",
//       status: status, // Use the dynamically set status
//       date_entered: date_created,
//     };
//     console.log("Insert data for usercoin_audit:", insertAuditData);

//     const [insertAuditResult] = await db.query(
//       "INSERT INTO usercoin_audit SET ?",
//       insertAuditData
//     );

//     if (insertAuditResult.affectedRows === 0) {
//       await db.query("ROLLBACK");
//       console.error("Failed to insert into usercoin_audit");
//       return next(new ErrorHandler("Failed to complete quest", 500));
//     }

//     // Fetch the current pending_coin from user_data
//     const [currentCoinResult] = await db.query(
//       "SELECT pending_coin FROM user_data WHERE user_id = ?",
//       [user_id]
//     );

//     const currentPendingCoin = currentCoinResult[0]?.pending_coin || 0;
//     console.log("Current pending_coin for user:", currentPendingCoin);

//     // Calculate the new pending_coin value only if activity is not "follow"
//     let newPendingCoin = currentPendingCoin;

//     if (activity !== "follow") {
//       newPendingCoin = currentPendingCoin + coinEarnValue;
//       console.log("New pending_coin value:", newPendingCoin);

//       // Update the pending_coin in user_data with the new value
//       const updateUserDataQuery = `
//     UPDATE user_data
//     SET pending_coin = ?
//     WHERE user_id = ?
//   `;

//       const [updateUserResult] = await db.query(updateUserDataQuery, [
//         newPendingCoin,
//         user_id,
//       ]);

//       if (updateUserResult.affectedRows === 0) {
//         await db.query("ROLLBACK");
//         console.error("Failed to update pending_coin in user_data");
//         return next(new ErrorHandler("Failed to update pending_coin", 500));
//       }
//       console.log("Pending_coin updated successfully for user.");
//     } else {
//       console.log("Activity is 'follow'; skipping pending_coin update.");
//     }

//     // Commit the transaction
//     await db.query("COMMIT");

//     // Fetch the updated pending_coin value (even if it wasn't updated)
//     const [updatedPendingCoinResult] = await db.query(
//       "SELECT pending_coin FROM user_data WHERE user_id = ?",
//       [user_id]
//     );

//     const updatedPendingCoin = updatedPendingCoinResult[0]?.pending_coin || 0;
//     console.log("Updated pending_coin for user:", updatedPendingCoin);

//     let responseMessage = `Addwedd Quest completed successfully. ${coinEarnValue} coins recorded in audit log.`;
//     if (activity === "follow") {
//       responseMessage = "Quest completed successfully. Approve by admin.";
//     }

//     // Respond with success
//     res.status(200).json({
//       success: true,
//       message: responseMessage,
//       data: {
//         user_id,
//         quest_id: fetchedQuestId,
//         quest_name: fetchedQuestName, // Return the quest name in the response
//         coin_earn: coinEarnValue,
//         title: "quest",
//         description: "quest",
//         status: status, // Return the status in the response
//         date_entered: new Date(),
//       },
//     });
//   } catch (error) {
//     console.error("Error during quest completion:", error);
//     await db.query("ROLLBACK");
//     return next(new ErrorHandler("Database query failed", 500));
//   }
// });
exports.completeQuest = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const { quest_id } = req.body;

  console.log("Received request to complete quest:", { user_id, quest_id });

  if (!quest_id) {
    console.log("Validation failed: Missing quest_id");
    return next(new ErrorHandler("Quest ID is required", 400));
  }

  try {
    // Check if the quest is already completed
    const [completedQuestCheck] = await db.query(
      "SELECT id FROM usercoin_audit WHERE user_id = ? AND quest_id = ? AND status = 'completed'",
      [user_id, quest_id]
    );

    if (completedQuestCheck.length > 0) {
      console.log("Quest already completed by user:", { user_id, quest_id });
      return res.status(200).json({
        success: false,
        message: "Quest already completed.",
      });
    }

    // Fetch quest details, including activity type, coin_earn value, and quest_name
    const [questResult] = await db.query(
      "SELECT id, coin_earn, activity, quest_name, duration FROM quest WHERE id = ?",
      [quest_id]
    );

    if (questResult.length === 0) {
      console.log("Quest not found for quest_id:", quest_id);
      return next(new ErrorHandler("Quest not found", 404));
    }

    const {
      id: fetchedQuestId,
      coin_earn: coinEarn,
      activity,
      quest_name: fetchedQuestName,
duration: duration,
    } = questResult[0];

    console.log("Quest ID, Coin Earn, Activity, Quest Name:", {
      fetchedQuestId,
      coinEarn,
      activity,
      fetchedQuestName,
    });

    const coinEarnValue = Math.floor(parseFloat(coinEarn));
    if (isNaN(coinEarnValue) || coinEarnValue < 0) {
      console.error(
        "Coin earn value is NaN or negative, cannot update user_data"
      );
      return next(new ErrorHandler("Invalid coin earn value", 400));
    }

    // Determine pending_coin and status for all activities
    let pendingCoinValue = coinEarnValue; // Coins will be added directly for all activities
    let status = "completed"; // Status will always be completed for all activities

    console.log(`Activity '${activity}' handled as 'watch/follow'.`);

    await db.query("START TRANSACTION");
    const date_created = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Insert into usercoin_audit with the determined pending_coin value and status
    const insertAuditData = {
      user_id,
      quest_id: fetchedQuestId,
      pending_coin: pendingCoinValue, // Coins added directly
      coin_operation: "cr",
      type: "quest",
      title: "quest",
      description: "quest",
      status: status, // Status is 'completed'
      date_entered: date_created,
    };
    console.log("Insert data for usercoin_audit:", insertAuditData);

    const [insertAuditResult] = await db.query(
      "INSERT INTO usercoin_audit SET ?",
      insertAuditData
    );

    if (insertAuditResult.affectedRows === 0) {
      await db.query("ROLLBACK");
      console.error("Failed to insert into usercoin_audit");
      return next(new ErrorHandler("Failed to complete quest", 500));
    }

    // Fetch the current pending_coin from user_data
    const [currentCoinResult] = await db.query(
      "SELECT pending_coin FROM user_data WHERE user_id = ?",
      [user_id]
    );

    const currentPendingCoin = currentCoinResult[0]?.pending_coin || 0;
    console.log("Current pending_coin for user:", currentPendingCoin);

    // Calculate the new pending_coin value
    const newPendingCoin = currentPendingCoin + coinEarnValue;
    console.log("New pending_coin value:", newPendingCoin);

    // Update the pending_coin in user_data
    const updateUserDataQuery = `
      UPDATE user_data
      SET pending_coin = ?
      WHERE user_id = ?
    `;

    const [updateUserResult] = await db.query(updateUserDataQuery, [
      newPendingCoin,
      user_id,
    ]);

    if (updateUserResult.affectedRows === 0) {
      await db.query("ROLLBACK");
      console.error("Failed to update pending_coin in user_data");
      return next(new ErrorHandler("Failed to update pending_coin", 500));
    }
    console.log("Pending_coin updated successfully for user.");

    // Commit the transaction
    await db.query("COMMIT");

    // Fetch the updated pending_coin value
    const [updatedPendingCoinResult] = await db.query(
      "SELECT pending_coin FROM user_data WHERE user_id = ?",
      [user_id]
    );

    const updatedPendingCoin = updatedPendingCoinResult[0]?.pending_coin || 0;
    console.log("Updated pending_coin for user:", updatedPendingCoin);

    // Response message
    const responseMessage = `Quest completed successfully. ${coinEarnValue} coins added to your account.`;

    // Respond with success
    res.status(200).json({
      success: true,
      message: responseMessage,
      data: {
        user_id,
        quest_id: fetchedQuestId,
        quest_name: fetchedQuestName, // Return the quest name in the response
        coin_earn: coinEarnValue,
        title: "quest",
        description: "quest",
        status: status, // Return the status in the response
        date_entered: new Date(),
      },
    });
  } catch (error) {
    console.error("Error during quest completion:", error);
    await db.query("ROLLBACK");
    return next(new ErrorHandler("Database query failed", 500));
  }
});


////////////////////////////////////////////
exports.getUserPendingCoins = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;

  console.log("Fetching pending coins for user:", user_id);

  try {
    // Query to get the sum of pending coins, ensuring no negative values
    const result = await db.query(
      "SELECT GREATEST(0, pending_coin) AS totalPendingCoins FROM user_data WHERE user_id = ?",
      [user_id]
    );

    const totalPendingCoins = result[0][0].totalPendingCoins || 0; // Default to 0 if no coins found

    console.log("Total pending coins fetched:", totalPendingCoins);

    // Respond with the total pending coins
    res.status(200).json({
      success: true,
      message: "Pending coins fetched successfully.",
      data: {
        user_id,
        pending_coin: totalPendingCoins,
      },
    });
  } catch (error) {
    console.error("Error fetching pending coins:", error);
    return next(new ErrorHandler("Database query failed", 500));
  }
});
//////////////////////////////////////

exports.transferPendingCoinsToTotal = catchAsyncErrors(
  async (req, res, next) => {
    const user_id = req.user.id; // Assuming req.user.id contains the authenticated user's ID

    console.log("Transferring coins from pending to total for user:", user_id);

    try {
      // Step 1: Retrieve the reduce_coin_rate from settings table
      const settingsResult = await db.query(
        "SELECT reduce_coin_rate FROM settings LIMIT 1" // Assuming there's only one row in the settings table
      );

      const reduceCoinRate = settingsResult[0][0]?.reduce_coin_rate || 0;

      // Step 2: Check if the user has enough pending coins in user_data table
      const userPendingResult = await db.query(
        "SELECT pending_coin FROM user_data WHERE user_id = ?",
        [user_id]
      );

      const userPendingCoins = userPendingResult[0][0]?.pending_coin || 0;

      // Check if user has enough pending coins
      if (userPendingCoins < reduceCoinRate) {
        return res.status(400).json({
          success: false,
          error: `Insufficient pending coins in user_data. At least ${reduceCoinRate} coins are required.`,
        });
      }
      // Step 3: Deduct coins from user_data table
      await db.query(
        "UPDATE user_data SET pending_coin = pending_coin - ?, coins = coins + ? WHERE user_id = ?",
        [reduceCoinRate, reduceCoinRate, user_id]
      );

      // Step 4: Calculate the updated pending coins and earn coins
      const updatedPendingCoins = userPendingCoins - reduceCoinRate; // Updated pending coins after deduction
      const earnCoins = reduceCoinRate; // Earn coins is the reduceCoinRate that is transferred

         const title = "Tap-Tap";
      const description = "Tap-Tap";
      const dateEntered = new Date().toISOString(); // Current date in ISO format
      
      // Insert a new row into usercoin_audit with the updated values
      // await db.query(
      //   "INSERT INTO usercoin_audit (user_id, pending_coin, earn_coin) VALUES (?, ?, ?)",
      //   [user_id, updatedPendingCoins, earnCoins]
      // );
      await db.query(
        "INSERT INTO usercoin_audit (user_id, pending_coin, earn_coin, title, description, date_entered) VALUES (?, ?, ?, ?, ?, CURDATE())",
        [
          user_id,
          updatedPendingCoins,
          earnCoins,
          title,
          description,
        ]
      );

      //    await db.query(
      //   "INSERT INTO usercoin_audit (user_id, date_entered) VALUES (?, CURDATE())",
      //   [
      //     user_id,
      //   ]
      // );

      // Step 5: Fetch updated values for response
      const updatedPendingCoinsResult = await db.query(
        "SELECT pending_coin FROM user_data WHERE user_id = ?",
        [user_id]
      );

      const finalUpdatedPendingCoins =
        updatedPendingCoinsResult[0][0].pending_coin;

      const updatedTotalCoinsResult = await db.query(
        "SELECT SUM(coins) AS totalEarnCoins FROM user_data WHERE user_id = ?",
        [user_id]
      );

      const updatedTotalCoins =
        updatedTotalCoinsResult[0][0]?.totalEarnCoins || 0;

      // Respond with the updated values
      res.status(200).json({
        success: true,
        message: `${reduceCoinRate} coins transferred from pending coins to total coins successfully.`,
        data: {
          user_id,
          pending_coin: updatedPendingCoins,
          coins: updatedTotalCoins,
        },
      });
    } catch (error) {
      console.error("Error during coin transfer:", error);
      return next(new ErrorHandler("Database query failed", 500));
    }
  }
);

////////////////////////////////////////////////////////
