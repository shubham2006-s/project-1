import mongoose from "mongoose";

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  paymentLabel: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Razorpay', 'Card', 'Online', 'Wallet', 'UPI', 'Netbanking'],
    required: true,
    default: 'COD',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paidAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  razorpayPaymentId: String,
  razorpayOrderId: String,
  placedAt: {
    type: Date,
    default: Date.now,
  },
  shipping: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pin: String,
  },
  CartItems: [
    {
      ProductId: String,
      title: String,
      image: String,
      quantity: Number,
      price: Number,
      color: String,
      size: String,
    },
  ],
});

export default mongoose.model('Order', orderSchema);