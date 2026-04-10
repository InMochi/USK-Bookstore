import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import api from '../../api/axios';

const PAYMENT_METHODS = [
  { id: 'transfer', label: 'Transfer Bank', icon: '🏦', desc: 'BCA, Mandiri, BNI, BRI' },
  { id: 'qris', label: 'QRIS', icon: '📱', desc: 'Scan QR dari aplikasi apapun' },
  { id: 'cash', label: 'Cash on Delivery', icon: '💵', desc: 'Bayar saat barang tiba' },
];

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!orderId) { navigate('/order'); return; }
    api.get(`/order/${orderId}`)
      .then((res) => setOrder(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId, navigate]);

  const handleSubmit = async () => {
    if (!selectedMethod) {
      setError('Pilih metode pembayaran dulu ya.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post(`/orders/${orderId}/payment`, {
        payment_method: selectedMethod,
        status: 'pending',
      });
      setSuccess(true);
    } catch (err) {
      const validation = err.response?.data?.errors;
      if (validation) {
        const firstKey = Object.keys(validation)[0];
        setError(validation[firstKey]?.[0] || 'Validasi gagal');
      } else {
        setError(err.response?.data?.message || 'Gagal membuat payment, coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto px-6 py-12 animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 rounded w-1/3" />
          <div className="h-32 bg-gray-100 rounded-2xl" />
          <div className="h-48 bg-gray-100 rounded-2xl" />
        </div>
      </MainLayout>
    );
  }

  if (success) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <div className="w-20 h-20 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            ⏳
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Submitted!</h2>
          <p className="text-gray-500 text-sm mb-2">
            Pembayaran kamu sedang menunggu konfirmasi dari admin.
          </p>
          <p className="text-gray-400 text-xs mb-8 max-w-xs mx-auto">
            Kamu akan mendapat notifikasi setelah admin memverifikasi pembayaran.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/"
              className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Belanja Lagi
            </Link>
            <Link
              to="/order"
              className="bg-[#1a1a2e] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#16213e] transition-colors"
            >
              Lihat Orders
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-lg mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Payment</h1>
          <p className="text-sm text-gray-400">Order #{orderId}</p>
        </div>

        {/* Order Summary */}
        {order && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">Order Summary</p>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Quantity</span>
                <span className="text-gray-900 font-medium">
                  {order.quantity} item{order.quantity !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Alamat</span>
                <span className="text-gray-900 font-medium truncate max-w-[200px] text-right">
                  {order.dest_address || '-'}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2.5 border-t border-gray-200">
                <span className="text-gray-500">Status</span>
                <span className="text-amber-600 capitalize font-medium">{order.status}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Pilih Metode Pembayaran</p>
          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                  selectedMethod === method.id
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{method.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${selectedMethod === method.id ? 'text-indigo-700' : 'text-gray-900'}`}>
                    {method.label}
                  </p>
                  <p className="text-xs text-gray-400">{method.desc}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedMethod === method.id ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                }`}>
                  {selectedMethod === method.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Info pending */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 flex gap-3 items-start">
          <span className="text-base mt-0.5">⏳</span>
          <p className="text-xs text-amber-700 leading-relaxed">
            Setelah submit, pembayaran akan diverifikasi oleh admin terlebih dahulu sebelum order diproses.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedMethod}
          className="w-full bg-[#1a1a2e] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#16213e] transition-colors disabled:opacity-50 mb-3"
        >
          {submitting ? 'Submitting...' : 'Confirm Payment'}
        </button>

        <Link
          to="/order"
          className="block text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Kembali ke Orders
        </Link>
      </div>
    </MainLayout>
  );
}