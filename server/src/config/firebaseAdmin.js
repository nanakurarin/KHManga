import admin from 'firebase-admin';

/**
 * Safely initialize Firebase Admin SDK.
 * Will not crash the server if service account credentials are missing.
 */
try {
  if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON && process.env.FIREBASE_SERVICE_ACCOUNT_JSON.trim() !== '') {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized with Service Account.');
    } else {
      // Try default initialization
      admin.initializeApp();
      console.log('Firebase Admin SDK initialized with default credentials.');
    }
  }
} catch (error) {
  console.warn('Firebase Admin SDK initialization skipped (No service account configured):', error.message);
}

export default admin;
