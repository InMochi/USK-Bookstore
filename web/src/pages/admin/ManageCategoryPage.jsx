import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../api/axios';

function CategoryModal({ onClose, onSaved, books, existingCategories }) {
  const [selectedBook, setSelectedBook] = useState('');
  const [mode, setMode] = useState('new'); // 'new' | 'existing'
  const [selectedExisting, setSelectedExisting] = useState('');
  const [categoryInputs, setCategoryInputs] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addCategoryInput = () => setCategoryInputs([...categoryInputs, '']);
  const removeCategoryInput = (index) => {
    if (categoryInputs.length === 1) return;
    setCategoryInputs(categoryInputs.filter((_, i) => i !== index));
  };
  const updateCategoryInput = (index, value) => {
    const updated = [...categoryInputs];
    updated[index] = value;
    setCategoryInputs(updated);
  };

  const handleSubmit = async () => {
    if (!selectedBook) { setError('Pilih buku dulu.'); return; }

    setLoading(true);
    setError('');
    try {
      if (mode === 'existing') {
        if (!selectedExisting) { setError('Pilih category dulu.'); setLoading(false); return; }
        await api.post(`/books/${selectedBook}/category`, {
          category_name: existingCategories.find(c => c.id == selectedExisting)?.category_name
        });
      } else {
        const validCategories = categoryInputs.filter((c) => c.trim() !== '');
        if (validCategories.length === 0) { setError('Isi minimal 1 category.'); setLoading(false); return; }
        await Promise.all(
          validCategories.map((name) =>
            api.post(`/books/${selectedBook}/category`, { category_name: name })
          )
        );
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-base font-medium text-gray-900 mb-1">Assign Category ke Buku</h2>
        <p className="text-xs text-gray-400 mb-5">Buat category baru atau pakai yang sudah ada</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        {/* Pilih Buku */}
        <div className="mb-5">
          <label className="block text-sm text-gray-600 mb-1.5">Buku</label>
          <select
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
          >
            <option value="">Pilih buku...</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setMode('new')}
            className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
              mode === 'new'
                ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            + Buat Baru
          </button>
          <button
            onClick={() => setMode('existing')}
            className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
              mode === 'existing'
                ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            Pakai yang Ada
          </button>
        </div>

        {mode === 'new' ? (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-600">Category Names</label>
              <button onClick={addCategoryInput} className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
                + Tambah lagi
              </button>
            </div>
            <div className="space-y-2">
              {categoryInputs.map((val, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => updateCategoryInput(index, e.target.value)}
                    placeholder={`Category ${index + 1}`}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                  />
                  {categoryInputs.length > 1 && (
                    <button onClick={() => removeCategoryInput(index)} className="text-red-400 hover:text-red-600 transition-colors px-2">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-5">
            <label className="block text-sm text-gray-600 mb-1.5">Pilih Category</label>
            <select
              value={selectedExisting}
              onChange={(e) => setSelectedExisting(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
            >
              <option value="">Pilih category...</option>
              {existingCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.category_name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#1a1a2e] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#16213e] transition-colors disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ category, onClose, onSaved }) {
  const [name, setName] = useState(category.category_name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Nama category tidak boleh kosong.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.patch(`/category/${category.id}`, { category_name: name });
      onSaved(category.id, name);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-base font-medium text-gray-900 mb-1">Edit Category</h2>
        <p className="text-xs text-gray-400 mb-5">ID #{category.id}</p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}
        <div className="mb-5">
          <label className="block text-sm text-gray-600 mb-1.5">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button onClick={handleSave} disabled={loading} className="flex-1 bg-[#1a1a2e] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#16213e] transition-colors disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

const colors = [
  'bg-indigo-50 text-indigo-600 border-indigo-100',
  'bg-purple-50 text-purple-600 border-purple-100',
  'bg-pink-50 text-pink-600 border-pink-100',
  'bg-amber-50 text-amber-600 border-amber-100',
  'bg-teal-50 text-teal-600 border-teal-100',
  'bg-green-50 text-green-600 border-green-100',
  'bg-blue-50 text-blue-600 border-blue-100',
  'bg-rose-50 text-rose-600 border-rose-100',
];

export default function ManageCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.get('/category'), api.get('/book')])
      .then(([catRes, bookRes]) => {
        const normCat = catRes.data?.data?.data ?? catRes.data?.data ?? catRes.data;
        const normBook = bookRes.data?.data?.data ?? bookRes.data?.data ?? bookRes.data;
        setCategories(Array.isArray(normCat) ? normCat : []);
        setBooks(Array.isArray(normBook) ? normBook : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Hapus kategori ini? Semua buku yang terhubung akan terlepas dari kategori ini.')) return;
    setDeleting(id);
    try {
      await api.delete(`/category/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const handleEditSaved = (id, newName) => {
    setCategories((prev) =>
      prev.map((c) => c.id === id ? { ...c, category_name: newName } : c)
    );
  };

  const filtered = categories.filter((c) =>
    c.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Categories</h1>
          <p className="text-sm text-gray-400">{categories.length} categories total</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari category..."
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition w-48"
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#1a1a2e] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#16213e] transition-colors whitespace-nowrap"
          >
            + Assign Category
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">🏷️</p>
          <p className="text-sm">Belum ada category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((cat, i) => (
            <div
              key={cat.id}
              className={`border rounded-xl p-4 ${colors[i % colors.length]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{cat.category_name}</p>
                  <p className="text-xs opacity-60 mt-0.5">
                    {cat.books_count ?? cat.books?.length ?? 0} buku
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setEditModal(cat)}
                    className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deleting === cat.id}
                    className="text-xs opacity-50 hover:opacity-100 transition-opacity disabled:opacity-30"
                    title="Delete"
                  >
                    {deleting === cat.id ? '...' : '✕'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CategoryModal
          books={books}
          existingCategories={categories}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchData(); }}
        />
      )}

      {editModal && (
        <EditModal
          category={editModal}
          onClose={() => setEditModal(null)}
          onSaved={handleEditSaved}
        />
      )}
    </AdminLayout>
  );
}