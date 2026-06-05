import express from 'express';
import registerAdminController from '../controllers/registerAdminController.js';

const router = express.Router();

router.route("/").post(registerAdminController.register);
router.route("/verifyCodeEmail").post(registerAdminController.verifyCode);

export default router; 