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
import PrivateRoute from '../layout/PrivateRoute'


export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthGuard>
        <App />
      </AuthGuard>
    ),
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
  }, {
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

