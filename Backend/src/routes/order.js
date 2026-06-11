import express from "express"
import ordersController from "../controllers/ordersController.js"
import { protect, restrictTo } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/")
.get(protect, ordersController.getOrders)
.post(protect, ordersController.insertOrder)

router.route("/:id")
.put(protect, restrictTo("admin", "employee"), ordersController.updateOrder)
.delete(protect, restrictTo("admin"), ordersController.deleteOrder)
.get(protect, ordersController.getOrderById)

export default router