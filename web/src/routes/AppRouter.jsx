import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import MainLayout from '../components/layouts/MainLayout';
import ManagePaymentPage from '../pages/admin/ManagePaymentPage';
import ManageUserPage from '../pages/admin/ManageUserPage';
import ManageOrderAdminPage from '../pages/admin/ManageOrderAdminPage';
import AboutPage from '../pages/public/AboutPage';
import CategoryDetailPage from '../pages/public/CategoryDetailPage';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

import HomePage from '../pages/public/HomePage';
import BookDetailPage from '../pages/public/BookDetailPage';
import AuthorPage from '../pages/public/AuthorPage';
import CategoryPage from '../pages/public/CategoryPage';
import AuthorDetailPage from '../pages/public/AuthorDetailPage';

import CartPage from '../pages/user/CartPage';
import OrderPage from '../pages/user/OrderPage';
import PaymentPage from '../pages/user/PaymentPage';
import ProfilePage from '../pages/user/ProfilePage';

import ManageBookPage from '../pages/admin/ManageBookPage';
import ManageAuthorPage from '../pages/admin/ManageAuthorPage';
import ManageCategoryPage from '../pages/admin/ManageCategoryPage';

// Loading screen kecil
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoadingUser } = useAuthStore();
  if (isLoadingUser) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, isLoadingUser } = useAuthStore();
  if (isLoadingUser) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/" />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoadingUser } = useAuthStore();
  if (isLoadingUser) return <LoadingScreen />;
  return !isAuthenticated ? children : <Navigate to="/" />;
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        
        <Route path="/" element={<MainLayout> <HomePage/> </MainLayout>} />
        <Route path="/book/:id" element={<BookDetailPage />} />
        <Route path="/author" element={<AuthorPage />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/author/:id" element={<AuthorDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/category/:id" element={<CategoryDetailPage />} />

        {/* Guest Only */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* User Protected */}
        <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
        <Route path="/order" element={<PrivateRoute><OrderPage /></PrivateRoute>} />
        <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin/books" element={<AdminRoute><ManageBookPage /></AdminRoute>} />
        <Route path="/admin/authors" element={<AdminRoute><ManageAuthorPage /></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><ManageCategoryPage /></AdminRoute>} />
        <Route path="/admin/payments" element={<AdminRoute><ManagePaymentPage /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><ManageUserPage /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><ManageOrderAdminPage /></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}