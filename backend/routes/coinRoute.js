// const express = require("express");
// const multer = require("multer");
// const {
//   addFrom,
//   createRecord,
//   editForm,
//   updateRecord,
//   deleteRecord,
//   getAllRecords,
//   getSingleRecord,
//   deleteImage,
//   apiGetAllRecords,
//   apiGetSingleRecord,
//   completeQuest,
//   getUserPendingCoins,
//   transferPendingCoinsToTotal,
// } = require("../contollers/coinController");
// const { isAuthenticatedUser, authorizeRoles, isApiAuthenticatedUser } = require("../middleware/auth");
// const Model = require("../models/coinModel");
// const module_slug = Model.module_slug;
// const router = express.Router();

// var Storage = multer.diskStorage({
//   destination: function (req, file, callback) {
//     console.log(file);
//     callback(null, "./uploads/quests");
//   },
//   filename: function (req, file, callback) {
//     console.log(file);
//     callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
//   },
// });

// var upload = multer({ storage: Storage });

// router
//   .route("/" + module_slug + "/add")
//   .get(isAuthenticatedUser, authorizeRoles("admin"), addFrom);
// router
//   .route("/" + module_slug + "/add")
//   .post(
//     upload.single("image"),
//     isAuthenticatedUser,
//     authorizeRoles("admin"),
//     createRecord
//   );

// router
//   .route("/" + module_slug + "/edit/:id")
//   .get(isAuthenticatedUser, authorizeRoles("admin"), editForm);
// router
//   .route("/" + module_slug + "/update/:id")
//   .post(
//     upload.single("image"),
//     isAuthenticatedUser,
//     authorizeRoles("admin"),
//     updateRecord
//   );
// router
//   .route("/" + module_slug + "/delete/:id")
//   .get(isAuthenticatedUser, authorizeRoles("admin"), deleteRecord);
// router
//   .route("/" + module_slug + "")
//   .get(isAuthenticatedUser, authorizeRoles("admin"), getAllRecords);
// router
//   .route("/" + module_slug + "/:id")
//   .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleRecord);
// router
//   .route("/" + module_slug + "/delete-image/:id")
//   .get(isAuthenticatedUser, authorizeRoles("admin"), deleteImage);

// /** REST API**/
// router.route("/api-" + module_slug + "").get(apiGetAllRecords);
// router.route("/api-" + module_slug + "/:id").get(apiGetSingleRecord);
// router
//   .route("/api-" + module_slug + "/complete-quest")
//   .post(isApiAuthenticatedUser, completeQuest);

// // GET route for fetching pending coins
// router.route("/pending-coins").get(isApiAuthenticatedUser, getUserPendingCoins);
// router
//   .route("/transfer-coins")
//   .post(isAuthenticatedUser, transferPendingCoinsToTotal);

// module.exports = router;
