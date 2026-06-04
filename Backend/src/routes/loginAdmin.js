import express from "express";
import loginAdminsController from "../controllers/loginAdminController.js";

const router = express.Router();

router.route("/").post(loginAdminsController.login);

export default router;


