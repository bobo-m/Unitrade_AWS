const express = require("express");
const multer = require("multer");
const { getAllRecords } = require("../contollers/companyController");
const {
  isAuthenticatedUser,
  authorizeRoles,
  isApiAuthenticatedUser,
} = require("../middleware/auth");
const Model = require("../models/companyModel");
const module_slug = Model.module_slug;
const router = express.Router();

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    console.log(file);
    callback(null, "./uploads");
  },
  filename: function (req, file, callback) {
    console.log(file);
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

const {
  loginCompanyApi,
  addFrom,
  createRecord,
  allUsers,
  forgotPasswordApi,
  updatePasswordApi,
  getAllCompaniesApi,
  getCompanyDetailApi,
  getSingleUser,
  editUserForm,
  updateUserRecord,
  deleteRecord,
  getCompanyProfileApi,
  updateCoinRateApi,
  reqGetAllReqApi,
  uploadTransactionDocApi,
  reqGetAllHistoryApiReqApi,
  reqGetUnapprovedWithDocApi,
  createCompanySellTransaction,
addCoinRangeApi,
} = require("../contollers/companyController");
var upload = multer({ storage: Storage });
// router.post("/users/update-status", updateUserStatus);
router
  .route("/" + module_slug + "/add")
  .get(isAuthenticatedUser, authorizeRoles("admin"), addFrom);

router
  .route("/" + module_slug + "/add")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createRecord);
// router
//   .route("/" + module_slug + "/company-form/:id")
//   .get(isAuthenticatedUser, authorizeRoles("admin"), showCompanyForm)
//   .post(isAuthenticatedUser, authorizeRoles("admin"), submitCompanyForm);
router
  .route("/" + module_slug + "/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser);
router
  .route("/" + module_slug + "/edit/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), editUserForm);

router
  .route("/" + module_slug + "/update/:id")
  .post(isAuthenticatedUser, authorizeRoles("admin"), updateUserRecord);
router
  .route("/" + module_slug + "/delete/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), deleteRecord);
router.route("/" + module_slug + "").get(isAuthenticatedUser, allUsers);
router.route("/api-company/:id").get(getCompanyDetailApi);
router.route("/api-companies").get(getAllCompaniesApi);
//////////////////////////////

router.route("/api-login-company").post(loginCompanyApi);
router.route("/api-password/forgot").post(forgotPasswordApi);
router
  .route("/api-password/update")
  .post(isApiAuthenticatedUser, updatePasswordApi);
router
  .route("/api-company-detail")
  .get(isApiAuthenticatedUser, getCompanyProfileApi);

router
  .route("/api-coinrate-update")
  .put(isApiAuthenticatedUser, updateCoinRateApi);

router
  .route("/api-addcoin-range")
  .post(isApiAuthenticatedUser, addCoinRangeApi);

router.route("/api-getall-req").get(isApiAuthenticatedUser, reqGetAllReqApi);

router
  .route("/api-getall-pending")
  .get(isApiAuthenticatedUser, reqGetUnapprovedWithDocApi);

router
  .route("/api-getall-history")
  .get(isApiAuthenticatedUser, reqGetAllHistoryApiReqApi);
router
  .route("/sell-coins-toadmin")
  .post(isApiAuthenticatedUser, createCompanySellTransaction);
router.post(
  "/upload-transaction-doc", // Route to handle transaction document upload
  upload.single("pay_image"), // This is where multer handles file upload
  uploadTransactionDocApi // Call the handler
);
module.exports = router;
