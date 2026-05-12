import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import {
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Menu,
  X,
  ArrowUp,
  ArrowDown,
  Home,
  BarChart3,
  Bell,
  User,
  Search,
  Sun,
  Moon,
  LayoutDashboard,
  Package as PackageIcon,
  ClipboardList,
  Users as UsersIcon,
  TrendingUp,
  Archive,
  Ticket,
  Settings as SettingsIcon,
  ChevronDown
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAdminDarkMode } from '../../context/AdminDarkModeContext';
import API from '../../util/api';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { darkMode, setDarkMode } = useAdminDarkMode();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    userGrowth: 5.2,
    orderGrowth: 12.5,
    revenueGrowth: 8.3
  });

  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const revenueData = {
    weekly: [
      { name: 'Mon', revenue: 12450 },
      { name: 'Tue', revenue: 15820 },
      { name: 'Wed', revenue: 13700 },
      { name: 'Thu', revenue: 18900 },
      { name: 'Fri', revenue: 21400 },
      { name: 'Sat', revenue: 23700 },
      { name: 'Sun', revenue: 19500 }
    ],
    monthly: [
      { name: 'Jan', revenue: 39000 },
      { name: 'Feb', revenue: 45000 },
      { name: 'Mar', revenue: 52000 },
      { name: 'Apr', revenue: 47000 },
      { name: 'May', revenue: 61000 },
      { name: 'Jun', revenue: 69000 },
      { name: 'Jul', revenue: 72000 },
      { name: 'Aug', revenue: 68000 },
      { name: 'Sep', revenue: 74000 },
      { name: 'Oct', revenue: 81000 },
      { name: 'Nov', revenue: 86000 },
      { name: 'Dec', revenue: 92000 }
    ],
    yearly: [
      { name: '2021', revenue: 410000 },
      { name: '2022', revenue: 520000 },
      { name: '2023', revenue: 630000 },
      { name: '2024', revenue: 720000 }
    ]
  };

  const analyticsCards = [
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      trend: '+12.4%',
      direction: 'up',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-500',
      darkGradient: 'from-emerald-600 to-teal-600'
    },
    {
      title: 'Orders',
      value: `${stats.totalOrders}`,
      trend: '+8.9%',
      direction: 'up',
      icon: ClipboardList,
      gradient: 'from-sky-500 to-blue-600',
      darkGradient: 'from-sky-600 to-blue-700'
    },
    {
      title: 'Customers',
      value: `${stats.totalUsers}`,
      trend: '+6.1%',
      direction: 'up',
      icon: Users,
      gradient: 'from-violet-500 to-fuchsia-500',
      darkGradient: 'from-violet-600 to-fuchsia-600'
    },
    {
      title: 'Products',
      value: `${stats.totalProducts}`,
      trend: '+3.2%',
      direction: 'up',
      icon: Package,
      gradient: 'from-orange-500 to-rose-500',
      darkGradient: 'from-orange-600 to-rose-600'
    }
  ];

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, productsRes, ordersRes, revenueRes, recentRes] = await Promise.all([
        API.get('/api/admin/users/count'),
        API.get('/api/admin/products/count'),
        API.get('/api/admin/orders/count'),
        API.get('/api/admin/orders/revenue'),
        API.get('/api/admin/orders?limit=6')
      ]);

      setStats({
        totalUsers: usersRes.data.count,
        totalProducts: productsRes.data.count,
        totalOrders: ordersRes.data.count,
        totalRevenue: revenueRes.data.revenue || 0,
        userGrowth: 5.2,
        orderGrowth: 12.5,
        revenueGrowth: 8.3
      });

      const recent = Array.isArray(recentRes.data) ? recentRes.data : [];
      setRecentOrders(
        recent.map((order) => ({
          customer: order.user?.name || order.shipping?.fullName || 'Guest',
          product: order.CartItems?.[0]?.title || 'Order item',
          orderId: order.id || `#${order._id?.slice(-8)}`,
          date: order.placedAt ? new Date(order.placedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
          status: order.orderStatus || order.status || 'processing',
          amount: order.total != null ? `$${order.total.toLocaleString()}` : '$0',
          rawOrder: order
        }))
      );
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products', icon: PackageIcon },
    { path: '/admin/orders', label: 'Orders', icon: ClipboardList },
    { path: '/admin/users', label: 'Customers', icon: UsersIcon },
    //{ path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/admin/inventory', label: 'Inventory', icon: Archive },
    //{ path: '/admin/coupons', label: 'Coupons', icon: Ticket },
    //{ path: '/admin/settings', label: 'Settings', icon: SettingsIcon }
  ];

  return (
    <div className={`min-h-screen flex overflow-hidden ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-linear-to-br from-slate-100 via-slate-50 to-white text-slate-900'}`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 rounded-r-[1.75rem] border-r ${darkMode ? 'bg-slate-950/95 border-white/10 shadow-2xl' : 'bg-white/90 border-slate-200 shadow-2xl'} backdrop-blur-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:h-screen`}>
        <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/20">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-slate-950'}`}>ShopNow</h2>
              <p className="text-sm text-slate-400">Premium admin</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-8 space-y-2 px-3">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${location.pathname === item.path ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold">
            <Home className="w-5 h-5" />
            Go to Shop
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-72">
        {/* Header */}
        <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-md border-b`}>
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className={`lg:hidden ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>Welcome back to your admin panel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search..."
                  className={`pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfile(false);
                  }}
                  className={`relative p-2 rounded-lg ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="p-4">
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No new notifications</p>
                    </div>
                  </div>
                )}
              </div>
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfile(!showProfile);
                    setShowNotifications(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                >
                  <User className="w-5 h-5" />
                  <ChevronDown className="w-4 h-4" />
                </button>
                {/* Profile Dropdown */}
                {showProfile && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          localStorage.removeItem("token");
                          localStorage.removeItem("user");
                          localStorage.removeItem("userId");

                          navigate("/login");
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm rounded ${darkMode
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
          {location.pathname === '/admin' ? (
            <>
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.2, delay: index * 0.08, repeat: Infinity }}
                      className={`rounded-3xl p-6 shadow-2xl transition-transform duration-300 bg-white/10 border border-white/10 animate-pulse ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100/80 border-slate-200'}`}
                    >
                      <div className="h-5 w-1/3 rounded-full bg-slate-400/20 mb-5" />
                      <div className="h-12 w-3/4 rounded-full bg-slate-400/20 mb-6" />
                      <div className="h-10 w-full rounded-2xl bg-slate-400/15" />
                    </motion.div>
                  ))
                ) : (
                  analyticsCards.map((card, index) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: index * 0.08 }}
                      className={`group overflow-hidden rounded-3xl p-6 shadow-2xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl bg-linear-to-br ${darkMode ? card.darkGradient : card.gradient}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80">{card.title}</p>
                          <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg shadow-black/10">
                          <card.icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-6 flex items-center justify-between gap-2 rounded-3xl bg-white/10 p-4 text-sm text-white/85 backdrop-blur">
                        <span className="font-medium">Trend</span>
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 font-semibold ${card.direction === 'up' ? 'bg-white/15 text-emerald-100' : 'bg-white/15 text-rose-100'}`}>
                          {card.direction === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                          {card.trend}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Charts and Tables Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart Card */}
                <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-3xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                      <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Revenue Analytics</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>Track revenue performance by period</p>
                    </div>
                    <div className={`rounded-full inline-flex overflow-hidden shadow-sm ${darkMode ? 'border border-gray-700 bg-gray-900/80' : 'border border-gray-200 bg-white'}`}>
                      {['weekly', 'monthly', 'yearly'].map((period) => (
                        <button
                          key={period}
                          onClick={() => setSelectedPeriod(period)}
                          className={`px-4 py-2 text-sm font-semibold transition-colors ${selectedPeriod === period ? (darkMode ? 'bg-white text-gray-900' : 'bg-slate-900 text-white') : (darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100')}`}
                        >
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={`rounded-4xl p-4 ${darkMode ? 'bg-gray-900/80' : 'bg-slate-50'} border ${darkMode ? 'border-gray-700' : 'border-transparent'}`}>
                    {isLoading ? (
                      <div className={`h-80 rounded-3xl ${darkMode ? 'bg-slate-900/80' : 'bg-slate-100'} animate-pulse`} />
                    ) : (
                      <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={revenueData[selectedPeriod]} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.08} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke={darkMode ? '#334155' : '#e2e8f0'} strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: darkMode ? '#cbd5e1' : '#475569' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: darkMode ? '#cbd5e1' : '#475569' }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                              borderColor: darkMode ? '#334155' : '#e2e8f0',
                              borderRadius: 18,
                              boxShadow: darkMode ? '0 10px 35px rgba(15, 23, 42, 0.35)' : '0 10px 30px rgba(15, 23, 42, 0.12)'
                            }}
                            labelStyle={{ color: darkMode ? '#94a3b8' : '#475569', fontWeight: 700 }}
                            itemStyle={{ color: darkMode ? '#fff' : '#0f172a' }}
                            formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={3} fill="url(#revenueGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border`}>
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Quick Actions</h3>
                  <div className="space-y-3">
                    <Link
                      to="/admin/products"
                      className={`block px-4 py-3 ${darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'} rounded-lg font-semibold transition-colors`}
                    >
                      + Add Product
                    </Link>
                    <Link
                      to="/admin/customers"
                      className={`block px-4 py-3 ${darkMode ? 'bg-purple-900/20 text-purple-400 hover:bg-purple-900/30' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'} rounded-lg font-semibold transition-colors`}
                    >
                      + Add Customer
                    </Link>
                    <Link
                      to="/admin/orders"
                      className={`block px-4 py-3 ${darkMode ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30' : 'bg-green-50 text-green-600 hover:bg-green-100'} rounded-lg font-semibold transition-colors`}
                    >
                      View Orders
                    </Link>
                    <button
                      onClick={() => navigate('/')}
                      className={`w-full px-4 py-3 ${darkMode ? 'bg-orange-900/20 text-orange-400 hover:bg-orange-900/30' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'} rounded-lg font-semibold transition-colors`}
                    >
                      Go to Shop
                    </button>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className={`mt-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow-md p-6 border`}>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatusItem label="Database" status="Active" color="green" darkMode={darkMode} />
                  <StatusItem label="API Server" status="Running" color="green" darkMode={darkMode} />
                  <StatusItem label="Payment Gateway" status="Connected" color="green" darkMode={darkMode} />
                </div>
              </div>

              {/* Recent Orders */}
              <div className={`mt-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-3xl shadow-md p-6 border`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div>
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Orders</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Latest ecommerce order activity</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold ${darkMode ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'}`}>Updated just now</span>
                </div>
                <div className={`overflow-x-auto rounded-3xl ${darkMode ? 'border border-gray-700 bg-gray-900/80' : 'border border-gray-200 bg-white'}`}>
                  {isLoading ? (
                    <div className="space-y-4 p-6">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className={`rounded-3xl p-4 ${darkMode ? 'bg-slate-900/90' : 'bg-slate-100'} animate-pulse`}>
                          <div className="flex flex-col gap-3">
                            <div className="h-4 w-3/5 rounded-full bg-slate-500/20" />
                            <div className="h-3 w-full rounded-full bg-slate-500/15" />
                            <div className="grid grid-cols-2 gap-4">
                              <div className="h-3 rounded-full bg-slate-500/15" />
                              <div className="h-3 rounded-full bg-slate-500/15" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                        <PackageIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>No recent orders yet</h4>
                        <p className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>New orders will appear here as they come in.</p>
                      </div>
                      <button className="mt-4 rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-600">Review inventory</button>
                    </div>
                  ) : (
                    <>
                      <table className="min-w-full border-separate border-spacing-y-2 text-left">
                        <thead>
                          <tr className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                            <th className="px-5 py-3">Customer</th>
                            <th className="px-5 py-3">Product</th>
                            <th className="px-5 py-3">Order ID</th>
                            <th className="px-5 py-3">Date</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3">Amount</th>
                            <th className="px-5 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map((order) => (
                            <tr key={order.orderId} className={`rounded-3xl transition-all duration-200 ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
                              <td className={`px-5 py-4 font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{order.customer}</td>
                              <td className={`px-5 py-4 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{order.product}</td>
                              <td className={`px-5 py-4 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{order.orderId}</td>
                              <td className={`px-5 py-4 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{order.date}</td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${order.status === 'delivered' ? (darkMode ? 'bg-emerald-500/15 text-emerald-200' : 'bg-emerald-50 text-emerald-700') : order.status === 'shipped' ? (darkMode ? 'bg-sky-500/15 text-sky-200' : 'bg-sky-50 text-sky-700') : order.status === 'processing' ? (darkMode ? 'bg-amber-500/15 text-amber-200' : 'bg-amber-50 text-amber-700') : order.status === 'cancelled' ? (darkMode ? 'bg-rose-500/15 text-rose-200' : 'bg-rose-50 text-rose-700') : (darkMode ? 'bg-slate-500/15 text-slate-200' : 'bg-slate-100 text-slate-700')}`}>{order.status}</span>
                              </td>
                              <td className={`px-5 py-4 text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{order.amount}</td>
                              <td className="px-5 py-4 text-right">
                                <button
                                  onClick={() => setSelectedOrder(order.rawOrder)}
                                  className={`text-sm font-semibold transition-colors ${darkMode ? 'text-sky-300 hover:text-white' : 'text-sky-600 hover:text-sky-800'}`}
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              </div>
              {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
                  <div className="w-full max-w-3xl overflow-hidden rounded-4xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white">Order Details</h3>
                        <p className="text-sm text-slate-400 mt-1">{selectedOrder.user?.name || selectedOrder.shipping?.fullName || 'Guest'}</p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="rounded-full bg-slate-800 p-3 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                      >
                        Close
                      </button>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-3xl bg-slate-900/80 p-4">
                          <p className="text-sm text-slate-400">Order ID</p>
                          <p className="mt-2 text-lg font-semibold text-white">{selectedOrder.id || selectedOrder._id}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-900/80 p-4">
                          <p className="text-sm text-slate-400">Placed At</p>
                          <p className="mt-2 text-lg font-semibold text-white">{selectedOrder.placedAt ? new Date(selectedOrder.placedAt).toLocaleString() : 'Unknown'}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-900/80 p-4">
                          <p className="text-sm text-slate-400">Status</p>
                          <p className="mt-2 inline-flex rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-white">{selectedOrder.orderStatus || selectedOrder.status}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-3xl bg-slate-900/80 p-4">
                          <p className="text-sm text-slate-400">Total</p>
                          <p className="mt-2 text-lg font-semibold text-white">${selectedOrder.total?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-900/80 p-4">
                          <p className="text-sm text-slate-400">Customer Email</p>
                          <p className="mt-2 text-lg font-semibold text-white">{selectedOrder.user?.email || selectedOrder.shipping?.email || 'N/A'}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-900/80 p-4">
                          <p className="text-sm text-slate-400">Shipping</p>
                          <p className="mt-2 text-white">{selectedOrder.shipping?.address || 'No address provided'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-3xl bg-slate-900/80 p-6">
                      <h4 className="text-xl font-semibold text-white mb-4">Items</h4>
                      <div className="space-y-4">
                        {selectedOrder.CartItems?.length ? (
                          selectedOrder.CartItems.map((item, index) => (
                            <div key={index} className="rounded-3xl bg-slate-950/80 p-4">
                              <div className="flex items-center gap-4">
                                {item.image && <img src={item.image} alt={item.title} className="h-16 w-16 rounded-2xl object-cover" />}
                                <div className="flex-1">
                                  <p className="font-semibold text-white">{item.title}</p>
                                  <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
                                  <p className="text-sm text-slate-400">Price: ${item.price}</p>
                                </div>
                                <p className="font-semibold text-white">${(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-400">No items available for this order.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, growth, color, darkMode }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue',
    green: 'from-green-500 to-green-600 text-green',
    orange: 'from-orange-500 to-orange-600 text-orange',
    purple: 'from-purple-500 to-purple-600 text-purple'
  };

  const bgClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
  };

  const growthColor = growth > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const growthIcon = growth > 0 ? ArrowUp : ArrowDown;

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 ${growthColor} text-sm font-semibold`}>
          <span>{growth}%</span>
          <growthIcon className="w-4 h-4" />
        </div>
      </div>
      <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>{title}</p>
      <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
};

const ProgressBar = ({ label, percentage, color, darkMode }) => {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
        <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{percentage}%</span>
      </div>
      <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
        <div
          className={`h-2 rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const StatusItem = ({ label, status, color, darkMode }) => {
  const statusColors = {
    green: 'text-green-400 bg-green-900/20 dark:text-green-400 dark:bg-green-900/20',
    yellow: 'text-yellow-400 bg-yellow-900/20 dark:text-yellow-400 dark:bg-yellow-900/20',
    red: 'text-red-400 bg-red-900/20 dark:text-red-400 dark:bg-red-900/20'
  };

  return (
    <div className={`flex items-center justify-between p-4 ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} rounded-lg transition-colors`}>
      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[color]}`}>
        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${color === 'green' ? 'bg-green-400' : color === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
        {status}
      </div>
    </div>
  );
};

export default AdminDashboard;


