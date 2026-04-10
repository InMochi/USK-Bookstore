import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';

const navItems = [
  { path: '/admin/books', label: 'Books', icon: '📚' },
  { path: '/admin/authors', label: 'Authors', icon: '✍️' },
  { path: '/admin/categories', label: 'Categories', icon: '🏷️' },
  { path: '/admin/payments', label: 'Payments', icon: '💳' },
  { path: '/admin/orders', label: 'Orders', icon: '📋' },  
  { path: '/admin/users', label: 'Users', icon: '👥' }, 
];

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    navigate('/login');
  };

  

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-[#1a1a2e] flex flex-col transition-all duration-200 flex-shrink-0`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          {!collapsed && (
            <Link to="/" className="text-white font-semibold text-sm">BookStore</Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white/50 hover:text-white transition-colors ml-auto"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-indigo-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-3">
          {!collapsed && (
            <p className="text-white/40 text-xs px-2 mb-2 truncate">{user?.name}</p>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm w-full"
          >
            <span className="flex-shrink-0">🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}