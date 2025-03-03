const express = require("express");
const multer = require("multer");
const {
  approveTransaction,
  allCompanyTransactions,
} = require("../contollers/companyTransactionController");
const {
  isAuthenticatedUser,
  authorizeRoles,
  isApiAuthenticatedUser,
} = require("../middleware/auth");
const Model = require("../models/faqModel");
const module_slug = Model.module_slug;
const router = express.Router();

var Storage = multer.memoryStorage(); // Use memoryStorage instead of diskStorage

var upload = multer({ storage: Storage });

router
  .route("/companytransactions")
  .get(isAuthenticatedUser, allCompanyTransactions);

router
  .route("/approvecompanyTransaction")
  .post(isAuthenticatedUser, approveTransaction);

module.exports = router;
