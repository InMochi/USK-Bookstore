import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const getImageUrl = (img) => {
    if (!img) return null;
    try {
      const base = api.defaults.baseURL?.replace(/\/api\/?$/i, '') || '';
      if (/^https?:\/\//i.test(img)) return img;
      return `${base}/storage/${img}`;
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      return img;
    }
  };

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMsg, setCartMsg] = useState('');
  const [qty, setQty] = useState(1); // ← tambah state qty

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await api.get(`/book/${id}`);
        let payload = res.data?.data ?? res.data;
        if (payload && payload.data && Array.isArray(payload.data)) payload = payload.data[0];
        if (Array.isArray(payload)) payload = payload[0];
        if (payload) {
          if (payload.book_id && !payload.id) payload.id = payload.book_id;
          if (payload.harga != null && payload.price == null) payload.price = payload.harga;
          if (payload.stok != null && payload.stock == null) payload.stock = payload.stok;
        }
        setBook(payload);
      } catch {
        console.error('Failed to fetch book details');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const stockVal = Number(book?.stock ?? book?.stok ?? 0);
  const priceVal = Number(book?.price ?? book?.harga ?? 0);

  const handleQtyChange = (val) => {
    const next = Math.max(1, Math.min(stockVal, val));
    setQty(next);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setAddingToCart(true);
    setCartMsg('');
    try {
      await api.post(`/books/${id}/cart`, {
        total_books: qty,
        total_price: priceVal * qty,
      });
      setCartMsg('success');
    } catch {
      setCartMsg('error');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex gap-10 animate-pulse">
            <div className="w-64 aspect-[3/4] bg-gray-100 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-4 pt-4">
              <div className="h-5 bg-gray-100 rounded w-1/4" />
              <div className="h-8 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!book) {
    return (
      <MainLayout>
        <div className="text-center py-32 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>Book not found</p>
          <Link to="/" className="text-indigo-500 text-sm mt-4 inline-block">Back to home</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link to="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <span className="text-gray-700">{book.title}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Cover */}
          <div className="flex-shrink-0">
            <div className="w-56 aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-sm">
              {book.image ? (
                <img src={getImageUrl(book.image)} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">📖</div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <p className="text-indigo-500 text-sm font-medium mb-2">{book.genre || 'General'}</p>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">{book.title}</h1>
            <p className="text-gray-500 text-sm mb-1">Edition: {book.edition || '-'}</p>
            {book.author && (
              <p className="text-gray-500 text-sm mb-6">
                by <span className="text-gray-700 font-medium">{book.author?.name}</span>
              </p>
            )}

            {/* Price & Stock */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-semibold text-gray-900">
                Rp {priceVal ? priceVal.toLocaleString('id-ID') : '-'}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                stockVal > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
              }`}>
                {stockVal > 0 ? `${stockVal} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Quantity Selector */}
            {stockVal > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Quantity</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleQtyChange(qty - 1)}
                      disabled={qty <= 1}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 text-lg"
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-sm font-medium text-gray-900">
                      {qty}
                    </span>
                    <button
                      onClick={() => handleQtyChange(qty + 1)}
                      disabled={qty >= stockVal}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 text-lg"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">maks. {stockVal}</span>

                  {/* Subtotal */}
                  {qty > 1 && (
                    <span className="text-sm text-gray-500">
                      = <span className="font-semibold text-gray-900">
                          Rp {(priceVal * qty).toLocaleString('id-ID')}
                        </span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Status feedback */}
            {cartMsg === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-lg mb-4">
                {qty} buku berhasil ditambahkan ke cart! 🎉{' '}
                <Link to="/cart" className="underline font-medium">Lihat cart</Link>
              </div>
            )}
            {cartMsg === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-3 rounded-lg mb-4">
                Gagal menambahkan ke cart. Coba lagi.
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || stockVal === 0}
                className="bg-[#1a1a2e] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#16213e] transition-colors disabled:opacity-50"
              >
                {addingToCart ? 'Adding...' : `Add to Cart${qty > 1 ? ` (${qty})` : ''}`}
              </button>
              <Link
                to="/"
                className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Back
              </Link>
            </div>

            {/* Extra Info */}
            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-0.5">Publication Date</p>
                <p className="text-gray-700">{book.publication_date || '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">Status</p>
                <p className="text-gray-700 capitalize">{book.status || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}