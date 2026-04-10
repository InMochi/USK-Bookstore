import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import api from '../../api/axios';

function AuthorCard({ author }) {
  const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
  return (
    <Link
      to={`/author/${author.id}`}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex gap-4 items-start"
    >
      <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {author.photo ? (
          <img src={`${API_URL}/storage/${author.photo}`} alt={author.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-indigo-400 font-semibold text-lg">
            {author.name?.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 mb-1">{author.name}</h3>
        <p className="text-xs text-gray-400 line-clamp-2">{author.description || 'No description available.'}</p>
      </div>
    </Link>
  );
}

export default function AuthorPage() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ last_page: 1, current_page: 1 });

  useEffect(() => {
    setLoading(true);
    const fetch = async () => {
      try {
        const res = await api.get('/author', { params: { page: currentPage, search } });
        
        // Jangan di-normalize di awal, ambil object response utamanya dulu
        const responseData = res.data; 

        // Cek apakah ini object paginasi dari Laravel
        if (responseData && Array.isArray(responseData.data)) {
          setAuthors(responseData.data); // Ambil array author-nya
          setPagination({
            last_page: responseData.last_page || 1,
            current_page: responseData.current_page || 1,
          });
        } 
        // Jika bukan paginasi (array biasa)
        else if (Array.isArray(responseData)) {
          setAuthors(responseData);
          setPagination({ last_page: 1, current_page: 1 });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const id = setTimeout(fetch, 400);
    return () => clearTimeout(id);
  }, [currentPage, search]);

  // reset page when search changes
  useEffect(() => { setCurrentPage(1); }, [search]);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Authors</h1>
            <p className="text-sm text-gray-400">Discover books by your favourite authors</p>
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
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl p-5 flex gap-4 animate-pulse">
                <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {authors.map((author, i) => (
              <AuthorCard key={author.id ?? `author-${i}`} author={author} />
            ))}
          </div>
        )}

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
      </div>
    </MainLayout>
  );
}