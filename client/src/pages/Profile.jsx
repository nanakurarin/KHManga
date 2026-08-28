import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { deleteUser, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { getMangaList } from '../services/mangaDexApi';
import {
  getUserProfile,
  updateUserProfile,
  deleteUserFromBackend,
  checkUsernameAvailability
} from '../services/backend';

// Premium preset avatars
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1541562232579-512a21360020?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
];

const statusLabels = {
  'reading': 'Reading',
  'completed': 'Completed',
  'plan_to_read': 'Plan to Read',
  'on_hold': 'On Hold',
  'dropped': 'Dropped',
  're_reading': 'Re-reading'
};

const statusColors = {
  'reading': 'bg-emerald-500',
  'completed': 'bg-blue-500',
  'plan_to_read': 'bg-slate-400 dark:bg-slate-600',
  'on_hold': 'bg-amber-500',
  'dropped': 'bg-rose-500',
  're_reading': 'bg-indigo-500'
};

const statusBgColors = {
  'reading': 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  'completed': 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
  'plan_to_read': 'bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400',
  'on_hold': 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
  'dropped': 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-450',
  're_reading': 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
};

function Profile() {
  const { currentUser } = useAuth();
  const { library, loading: libraryLoading, loadLibrary } = useLibrary();
  const navigate = useNavigate();

  // Profile data from backend DB
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Username validation state
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameError, setUsernameError] = useState('');

  // Recently updated manga details
  const [recentMangaDetails, setRecentMangaDetails] = useState({});
  const [loadingRecentDetails, setLoadingRecentDetails] = useState(false);

  // Success message toast/banner
  const [successMessage, setSuccessMessage] = useState('');

  // Account deletion loading state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch profile on mount or user change
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      try {
        setProfileLoading(true);
        setProfileError('');
        const res = await getUserProfile(currentUser.uid);
        if (res.success && res.user) {
          setProfile(res.user);
        } else {
          throw new Error('User not found.');
        }
      } catch (err) {
        console.error('Failed to load user profile from DB:', err);
        // Fallback to Firebase details if database record not found or fetch fails
        setProfile({
          username: currentUser.displayName || 'Reader',
          email: currentUser.email || '',
          avatar: currentUser.photoURL || null,
          createdAt: currentUser.metadata.creationTime || new Date().toISOString()
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
    // Refresh library lists to be absolutely up-to-date
    loadLibrary();
  }, [currentUser]);

  // Debounced username checking for modal
  useEffect(() => {
    if (!newUsername || newUsername.trim() === '' || newUsername.trim() === profile?.username) {
      setUsernameAvailable(null);
      setUsernameError('');
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setUsernameChecking(true);
        setUsernameError('');
        const res = await checkUsernameAvailability(newUsername.trim());
        setUsernameAvailable(res.available);
        if (!res.available) {
          setUsernameError('This username is already taken.');
        }
      } catch (err) {
        console.error(err);
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [newUsername, profile?.username]);

  // Extract the 5 most recently updated library entries
  const recentEntries = [...library]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  // Load covers and metadata from MangaDex API for the 5 recent items
  useEffect(() => {
    const fetchRecentDetails = async () => {
      if (recentEntries.length === 0) {
        setRecentMangaDetails({});
        return;
      }
      setLoadingRecentDetails(true);
      try {
        const ids = recentEntries.map(entry => entry.mangaId);
        const detailsList = await getMangaList(ids);
        const map = {};
        detailsList.forEach(manga => {
          map[manga.id] = manga;
        });
        setRecentMangaDetails(map);
      } catch (err) {
        console.error('Failed to fetch recent manga metadata:', err);
      } finally {
        setLoadingRecentDetails(false);
      }
    };

    fetchRecentDetails();
  }, [library]);

  // Handlers
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleDeleteAccount = async () => {
    const user = currentUser;
    if (!user) {
      setProfileError('No authenticated user found.');
      return;
    }

    setDeleteLoading(true);
    setProfileError('');

    try {
      // Step 2: Delete from Firebase Auth & MySQL via backend DELETE endpoint
      await deleteUserFromBackend(user.uid);

      // Step 3: Best-effort client SDK delete if still active, then Sign Out
      try {
        await deleteUser(user);
      } catch (clientDeleteErr) {
        console.warn('Firebase client user deletion warning (can be ignored if already deleted by server):', clientDeleteErr);
      }

      await signOut(auth);

      // Step 4: Navigate to Login page
      navigate('/login');
    } catch (err) {
      console.error('Account deletion error:', err);
      setProfileError(err.message || 'Failed to delete account. Please try again.');
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenEditModal = () => {
    if (!profile) return;
    setNewUsername(profile.username);
    setNewAvatar(profile.avatar || '');
    setCustomAvatarUrl(profile.avatar && !AVATAR_PRESETS.includes(profile.avatar) ? profile.avatar : '');
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUser || !profile) return;

    const usernameVal = newUsername.trim();
    if (!usernameVal) {
      setEditError('Username cannot be empty.');
      return;
    }

    if (usernameVal !== profile.username && usernameAvailable === false) {
      setEditError('Please select a different username.');
      return;
    }

    setEditLoading(true);
    setEditError('');

    let finalAvatar = newAvatar;
    if (customAvatarUrl.trim()) {
      finalAvatar = customAvatarUrl.trim();
    }

    try {
      // 1. Update backend MySQL database User table
      const res = await updateUserProfile(currentUser.uid, {
        username: usernameVal,
        avatar: finalAvatar || null
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to update database profile.');
      }

      // 2. Update Firebase client profile display details
      await updateProfile(currentUser, {
        displayName: usernameVal,
        photoURL: finalAvatar || null
      });

      // 3. Update local state
      setProfile(prev => ({
        ...prev,
        username: usernameVal,
        avatar: finalAvatar || null
      }));

      setIsEditModalOpen(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Profile update failed:', err);
      setEditError(err.message || 'An error occurred while updating profile.');
    } finally {
      setEditLoading(false);
    }
  };

  // Computations for Library Stats
  const totalManga = library.length;
  const countByStatus = {
    reading: 0,
    completed: 0,
    plan_to_read: 0,
    on_hold: 0,
    dropped: 0,
    re_reading: 0
  };

  library.forEach(entry => {
    if (countByStatus[entry.status] !== undefined) {
      countByStatus[entry.status]++;
    }
  });

  const totalChapters = library.reduce((sum, entry) => sum + (entry.chaptersRead || 0), 0);
  const ratedEntries = library.filter(entry => entry.score !== null && entry.score !== undefined);
  const averageScore = ratedEntries.length > 0
    ? (ratedEntries.reduce((sum, entry) => sum + entry.score, 0) / ratedEntries.length).toFixed(1)
    : 'N/A';

  // Rendering Loader State
  if (profileLoading || libraryLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500"></div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading user profile...</p>
      </div>
    );
  }

  // Render Page Content
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 px-4 md:px-0">
      
      {/* Alert Notices */}
      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shadow-sm animate-fade-in-down">
          {successMessage}
        </div>
      )}
      
      {profileError && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl p-4 text-rose-600 dark:text-rose-450 text-xs font-semibold shadow-sm">
          {profileError}
        </div>
      )}

      {/* 1. USER INFORMATION BANNER */}
      {profile && (
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900 rounded-3xl overflow-hidden shadow-sm relative">
          {/* Cover Header Banner Background */}
          <div className="h-36 sm:h-44 bg-gradient-to-r from-rose-600/30 via-rose-500/20 to-amber-500/20 dark:from-rose-950/50 dark:via-rose-900/30 dark:to-slate-950/30 relative">
            <div className="absolute inset-0 bg-slate-950/5 dark:bg-slate-950/20 backdrop-blur-[1px]"></div>
          </div>
          
          {/* User Details & Profile Avatar Row */}
          <div className="px-6 pb-6 sm:px-8 sm:pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-14 relative z-10">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-xl bg-white dark:bg-slate-950 select-none"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-900 bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white text-4xl font-black shadow-xl select-none">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="text-center sm:text-left space-y-1.5 flex-grow mt-2 sm:mt-0">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                {profile.username}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{profile.email}</p>
              <div className="flex items-center justify-center sm:justify-start text-xs text-slate-450 dark:text-slate-500 font-semibold gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </div>
            </div>

            <div className="flex gap-3 mt-4 sm:mt-0">
              <button
                onClick={handleOpenEditModal}
                className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition duration-150 shadow-sm flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: STATS AND ACTIONS */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* 2 & 3. STATS SUMMARY CARD */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-md font-extrabold text-slate-900 dark:text-white font-sans uppercase tracking-wider">Library Statistics</h3>
              <p className="text-xs text-slate-450 dark:text-slate-500 font-medium">Detailed tracking breakdown of manga library</p>
            </div>

            {/* General Highlights */}
            <div className="grid grid-cols-3 gap-4 border-b border-slate-100 dark:border-slate-950 pb-6 text-center">
              <div className="space-y-0.5">
                <p className="text-2xl font-black text-rose-500">{totalManga}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Manga</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{totalChapters}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Chapters Read</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl font-black text-amber-500">{averageScore}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Avg Score</p>
              </div>
            </div>

            {/* Dynamic Status Progress Bar */}
            {totalManga > 0 && (
              <div className="space-y-1.5">
                <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden flex">
                  {Object.entries(countByStatus).map(([status, count]) => {
                    if (count === 0) return null;
                    const percent = ((count / totalManga) * 100).toFixed(1);
                    return (
                      <div
                        key={status}
                        style={{ width: `${percent}%` }}
                        className={`${statusColors[status] || 'bg-slate-400'} h-full`}
                        title={`${statusLabels[status]}: ${count} (${percent}%)`}
                      />
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 pt-1">
                  {Object.entries(countByStatus).map(([status, count]) => {
                    if (count === 0) return null;
                    return (
                      <div key={status} className="flex items-center gap-1.5 text-[10px] font-bold">
                        <span className={`w-2 h-2 rounded-full ${statusColors[status]}`}></span>
                        <span className="text-slate-500 dark:text-slate-400">{statusLabels[status]}:</span>
                        <span className="text-slate-800 dark:text-slate-200">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Detailed list counts */}
            <div className="space-y-3 pt-2">
              {Object.entries(countByStatus).map(([status, count]) => {
                const percent = totalManga > 0 ? Math.round((count / totalManga) * 100) : 0;
                return (
                  <div key={status} className="flex items-center justify-between text-xs font-semibold py-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${statusColors[status]}`} />
                      <span className="text-slate-700 dark:text-slate-350">{statusLabels[status]}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-900 dark:text-white font-bold">{count}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 w-8 text-right font-medium">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. ACCOUNT ACTIONS CARD */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-md font-extrabold text-slate-900 dark:text-white font-sans uppercase tracking-wider">Account Actions</h3>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800/80 transition duration-150 shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage Profile Settings
              </button>
              
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-white dark:bg-slate-950 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-200 dark:border-rose-900/50 hover:border-rose-300 dark:hover:border-rose-900/70 transition duration-150 shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-900/60">
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold bg-rose-50/50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:text-rose-700 dark:hover:text-rose-200 border border-rose-200 dark:border-rose-900/50 transition duration-150"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl p-3.5 space-y-3">
                    <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400">
                      Are you sure? This action is permanent and cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading}
                        className="flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold bg-rose-650 hover:bg-rose-750 disabled:opacity-50 text-white transition duration-150 text-center"
                      >
                        {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deleteLoading}
                        className="flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-250 transition duration-150 text-center border border-slate-200 dark:border-slate-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECENTLY UPDATED FEED */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 4. RECENTLY UPDATED */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm flex flex-col h-full justify-between min-h-[400px]">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-md font-extrabold text-slate-900 dark:text-white font-sans uppercase tracking-wider">Recently Updated</h3>
                  <p className="text-xs text-slate-450 dark:text-slate-500 font-medium">Your 5 most recently active bookmarks</p>
                </div>
                <Link
                  to="/library"
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:text-rose-455 hover:underline flex items-center gap-1"
                >
                  View Library
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {loadingRecentDetails ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                  <p className="text-slate-400 text-xs">Fetching library cover arts...</p>
                </div>
              ) : recentEntries.length > 0 ? (
                <div className="space-y-4">
                  {recentEntries.map(entry => {
                    const manga = recentMangaDetails[entry.mangaId];
                    const title = manga?.title || `Manga (ID: ${entry.mangaId})`;
                    const coverUrl = manga?.coverUrl;

                    return (
                      <div
                        key={entry.mangaId}
                        className="flex gap-4 p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-950 rounded-2xl hover:border-slate-200 dark:hover:border-slate-800/80 hover:bg-slate-100/30 dark:hover:bg-slate-950/80 transition duration-150 group"
                      >
                        {/* cover thumbnail */}
                        <div className="w-12 h-16 bg-slate-200 dark:bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-950 shadow-sm relative select-none">
                          {coverUrl ? (
                            <img
                              src={coverUrl}
                              alt={title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-[8px] text-slate-500 font-bold">Cover</span>
                            </div>
                          )}
                        </div>

                        {/* info details */}
                        <div className="flex flex-col justify-between py-0.5 flex-grow">
                          <div className="space-y-1">
                            <Link
                              to={`/manga/${entry.mangaId}`}
                              className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-rose-500 transition duration-150 line-clamp-1"
                              title={title}
                            >
                              {title}
                            </Link>
                            
                            {/* status and progress info */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${statusBgColors[entry.status]}`}>
                                {statusLabels[entry.status]}
                              </span>
                              <span className="text-[11px] text-slate-455 dark:text-slate-500 font-semibold">
                                Read: <strong className="text-slate-700 dark:text-slate-350">{entry.chaptersRead} ch</strong>
                              </span>
                              {entry.score !== null && entry.score !== undefined && (
                                <span className="text-[11px] text-amber-500 dark:text-amber-400 font-bold flex items-center gap-0.5">
                                  ★ {entry.score}/10
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] text-slate-405 dark:text-slate-600 font-medium">
                            Updated: {new Date(entry.updatedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty library state */
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-900 border-dashed rounded-3xl">
                  <p className="text-slate-400 text-sm">Your reading library is empty.</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mt-1">Start bookmarks in browse section to populate library details.</p>
                  <Link
                    to="/browse"
                    className="mt-5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition duration-150 shadow-md shadow-rose-950/20"
                  >
                    Browse MangaDex
                  </Link>
                </div>
              )}
            </div>
            
            {/* Display status details summary */}
            {recentEntries.length > 0 && (
              <div className="text-[10px] text-slate-400 dark:text-slate-600 border-t border-slate-100 dark:border-slate-900/60 pt-4 font-semibold text-center sm:text-right uppercase tracking-wider">
                Showing {Math.min(5, recentEntries.length)} of {totalManga} total entries
              </div>
            )}
          </div>

        </div>

      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => !editLoading && setIsEditModalOpen(false)}
          ></div>

          {/* Modal Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative z-10 overflow-y-auto max-h-[90vh] animate-fade-in">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Edit Profile Settings</h3>
              <button
                type="button"
                disabled={editLoading}
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition duration-150"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error alerts */}
            {editError && (
              <div className="my-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl p-3 text-rose-600 dark:text-rose-455 text-xs font-semibold">
                {editError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="space-y-6 mt-4">
              
              {/* Input: Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider block">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    disabled={editLoading}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all duration-200 pr-10"
                    placeholder="Username"
                  />
                  {/* Realtime check spinner/icon */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {usernameChecking ? (
                      <div className="animate-spin h-4 w-4 border-2 border-rose-500 border-t-transparent rounded-full"></div>
                    ) : usernameAvailable === true ? (
                      <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : usernameAvailable === false ? (
                      <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : null}
                  </div>
                </div>
                {/* Username availability status messages */}
                {usernameError && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1">{usernameError}</p>
                )}
                {usernameAvailable === true && (
                  <p className="text-[11px] font-bold text-emerald-500 mt-1">Username is available.</p>
                )}
              </div>

              {/* Avatar Preset Grid selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider block">
                  Select Preset Avatar
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {AVATAR_PRESETS.map((preset, index) => {
                    const isSelected = newAvatar === preset && !customAvatarUrl;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setNewAvatar(preset);
                          setCustomAvatarUrl('');
                        }}
                        disabled={editLoading}
                        className={`w-full aspect-square rounded-2xl overflow-hidden border-2 transition duration-150 select-none ${
                          isSelected
                            ? 'border-rose-500 scale-95 shadow-md shadow-rose-950/20'
                            : 'border-slate-100 dark:border-slate-800 hover:border-rose-500/50 hover:scale-95'
                        }`}
                      >
                        <img src={preset} alt={`preset-${index}`} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input: Custom Avatar URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider block">
                  Or Paste Custom Avatar URL
                </label>
                <input
                  type="url"
                  value={customAvatarUrl}
                  onChange={(e) => {
                    setCustomAvatarUrl(e.target.value);
                    setNewAvatar(e.target.value);
                  }}
                  disabled={editLoading}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all duration-200"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              {/* Real-time Preview */}
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/50 dark:border-slate-850/60 rounded-2xl">
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 select-none">
                  {(customAvatarUrl || newAvatar) ? (
                    <img
                      src={customAvatarUrl || newAvatar}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-extrabold text-lg">
                      {newUsername ? newUsername.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Live Profile Preview</p>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{newUsername || 'Username'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  disabled={editLoading}
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-855 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-700 dark:hover:text-slate-200 transition duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading || (newUsername.trim() !== profile.username && usernameAvailable === false) || usernameChecking}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition duration-150 flex items-center gap-1.5 shadow-md shadow-rose-950/20"
                >
                  {editLoading ? 'Saving changes...' : 'Save Changes'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;
