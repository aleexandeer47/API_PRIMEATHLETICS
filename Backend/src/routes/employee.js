import express from "express"
import employeController from "../controllers/employeesController.js"

const router = express.Router();

router.route("/")
.get(employeController.getEmployees)
.post(employeController.insertEmployee)

router.route("/:id")
.put(employeController.updateEmployee)
.delete(employeController.deleteEmployee)
.get(employeController.getEmployeeById)

export default router;