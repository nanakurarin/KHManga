import React from 'react';
import { Link } from 'react-router-dom';

function Register() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register form submitted (placeholder)');
  };

  return (
    <div className="max-w-md w-full mx-auto my-8">
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-8 space-y-6 shadow-xl shadow-slate-950/50">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
          <p className="text-xs text-slate-400">Sign up now to start bookmarking and saving your progress</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              required
              placeholder="e.g. MangaLover"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition duration-200"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition duration-200"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              placeholder="Min. 8 characters"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition duration-200"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg text-sm transition duration-200 mt-2 shadow-lg shadow-rose-950/40"
          >
            Create Account
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs font-semibold uppercase">Or sign up with</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Social Authentication button placeholders */}
        <div>
          <button className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-white text-slate-300 font-bold py-2.5 rounded-lg text-xs transition duration-200 flex items-center justify-center space-x-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.708 0 3.277.604 4.5 1.625l2.437-2.437C17.312 1.696 14.933 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.795 0 10.254-4.074 10.254-10.24 0-.695-.08-1.355-.22-1.955H12.24z"/>
            </svg>
            <span>Google Account</span>
          </button>
        </div>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-rose-500 hover:underline font-semibold">
            Log In here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
