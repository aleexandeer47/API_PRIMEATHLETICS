import express from "express";
import suppliersController from "../controllers/supliersController.js";
import { protect, restrictTo } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, restrictTo("admin", "employee"));

router.route("/")
    .get(suppliersController.getSuppliers)
    .post(suppliersController.insertSupplier);

router.route("/:id")
    .put(suppliersController.updateSupplier)
    .delete(suppliersController.deleteSupplier)
    .get(suppliersController.getSupplierById);

export default router;
