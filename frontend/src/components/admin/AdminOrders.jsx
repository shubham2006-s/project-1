import React, { useState, useEffect } from 'react';
import { FaEye, FaTimes } from 'react-icons/fa';
import { useAdminDarkMode } from '../../context/AdminDarkModeContext';
import API from '../../util/api';

const badgeClasses = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-sky-100 text-sky-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
  paid: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-rose-100 text-rose-800',
};

const AdminOrders = () => {
  const { darkMode } = useAdminDarkMode();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await API.get('/api/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/api/admin/orders/${orderId}/status`, { orderStatus: newStatus });
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((order) => order.orderStatus === statusFilter);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className={`rounded-lg shadow-md p-6 border ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Orders Management</h2>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage order lifecycle and payment status for your store.</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`w-full max-w-xs border rounded px-3 py-2 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className={`overflow-x-auto rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <table className="min-w-full table-auto border-separate border-spacing-y-2">
          <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-2xl`}>
            <tr>
              <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>Order</th>
              <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>Customer</th>
              <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>Date</th>
              <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>Payment</th>
              <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>Order Status</th>
              <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>Actions</th>
            </tr>
          </thead>
          <tbody className={`${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
            {filteredOrders.map((order) => (
              <tr key={order._id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}>
                <td className={`px-4 py-4 whitespace-nowrap font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{order._id.slice(-8)}</td>
                <td className={`px-4 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{order.user?.name || 'Guest'}</td>
                <td className={`px-4 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{new Date(order.placedAt).toLocaleDateString()}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${badgeClasses[order.paymentStatus] || (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800')}`}>
                    {order.paymentStatus || 'pending'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`border rounded px-2 py-1 text-sm font-medium ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className={`${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-900'}`}
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className={`fixed inset-0 ${darkMode ? 'bg-black/60' : 'bg-black/40'} flex items-center justify-center z-50 p-4`}>
          <div className={`rounded-3xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:border-gray-700'}`}>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Order Details</h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Order #{selectedOrder._id.slice(-8)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className={`rounded-full p-2 transition ${darkMode ? 'bg-gray-700 text-slate-300 hover:bg-gray-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className={`rounded-3xl border p-4 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-slate-200 bg-white'}`}>
                <p className={`text-xs uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Payment method</p>
                <p className={`mt-2 font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedOrder.paymentMethod || 'COD'}</p>
                <p className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{selectedOrder.paymentLabel}</p>
              </div>
              <div className={`rounded-3xl border p-4 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-slate-200 bg-white'}`}>
                <p className={`text-xs uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Order total</p>
                <p className={`mt-2 text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-950'}`}>${selectedOrder.total}</p>
                <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses[selectedOrder.paymentStatus] || (darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-800')}`}>
                  {selectedOrder.paymentStatus || 'pending'}
                </span>
              </div>
            </div>

            <div className={`mt-5 rounded-3xl border p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={`text-xs uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Status</p>
                  <p className={`mt-2 text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedOrder.orderStatus}</p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses[selectedOrder.orderStatus] || (darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-800')}`}>
                  {selectedOrder.orderStatus}
                </span>
              </div>
            </div>

            {selectedOrder.shipping && (
              <div className={`mt-5 rounded-3xl border p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-slate-200'}`}>
                <p className={`text-xs uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Shipping address</p>
                <p className={`mt-2 font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedOrder.shipping.fullName}</p>
                <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{selectedOrder.shipping.address}</p>
                <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {selectedOrder.shipping.city}, {selectedOrder.shipping.state} {selectedOrder.shipping.pin}
                </p>
                <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{selectedOrder.shipping.phone}</p>
              </div>
            )}

            <div className={`mt-5 rounded-3xl border p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-slate-200'}`}>
              <p className={`text-xs uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Ordered items</p>
              <div className="mt-4 space-y-3">
                {selectedOrder.CartItems?.map((item, index) => (
                  <div key={index} className={`flex flex-wrap items-center gap-4 rounded-3xl p-3 shadow-sm ${darkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-100'}`}>
                    <div className={`h-16 w-16 overflow-hidden rounded-2xl ${darkMode ? 'bg-gray-600' : 'bg-slate-100'}`}>
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className={`grid h-full place-items-center text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No image</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Qty {item.quantity}</p>
                      {item.color && <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Color: {item.color}</p>}
                      {item.size && <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Size: {item.size}</p>}
                    </div>
                    <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;