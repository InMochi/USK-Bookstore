import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const responseData = res.data;

      const token = responseData.token || responseData.data?.token;

      let user = null;
      if (responseData.user) {
        user = responseData.user;
      } else if (responseData.data?.user) {
        user = responseData.data.user;
      } else if (responseData.data && !responseData.data.token) {

        user = responseData.data;
      }

      if (user && token) {
        setAuth(user, token);
        
        setTimeout(() => navigate('/'), 10);
      } else {
        console.error("Data tidak lengkap:", { user, token });
        setError("Data login tidak lengkap dari server.");
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal, coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-8">Sign in to your account</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1a2e] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#16213e] transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-500 hover:text-indigo-600">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}