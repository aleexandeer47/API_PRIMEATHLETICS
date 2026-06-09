import express from "express";
import productController from "../controllers/productsController.js";
import { uploadImageTo } from "../utils/cloudinaryConfig.js";

const router = express.Router();

const uploadProducts = uploadImageTo("products");

// CRUD de productos
router
  .route("/")
  .get(productController.getProducts)
  .post(uploadProducts.array("images", 20), productController.insertProducts);

router.route("/searchByName").post(productController.getProductByName);

router.route("/low-stock").get(productController.getLowStock);

router.route("/price-range").post(productController.getProductsByPriceRange);

router.route("/count").get(productController.countProducts);

router
  .route("/:id")
  .get(productController.getProductById)
  .put(productController.updateProducts)
  .delete(productController.deleteProducts);

router.put(
  "/:id/variants/:color/image",
  uploadProducts.single("image"),
  productController.updateVariantImage,
);

export default router;
