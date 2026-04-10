import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      // 
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
  <nav className="bg-[#1a1a2e] text-white px-6 py-3 flex items-center gap-8 sticky top-0 z-50">
    <Link to="/" className="font-semibold text-lg tracking-tight shrink-0">
      BookStore
    </Link>

    <div className="flex items-center gap-6 text-sm text-white/70 flex-1">
      <Link to="/" className="hover:text-white transition-colors">Home</Link>
      <Link to="/author" className="hover:text-white transition-colors">Authors</Link>
      <Link to="/category" className="hover:text-white transition-colors">Categories</Link>
      <Link to="/about" className="hover:text-white transition-colors">About</Link>
    </div>

    <div className="flex items-center gap-3 text-sm ml-auto">
      {isAuthenticated ? (
        <>
          {user?.role === 'admin' && (
            <Link to="/admin/books" className="hover:text-white/70 transition-colors">
              Admin
            </Link>
          )}
          <Link to="/cart" className="hover:text-white/70 transition-colors">
            Cart
          </Link>
          <span className="text-white/50">|</span>
          <Link to="/profile" className="text-white/70 hover:text-white transition-colors">
            {user?.name}
          </Link>
          <button
            onClick={handleLogout}
            className="border border-white/30 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="border border-white/30 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-indigo-500 px-3 py-1.5 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Register
          </Link>
        </>
      )}
    </div>
  </nav>
  );
}