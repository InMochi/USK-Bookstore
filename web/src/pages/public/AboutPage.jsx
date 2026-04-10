import { Link } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';

const team = [
  { name: 'Budi Santoso', role: 'Founder & CEO', initial: 'B' },
  { name: 'Sari Dewi', role: 'Head of Operations', initial: 'S' },
  { name: 'Rizky Pratama', role: 'Lead Developer', initial: 'R' },
];

const stats = [
  { value: '10,000+', label: 'Buku tersedia' },
  { value: '5,000+', label: 'Pelanggan aktif' },
  { value: '500+', label: 'Penulis terdaftar' },
  { value: '4.9★', label: 'Rating rata-rata' },
];

export default function AboutPage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-[#1a1a2e] text-white py-20 px-6 text-center">
        <p className="text-indigo-400 text-sm font-medium mb-3 tracking-wide uppercase">About Us</p>
        <h1 className="text-4xl font-semibold mb-4">
          Toko buku yang <span className="text-indigo-400">dicintai</span> pembaca
        </h1>
        <p className="text-white/60 text-base max-w-xl mx-auto">
          Kami hadir untuk memudahkan kamu menemukan buku yang tepat, dari penulis terbaik, dengan harga yang terjangkau.
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
              <p className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="flex flex-col md:flex-row gap-12 mb-16 items-center">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cerita kami</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              BookStore didirikan dengan satu misi sederhana: membuat buku berkualitas mudah dijangkau oleh semua orang. Kami percaya bahwa membaca adalah investasi terbaik yang bisa kamu lakukan untuk dirimu sendiri.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Sejak berdiri, kami telah melayani ribuan pembaca dari seluruh Indonesia dengan koleksi buku yang terus berkembang setiap harinya — dari fiksi, non-fiksi, hingga buku akademik.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Kami tidak hanya menjual buku. Kami membangun komunitas pembaca yang saling menginspirasi.
            </p>
          </div>
          <div className="w-full md:w-72 aspect-square bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-8xl">📚</span>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Nilai-nilai kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🎯', title: 'Kualitas', desc: 'Kami hanya menyediakan buku dari penulis dan penerbit terpercaya.' },
              { icon: '💡', title: 'Inovasi', desc: 'Terus berinovasi untuk pengalaman belanja buku yang lebih mudah dan menyenangkan.' },
              { icon: '🤝', title: 'Kepercayaan', desc: 'Kepercayaan pelanggan adalah prioritas utama kami dalam setiap transaksi.' },
            ].map((val) => (
              <div key={val.title} className="bg-white border border-gray-200 rounded-2xl p-6">
                <span className="text-3xl mb-4 block">{val.icon}</span>
                <h3 className="font-medium text-gray-900 mb-2">{val.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Tim kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {team.map((member) => (
              <div key={member.name} className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-semibold text-indigo-400">{member.initial}</span>
                </div>
                <p className="font-medium text-gray-900 mb-1">{member.name}</p>
                <p className="text-xs text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#1a1a2e] rounded-2xl p-10 text-center text-white">
          <h2 className="text-2xl font-semibold mb-3">Siap mulai membaca?</h2>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
            Jelajahi ribuan koleksi buku kami dan temukan buku favoritmu sekarang.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/"
              className="bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors"
            >
              Browse Buku
            </Link>
            <Link
              to="/contact"
              className="border border-white/30 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}