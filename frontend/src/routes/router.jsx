import { createBrowserRouter } from 'react-router-dom'
import Login from '../components/Auth/Login'
import Signup from '../components/Auth/Signup'
import ForgotPassword from '../components/Auth/ForgotPassword'
import App from '../App'
import Home from '../components/Home/Home'
import AuthGuard from '../layout/AuthGuard'
import ProductDetails from '../components/products/ProductDetails'
import NewArrivalsPage from '../components/newArrivals/NewArrivalsPage'
import Deals from '../components/deals/Deals'
import Cart from '../components/cart/Cart'
import Checkout from '../components/checkout/Checkout'
import Orders from '../components/orders/Orders'
import Profile from '../components/profile/Profile'
import Wishlist from '../components/wishlist/Wishlist'
import Help from '../components/help/Help'
import AdminGuard from '../layout/AdminGuard'
import AdminDashboard from '../components/admin/AdminDashboard'
import AdminUsers from '../components/admin/AdminUsers'
import AdminProducts from '../components/admin/AdminProducts'
import AdminOrders from '../components/admin/AdminOrders'
import AdminAnalytics from '../components/admin/AdminAnalytics'
import AdminInventory from '../components/admin/AdminInventory'
import AdminCoupons from '../components/admin/AdminCoupons'
import AdminSettings from '../components/admin/AdminSettings'
import { AdminDarkModeProvider } from '../context/AdminDarkModeContext.jsx'
import PrivateRoute from '../layout/PrivateRoute'
import ErrorPage from '../components/error/ErrorPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthGuard>
        <App />
      </AuthGuard>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: 'product/:id',
        element: <ProductDetails />,
      },
      {
        path: 'new-arrivals',
        element: <NewArrivalsPage />,
      },
      {
        path: "deals",
        element: <Deals />
      },
      {
        path: 'cart',
        element: <Cart />,
      },
      {
        path: 'wishlist',
        element: <Wishlist />,
      },
      {
        path: 'checkout',
        element: <Checkout />,
      },
      {
        path: 'orders',
        element: <Orders />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'help',
        element: <Help />,
      },
    ]
  },
  {
    path: '/admin',
    element: (
      <AuthGuard>
        <AdminGuard>
          <AdminDarkModeProvider>
            <AdminDashboard />
          </AdminDarkModeProvider>
        </AdminGuard>
      </AuthGuard>
    ),
    children: [
      {
        path: 'users',
        element: <AdminUsers />,
      },
      {
        path: 'products',
        element: <AdminProducts />,
      },
      {
        path: 'orders',
        element: <AdminOrders />,
      },
      {
        path: 'analytics',
        element: <AdminAnalytics />,
      },
      {
        path: 'inventory',
        element: <AdminInventory />,
      },
      {
        path: 'coupons',
        element: <AdminCoupons />,
      },
      {
        path: 'settings',
        element: <AdminSettings />,
      },
    ]
  },
  {
    path: 'login',
    element: <Login />
  },
  {
    path: 'signup',
    element: <Signup />,
  },
  {
    path: 'forgot-password',
    element: <ForgotPassword />,
  }
])

