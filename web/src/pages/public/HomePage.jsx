import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import api from '../../api/axios';

function BookCard({ book }) {
  const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
  return (
    <Link to={`/book/${book.id}`} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
        {book.image ? (
          <img
            src={`${API_URL}/storage/${book.image}`}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📖</div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-indigo-500 font-medium mb-1">{book.genre || 'General'}</p>
        <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 mb-1">{book.title}</h3>
        <p className="text-xs text-gray-500 mb-3">{book.edition || ''}</p>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900 text-sm">
            Rp {Number(book.price).toLocaleString('id-ID')}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            book.stock > 0
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-500'
          }`}>
            {book.stock > 0 ? 'In stock' : 'Out of stock'}
          </span>
        </div>
      </div>
    </Link>
  );
}

function CategoryBadge({ category }) {
  return (
    <Link
      to={`/category`}
      className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-500 transition-colors whitespace-nowrap"
    >
      {category.category_name}
    </Link>
  );
}

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ last_page: 1 }); 

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Tambahkan parameter search ke URL
      const [booksRes, categoriesRes] = await Promise.all([
        api.get(`/book?page=${currentPage}&search=${search}`),
        api.get('/category'),
      ]);

      const booksData = booksRes.data;
      let booksList = [];
      let last = 1;
      let curr = currentPage;

      if (booksData) {
        // Karena controller kamu me-return ['data' => $book], 
        // maka booksData.data adalah objek pagination dari Laravel
        const inner = booksData.data; 
        
        if (inner && inner.data && Array.isArray(inner.data)) {
          booksList = inner.data;
          last = inner.last_page ?? 1;
          curr = inner.current_page ?? currentPage;
        } else if (Array.isArray(inner)) {
          booksList = inner;
        }
      }

      setBooks(booksList);
      setPagination({ last_page: last, current_page: curr });
      
      const catsPayload = categoriesRes.data?.data ?? categoriesRes.data;
      setCategories(Array.isArray(catsPayload) ? catsPayload : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Debounce Logic: Kasih jeda 500ms biar gak spamming API pas ngetik
  const timeoutId = setTimeout(() => {
    fetchData();
  }, 500);

  return () => clearTimeout(timeoutId);

  // 3. Dependency: Re-run kalau page ATAU search berubah
}, [currentPage, search]); 

// 4. Tambahkan ini: Reset ke halaman 1 tiap kali user mulai ngetik
useEffect(() => {
  setCurrentPage(1);
}, [search]);

  const filteredBooks = books.filter((b) => 
    b.title?.toLowerCase().includes(search.toLowerCase())
  );

  console.log('Books state (raw):', books);
  console.log('Filtered books length:', filteredBooks.length, filteredBooks);

  return (
    <>
      {/* Hero */}
      <section className="bg-[#1a1a2e] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-400 text-sm font-medium mb-3 tracking-wide uppercase">Welcome to BookStore</p>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-4">
            Find your next <br />
            <span className="text-indigo-400">favourite book</span>
          </h1>
          <p className="text-white/60 text-base mb-8 max-w-xl mx-auto">
            Discover thousands of books from the best authors around the world.
          </p>
          <div className="flex items-center max-w-md mx-auto bg-white/10 border border-white/20 rounded-xl overflow-hidden">
            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/40 px-4 py-3 text-sm focus:outline-none"
            />
            <div className="px-4 text-white/40">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Categories */}
        {categories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Browse by Category</h2>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat, index) => (
                <CategoryBadge key={`${cat.id}-${index}`} category={cat} />
              ))}
            </div>
          </section>
        )}

        {/* Books Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">
              {search ? `Results for "${search}"` : 'All Books'}
            </h2>
            <span className="text-sm text-gray-400">{filteredBooks.length} books</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl animate-pulse">
                  <div className="aspect-[3/4]" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filteredBooks.map((book, i) => (
                <BookCard key={book.id ?? `book-${i}`} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm">No books found</p>
            </div>
          )}
        </section>
        {/* Pagination Controls */}
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
    </>
  );
}