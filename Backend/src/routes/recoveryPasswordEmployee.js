import express from "express";
import recoveryPasswordEmployeeController from "../controllers/recoveryPasswordEmployeeController.js";

const router = express.Router();

router.route("/requestCode").post(recoveryPasswordEmployeeController.requestCode);
router.route("/verifyCode").post(recoveryPasswordEmployeeController.verifyCode);
router.route("/newPassword").post(recoveryPasswordEmployeeController.newPassword);

export default router;


