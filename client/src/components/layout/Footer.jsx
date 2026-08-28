import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 text-slate-550 dark:text-slate-400 py-12 transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Info */}
          <div className="flex flex-col space-y-4">
            <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-rose-400 bg-clip-text text-transparent tracking-wider">
              KH<span className="text-slate-900 dark:text-slate-100">Manga</span>
            </span>
            <p className="text-sm text-slate-500 max-w-xs">
              Your premium, responsive portal to read high-quality manga online. Created with love using React and Tailwind CSS.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link to="/" className="hover:text-white transition duration-150">Home</Link>
              <Link to="/browse" className="hover:text-white transition duration-150">Browse</Link>
              <Link to="/library" className="hover:text-white transition duration-150">Library</Link>
              <Link to="/profile" className="hover:text-white transition duration-150">Profile</Link>
            </div>
          </div>

          {/* Contact / Links */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Developer Links</h4>
            <div className="flex items-center space-x-4 text-sm">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center space-x-2 hover:text-white transition duration-150"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                </svg>
                <span>GitHub Repository</span>
              </a>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Manga metadata and details are fetched from the MangaDex API.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {currentYear} KHManga. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
