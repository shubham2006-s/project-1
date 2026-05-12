import Product from "../model/Product.js";

export const getProducts = async (req, res, next) => {
    try {
        const { inStockOnly } = req.query;
        let filter = {};
        
        // Filter for in stock products if requested
        if (inStockOnly === 'true') {
            filter.stockStatus = 'in stock';
        }
        
        const products = await Product.find(filter).limit(20);
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};

export const getNewArrivals = async (req, res, next) => {
    try {
        const products = await Product.find({badge : "New"})
        res.status(200).json(products);
    }catch (error) {
        next(error);
    }  
}

export const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

// Check if product is in stock
export const checkStock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        const isAvailable = product.stock >= (quantity || 1);
        
        res.status(200).json({
            productId: id,
            available: isAvailable,
            stock: product.stock,
            stockStatus: product.stockStatus,
            requestedQuantity: quantity || 1
        });
    } catch (error) {
        next(error);
    }
};

// Reduce stock when order is placed
export const reduceStock = async (productId, quantity) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error("Product not found");
        }
        
        if (product.stock < quantity) {
            throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`);
        }
        
        product.stock -= quantity;
        await product.save();
        
        return product;
    } catch (error) {
        throw error;
    }
};

// Restore stock when order is cancelled
export const restoreStock = async (productId, quantity) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error("Product not found");
        }
        
        product.stock += quantity;
        await product.save();
        
        return product;
    } catch (error) {
        throw error;
    }
};

// Get products by stock status
export const getProductsByStockStatus = async (req, res, next) => {
    try {
        const { status } = req.params; // in stock, out of stock, low stock
        
        if (!['in stock', 'out of stock', 'low stock'].includes(status)) {
            return res.status(400).json({ message: "Invalid stock status" });
        }
        
        const products = await Product.find({ stockStatus: status });
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};

