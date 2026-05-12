import express from "express";
import * as productController from "../controllers/product.js";

const router = express.Router();

router.get("/", productController.getProducts);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/stock-status/:status', productController.getProductsByStockStatus);
router.post("/:id/check-stock", productController.checkStock);
router.get("/:id", productController.getProductById);

export default router;