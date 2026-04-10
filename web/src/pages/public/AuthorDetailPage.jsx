import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import api from '../../api/axios';

function BookCard({ book }) {
  const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
  return (
    <Link
      to={`/book/${book.id}`}
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
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
        <p className="text-xs text-indigo-500 font-medium mb-1">
          {book.categories?.map((c) => c.category_name).join(', ') || 'General'}
        </p>
        <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 mb-1">{book.title}</h3>
        <p className="text-xs text-gray-400 mb-3">{book.edition || ''}</p>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900 text-sm">
            Rp {Number(book.price).toLocaleString('id-ID')}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            book.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
          }`}>
            {book.stock > 0 ? 'In stock' : 'Out of stock'}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function AuthorDetailPage() {
  const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/author/details/${id}`)
      .then((res) => setAuthor(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto px-6 py-12 animate-pulse">
          <div className="flex gap-8 mb-12">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex-shrink-0" />
            <div className="flex-1 space-y-3 pt-2">
              <div className="h-6 bg-gray-100 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl aspect-[3/4]" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!author) {
    return (
      <MainLayout>
        <div className="text-center py-32 text-gray-400">
          <p className="text-4xl mb-3">👤</p>
          <p className="text-sm">Author not found</p>
          <Link to="/author" className="text-indigo-500 text-sm mt-4 inline-block">
            Back to authors
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link to="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <Link to="/author" className="hover:text-gray-600">Authors</Link>
          <span>/</span>
          <span className="text-gray-700">{author.name}</span>
        </div>

        {/* Author Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden">
              {author.photo ? (
                <img src={`${API_URL}/storage/${author.photo}`} alt={author.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-semibold text-indigo-400">
                  {author.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">{author.name}</h1>
            {author.DOB && (
              <p className="text-sm text-gray-400 mb-3">
                Born:{' '}
                {new Date(author.DOB).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            )}
            <p className="text-sm text-gray-600 leading-relaxed">
              {author.description || 'No description available.'}
            </p>

            <div className="flex gap-4 mt-5 pt-5 border-t border-gray-100">
              <div>
                <p className="text-2xl font-semibold text-gray-900">{author.books?.length || 0}</p>
                <p className="text-xs text-gray-400">Books published</p>
              </div>
              {/* <div className="border-l border-gray-100 pl-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {[...new Set(author.books?.flatMap((b) => b.categories?.map((c) => c.category_name)) || [])].length}
                </p>
                <p className="text-xs text-gray-400">Genres covered</p>
              </div> */}
            </div>
          </div>
        </div>

        {/* Books */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-5">
            Books by {author.name}
          </h2>
          {author.books?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {author.books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-3xl mb-3">📭</p>
              <p className="text-sm">No books yet</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}