import express from "express";
import customerController from "../controllers/customerController.js"
import { protect, restrictTo } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/")
.get(protect, restrictTo("admin", "employee"), customerController.getCustomers)

router.route("/:id")
.put(protect, customerController.updateCustomer)
.delete(protect, restrictTo("admin"), customerController.deleteCustomer)
.get(protect, customerController.getCustomerById)

export default router;