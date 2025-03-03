const express = require("express");
const multer = require("multer");

const { getAllRecords } = require("../contollers/testimonialsController");
const db = require("../config/mysql_database");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const Model = require("../models/testimonialModel");
const module_slug = Model.module_slug;
const router = express.Router();

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    console.log(file);
    callback(null, "./uploads/testimonials");
  },
  filename: function (req, file, callback) {
    console.log(file);
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({ storage: Storage });

// router.route('/'+module_slug+'/add').get(isAuthenticatedUser,authorizeRoles('admin'),addFrom)
// router.route('/'+module_slug+'/add').post(upload.single('image'),isAuthenticatedUser,authorizeRoles('admin'),createRecord)
// router.route('/'+module_slug+'/edit/:id').get(isAuthenticatedUser,authorizeRoles('admin'),editForm)
// router.route('/'+module_slug+'/update/:id').post(upload.single('image'),isAuthenticatedUser,authorizeRoles('admin'),updateRecord)
// router.route('/'+module_slug+'/delete/:id').get(isAuthenticatedUser,authorizeRoles('admin'),deleteRecord)
router
  .route("/" + module_slug + "")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllRecords);
// router.route('/'+module_slug+'/delete-image/:id').get(isAuthenticatedUser,authorizeRoles('admin'),deleteImage);

/** REST API**/
// router.route("/api-" + module_slug + "").get(apiGetAllRecords);

// Route to fetch user quest entries from `usercoin_audit`
router.get('/user/:userId/quest-entries', async (req, res) => {
  const { userId } = req.params;

  try {
      // SQL query to get data from `usercoin_audit` where `type` is 'quest'
      // const query = `
      //     SELECT * FROM usercoin_audit
      //     WHERE user_id = ? AND type = 'quest'
      // `;
      const query = `
  SELECT qa.*, q.quest_name, u.user_name
  FROM usercoin_audit qa
  JOIN users u ON qa.user_id = u.id
  LEFT JOIN quest q ON qa.quest_id = q.id
  WHERE qa.type = 'quest'
`;

      const questEntries = await db.query(query, [userId]);
      console.log("Quest Entries:", questEntries);
      res.render('testimonials/index', { 
         layout: module_layout,
         title: 'User Quest Entries', 
         module_slug: 'testimonials', 
         questEntries 
      });

      
      
     
  } catch (error) {
      console.error("Error fetching user's quest entries:", error);
      res.status(500).render('errorPage', { message: 'Internal Server Error' });
  }
});


router
  .route("/" + module_slug + "")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllRecords);






module.exports = router;
