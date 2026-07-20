import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteUser, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { deleteUserFromBackend } from '../services/backend';

function Profile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userDetails = {
    username: auth.currentUser?.displayName || 'OtakuReader99',
    email: auth.currentUser?.email || 'reader@khmanga.com',
    joinDate: 'July 2026',
    favoriteGenres: ['Action', 'Fantasy', 'Comedy'],
    stats: {
      completed: 12,
      reading: 4,
      chaptersRead: 342,
    }
  };

  /**
   * Deletes user account completely:
   * 1. Confirmation prompt
   * 2. Calls backend DELETE endpoint (uses Admin SDK to delete from Firebase Auth & MySQL)
   * 3. Signs out user and redirects to login page
   */
  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError('No authenticated user found.');
      return;
    }

    // Step 1: Confirmation prompt
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action is permanent and cannot be undone.'
    );
    if (!confirmed) return;

    setLoading(true);
    setError('');

    const uid = user.uid;

    try {
      // Step 2: Delete from Firebase Auth & MySQL via backend DELETE endpoint
      await deleteUserFromBackend(uid);

      // Step 3: Best-effort client SDK delete if still active, then Sign Out
      try {
        await deleteUser(user);
      } catch (clientDeleteErr) {
        // Ignored if backend Admin SDK already deleted the user from Firebase Auth
      }

      await signOut(auth);

      // Step 4: Navigate to Login page
      navigate('/login');
    } catch (err) {
      console.error('Account deletion error:', err);
      setError(err.message || 'Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Error display */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 text-rose-200 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Profile Header card */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-rose-950/40 select-none">
          {userDetails.username.charAt(0)}
        </div>
        <div className="space-y-1 text-center sm:text-left flex-grow">
          <h2 className="text-2xl font-extrabold text-white">{userDetails.username}</h2>
          <p className="text-sm text-slate-400">{userDetails.email}</p>
          <p className="text-xs text-slate-500">Member since {userDetails.joinDate}</p>
        </div>
        <div>
          <button className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-950 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition duration-150">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats card */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Reading Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-black text-rose-500">{userDetails.stats.reading}</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Reading</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black text-slate-200">{userDetails.stats.completed}</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Completed</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black text-slate-200">{userDetails.stats.chaptersRead}</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Chapters</p>
            </div>
          </div>
        </div>

        {/* Favorite genres card */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {userDetails.favoriteGenres.map((g) => (
              <span key={g} className="px-2.5 py-1 bg-slate-950 text-slate-300 rounded text-xs border border-slate-900">
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Settings options card */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Account Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold bg-slate-950 text-slate-300 hover:text-white border border-slate-900 hover:border-slate-800 transition duration-150">
              Account Settings
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold bg-rose-950/40 text-rose-400 hover:bg-rose-900/40 hover:text-rose-200 border border-rose-900/50 transition duration-150 disabled:opacity-50"
            >
              {loading ? 'Deleting Account...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

