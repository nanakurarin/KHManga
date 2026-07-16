import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';

// 1. Create the Authentication Context
const AuthContext = createContext();

/**
 * Custom hook to easily access authentication context values.
 * This saves us from having to import useContext and AuthContext in every component.
 * 
 * @returns {{ currentUser: import('firebase/auth').User | null, loading: boolean }}
 */
export function useAuth() {
    return useContext(AuthContext);
}

/**
 * Provider component that wraps the application.
 * It manages the authentication state and provides it to all child components.
 */
export function AuthProvider({ children }) {
    // Track the currently logged-in user (null when logged out or not yet loaded)
    const [currentUser, setCurrentUser] = useState(null);

    // Track whether the initial authentication state is still loading/checking
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // onAuthStateChanged subscribes to the user's sign-in state.
        // It is triggered when the user signs in, signs out, or when the app initializes.
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false); // Once Firebase responds with the user state, loading is complete
        });

        // Return the unsubscribe function to clean up the listener when the component unmounts.
        // This prevents memory leaks by ensuring the listener doesn't keep running in the background.
        return unsubscribe;
    }, []);

    // Values that will be accessible to any component calling useAuth()
    const value = {
        currentUser,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
