/**
 * Reusable helper to sync user authentication details from Firebase Auth to the MySQL backend.
 * Uses relative path which is proxied to the backend port by Vite server.
 * 
 * @param {Object} params
 * @param {string} params.firebaseUid - Firebase user UID
 * @param {string} params.email - Firebase user email
 * @param {string} params.username - User display name/username
 * @returns {Promise<Object>} The synced user object from the backend database
 */


export const checkUsernameAvailability = async (username) => {
  const response = await fetch(`/api/users/check-username/${encodeURIComponent(username)}`);

  if (!response.ok) {
    throw new Error('Failed to check username.');
  }

  return response.json();
};


export const syncUserWithBackend = async ({ firebaseUid, email, username }) => {
  try {
    const response = await fetch('/api/users/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firebaseUid, email, username }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson && errorJson.error) {
          errorMsg = errorJson.error;
        }
      } catch (e) {
        // Response is not JSON
        if (errorText) {
          errorMsg = errorText;
        }
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error syncing user with backend:', error);
    throw error;
  }
};

export const deleteUserFromBackend = async (firebaseUid) => {
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(firebaseUid)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson && errorJson.error) {
          errorMsg = errorJson.error;
        }
      } catch (e) {
        if (errorText) {
          errorMsg = errorText;
        }
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting user from backend:', error);
    throw error;
  }
};

