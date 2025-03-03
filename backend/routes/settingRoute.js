const express = require("express");
const multer = require("multer");
const {
  editForm,
  updateRecord,
  deleteImage,
  apiGetSingleRecord,
} = require("../contollers/settingsController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const Model = require("../models/settingModel");
const module_slug = Model.module_slug;
const router = express.Router();

const Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads/settings"); // Directory for file storage
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + "_" + file.originalname;
    callback(null, file.fieldname + "_" + uniqueSuffix);
  },
});
const upload = multer({ storage: Storage });

router
  .route("/" + module_slug)
  .get(isAuthenticatedUser, authorizeRoles("admin"), editForm);
router.route("/" + module_slug + "/update/:id").post(
  upload.fields([
    { name: "header_logo", maxCount: 1 },
    { name: "qr_code", maxCount: 1 },
  ]),
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateRecord
);

router
  .route("/" + module_slug + "/delete-image/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), deleteImage);

/** REST API**/
router.route("/api-" + module_slug).get(apiGetSingleRecord);

module.exports = router;
