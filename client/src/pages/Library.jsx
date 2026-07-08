import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Library() {
  const tabs = ['All', 'Reading', 'Completed', 'Plan to Read', 'On Hold'];
  const [activeTab, setActiveTab] = useState('All');

  const mockLibraryManga = [
    { id: '1', title: 'Chainsaw Man', status: 'Reading', progress: '12 / 150 chapters' },
    { id: '2', title: 'Frieren: Beyond Journey\'s End', status: 'Reading', progress: '45 / 120 chapters' },
    { id: '4', title: 'Demon Slayer', status: 'Completed', progress: '205 / 205 chapters' },
  ];

  const filteredManga = activeTab === 'All' 
    ? mockLibraryManga 
    : mockLibraryManga.filter(m => m.status === activeTab);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">My Library</h2>
        <p className="text-sm text-slate-400">Keep track of your reading progress and bookmarks</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-900 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap pb-4 px-6 text-sm font-semibold border-b-2 transition duration-200 ${
              activeTab === tab 
                ? 'border-rose-500 text-rose-500' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid of Bookmarked Items */}
      {filteredManga.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredManga.map((manga) => (
            <div 
              key={manga.id} 
              className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex gap-4 hover:border-slate-800 transition duration-150"
            >
              {/* Cover placeholder */}
              <div className="w-20 h-28 bg-slate-950 rounded flex-shrink-0 flex items-center justify-center border border-slate-800 text-[10px] text-slate-600 font-bold select-none">
                Cover
              </div>
              <div className="flex flex-col justify-between py-1">
                <div>
                  <h4 className="font-bold text-slate-200 line-clamp-1">{manga.title}</h4>
                  <span className="text-[10px] bg-slate-800 text-rose-400 px-2 py-0.5 rounded font-semibold uppercase tracking-wider inline-block mt-1">
                    {manga.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">{manga.progress}</p>
                  <Link 
                    to={`/manga/${manga.id}`} 
                    className="text-xs text-rose-500 hover:text-rose-400 font-bold inline-block"
                  >
                    Continue &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/20 border border-slate-900/50 border-dashed rounded-2xl">
          <p className="text-slate-400 text-sm">No bookmarks found for "{activeTab}" category.</p>
          <Link 
            to="/browse" 
            className="mt-4 inline-block text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition duration-150"
          >
            Browse Manga
          </Link>
        </div>
      )}
    </div>
  );
}

export default Library;
