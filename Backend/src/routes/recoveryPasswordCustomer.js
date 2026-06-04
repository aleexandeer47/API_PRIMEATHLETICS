import express from "express";
import recoveryPasswordCustomerController from "../controllers/recoveryPasswordCustomerController.js";

const router = express.Router();

router.route("/requestCode").post(recoveryPasswordCustomerController.requestCode);
router.route("/verifyCode").post(recoveryPasswordCustomerController.verifyCode);
router.route("/newPassword").post(recoveryPasswordCustomerController.newPassword);

export default router;


