import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-2xl font-semibold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/order'), api.get('/payment')])
      .then(([ordersRes, paymentsRes]) => {
        const normalize = (res) => {
          const payload = res?.data?.data ?? res?.data;
          if (!payload) return [];
          if (Array.isArray(payload)) return payload;
          if (Array.isArray(payload.data)) return payload.data; // paginator
          return [payload];
        };

        setOrders(normalize(ordersRes));
        setPayments(normalize(paymentsRes));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const completedOrders = orders.filter((o) => o.status === 'complete' || o.status === 'completed').length;
  const pendingPayments = payments.filter((p) => p.status === 'pending').length;
  const approvedPayments = payments.filter((p) => p.status === 'approved').length;

  const statusColor = {
    pending: 'bg-amber-50 text-amber-600',
    processing: 'bg-blue-50 text-blue-600',
    complete: 'bg-green-50 text-green-600',
    completed: 'bg-green-50 text-green-600',
    cancelled: 'bg-red-50 text-red-500',
  };

  const paymentStatusColor = {
    pending: 'bg-amber-50 text-amber-600',
    approved: 'bg-green-50 text-green-600',
    rejected: 'bg-red-50 text-red-500',
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Profile Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-semibold text-indigo-400">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900 mb-0.5">{user?.name}</h1>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                  user?.role === 'admin'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {user?.role}
                </span>
                {user?.email_verified_at && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-600">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Orders" value={orders.length} />
            <StatCard label="Completed" value={completedOrders} />
            <StatCard label="Pending Payments" value={pendingPayments} />
            <StatCard label="Approved Payments" value={approvedPayments} />
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-medium text-gray-900">Recent Orders</h2>
            <Link to="/order" className="text-sm text-indigo-500 hover:text-indigo-600">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.order_date || order.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-500">{order.quantity} item{order.quantity !== 1 ? 's' : ''}</p>
                    <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${statusColor[order.status] || 'bg-gray-100 text-gray-500'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-medium text-gray-900">Recent Payments</h2>
            <Link to="/payment" className="text-sm text-indigo-500 hover:text-indigo-600">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">💳</p>
              <p className="text-sm">No payments yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment #{payment.id}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {payment.payment_method?.replace('_', ' ')}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${paymentStatusColor[payment.status] || 'bg-gray-100 text-gray-500'}`}>
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
}