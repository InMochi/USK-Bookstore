import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../api/axios';

const statusColor = {
  pending: 'bg-amber-50 text-amber-600 border-amber-100',
  approved: 'bg-green-50 text-green-600 border-green-100',
  rejected: 'bg-red-50 text-red-500 border-red-100',
};

export default function ManagePaymentPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchPayments = () => {
    setLoading(true);
    api.get('/payment')
      .then((res) => {
        const payload = res.data?.data ?? res.data;
        const normalize = (p) => {
          if (!p) return [];
          if (Array.isArray(p)) return p;
          if (Array.isArray(p.data)) return p.data; // paginated wrapper
          return [p];
        };
        setPayments(normalize(payload));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleUpdateStatus = async (id, status) => {
    setUpdating(id);
    try {
      const res = await api.patch(`/payment/${id}`, { status });
      // Prefer server-provided updated payment, otherwise refresh list
      const updated = res.data?.data ?? null;
      if (updated && updated.id) {
        setPayments((prev) => prev.map((p) => p.id === updated.id ? { ...p, status: updated.status } : p));
      } else {
        // fallback: refetch to ensure UI matches server
        fetchPayments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Payments</h1>
        <p className="text-sm text-gray-400">{payments.length} payments total</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">💳</p>
          <p className="text-sm">Belum ada payment</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">ID</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">User</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Order</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Method</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Receipt</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-gray-400">#{payment.id}</td>
                  <td className="px-5 py-4 text-gray-700">User #{payment.user_id}</td>
                  <td className="px-5 py-4 text-gray-700">Order #{payment.order_id}</td>
                  <td className="px-5 py-4">
                    <span className="capitalize text-gray-700">
                      {payment.payment_method?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{payment.receipt_number || '-'}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${statusColor[payment.status] || statusColor.pending}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {payment.status === 'pending' && (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleUpdateStatus(payment.id, 'approved')}
                          disabled={updating === payment.id}
                          className="text-xs bg-green-50 text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          {updating === payment.id ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(payment.id, 'rejected')}
                          disabled={updating === payment.id}
                          className="text-xs bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {updating === payment.id ? '...' : 'Reject'}
                        </button>
                      </div>
                    )}
                    {payment.status !== 'pending' && (
                      <p className="text-xs text-gray-300 text-right capitalize">{payment.status}</p>
                    )}
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