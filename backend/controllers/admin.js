import User from "../model/User.js";
import Product from "../model/Product.js";
import Order from "../model/Order.js";
import bcrypt from "bcryptjs";

const orderStatusValues = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentStatusValues = ['pending', 'paid', 'failed', 'refunded'];
const onlinePaymentMethods = ['Razorpay', 'Card', 'Online', 'Wallet', 'UPI', 'Netbanking'];

const sendError = (res, status, message, data = null) => {
  return res.status(status).json({ message, data });
};

const normalizePaymentMethod = (method) => {
  if (!method) return 'COD';
  const normalized = String(method).trim();
  return normalized.toUpperCase() === 'COD' ? 'COD' : normalized;
};

const normalizeOrderStatus = (status) => {
  return orderStatusValues.includes(status) ? status : 'pending';
};

const normalizePaymentStatus = (status, paymentMethod) => {
  const normalized = paymentStatusValues.includes(status) ? status : null;
  if (normalized) return normalized;
  return onlinePaymentMethods.includes(paymentMethod) ? 'paid' : 'pending';
};

const buildOrderTimestamps = ({ orderStatus, paymentStatus, paymentMethod }) => {
  const updates = {};

  if (orderStatus === 'delivered') {
    updates.deliveredAt = new Date();
  }

  if (orderStatus === 'cancelled') {
    updates.cancelledAt = new Date();
  }

  if (paymentStatus === 'paid') {
    updates.paidAt = new Date();
  }

  if (paymentMethod === 'COD' && orderStatus === 'delivered') {
    updates.paymentStatus = 'paid';
    updates.paidAt = new Date();
  }

  return updates;
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const getUserCount = async (req, res, next) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user count' });
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email || !role) {
      return sendError(res, 400, 'Name, email, and role are required.');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    ).select('-password');

    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return sendError(res, 404, 'User not found.');
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email || !role) {
      return sendError(res, 400, 'Name, email, and role are required.');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'A user with this email already exists.');
    }

    const rawPassword = password && password.trim().length > 0 ? password : 'ChangeMe123!';
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    const user = new User({
      name,
      email,
      role,
      password: hashedPassword,
    });

    await user.save();
    const createdUser = user.toObject();
    delete createdUser.password;

    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
};

export const getProductCount = async (req, res, next) => {
  try {
    const count = await Product.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product count' });
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product' });
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return sendError(res, 404, 'Product not found.');
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
};

export const updateProductStock = async (req, res, next) => {
  try {
    const { stock } = req.body;
    
    if (stock === undefined || stock === null) {
      return sendError(res, 400, 'Stock quantity is required.');
    }

    if (typeof stock !== 'number' || stock < 0) {
      return sendError(res, 400, 'Stock must be a non-negative number.');
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return sendError(res, 404, 'Product not found.');
    }

    product.stock = stock;
    await product.save();

    res.json({
      message: 'Product stock updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({ message: 'Error updating product stock' });
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return sendError(res, 404, 'Product not found.');
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10);
    const { status, paymentStatus } = req.query;

    const queryFilter = {};
    if (status && orderStatusValues.includes(status)) {
      queryFilter.orderStatus = status;
    }
    if (paymentStatus && paymentStatusValues.includes(paymentStatus)) {
      queryFilter.paymentStatus = paymentStatus;
    }

    const query = Order.find(queryFilter)
      .populate('user', 'name email')
      .sort({ placedAt: -1 });

    if (!Number.isNaN(limit) && limit > 0) {
      query.limit(limit);
    }

    const orders = await query;
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders', data: error.message });
  }
};

export const getRecentOrders = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 6;
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ placedAt: -1 })
      .limit(limit);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching recent orders', data: error.message });
  }
};

export const getOrderCount = async (req, res, next) => {
  try {
    const count = await Order.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order count' });
  }
};

export const getTotalRevenue = async (req, res, next) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { paymentStatus: 'paid' },
                { $and: [{ paymentMethod: 'COD' }, { orderStatus: 'delivered' }] },
              ],
            },
            { orderStatus: { $ne: 'cancelled' } },
            { paymentStatus: { $ne: 'failed' } },
          ],
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const revenue = result.length > 0 ? result[0].total : 0;
    res.json({ revenue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching revenue', data: error.message });
  }
};

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenueResult, orderStatusBreakdown, paymentStatusBreakdown] =
      await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([
          {
            $match: {
              $and: [
                {
                  $or: [
                    { paymentStatus: 'paid' },
                    { $and: [{ paymentMethod: 'COD' }, { orderStatus: 'delivered' }] },
                  ],
                },
                { orderStatus: { $ne: 'cancelled' } },
                { paymentStatus: { $ne: 'failed' } },
              ],
            },
          },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
        Order.aggregate([{ $group: { _id: '$paymentStatus', count: { $sum: 1 } } }]),
      ]);

    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: revenue,
      orderStatusBreakdown,
      paymentStatusBreakdown,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching dashboard metrics', data: error.message });
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    if (!orderStatusValues.includes(orderStatus)) {
      return sendError(res, 400, 'Invalid orderStatus value.');
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return sendError(res, 404, 'Order not found.');
    }

    const updates = { orderStatus };

    if (orderStatus === 'delivered') {
      updates.deliveredAt = new Date();
      if (order.paymentMethod === 'COD') {
        updates.paymentStatus = 'paid';
        updates.paidAt = new Date();
      }
    }

    if (orderStatus === 'cancelled') {
      updates.cancelledAt = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating order status', data: error.message });
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, razorpayPaymentId, razorpayOrderId } = req.body;
    if (!paymentStatusValues.includes(paymentStatus)) {
      return sendError(res, 400, 'Invalid paymentStatus value.');
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return sendError(res, 404, 'Order not found.');
    }

    const updates = { paymentStatus };

    if (paymentStatus === 'paid') {
      updates.paidAt = new Date();
    }

    if (paymentStatus === 'failed') {
      updates.paidAt = undefined;
    }

    if (paymentStatus === 'refunded') {
      updates.orderStatus = 'cancelled';
      updates.cancelledAt = new Date();
    }

    if (order.orderStatus === 'delivered' && order.paymentMethod === 'COD') {
      updates.paymentStatus = 'paid';
      updates.paidAt = new Date();
    }

    if (razorpayPaymentId) {
      updates.razorpayPaymentId = razorpayPaymentId;
    }
    if (razorpayOrderId) {
      updates.razorpayOrderId = razorpayOrderId;
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating payment status', data: error.message });
  }
};