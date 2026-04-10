import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../api/axios';

function AuthorModal({ author, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: author?.name || '',
    description: author?.description || '',
    photo: author?.photo || null,
    DOB: author?.DOB || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name) {
      setError('Nama wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('DOB', form.DOB);

      if (form.photo && form.photo instanceof File) {
        formData.append('photo', form.photo);
      }

      if (author) {
        formData.append('_method', 'POST'); 
        await api.post(`/author/${author.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/author', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengunggah file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-lg font-medium text-gray-900 mb-5">
          {author ? 'Edit Author' : 'Add Author'}
        </h2>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}
        <div className="space-y-4">
            <div>
            <label className="block text-sm text-gray-600 mb-1.5">Upload Foto</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, photo: e.target.files[0] })} 
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          {[
            { label: 'Name', key: 'name', type: 'text' },
            { label: 'Date of Birth', key: 'DOB', type: 'date' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-gray-600 mb-1.5">{field.label}</label>
              <input
                type={field.type}
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#1a1a2e] text-white py-2.5 rounded-xl text-sm hover:bg-[#16213e] transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageAuthorPage() {
  const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ last_page: 1, current_page: 1 });
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/author', { params: { page: currentPage, search } });
      
      // Ambil object response utama dari Laravel
      const responseData = res.data;

      // Cek apakah ini object paginasi (ada property data yang isinya array)
      if (responseData && Array.isArray(responseData.data)) {
        setAuthors(responseData.data);
        setPagination({ 
          last_page: responseData.last_page || 1, 
          current_page: responseData.current_page || 1 
        });
      } 
      // Jika backend mengembalikan array biasa (bukan paginasi)
      else if (Array.isArray(responseData)) {
        setAuthors(responseData);
        setPagination({ last_page: 1, current_page: 1 });
      } else {
        setAuthors([]);
        setPagination({ last_page: 1, current_page: 1 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(fetchAuthors, 300);
    return () => clearTimeout(id);
  }, [currentPage, search]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const handleDelete = async (id) => {
    if (!confirm('Hapus author ini?')) return;
    setDeleting(id);
    try {
      await api.delete(`/author/${id}`);
      setAuthors((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Authors</h1>
          <p className="text-sm text-gray-400">{authors.length} authors total</p>
        </div>

        <div className="w-full max-w-sm">
          <input
            type="text"
            placeholder="Search authors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <button
          onClick={() => setModal('add')}
          className="bg-[#1a1a2e] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#16213e] transition-colors"
        >
          + Add Author
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {authors.map((author) => (
            <div key={author.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {author.photo ? (
                  <img src={`${API_URL}/storage/${author.photo}`} alt={author.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-indigo-400 font-semibold">{author.name?.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{author.name}</p>
                <p className="text-xs text-gray-400 truncate">{author.description || 'No description'}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setModal(author)}
                  className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(author.id)}
                  disabled={deleting === author.id}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting === author.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {pagination.last_page > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              Previous
            </button>

            <span className="text-sm font-medium">Page {currentPage} of {pagination.last_page}</span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))}
              disabled={currentPage === pagination.last_page || loading}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        )}
        </>
      )}

      {modal && (
        <AuthorModal
          author={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchAuthors(); }}
        />
      )}
    </AdminLayout>
  );
}