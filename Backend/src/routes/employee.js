import express from "express"
import employeController from "../controllers/employeesController.js"
import { protect, restrictTo } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
.get(restrictTo("admin", "employee"), employeController.getEmployees)

router.route("/:id")
.put(restrictTo("admin", "employee"), employeController.updateEmployee)
.delete(restrictTo("admin"), employeController.deleteEmployee)
.get(restrictTo("admin", "employee"), employeController.getEmployeeById)

export default router;