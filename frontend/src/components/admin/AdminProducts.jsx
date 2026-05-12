import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useAdminDarkMode } from '../../context/AdminDarkModeContext';
import API from '../../util/api';
const AdminProducts = () => {
    const { darkMode } = useAdminDarkMode();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        brand: '',
        category: '',
        price: '',
        mrp: '',
        rating: '',
        reviews: '',
        badge: '',
        image: ''
    });
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await API.get('/api/admin/products');
            console.log(response.data);
            setProducts(Array.isArray(response.data)
                ? response.data
                : response.data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);

        setFormData({
            title: product.title || '',
            brand: product.brand || '',
            category: product.category || '',
            price: product.price || '',
            mrp: product.mrp || '',
            rating: product.rating || '',
            reviews: product.reviews || '',
            badge: product.badge || '',
            image: product.image || ''
        });
    };

    const handleSave = async () => {
        try {
            if (editingProduct) {
                await API.put(`/api/admin/products/${editingProduct._id}`, formData);
                setEditingProduct(null);
            } else {
                await API.post('/api/admin/products', formData);
                setShowAddForm(false);
            }
            setFormData({
                title: '',
                brand: '',
                category: '',
                price: '',
                mrp: '',
                rating: '',
                reviews: '',
                badge: '',
                image: ''
            });
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await API.delete(`/api/admin/products/${productId}`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div></div>;

    return (
        <div className={`${darkMode ? 'bg-gray-800 dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Products Management</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
                >
                    <FaPlus className="mr-2" />
                    Add Product
                </button>
            </div>

            {(showAddForm || editingProduct) && (
                <div className={`mb-6 p-4 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={`border rounded px-3 py-2 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />

                        <input
                            type="text"
                            placeholder="Brand"
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            className={`border rounded px-3 py-2 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />

                        <input
                            type="text"
                            placeholder="Category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className={`border rounded px-3 py-2 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />

                        <input
                            type="number"
                            placeholder="Price"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className={`border rounded px-3 py-2 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />

                        <input
                            type="number"
                            placeholder="MRP"
                            value={formData.mrp}
                            onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                            className={`border rounded px-3 py-2 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />

                        <input
                            type="number"
                            step="0.1"
                            placeholder="Rating"
                            value={formData.rating}
                            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                            className={`border rounded px-3 py-2 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />

                        <input
                            type="number"
                            placeholder="Reviews"
                            value={formData.reviews}
                            onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                            className={`border rounded px-3 py-2 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />

                        <input
                            type="text"
                            placeholder="Badge"
                            value={formData.badge}
                            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                            className={`border rounded px-3 py-2 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />

                        <input
                            type="text"
                            placeholder="Image URL"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            className={`border rounded px-3 py-2 md:col-span-2 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                    </div>
                    <div className="mt-4 flex space-x-2">
                        <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                            {editingProduct ? 'Update' : 'Add'} Product
                        </button>
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setEditingProduct(null);
                                setFormData({
                                    title: '',
                                    brand: '',
                                    category: '',
                                    price: '',
                                    mrp: '',
                                    rating: '',
                                    reviews: '',
                                    badge: '',
                                    image: ''
                                });
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className={`overflow-x-auto rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <table className="min-w-full table-auto">
                    <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <tr>
                            <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Image</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Name</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Category</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Price</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Brand</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {products.map((product) => (
                            <tr key={product._id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <img src={product.image} alt={product.title} className="w-12 h-12 object-cover rounded" />
                                </td>
                                <td className={`px-4 py-4 whitespace-nowrap font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.title}</td>
                                <td className={`px-4 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{product.category}</td>
                                <td className={`px-4 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>${product.price}</td>
                                <td className={`px-4 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{product.brand}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleEdit(product)} className={`${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-900'}`}>
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(product._id)} className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProducts;