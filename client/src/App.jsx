import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <header className="bg-slate-900 border-b border-slate-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-rose-500">KHManga</h1>
            <nav className="space-x-4">
              <span className="text-slate-400 hover:text-white cursor-pointer">Home</span>
              <span className="text-slate-400 hover:text-white cursor-pointer">Browse</span>
            </nav>
          </div>
        </header>
        
        <main className="flex-grow container mx-auto p-4 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold mb-2">Folder Structure Created Successfully!</h2>
          <p className="text-slate-400">Ready to build the React client application.</p>
        </main>
        
        <footer className="bg-slate-900 border-t border-slate-800 p-4 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} KHManga. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;
