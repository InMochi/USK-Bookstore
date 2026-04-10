import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../api/axios';

export default function ManageUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  //   eslint-disable-next-line no-unused-vars
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchUsers = (q = '') => {
    setLoading(true);
    api.get('/auth/user', { params: { search: q } })
      .then((res) => {
        const payload = res.data?.data ?? res.data;
        const normalize = (p) => {
          if (!p) return [];
          if (Array.isArray(p)) return p;
          if (Array.isArray(p.data)) return p.data;
          return [p];
        };
        setUsers(normalize(payload));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  //   eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchUsers(searchInput);
  };

  const roleColor = {
    admin: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    user: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Users</h1>
          <p className="text-sm text-gray-400">{users.length} users terdaftar</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari nama / email..."
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition w-56"
          />
          <button
            type="submit"
            className="bg-[#1a1a2e] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#16213e] transition-colors"
          >
            Cari
          </button>
        </form>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">👥</p>
          <p className="text-sm">Tidak ada user ditemukan</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">User</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Email</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Role</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-400 text-xs font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{user.email}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border capitalize font-medium ${roleColor[user.role] || roleColor.user}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {user.email_verified_at ? (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-100">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {new Date(user.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
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