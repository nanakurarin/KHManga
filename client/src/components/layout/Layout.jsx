import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

function Layout({ children }) {
  const location = useLocation();
  const isReaderRoute = location.pathname.startsWith('/read/');

  if (isReaderRoute) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-rose-600 selection:text-white transition-colors duration-250">
        <main className="flex-grow w-full">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-rose-600 selection:text-white transition-colors duration-250">
      {/* Navbar at top */}
      <Navbar />

      {/* Main content filling available height */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer at bottom */}
      <Footer />
    </div>
  );
}

export default Layout;
