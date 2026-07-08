import React from 'react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-rose-600 selection:text-white">
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
