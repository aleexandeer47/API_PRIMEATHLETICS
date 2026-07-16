import express from "express";
import productReviewController from "../controllers/productsReviewController.js";
import { protect } from "../../middlewares/authMiddleware.js"; // ajustá el path real

const router = express.Router();

router
  .route("/")
  .get(productReviewController.getReviews)
  .post(protect, productReviewController.insertReviews);

router
  .route("/:id")
  .put(protect, productReviewController.updateReviews)
  .delete(protect, productReviewController.deleteReviews)
  .get(productReviewController.getReviewById);

export default router;
