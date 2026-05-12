import mongoose from "mongoose";

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    mrp: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    reviews: {
        type: Number,
        required: true,
        default: 0
    },
    badge: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    stockStatus: {
        type: String,
        enum: ['in stock', 'out of stock', 'low stock'],
        default: 'in stock'
    },
    lowStockThreshold: {
        type: Number,
        default: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update stockStatus based on stock quantity
productSchema.pre('save', function() {
    if (this.stock === 0) {
        this.stockStatus = 'out of stock';
    } else if (this.stock <= this.lowStockThreshold) {
        this.stockStatus = 'low stock';
    } else {
        this.stockStatus = 'in stock';
    }
});

export default mongoose.model('Product', productSchema);