import express from "express";
import * as orderController from "../controllers/order.js";
import { isAuth } from "../middleware/is-Auth.js";

const router = express.Router();

router.post("/place", isAuth, orderController.placeOrder);
router.get("/", isAuth, orderController.getUserOrders);

export default router;