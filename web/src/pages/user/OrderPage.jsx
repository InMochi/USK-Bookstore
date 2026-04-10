import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import api from '../../api/axios';

const statusColor = {
  pending: 'bg-amber-50 text-amber-600 border-amber-100',
  processing: 'bg-blue-50 text-blue-600 border-blue-100',
  completed: 'bg-green-50 text-green-600 border-green-100',
  cancelled: 'bg-red-50 text-red-500 border-red-100',
};

const statusIcon = {
  pending: '⏳',
  processing: '📦',
  completed: '✅',
  cancelled: '✕',
};

const statusDesc = {
  pending: 'Menunggu pembayaran',
  processing: 'Sedang diproses',
  completed: 'Pesanan selesai',
  cancelled: 'Pesanan dibatalkan',
};

function AddressModal({ order, onClose, onSaved }) {
  const [address, setAddress] = useState(
    order.dest_address === '-' ? '' : order.dest_address || ''
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!address.trim()) {
      setError('Alamat tidak boleh kosong.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.patch(`/order/${order.id}`, { dest_address: address });
      onSaved(order.id, address);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan alamat.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-base font-medium text-gray-900 mb-1">Alamat Pengiriman</h2>
        <p className="text-xs text-gray-400 mb-5">Order #{order.id}</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <textarea
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Masukkan alamat lengkap pengiriman..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition resize-none mb-5"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#1a1a2e] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#16213e] transition-colors disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Alamat'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addressModal, setAddressModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/order')
      .then((res) => {
        const payload = res.data?.data ?? res.data;
        const normalize = (p) => {
          if (!p) return [];
          if (Array.isArray(p)) return p;
          if (Array.isArray(p.data)) return p.data;
          return [p];
        };
        setOrders(normalize(payload));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddressSaved = (orderId, newAddress) => {
    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, dest_address: newAddress } : o)
    );
  };

  const handlePayNow = (order) => {
    // Cek address dulu sebelum pay
    if (!order.dest_address || order.dest_address === '-') {
      setAddressModal(order);
      return;
    }
    navigate(`/payment?order_id=${order.id}`);
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const processingCount = orders.filter((o) => o.status === 'processing').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;

  const needsAddress = (order) =>
    order.status === 'pending' && (!order.dest_address || order.dest_address === '-');

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">My Orders</h1>
            <p className="text-sm text-gray-400">
              {orders.length} order{orders.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Link to="/" className="text-sm text-indigo-500 hover:text-indigo-600 transition-colors">
            + Shop more
          </Link>
        </div>

        {/* Stats bar */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Waiting Payment', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
              { label: 'Processing', value: processingCount, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
              { label: 'Completed', value: completedCount, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
            ].map((stat) => (
              <div key={stat.label} className={`border rounded-xl p-4 ${stat.bg}`}>
                <p className={`text-xl font-semibold mb-0.5 ${stat.color}`}>{stat.value}</p>
                <p className={`text-xs ${stat.color} opacity-80`}>{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-36 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-32 text-gray-400">
            <p className="text-6xl mb-4">📋</p>
            <p className="text-base font-medium text-gray-500 mb-2">No orders yet</p>
            <p className="text-sm mb-6">Mulai belanja dan order pertamamu!</p>
            <Link
              to="/"
              className="inline-block bg-[#1a1a2e] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#16213e] transition-colors"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-sm transition-shadow"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base border ${statusColor[order.status] || statusColor.pending}`}>
                      {statusIcon[order.status] || '⏳'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.order_date || order.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border capitalize font-medium ${statusColor[order.status] || statusColor.pending}`}>
                    {order.status}
                  </span>
                </div>

                {/* Detail row */}
                <div className="grid grid-cols-3 gap-4 text-sm py-4 border-t border-b border-gray-100 mb-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Quantity</p>
                    <p className="text-gray-800 font-medium">
                      {order.quantity} item{order.quantity !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Alamat</p>
                    {needsAddress(order) ? (
                      <button
                        onClick={() => setAddressModal(order)}
                        className="text-xs text-indigo-500 hover:text-indigo-700 underline underline-offset-2"
                      >
                        + Isi alamat
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <p className="text-gray-800 font-medium text-xs truncate">{order.dest_address}</p>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => setAddressModal(order)}
                            className="text-gray-400 hover:text-indigo-500 transition-colors flex-shrink-0 text-xs"
                          >
                            ✎
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Info</p>
                    <p className="text-xs font-medium capitalize text-gray-500">
                      {statusDesc[order.status] || '-'}
                    </p>
                  </div>
                </div>

                {/* Action */}
                {order.status === 'pending' && (
                  needsAddress(order) ? (
                    <button
                      onClick={() => setAddressModal(order)}
                      className="w-full border-2 border-dashed border-amber-300 text-amber-600 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-50 transition-colors"
                    >
                      ⚠️ Isi alamat pengiriman dulu
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePayNow(order)}
                      className="w-full bg-[#1a1a2e] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#16213e] transition-colors"
                    >
                      Pay Now →
                    </button>
                  )
                )}

                {order.status !== 'pending' && (
                  <div className={`text-center text-xs py-1 font-medium ${
                    statusColor[order.status]?.split(' ')[1] || 'text-gray-400'
                  }`}>
                    {statusIcon[order.status]} {statusDesc[order.status]}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address Modal */}
      {addressModal && (
        <AddressModal
          order={addressModal}
          onClose={() => setAddressModal(null)}
          onSaved={handleAddressSaved}
        />
      )}
    </MainLayout>
  );
}