/**
 * Helper to handle response and parse error message if the response is not OK.
 */
const handleResponse = async (response, defaultErrorMsg) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMsg = defaultErrorMsg || `HTTP error! status: ${response.status}`;
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
  return response.json();
};

/**
 * Add a manga to the user's library.
 * POST /api/library
 * 
 * @param {Object} params
 * @param {string} params.firebaseUid - Firebase user UID
 * @param {string} params.mangaId - Unique ID of the manga
 * @param {string} [params.status] - Status enum (e.g., 'plan_to_read', 'reading', etc.)
 * @param {number} [params.chaptersRead] - Number of chapters read
 * @param {number} [params.score] - Score (1-10)
 * @param {string} [params.notes] - Notes/Comments
 * @param {string|null} [params.startDate] - YYYY-MM-DD or ISO date string
 * @param {string|null} [params.finishDate] - YYYY-MM-DD or ISO date string
 * @returns {Promise<Object>} The added library entry
 */
export const addToLibrary = async (params) => {
  try {
    // Sanitize dates to be null if they are empty strings
    const sanitizedParams = {
      ...params,
      startDate: params.startDate || null,
      finishDate: params.finishDate || null,
    };

    const response = await fetch('/api/library', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedParams),
    });

    return await handleResponse(response, 'Failed to add manga to library.');
  } catch (error) {
    console.error('Error adding to library:', error);
    throw error;
  }
};

/**
 * Fetch the user's entire library list.
 * GET /api/library/:firebaseUid
 * 
 * @param {string} firebaseUid - Firebase user UID
 * @returns {Promise<Object>} Object containing the list of library entries
 */
export const getLibrary = async (firebaseUid) => {
  try {
    const response = await fetch(`/api/library/${encodeURIComponent(firebaseUid)}`);
    return await handleResponse(response, 'Failed to retrieve library.');
  } catch (error) {
    console.error('Error getting library:', error);
    throw error;
  }
};

/**
 * Update details of a manga in the user's library.
 * PUT /api/library/:firebaseUid/:mangaId
 * 
 * @param {string} firebaseUid - Firebase user UID
 * @param {string} mangaId - Unique ID of the manga
 * @param {Object} updateData - Fields to update
 * @param {string} [updateData.status] - Status enum
 * @param {number} [updateData.chaptersRead] - Chapters read count
 * @param {number|null} [updateData.score] - Score (1-10)
 * @param {string|null} [updateData.notes] - User notes
 * @param {string|null} [updateData.startDate] - Start date string
 * @param {string|null} [updateData.finishDate] - Finish date string
 * @returns {Promise<Object>} The updated library entry
 */
export const updateLibrary = async (firebaseUid, mangaId, updateData) => {
  try {
    // Sanitize dates to be null if they are empty strings
    const sanitizedData = {
      ...updateData,
    };
    if (updateData.hasOwnProperty('startDate')) {
      sanitizedData.startDate = updateData.startDate || null;
    }
    if (updateData.hasOwnProperty('finishDate')) {
      sanitizedData.finishDate = updateData.finishDate || null;
    }

    const response = await fetch(
      `/api/library/${encodeURIComponent(firebaseUid)}/${encodeURIComponent(mangaId)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      }
    );

    return await handleResponse(response, 'Failed to update library entry.');
  } catch (error) {
    console.error('Error updating library:', error);
    throw error;
  }
};

/**
 * Remove a manga from the user's library.
 * DELETE /api/library/:firebaseUid/:mangaId
 * 
 * @param {string} firebaseUid - Firebase user UID
 * @param {string} mangaId - Unique ID of the manga
 * @returns {Promise<Object>} Confirmation response
 */
export const removeFromLibrary = async (firebaseUid, mangaId) => {
  try {
    const response = await fetch(
      `/api/library/${encodeURIComponent(firebaseUid)}/${encodeURIComponent(mangaId)}`,
      {
        method: 'DELETE',
      }
    );

    return await handleResponse(response, 'Failed to remove manga from library.');
  } catch (error) {
    console.error('Error removing from library:', error);
    throw error;
  }
};
