import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  // Static placeholder data for aesthetic purposes
  const trendingManga = [
    { id: '1', title: 'Chainsaw Man', author: 'Tatsuki Fujimoto', rating: '9.2', cover: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80', status: 'Ongoing' },
    { id: '2', title: 'Frieren: Beyond Journey\'s End', author: 'Kanehito Yamada', rating: '9.6', cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80', status: 'Ongoing' },
    { id: '3', title: 'Oshi no Ko', author: 'Aka Akasaka', rating: '8.9', cover: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=400&q=80', status: 'Ongoing' },
    { id: '4', title: 'Demon Slayer', author: 'Koyoharu Gotouge', rating: '9.4', cover: 'https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&q=80', status: 'Completed' },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Banner Section */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-slate-800 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-6 max-w-xl text-left">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Featured Release
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Dive into the world of <span className="bg-gradient-to-r from-rose-500 to-rose-400 bg-clip-text text-transparent">KHManga</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Explore thousands of manga titles directly from the MangaDex repository. Completely ad-free, sleek, and lightning-fast.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              to="/browse" 
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-950/40 transition duration-200 transform hover:-translate-y-0.5"
            >
              Start Reading
            </Link>
            <Link 
              to="/register" 
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl font-bold border border-slate-700/80 transition duration-200"
            >
              Create Account
            </Link>
          </div>
        </div>
        <div className="w-full md:w-80 h-48 md:h-80 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl relative flex items-center justify-center">
          {/* Decorative design representation */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10" />
          <div className="text-center p-6 z-20 space-y-2">
            <p className="text-xs text-rose-400 font-semibold tracking-widest uppercase">Now Trending</p>
            <p className="text-xl font-bold text-white">Chainsaw Man Part 2</p>
            <span className="inline-block bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded">Ch. 150 Released</span>
          </div>
        </div>
      </section>

      {/* Grid List Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-900 pb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-100">Popular Updates</h3>
            <p className="text-sm text-slate-400">Handpicked popular series update schedules</p>
          </div>
          <Link to="/browse" className="text-rose-500 hover:text-rose-400 text-sm font-semibold transition duration-150">
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {trendingManga.map((manga) => (
            <Link 
              key={manga.id} 
              to={`/manga/${manga.id}`} 
              className="group flex flex-col bg-slate-900/40 rounded-xl overflow-hidden border border-slate-900 hover:border-slate-800 transition duration-200"
            >
              <div className="relative aspect-[3/4] bg-slate-950 overflow-hidden">
                <div className="absolute top-2 right-2 z-10 bg-slate-950/80 backdrop-blur-sm text-xs font-semibold px-2 py-0.5 rounded text-rose-400 border border-slate-800">
                  {manga.rating} ★
                </div>
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-600 font-bold group-hover:scale-105 transition duration-300">
                  {/* Decorative placeholder block */}
                  <span className="text-sm px-4 text-center select-none">{manga.title} Cover</span>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-slate-200 group-hover:text-rose-400 transition duration-150 line-clamp-1">
                  {manga.title}
                </h4>
                <p className="text-xs text-slate-400">{manga.author}</p>
                <div className="flex justify-between items-center pt-2 text-[10px] text-slate-500 font-semibold uppercase">
                  <span>{manga.status}</span>
                  <span className="text-slate-400">Ch. 12</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
