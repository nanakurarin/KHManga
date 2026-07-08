import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
      <div className="space-y-2">
        <h2 className="text-8xl font-black text-rose-500 tracking-wider">404</h2>
        <h3 className="text-2xl font-bold text-slate-200">Page Not Found</h3>
        <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
      </div>
      <div>
        <Link 
          to="/" 
          className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-950/40 transition duration-200 transform hover:-translate-y-0.5 inline-block text-sm"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
