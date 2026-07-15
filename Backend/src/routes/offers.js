import express from "express";
import offerController from "../controllers/offersController.js";
import { uploadImageTo } from "../utils/cloudinaryConfig.js";

const router = express.Router();

const uploadOffers = uploadImageTo("offers");

router
  .route("/")
  .get(offerController.getOffers)
  .post(uploadOffers.single("banner"), offerController.insertOffer);

router.route("/searchByName").post(offerController.getOfferByName);

router
  .route("/:id")
  .put(offerController.updateOffer)
  .delete(offerController.deleteOffer);

router.put(
  "/:id/banner",
  uploadOffers.single("banner"),
  offerController.updateOfferBanner
);

export default router;