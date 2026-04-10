import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import api from '../../api/axios';
import useCartStore from '../../store/cartStore';

function CartItem({ item, onDelete }) {
  const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
  const [deleting, setDeleting] = useState(false);

  const imageSrc = item.book?.image
    ? (item.book.image.startsWith('http')
      ? item.book.image
      : `${API_URL}/storage/${item.book.image.replace(/^\/+/, '')}`)
    : null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/cart/${item.id}`);
      onDelete(item.id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0">
      <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {imageSrc ? (
          <img src={imageSrc} alt={item.book?.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">📖</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 text-sm mb-0.5 truncate">{item.book?.title}</h3>
        <p className="text-xs text-gray-400 mb-3">{item.book?.edition || ''}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
              Qty: {item.total_books}
            </span>
            <span className="font-semibold text-gray-900 text-sm">
              Rp {Number(item.total_price).toLocaleString('id-ID')}
            </span>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 border border-red-100 hover:border-red-300 px-2.5 py-1.5 rounded-lg"
          >
            {deleting ? 'Removing...' : '✕ Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(null);
  const [error, setError] = useState('');
  const { setCartItems } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/cart')
      .then((res) => {
        const payload = res.data?.data ?? res.data;
        const normalize = (p) => {
          if (!p) return [];
          if (Array.isArray(p)) return p;
          if (Array.isArray(p.data)) return p.data;
          return [p];
        };
        const normalized = normalize(payload);
        setCarts(normalized);
        setCartItems(normalized);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    const updated = carts.filter((c) => c.id !== id);
    setCarts(updated);
    setCartItems(updated);
  };

  const handleCheckoutAll = async () => {
    setCheckingOut('all');
    setError('');
    try {
      const cartIds = carts.map((c) => c.id);

      await api.post('/orders/bulk', {
        cart_ids: cartIds,
        order_date: new Date().toISOString().slice(0, 10),
        dest_address: '-',
        status: 'pending',
      });

      navigate('/order');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Gagal checkout, coba lagi.'
      );
    } finally {
      setCheckingOut(null);
    }
  };

  const totalAll = carts.reduce((sum, c) => sum + Number(c.total_price), 0);
  const totalQty = carts.reduce((sum, c) => sum + Number(c.total_books ?? 1), 0);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Your Cart</h1>
            <p className="text-sm text-gray-400">
              {carts.length} item{carts.length !== 1 ? 's' : ''} in cart
            </p>
          </div>
          {carts.length > 0 && (
            <Link to="/" className="text-sm text-indigo-500 hover:text-indigo-600 transition-colors">
              + Add more books
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl px-6 space-y-4 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 py-3 animate-pulse">
                  <div className="w-16 h-20 bg-gray-100 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:w-72 bg-gray-100 rounded-2xl h-48 animate-pulse" />
          </div>
        ) : carts.length === 0 ? (
          <div className="text-center py-32 text-gray-400">
            <p className="text-6xl mb-4">🛒</p>
            <p className="text-base font-medium text-gray-500 mb-2">Your cart is empty</p>
            <p className="text-sm mb-6">Looks like you haven't added any books yet.</p>
            <Link
              to="/"
              className="inline-block bg-[#1a1a2e] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#16213e] transition-colors"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cart Items */}
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl px-6">
              {carts.map((item) => (
                <CartItem key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>

            {/* Summary */}
            <div className="lg:w-72">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-20">
                <h2 className="text-sm font-medium text-gray-900 mb-4">Order Summary</h2>

                {/* Per item breakdown */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                  {carts.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-gray-500">
                      <span className="truncate max-w-[150px]">{item.book?.title}</span>
                      <span className="flex-shrink-0 ml-2">
                        Rp {Number(item.total_price).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total qty + price */}
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Total qty</span>
                  <span>{totalQty} buku</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-gray-900 mb-2">
                  <span>Total</span>
                  <span>Rp {totalAll.toLocaleString('id-ID')}</span>
                </div>

                <p className="text-xs text-gray-400 mb-5">
                  Semua item jadi 1 order • Isi alamat di halaman berikutnya
                </p>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-500 text-xs px-3 py-2.5 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCheckoutAll}
                  disabled={checkingOut !== null}
                  className="w-full bg-[#1a1a2e] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#16213e] transition-colors disabled:opacity-50"
                >
                  {checkingOut ? 'Processing...' : `Checkout (${carts.length} item${carts.length !== 1 ? 's' : ''})`}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  Kamu akan mengisi alamat pengiriman di halaman berikutnya
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}