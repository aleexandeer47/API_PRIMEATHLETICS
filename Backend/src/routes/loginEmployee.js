import express from "express";
import loginEmployeController from "../controllers/loginEmployeeController.js";

const router = express.Router();

router.route("/").post(loginEmployeController.login);

export default router;


