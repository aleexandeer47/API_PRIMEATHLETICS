import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protect, restrictTo } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/stats").get(restrictTo("admin", "employee"), getDashboardStats);

export default router;
