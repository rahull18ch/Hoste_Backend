const express = require("express");
const router = express.Router();
const middleware=require("../middleware/middle")
const {dummy}=require("../controller/dumy")
const {singup,login,getTotalStudents}=require("../controller/create");
const {register_complain}=require("../controller/complain");
const {updateStatus,getStudentComplaintStatus,getAllComplaintStatsForAdmin,getAllStudentDetails,deleteStudent}=require("../controller/updatestatus")
const{delete_complain}=require("../controller/delete")
const {addAnnouncement,getAllAnnouncements}=require("../controller/add_annoucement")
const {getStudentComplaints,getAllComplaintsForAdmin }=require("../controller/getdetails");
const {ragChat}=require("../controller/chatContoller")

const { signupRequest, verifyAndRegister} = require("../controller/create");

router.post("/chat",ragChat); 
// get route  electrict

// New OTP-first registration routes
router.post("/signup-request", signupRequest);
router.post("/verify-register", verifyAndRegister);




router.get("/get/mycomplain",middleware,getStudentComplaints);
router.get("/admin/get/all_complain",middleware,getAllComplaintsForAdmin);
router.get("/admin/total_student",middleware,getTotalStudents);



router.post("/admin/add_annoucement",middleware,addAnnouncement)

router.get("/get/annoucment",middleware,getAllAnnouncements);

router.get("/admin/total_status",middleware,getAllComplaintStatsForAdmin);
router.delete("/admin/delete_user/:studentId",middleware,deleteStudent)







router.post("/complain",middleware,register_complain);



router.delete("/delete/complain/:complainId/:elementId",middleware,delete_complain);

router.put("/admin/update/:complainId/:elementId",middleware,updateStatus);
router.get("/student_status",middleware,getStudentComplaintStatus);
router.get("/admin/student_detail",middleware,getAllStudentDetails);




router.post("/signup",singup);

router.post("/login", login);
router.get("/d", dummy);









module.exports=router;