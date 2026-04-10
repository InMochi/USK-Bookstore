import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

function BookCard({ book }) {
  const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMsg, setCartMsg] = useState('');

  const imageSrc = book.image
    ? (book.image.startsWith('http')
      ? book.image
      : `${API_URL}/storage/${book.image.replace(/^\/+/, '')}`)
    : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    setAddingToCart(true);
    setCartMsg('');
    try {
      const qty = 1;
      const price = Number(book?.price ?? 0);
      await api.post(`/books/${book.id}/cart`, {
        total_books: qty,
        total_price: price * qty,
      });
      setCartMsg('success');
      setTimeout(() => setCartMsg(''), 2000);
    } catch {
      setCartMsg('error');
      setTimeout(() => setCartMsg(''), 2000);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <Link
      to={`/book/${book.id}`}
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📖</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
          {book.title} 
        </h3>
         <hr></hr>
        <h4 className='font-medium text-gray-900 text-sm leading-tight line-clamp-2 mb-1'>
          Selengkapnya
        </h4>
        <p className="text-xs text-gray-400 mb-3">{book.edition || ''}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-gray-900 text-sm">
            Rp {Number(book.price).toLocaleString('id-ID')}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            book.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
          }`}>
            {book.stock > 0 ? 'In stock' : 'Habis'}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={addingToCart || book.stock === 0}
          className={`w-full py-2 rounded-lg text-xs font-medium transition-colors ${
            cartMsg === 'success'
              ? 'bg-green-50 text-green-600'
              : cartMsg === 'error'
              ? 'bg-red-50 text-red-500'
              : 'bg-[#1a1a2e] text-white hover:bg-[#16213e] disabled:opacity-50'
          }`}
        >
          {addingToCart ? 'Adding...' : cartMsg === 'success' ? '✓ Added!' : cartMsg === 'error' ? 'Gagal' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}

export default function CategoryDetailPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/category/details/${id}`)
      .then((res) => setCategory(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto px-6 py-12 animate-pulse">
          <div className="h-5 bg-gray-100 rounded w-1/4 mb-8" />
          <div className="h-28 bg-gray-100 rounded-2xl mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl aspect-[3/4]" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!category) {
    return (
      <MainLayout>
        <div className="text-center py-32 text-gray-400">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="text-sm">Category not found</p>
          <Link to="/category" className="text-indigo-500 text-sm mt-4 inline-block">
            Back to categories
          </Link>
        </div>
      </MainLayout>
    );
  }

  const books = category.books || [];

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link to="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <Link to="/category" className="hover:text-gray-600">Categories</Link>
          <span>/</span>
          <span className="text-gray-700">{category.category_name}</span>
        </div>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🏷️</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                {category.category_name}
              </h1>
              <p className="text-sm text-gray-400">
                {books.length} buku dalam kategori ini
              </p>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {books.length > 0 ? (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-5">
              Buku dalam kategori ini
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">Belum ada buku dalam kategori ini</p>
          </div>
        )}

        <div className="mt-10">
          <Link to="/category" className="text-sm text-indigo-500 hover:text-indigo-600 transition-colors">
            ← Back to all categories
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}