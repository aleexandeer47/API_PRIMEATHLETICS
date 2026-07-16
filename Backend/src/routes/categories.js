import express from "express";
import categoriesController from "../controllers/categoriesController.js";

const router = express.Router();

router.route("/menu").get(categoriesController.getMenu);

export default router;
