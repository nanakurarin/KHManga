/**
 * Maps standard Firebase Authentication error codes to beginner-friendly,
 * readable error message strings.
 * 
 * @param {string} code - The Firebase Auth error code
 * @returns {string} User-friendly error message
 */
export function getFriendlyFirebaseError(code) {
    switch (code) {
        case 'auth/email-already-in-use':
            return 'This email address is already in use by another account.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/weak-password':
            return 'The password is too weak. Please choose a stronger password with at least 8 characters.';
        case 'auth/network-request-failed':
            return 'Network connection failed. Please check your internet connection and try again.';
        case 'auth/too-many-requests':
            return 'Too many request attempts. Please try again later.';
        case 'auth/operation-not-allowed':
            return 'Email/password registration is currently disabled.';
        case 'auth/wrong-password':
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
            return 'Incorrect email or password. Please try again.';
        default:
            return 'An error occurred. Please check your details and try again.';
    }
}
