import express from "express";
import adminController from "../controllers/adminsController.js"

const router = express.Router();

router.route("/")
.get(adminController.getAdmins)

router.route("/:id")
.get(adminController.getAdminById)
.delete(adminController.deleteAdmin)
.put(adminController.updateAdmin);


export default router;