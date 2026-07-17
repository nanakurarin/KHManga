import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { currentUser } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Browse', path: '/browse' },
    { name: 'Library', path: '/library' },
    { name: 'Profile', path: '/profile' },
  ];

  const activeStyle = "text-rose-500 font-semibold border-b-2 border-rose-500 pb-1";
  const inactiveStyle = "text-slate-300 hover:text-white transition duration-200";

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut(auth);
      setIsOpen(false); // Close mobile menu if open
      navigate('/');
    } catch (err) {
      console.error('Firebase logout error:', err);
      alert('Failed to log out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-black bg-gradient-to-r from-rose-500 to-crimson-600 bg-clip-text text-transparent tracking-wider">
                KH<span className="text-slate-100">Manga</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                <span className="text-slate-300 text-sm font-medium mr-2">
                  Hi, {currentUser.displayName || currentUser.email}
                </span>

                <Link
                  to="/profile"
                  className="text-slate-300 hover:text-white text-sm font-medium transition duration-200"
                >
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-700/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition duration-200 flex items-center space-x-2 shadow-lg shadow-rose-950/40"
                >
                  {loggingOut ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Logging Out...</span>
                    </>
                  ) : (
                    <span>Log Out</span>
                  )}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white text-sm font-medium transition duration-200"
                >
                  Log In
                </Link>

                <Link
                  to="/register"
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition duration-200 shadow-lg shadow-rose-950/40"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none transition duration-200"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-950/95 border-b border-slate-800">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-slate-900 text-rose-500' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          {currentUser ? (
            <div className="pt-4 pb-2 border-t border-slate-800 flex flex-col space-y-2 px-3">
              <span className="text-slate-400 text-xs font-semibold px-3 uppercase tracking-wider">
                Logged in as: <span className="text-slate-200 normal-case font-medium">{currentUser.displayName || currentUser.email}</span>
              </span>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-slate-300 hover:text-white py-2 font-medium text-sm transition duration-200"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full text-center bg-rose-600 hover:bg-rose-700 disabled:bg-rose-700/50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold text-sm transition duration-200 flex items-center justify-center space-x-2"
              >
                {loggingOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Logging Out...</span>
                  </>
                ) : (
                  <span>Log Out</span>
                )}
              </button>
            </div>
          ) : (
            <div className="pt-4 pb-2 border-t border-slate-800 flex flex-col space-y-2 px-3">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-slate-300 hover:text-white py-2 font-medium text-sm transition duration-200"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-full text-center bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg font-semibold text-sm transition duration-200"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
