import React from 'react';
import { useParams, Link } from 'react-router-dom';

function MangaDetails() {
  const { id } = useParams();

  // Static mockup detail definitions
  const mangaDetails = {
    title: `Manga Title (${id})`,
    altTitles: ['Another title alternate', 'Secondary title translation'],
    author: 'Author Name',
    artist: 'Artist Name',
    description: 'This is a premium placeholder description. In the production app, this content will load from the MangaDex API. A mysterious force has altered reality, and our protagonist must rise through the ranks to restore the timeline and protect their loved ones.',
    status: 'Ongoing',
    year: '2023',
    rating: '9.3',
    chapters: [
      { id: 'ch-3', title: 'Chapter 3: The Call to Action', date: '2024-01-10', number: '3' },
      { id: 'ch-2', title: 'Chapter 2: Training Ground', date: '2024-01-05', number: '2' },
      { id: 'ch-1', title: 'Chapter 1: The Beginning of the End', date: '2024-01-01', number: '1' },
    ]
  };

  return (
    <div className="space-y-8">
      {/* Return button */}
      <div>
        <Link to="/browse" className="inline-flex items-center text-slate-400 hover:text-rose-500 text-sm transition duration-150">
          &larr; Back to Browse
        </Link>
      </div>

      {/* Main Details Panel */}
      <div className="flex flex-col md:flex-row gap-8 bg-slate-900/40 border border-slate-900 rounded-2xl p-6 sm:p-8">
        {/* Cover Art Box */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="aspect-[3/4] bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800 text-slate-600 font-bold select-none">
            Manga Cover
          </div>
          {/* Action buttons */}
          <div className="mt-4 flex flex-col gap-2">
            <button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-lg text-sm shadow-md transition duration-150">
              Add to Library
            </button>
          </div>
        </div>

        {/* Text Metadata */}
        <div className="flex-grow space-y-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white">{mangaDetails.title}</h2>
            <p className="text-sm text-slate-400 mt-1">{mangaDetails.author} &bull; {mangaDetails.artist}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase">
            <span className="px-2.5 py-1 bg-slate-800 text-rose-400 rounded-md border border-slate-700/50">
              {mangaDetails.status}
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md border border-slate-700/50">
              Year: {mangaDetails.year}
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md border border-slate-700/50">
              Rating: {mangaDetails.rating} ★
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-300">Description</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{mangaDetails.description}</p>
          </div>
        </div>
      </div>

      {/* Chapters list section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-200">Chapters List</h3>
        <div className="bg-slate-900/20 border border-slate-900 rounded-xl overflow-hidden">
          <div className="divide-y divide-slate-900">
            {mangaDetails.chapters.map((chapter) => (
              <div 
                key={chapter.id} 
                className="flex items-center justify-between p-4 hover:bg-slate-900/50 transition duration-150"
              >
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-slate-200">
                    Chapter {chapter.number}
                  </span>
                  <p className="text-xs text-slate-400">{chapter.title}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-slate-500 hidden sm:inline">{chapter.date}</span>
                  <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg text-xs font-semibold transition duration-150">
                    Read
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MangaDetails;
