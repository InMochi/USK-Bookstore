import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import api from '../../api/axios';

const colors = [
  { bg: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-600', dot: 'bg-indigo-500' },
  { bg: 'bg-purple-50 border-purple-100', text: 'text-purple-600', dot: 'bg-purple-500' },
  { bg: 'bg-pink-50 border-pink-100', text: 'text-pink-600', dot: 'bg-pink-500' },
  { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-600', dot: 'bg-amber-500' },
  { bg: 'bg-teal-50 border-teal-100', text: 'text-teal-600', dot: 'bg-teal-500' },
  { bg: 'bg-green-50 border-green-100', text: 'text-green-600', dot: 'bg-green-500' },
  { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-600', dot: 'bg-blue-500' },
  { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-600', dot: 'bg-rose-500' },
];

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/category')
      .then((res) => {
        const payload = res.data?.data ?? res.data;
        const normalize = (p) => {
          if (!p) return [];
          if (Array.isArray(p)) return p;
          if (Array.isArray(p.data)) return p.data;
          return [p];
        };
        setCategories(normalize(payload));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Categories</h1>
          <p className="text-sm text-gray-400">
            {categories.length} categories available — klik untuk lihat buku
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">🏷️</p>
            <p className="text-sm">Belum ada category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => {
              const color = colors[i % colors.length];
              return (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  className={`border rounded-2xl p-5 hover:-translate-y-1 hover:shadow-md transition-all duration-200 group ${color.bg}`}
                >
                  <div className={`w-9 h-9 rounded-xl ${color.dot} flex items-center justify-center mb-4`}>
                    <span className="text-white text-sm">🏷️</span>
                  </div>
                  <p className={`font-medium text-sm mb-1.5 ${color.text}`}>
                    {cat.category_name}
                  </p>
                  <p className={`text-xs opacity-60 ${color.text}`}>
                    {cat.books_count ?? 0} buku
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}