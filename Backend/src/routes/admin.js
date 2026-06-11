import express from "express";
import adminController from "../controllers/adminsController.js"
import { protect, restrictTo } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, restrictTo("admin"));

router.route("/")
.get(adminController.getAdmins)

router.route("/:id")
.get(adminController.getAdminById)
.delete(adminController.deleteAdmin)
.put(adminController.updateAdmin);

export default router;