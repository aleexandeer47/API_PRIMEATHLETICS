import express from "express"
import productReviewController from "../controllers/productsReviewController.js"

const router = express.Router();

router.route("/")
.get(productReviewController.getReviews)
.post(productReviewController.insertReviews)

router.route("/:id")
.put(productReviewController.updateReviews)
.delete(productReviewController.deleteReviews)
.get(productReviewController.getReviewById)

export default router