const express = require("express");
const multer = require("multer");
const {
  reqGetAllUsers,
  uploadScreenshotApi,
} = require("../contollers/faqController");
const {
  isAuthenticatedUser,
  authorizeRoles,
  isApiAuthenticatedUser,
} = require("../middleware/auth");
const Model = require("../models/faqModel");
const module_slug = Model.module_slug;
const router = express.Router();

var Storage = multer.memoryStorage();  // Use memoryStorage instead of diskStorage

var upload = multer({ storage: Storage });

router.route("/faqs").get(isAuthenticatedUser, reqGetAllUsers);
router
  .route("/upload")
  .patch(isAuthenticatedUser, upload.single("image"), uploadScreenshotApi);

module.exports = router;
