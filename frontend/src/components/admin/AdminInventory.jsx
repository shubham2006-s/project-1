import React, { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp, Package, ShoppingCart, Clock } from 'lucide-react';
import API from '../../util/api';
import { useToast } from '../../context/ToastContext';
import { useAdminDarkMode } from '../../context/AdminDarkModeContext';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, in-stock, low-stock, out-of-stock
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStock, setEditingStock] = useState(null);
  const [newStockValue, setNewStockValue] = useState('');
  const { darkMode } = useAdminDarkMode();
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalStockValue: 0
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/admin/products');
      const allProducts = Array.isArray(response.data) ? response.data : response.data.products || [];
      setProducts(allProducts);
      calculateStats(allProducts);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (productList) => {
    const stats = {
      totalProducts: productList.length,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      totalStockValue: 0
    };

    productList.forEach(product => {
      if (product.stock === 0) {
        stats.outOfStock++;
      } else if (product.stock <= (product.lowStockThreshold || 5)) {
        stats.lowStock++;
      } else {
        stats.inStock++;
      }
      stats.totalStockValue += (product.stock || 0) * (product.price || 0);
    });

    setStats(stats);
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      if (newStock === '' || newStock === null || newStock === undefined){
        alert('Please enter a stock value');
        return;
      }

      const stockValue = parseInt(newStock);
      if (isNaN(stockValue) || stockValue < 0) {
        showToast({
          title: 'Invalid Stock Value',
          description: 'Please enter a valid non-negative number for stock.',
          variant: 'error'
        })
        return;
      }

      // Call API to update stock
      const response = await API.put(`/api/admin/products/${productId}/stock`, {
        stock: stockValue
      });

      console.log('Stock update response:', response);

      // Update local state
      const updatedProducts = products.map(p =>
        p._id === productId ? { ...p, stock: stockValue } : p
      );
      setProducts(updatedProducts);
      calculateStats(updatedProducts);
      setEditingStock(null);
      showToast({
        title: 'Stock Updated',
        description: 'Product stock has been updated successfully.',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      console.error('Error response:', error.response);
      showToast({
        title: 'Failed to Update Stock',
        description: 'Failed to update product stock.',
        variant: 'error'
      });
    }
  };

  const getStockBadgeColor = (product) => {
    if (product.stock === 0) {
      return 'bg-red-100 text-red-800 border-red-300';
    } else if (product.stock <= (product.lowStockThreshold || 5)) {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  const getStockStatusText = (product) => {
    if (product.stock === 0) {
      return '✕ Out of Stock';
    } else if (product.stock <= (product.lowStockThreshold || 5)) {
      return '⚠ Low Stock';
    }
    return '✓ In Stock';
  };

  const getFilteredProducts = () => {
    let filtered = products;

    if (filter !== 'all') {
      filtered = filtered.filter(p => {
        if (filter === 'in-stock') return p.stock > (p.lowStockThreshold || 5);
        if (filter === 'low-stock') return p.stock > 0 && p.stock <= (p.lowStockThreshold || 5);
        if (filter === 'out-of-stock') return p.stock === 0;
        return true;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500" />
      </div>
    );
  }

  const filteredProducts = getFilteredProducts();

  return (
    <div className={`space-y-6 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Total Products</p>
              <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-gray-100' : 'text-slate-900'}`}>{stats.totalProducts}</p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900 bg-opacity-50' : 'bg-blue-100'}`}>
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`rounded-2xl shadow-lg p-6 border-l-4 border-emerald-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>In Stock</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.inStock}</p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-emerald-900 bg-opacity-50' : 'bg-emerald-100'}`}>
              <ShoppingCart className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className={`rounded-2xl shadow-lg p-6 border-l-4 border-amber-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Low Stock</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{stats.lowStock}</p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-amber-900 bg-opacity-50' : 'bg-amber-100'}`}>
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className={`rounded-2xl shadow-lg p-6 border-l-4 border-red-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Out of Stock</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.outOfStock}</p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900 bg-opacity-50' : 'bg-red-100'}`}>
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className={`rounded-3xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-gray-100' : 'text-slate-900'}`}>Inventory Management</h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Manage product stock and availability.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by product name or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-slate-300 text-slate-900'}`}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-slate-300 text-slate-900'}`}
          >
            <option value="all">All Products</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        {/* Table */}
        <div className={`overflow-x-auto rounded-2xl border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-slate-200 bg-slate-50'}`}>
          <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-slate-200'} text-left`}>
            <thead className={darkMode ? 'bg-gray-700' : 'bg-slate-100'}>
              <tr>
                <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Product</th>
                <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Brand</th>
                <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Price</th>
                <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Stock</th>
                <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Status</th>
                <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700 bg-gray-800' : 'divide-slate-200 bg-white'}`}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id} className={`transition-colors duration-150 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image && (
                          <img src={product.image} alt={product.title} className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-slate-900'}`}>{product.title}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>{product.brand}</td>
                    <td className={`px-6 py-4 font-semibold ${darkMode ? 'text-gray-100' : 'text-slate-900'}`}>₹{product.price}</td>
                    <td className="px-6 py-4">
                      {editingStock === product._id ? (
                        <input
                          type="number"
                          value={newStockValue}
                          onChange={(e) => setNewStockValue(e.target.value)}
                          className={`w-20 px-2 py-1 border border-blue-500 rounded-lg focus:outline-none ${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-slate-900'}`}
                          min="0"
                        />
                      ) : (
                        <span className={`font-bold ${darkMode ? 'text-gray-100' : 'text-slate-900'}`}>{product.stock || 0}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStockBadgeColor(product)}`}>
                        {getStockStatusText(product)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingStock === product._id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateStock(product._id, newStockValue)}
                            className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingStock(null)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-slate-300 text-slate-700 hover:bg-slate-400'}`}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingStock(product._id);
                            setNewStockValue(product.stock || 0);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={`px-6 py-8 text-center ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
