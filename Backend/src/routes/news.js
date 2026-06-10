import { Router } from "express";
import newsController from "../controllers/newsController.js";
import { uploadImageTo } from "../utils/cloudinaryConfig.js";

const router = Router();

const uploadNews = uploadImageTo("News");

// Crear novedad
router.post(
  "/",
  uploadNews.fields([
    { name: "banner", maxCount: 1 },
    { name: "card", maxCount: 1 }
  ]),
  newsController.createNews
);

// Consultas especiales
router.get("/featured/banner", newsController.getFeaturedNews);
router.get("/recent/collaborations", newsController.getRecentCollaborations);
router.get("/upcoming/releases", newsController.getUpcomingReleases);

// CRUD
router.get("/", newsController.getAllNews);
router.get("/:id", newsController.getNewsById);

router.put(
  "/:id",
  uploadNews.fields([
    { name: "banner", maxCount: 1 },
    { name: "card", maxCount: 1 }
  ]),
  newsController.updateNews
);

router.patch("/:id/status", newsController.changeStatus);

router.delete("/:id", newsController.deleteNews);

export default router;