import Order from "../model/Order.js";
import { reduceStock, restoreStock } from "./product.js";

const validOrderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
const onlineMethods = ['Razorpay', 'Card', 'Online', 'Wallet', 'UPI', 'Netbanking'];

const buildOrderTimestamps = ({ orderStatus, paymentStatus, paymentMethod }) => {
  const timestamps = {};

  if (orderStatus === 'delivered') {
    timestamps.deliveredAt = new Date();
  }

  if (orderStatus === 'cancelled') {
    timestamps.cancelledAt = new Date();
  }

  if (paymentStatus === 'paid') {
    timestamps.paidAt = new Date();
  }

  if (paymentMethod === 'COD' && orderStatus === 'delivered') {
    timestamps.paymentStatus = 'paid';
    timestamps.paidAt = new Date();
  }

  return timestamps;
};

export const placeOrder = async (req, res, next) => {
  const userId = req.userId;
  const {
    id,
    total,
    paymentLabel,
    paymentMethod,
    paymentStatus,
    orderStatus,
    shipping,
    CartItems,
    razorpayPaymentId,
    razorpayOrderId,
  } = req.body;

  try {
    if (!id || !total || !paymentLabel || !paymentMethod || !shipping || !Array.isArray(CartItems) || CartItems.length === 0) {
      return res.status(400).json({ message: 'Order payload is incomplete.' });
    }

    // Check and reduce stock for all items before creating order
    for (const item of CartItems) {
      try {
        await reduceStock(item.ProductId, item.quantity);
      } catch (stockError) {
        return res.status(400).json({ 
          message: `Stock issue: ${stockError.message}`, 
          product: item.title 
        });
      }
    }

    const normalizedPaymentMethod = paymentMethod === 'cod' || paymentMethod === 'COD' ? 'COD' : paymentMethod;
    const normalizedOrderStatus = validOrderStatuses.includes(orderStatus) ? orderStatus : 'pending';
    const normalizedPaymentStatus = validPaymentStatuses.includes(paymentStatus)
      ? paymentStatus
      : onlineMethods.includes(normalizedPaymentMethod)
      ? 'paid'
      : 'pending';

    const orderData = {
      user: userId,
      id,
      total,
      paymentLabel,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: normalizedPaymentStatus,
      orderStatus: normalizedOrderStatus,
      razorpayPaymentId,
      razorpayOrderId,
      shipping,
      CartItems,
    };

    Object.assign(orderData, buildOrderTimestamps({
      orderStatus: normalizedOrderStatus,
      paymentStatus: normalizedPaymentStatus,
      paymentMethod: normalizedPaymentMethod,
    }));

    const order = new Order(orderData);
    await order.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const getUserOrders = async (req, res, next) => {
  const userId = req.userId;

  try {
    const orders = await Order.find({ user: userId }).sort({ placedAt: -1 });
    res.status(200).json({ message: 'Orders fetched successfully', orders });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};