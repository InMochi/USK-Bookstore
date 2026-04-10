import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../api/axios';

function BookModal({ book, authors, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: book?.title || '',
    publication_date: book?.publication_date || '',
    price: book?.price || '',
    image: book?.image || null, 
    status: book?.status || 'available',
    stock: book?.stock || '',
    genre: book?.genre || '',
    author_id: book?.author_id || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('publication_date', form.publication_date);
      formData.append('price', form.price);
      formData.append('stock', form.stock);
      formData.append('genre', form.genre);
      formData.append('author_id', form.author_id);
      formData.append('status', form.status);
      formData.append('edition', form.edition || '');
      

      if (form.image && form.image instanceof File) {
        formData.append('image', form.image);
      }

      if (book) {
        formData.append('_method', 'POST');
        await api.post(`/book/${book.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post(`/authors/${form.author_id}/book`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      onSaved();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Gagal mengunggah file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-medium text-gray-900 mb-5">
          {book ? 'Edit Book' : 'Add Book'}
        </h2>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Author</label>
            <select
              value={form.author_id}
              onChange={(e) => setForm({ ...form, author_id: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
            >
              <option value="">Select author...</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Upload Cover</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, image: e.target.files[0] })} // Ambil file asli
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          {[
            { label: 'Title', key: 'title', type: 'text' },
            { label: 'Genre', key: 'genre', type: 'text' },
            { label: 'Price', key: 'price', type: 'number' },
            { label: 'Stock', key: 'stock', type: 'number' },
            { label: 'Publication Date', key: 'publication_date', type: 'date' },
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
            <label className="block text-sm text-gray-600 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
            >
              <option value="available">Available</option>
              <option value="not_available">Not Available</option>
            </select>
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

export default function ManageBookPage() {
  const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ last_page: 1 }); 
  const [search, setSearch] = useState('');
  

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/book', { params: { page: currentPage, search } }),
      api.get('/author/all'),
    ])
      .then(([booksRes, allAuthorsRes]) => {
        const normalizeList = (res) => {
          const payload = res?.data?.data ?? res?.data;
          if (!payload) return [];
          // paginated object
          if (payload && Array.isArray(payload.data)) return payload.data;
          if (Array.isArray(payload)) return payload;
          return [payload];
        };

        // booksRes may be a paginator object
        const booksPayload = booksRes?.data?.data ?? booksRes?.data;
        if (booksPayload && Array.isArray(booksPayload.data)) {
          setBooks(booksPayload.data);
          setPagination({
            last_page: booksPayload.last_page || 1,
            current_page: booksPayload.current_page || currentPage,
            per_page: booksPayload.per_page || booksPayload.perPage || 20,
            total: booksPayload.total || 0,
          });
        } else {
          setBooks(normalizeList(booksRes));
          setPagination({ last_page: 1, current_page: 1, per_page: 20, total: 0 });
        }

        setAuthors(normalizeList(allAuthorsRes));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const id = setTimeout(fetchData, 300);
    return () => clearTimeout(id);
  }, [currentPage, search]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const handleDelete = async (id) => {
    if (!confirm('Hapus buku ini?')) return;
    setDeleting(id);
    try {
      await api.delete(`/book/${id}`);
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
  setCurrentPage(1);
  }, []);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Books</h1>
          <p className="text-sm text-gray-400">{books.length} books total</p>
        </div>

        <div className="w-full max-w-sm">
          <input
            type="text"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <button
          onClick={() => setModal('add')}
          className="bg-[#1a1a2e] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#16213e] transition-colors"
        >
          + Add Book
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Book</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Genre</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Price</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Stock</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {book.image ? (
                          <img src={`${API_URL}/storage/${book.image}`} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">📖</div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-[180px]">{book.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{book.genre || '-'}</td>
                  <td className="px-5 py-3 text-gray-700">Rp {Number(book.price).toLocaleString('id-ID')}</td>
                  <td className="px-5 py-3 text-gray-700">{book.stock}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      book.status === 'available'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {book.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setModal(book)} className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">Edit</button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        disabled={deleting === book.id}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        {deleting === book.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagination.last_page > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              Previous
            </button>
            
            <span className="text-sm font-medium">
              Page {currentPage} of {pagination.last_page}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))}
              disabled={currentPage === pagination.last_page || loading}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        )}
        </div>
      )}

      {modal && (
        <BookModal
          book={modal === 'add' ? null : modal}
          authors={authors}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchData(); }}
        />
      )}
    </AdminLayout>
  );
}