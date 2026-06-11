import express from "express";
import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/auth/verify
router.get("/verify", protect, (req, res) => {
  return res.status(200).json({
    message: "Sesión activa",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.userType, // 'admin', 'customer', 'employee'
    },
  });
});

export default router;
