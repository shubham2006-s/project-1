import express from "express";
import { isAdmin } from "../middleware/is-Admin.js";
import { isAuth } from "../middleware/is-Auth.js";
import * as adminController from "../controllers/admin.js";

const router = express.Router();

// Users management
router.get('/users', isAuth, isAdmin, adminController.getUsers);
router.get('/users/count', isAuth, isAdmin, adminController.getUserCount);
router.post('/users', isAuth, isAdmin, adminController.createUser);
router.put('/users/:id', isAuth, isAdmin, adminController.updateUser);
router.delete('/users/:id', isAuth, isAdmin, adminController.deleteUser);

// Products management
router.get('/products', isAuth, isAdmin, adminController.getProducts);
router.get('/products/count', isAuth, isAdmin, adminController.getProductCount);
router.post('/products', isAuth, isAdmin, adminController.createProduct);
router.put('/products/:id/stock', isAuth, isAdmin, adminController.updateProductStock);
router.put('/products/:id', isAuth, isAdmin, adminController.updateProduct);
router.delete('/products/:id', isAuth, isAdmin, adminController.deleteProduct);

// Orders management
router.get('/orders', isAuth, isAdmin, adminController.getOrders);
router.get('/orders/recent', isAuth, isAdmin, adminController.getRecentOrders);
router.get('/orders/count', isAuth, isAdmin, adminController.getOrderCount);
router.get('/orders/revenue', isAuth, isAdmin, adminController.getTotalRevenue);
router.get('/dashboard', isAuth, isAdmin, adminController.getDashboardMetrics);
router.put('/orders/:id/status', isAuth, isAdmin, adminController.updateOrderStatus);
router.put('/orders/:id/payment', isAuth, isAdmin, adminController.updatePaymentStatus);

export default router;