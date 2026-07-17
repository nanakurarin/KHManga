import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute Component
 * Prevents unauthenticated users from accessing specific client routes.
 */
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  // Show a full-page dark spinner while authentication state is resolving
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16">
          {/* Inner pulsing logo light */}
          <div className="absolute inset-0 bg-rose-500/10 rounded-full blur-xl animate-pulse"></div>
          {/* Spinning gradient border */}
          <div className="w-16 h-16 rounded-full border-4 border-t-rose-500 border-r-transparent border-b-slate-800 border-l-transparent animate-spin"></div>
        </div>
        <p className="text-slate-400 text-sm font-semibold tracking-wider animate-pulse uppercase">
          Loading auth state...
        </p>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Render children components if authenticated
  return children;
}

export default ProtectedRoute;
