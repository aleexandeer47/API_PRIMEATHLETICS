import express from "express";
import suppliers from "../controllers/supliersController.js";

const router = express.Router();

router.route("/")
    .get(suppliers.getSuppliers)
    .post(suppliers.insertSupplier);

router.route("/:id")
    .put(suppliers.updateSupplier)
    .delete(suppliers.deleteSupplier)
    .get(suppliers.getSupplierById);

export default router;
