import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { getFriendlyFirebaseError } from '../utils/firebaseErrors';

// ==========================================
// 1. VALIDATION LOGIC (Helper function)
// ==========================================
/**
 * Performs client-side validation on the registration form inputs.
 * Returns an object indicating success or failure with an optional error message.
 * 
 * @param {string} username - User chosen display name
 * @param {string} email - Input email address
 * @param {string} password - User chosen password (min 8 characters)
 * @param {string} confirmPassword - Retyped password
 * @returns {{ isValid: boolean, errorMessage: string }} Validation result
 */
const validateRegistrationForm = (username, email, password, confirmPassword) => {
  // Ensure none of the fields are empty or only whitespace
  if (!username.trim() || !email.trim() || !password || !confirmPassword) {
    return { isValid: false, errorMessage: 'All fields are required.' };
  }

  // Password must be a minimum of 8 characters
  if (password.length < 8) {
    return { isValid: false, errorMessage: 'Password must be at least 8 characters long.' };
  }

  // Verify both password fields match
  if (password !== confirmPassword) {
    return { isValid: false, errorMessage: 'Passwords do not match.' };
  }

  return { isValid: true, errorMessage: '' };
};

// ==========================================
// 2. REGISTRATION LOGIC (Helper function)
// ==========================================
/**
 * Executes the user registration flow using Firebase Authentication.
 * Creates the user, sets their displayName, reloads the user state,
 * and verifies that the displayName was updated correctly.
 * 
 * @param {string} username - User chosen name
 * @param {string} email - Input email address
 * @param {string} password - User chosen password
 * @returns {Promise<import('firebase/auth').User>} The verified registered user object
 */
const registerUser = async (username, email, password) => {
  // Create user using Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);

  // Update user profile to include their username as displayName
  await updateProfile(userCredential.user, {
    displayName: username.trim(),
  });

  // Refresh the Firebase user state to ensure display name is synchronized locally
  await userCredential.user.reload();

  // Verify the profile displayName was updated correctly after reloading
  const updatedUser = auth.currentUser;
  if (!updatedUser || updatedUser.displayName !== username.trim()) {
    throw new Error('Profile update verification failed. Display name did not update correctly.');
  }

  return updatedUser;
};

// ==========================================
// 3. UI RENDERING & COMPONENT STATE
// ==========================================
/**
 * Register Page Component
 * Renders the registration form and handles user submission events
 */
function Register() {
  // React States for inputs and UI loading / error states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    const validationResult = validateRegistrationForm(username, email, password, confirmPassword);
    if (!validationResult.isValid) {
      setError(validationResult.errorMessage);
      return;
    }

    // Step B: Execution of the registration logic
    try {
      setLoading(true);
      await registerUser(username, email, password);

      // Successfully registered and verified, navigate to home page
      navigate('/');
    } catch (err) {
      console.error('Firebase registration error:', err);
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
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-400 to-amber-500 tracking-wide">
            CREATE ACCOUNT
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Join KHManga to track your library and bookmarks
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative">
          
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              placeholder="e.g. MangaLover"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800/80 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all duration-200"
            />
          </div>

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
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800/80 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all duration-200"
            />
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800/80 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all duration-200"
            />
          </div>

          {/* Submit Button (Create Account) */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg text-sm transition-all duration-300 mt-3 shadow-lg shadow-rose-950/40 relative flex items-center justify-center space-x-2 ${
              loading ? 'opacity-70 cursor-not-allowed bg-rose-700' : 'hover:scale-[1.01]'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Divider decorative line */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800/80"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">Or sign up with</span>
          <div className="flex-grow border-t border-slate-800/80"></div>
        </div>

        {/* Disabled Social Google Auth placeholder as requested */}
        <div>
          <button
            disabled
            className="w-full bg-slate-950/50 border border-slate-800 hover:border-slate-700 hover:text-white text-slate-400 font-bold py-2.5 rounded-lg text-xs transition duration-200 flex items-center justify-center space-x-2 cursor-not-allowed opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.708 0 3.277.604 4.5 1.625l2.437-2.437C17.312 1.696 14.933 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.795 0 10.254-4.074 10.254-10.24 0-.695-.08-1.355-.22-1.955H12.24z"/>
            </svg>
            <span>Google Account (Coming Soon)</span>
          </button>
        </div>

        {/* Redirection Link to Login Page */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/50">
          Already have an account?{' '}
          <Link to="/login" className="text-rose-500 hover:text-rose-400 hover:underline font-semibold transition duration-200">
            Log In here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
