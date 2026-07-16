import express from "express";
import cartController from "../controllers/cartController.js";
import { protect, restrictTo } from "../../middlewares/authMiddleware.js"; // ajustá el path real

const router = express.Router();

router
  .route("/")
  .get(protect, restrictTo("admin", "employee"), cartController.getAllCarts)
  .post(protect, restrictTo("customer"), cartController.insertCart);

router
  .route("/:id")
  .put(protect, restrictTo("customer"), cartController.updateCart)
  .delete(protect, cartController.deleteCart)
  .get(protect, cartController.getCartById);

export default router;
