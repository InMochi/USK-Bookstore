import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
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

export default function ManageOrderAdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

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

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">All Orders</h1>
        <p className="text-sm text-gray-400">{orders.length} total orders</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'processing', label: 'Processing' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filterStatus === tab.key
                ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
              filterStatus === tab.key ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-sm">Tidak ada order dengan status ini</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Order</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">User</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Qty</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Alamat</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Tanggal</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{statusIcon[order.status] || '⏳'}</span>
                      <span className="font-medium text-gray-900">#{order.id}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    User #{order.user_id}
                  </td>
                  <td className="px-5 py-4 text-gray-700">
                    {order.quantity} item{order.quantity !== 1 ? 's' : ''}
                  </td>
                  <td className="px-5 py-4 text-gray-500 max-w-[160px]">
                    <p className="truncate text-xs">
                      {!order.dest_address || order.dest_address === '-'
                        ? <span className="text-amber-500">Belum diisi</span>
                        : order.dest_address
                      }
                    </p>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {new Date(order.order_date || order.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border capitalize font-medium ${statusColor[order.status] || statusColor.pending}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}