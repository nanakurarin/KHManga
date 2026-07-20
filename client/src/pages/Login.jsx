import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { getFriendlyFirebaseError } from '../utils/firebaseErrors';
import { syncUserWithBackend } from '../services/backend';

/**
 * Login Page Component
 * Renders the login form and handles user authentication with Firebase
 */
function Login() {
  // React States for inputs and UI loading / error states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hook for routing redirects
  const navigate = useNavigate();

  /**
   * Form Submission Handler
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous error messages
    setError('');

    // Step A: Client-side input validation
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    // Step B: Execution of the login logic
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);

      // Sync user with backend (non-blocking)
      try {
        const user = userCredential.user;

        await syncUserWithBackend({
          firebaseUid: user.uid,
          email: user.email,
          username: user.displayName || user.email.split('@')[0],
        });
      } catch (syncErr) {
        console.warn('Backend user sync failed (non-blocking):', syncErr);
      }

      // Successfully signed in, navigate to home page
      navigate('/');
    } catch (err) {
      console.error('Firebase login error:', err);
      // Map error code to reader-friendly string using our utility
      setError(getFriendlyFirebaseError(err.code || err.message));
    } finally {
      // Always reset loading status
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-12 px-4">
      {/* 
        Sleek card with a translucent glassmorphic look, dark slate borders, 
        and shadow effects tailored for a modern anime/gaming site. 
      */}
      <div className="relative bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 space-y-6 shadow-2xl shadow-rose-950/20">

        {/* Subtle, glowing decorative ambient lights in the corners */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header section with customized gradient text */}
        <div className="text-center space-y-2 relative">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-400 to-amber-500 tracking-wide uppercase">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Log in to sync your library bookmarks and reading history
          </p>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 text-rose-200 text-xs flex items-center space-x-3 transition-all duration-300">
            <svg className="h-5 w-5 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-semibold leading-relaxed">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative">

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800/80 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all duration-200"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800/80 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all duration-200"
            />
          </div>

          {/* Submit Button (Log In) */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg text-sm transition-all duration-300 mt-3 shadow-lg shadow-rose-950/40 relative flex items-center justify-center space-x-2 ${loading ? 'opacity-70 cursor-not-allowed bg-rose-700' : 'hover:scale-[1.01]'
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Logging In...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </button>
        </form>

        {/* Divider decorative line */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800/80"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">Or continue with</span>
          <div className="flex-grow border-t border-slate-800/80"></div>
        </div>

        {/* Disabled Social Google Auth placeholder as requested */}
        <div>
          <button
            disabled
            className="w-full bg-slate-950/50 border border-slate-800 hover:border-slate-700 hover:text-white text-slate-400 font-bold py-2.5 rounded-lg text-xs transition duration-200 flex items-center justify-center space-x-2 cursor-not-allowed opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.708 0 3.277.604 4.5 1.625l2.437-2.437C17.312 1.696 14.933 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.795 0 10.254-4.074 10.254-10.24 0-.695-.08-1.355-.22-1.955H12.24z" />
            </svg>
            <span>Google Account (Coming Soon)</span>
          </button>
        </div>

        {/* Redirection Link to Register Page */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/50">
          Don't have an account?{' '}
          <Link to="/register" className="text-rose-500 hover:text-rose-400 hover:underline font-semibold transition duration-200">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
