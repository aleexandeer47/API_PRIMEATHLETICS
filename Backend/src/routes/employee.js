import express from "express"
import employeController from "../controllers/employeesController.js"

const router = express.Router();

router.route("/")
.get(employeController.getEmployees)

router.route("/:id")
.put(employeController.updateEmployee)
.delete(employeController.deleteEmployee)
.get(employeController.getEmployeeById)

export default router;