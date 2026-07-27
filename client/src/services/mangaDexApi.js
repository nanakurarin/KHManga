const BASE_URL = 'https://api.mangadex.org';

// Genre tag mapping to MangaDex UUIDs
export const genreTagIds = {
  'Thriller': '07251805-a27e-4d59-b488-f0bfbec15168',
  'Sci-Fi': '256c8bd9-4904-4360-bf4f-508a76d67183',
  'Action': '391b0423-d847-456f-aff0-8b0cfc03066b',
  'Romance': '423e2eae-a7a2-4a8b-ac03-a8351462d71d',
  'Comedy': '4d32cc48-9f00-4cca-9b5a-a839f0764984',
  'Drama': 'b9af3a63-f058-46de-a9a0-e0c13906197a',
  'Fantasy': 'cdc58593-87dd-415e-bbc0-2ec27bf404cc',
  'Slice of Life': 'e5301a23-ebd9-49dd-a0cb-2add944c7fe9',
  'Supernatural': 'eabc5b4c-6aff-42f3-b657-3e90cbd00b75'
};

/**
 * Helper to extract English fields or fallbacks from MangaDex structures.
 */
export const formatMangaData = (manga) => {
  if (!manga) return null;

  const id = manga.id;
  const attrs = manga.attributes || {};

  // Extract English title, fallback to any available title
  const title = attrs.title?.en || 
    (attrs.title ? Object.values(attrs.title)[0] : '') || 
    'Untitled Manga';

  // Extract alt titles (just strings)
  const altTitles = (attrs.altTitles || [])
    .map(t => Object.values(t)[0])
    .filter(Boolean);

  // Extract description
  const description = attrs.description?.en || 
    (attrs.description ? Object.values(attrs.description)[0] : '') || 
    'No English description available.';

  // Resolve cover art relationship
  const coverRel = manga.relationships?.find(r => r.type === 'cover_art');
  const coverFileName = coverRel?.attributes?.fileName;
  const coverUrl = coverFileName 
    ? `https://uploads.mangadex.org/covers/${id}/${coverFileName}.512.jpg`
    : null;

  // Resolve author
  const authorRel = manga.relationships?.find(r => r.type === 'author');
  const author = authorRel?.attributes?.name || 'Unknown Author';

  // Resolve artist
  const artistRel = manga.relationships?.find(r => r.type === 'artist');
  const artist = artistRel?.attributes?.name || 'Unknown Artist';

  // Format status to Title Case (e.g. ongoing -> Ongoing)
  const rawStatus = attrs.status || 'unknown';
  const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

  // Format genres/tags
  const genres = (attrs.tags || [])
    .filter(t => t.attributes?.group === 'genre')
    .map(t => t.attributes?.name?.en)
    .filter(Boolean);

  const year = attrs.year || 'N/A';

  return {
    id,
    title,
    altTitles,
    description,
    coverUrl,
    author,
    artist,
    status,
    genres,
    year,
    contentRating: attrs.contentRating || 'safe'
  };
};

/**
 * Resolves a cover art URL for a manga.
 * Supports both formatted manga object and raw MangaDex API response.
 * 
 * @param {Object} manga - Manga details object
 * @returns {string|null} Cover art image URL
 */
export const getCoverArt = (manga) => {
  if (!manga) return null;
  if (manga.coverUrl) return manga.coverUrl;
  
  const coverRel = manga.relationships?.find(r => r.type === 'cover_art');
  const coverFileName = coverRel?.attributes?.fileName;
  if (coverFileName && manga.id) {
    return `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}.512.jpg`;
  }
  return null;
};

/**
 * Fetch the latest uploaded or updated manga.
 * 
 * @returns {Promise<Array>} List of formatted manga objects
 */
export const getLatestManga = async () => {
  try {
    const url = new URL(`${BASE_URL}/manga`);
    url.searchParams.append('includes[]', 'cover_art');
    url.searchParams.append('includes[]', 'author');
    url.searchParams.append('includes[]', 'artist');
    url.searchParams.append('limit', '10');
    url.searchParams.append('contentRating[]', 'safe');
    url.searchParams.append('contentRating[]', 'suggestive');
    url.searchParams.append('order[latestUploadedChapter]', 'desc');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch latest manga: ${response.status}`);
    }

    const data = await response.json();
    return (data.data || []).map(formatMangaData).filter(Boolean);
  } catch (error) {
    console.error('Error in getLatestManga:', error);
    throw error;
  }
};

/**
 * Search manga by title with optional filtering and sorting options.
 * 
 * @param {string} query - Search title keyword
 * @param {Object} [options] - Filters and sorting options
 * @param {string} [options.genre] - Genre label to filter
 * @param {string} [options.order] - Sort ordering ('Latest Updates', 'Alphabetical', 'Highest Rating')
 * @param {number} [options.limit] - Limit results (default: 24)
 * @param {number} [options.offset] - Offset (default: 0)
 * @returns {Promise<Array>} List of formatted manga objects
 */
export const searchManga = async (query = '', options = {}) => {
  try {
    const url = new URL(`${BASE_URL}/manga`);
    
    url.searchParams.append('includes[]', 'cover_art');
    url.searchParams.append('includes[]', 'author');
    url.searchParams.append('includes[]', 'artist');
    
    const limit = options.limit || 24;
    const offset = options.offset || 0;
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('offset', offset.toString());
    
    url.searchParams.append('contentRating[]', 'safe');
    url.searchParams.append('contentRating[]', 'suggestive');

    if (query && query.trim()) {
      url.searchParams.append('title', query.trim());
    }

    if (options.genre && genreTagIds[options.genre]) {
      url.searchParams.append('includedTags[]', genreTagIds[options.genre]);
    }

    if (options.order === 'Alphabetical') {
      url.searchParams.append('order[title]', 'asc');
    } else if (options.order === 'Highest Rating') {
      url.searchParams.append('order[followedCount]', 'desc');
    } else {
      url.searchParams.append('order[latestUploadedChapter]', 'desc');
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to search manga: ${response.status}`);
    }

    const data = await response.json();
    return (data.data || []).map(formatMangaData).filter(Boolean);
  } catch (error) {
    console.error('Error in searchManga:', error);
    throw error;
  }
};

/**
 * Fetch details of a single manga by ID.
 * 
 * @param {string} id - MangaDex UUID
 * @returns {Promise<Object>} Formatted manga object
 */
export const getMangaDetails = async (id) => {
  try {
    const url = new URL(`${BASE_URL}/manga/${encodeURIComponent(id)}`);
    url.searchParams.append('includes[]', 'cover_art');
    url.searchParams.append('includes[]', 'author');
    url.searchParams.append('includes[]', 'artist');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch manga details: ${response.status}`);
    }

    const data = await response.json();
    return formatMangaData(data.data);
  } catch (error) {
    console.error(`Error in getMangaDetails for ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch chapter list feed for a manga, filtering for English chapters.
 * Deduplicates multiple scanlations of the same chapter.
 * 
 * @param {string} id - MangaDex UUID
 * @returns {Promise<Array>} List of deduplicated chapter objects
 */
export const getMangaChapters = async (id) => {
  try {
    const url = new URL(`${BASE_URL}/manga/${encodeURIComponent(id)}/feed`);
    url.searchParams.append('translatedLanguage[]', 'en');
    url.searchParams.append('limit', '500');
    url.searchParams.append('order[chapter]', 'asc');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch chapters list: ${response.status}`);
    }

    const data = await response.json();
    const chaptersList = data.data || [];

    const uniqueChapters = [];
    const seenChapters = new Set();

    for (const ch of chaptersList) {
      const chNum = ch.attributes?.chapter;
      if (chNum) {
        if (!seenChapters.has(chNum)) {
          seenChapters.add(chNum);
          uniqueChapters.push({
            id: ch.id,
            number: chNum,
            title: ch.attributes?.title || `Chapter ${chNum}`,
            date: ch.attributes?.publishAt 
              ? new Date(ch.attributes.publishAt).toISOString().split('T')[0]
              : 'N/A'
          });
        }
      } else {
        uniqueChapters.push({
          id: ch.id,
          number: 'Oneshot',
          title: ch.attributes?.title || 'Oneshot',
          date: ch.attributes?.publishAt 
            ? new Date(ch.attributes.publishAt).toISOString().split('T')[0]
            : 'N/A'
        });
      }
    }

    return uniqueChapters;
  } catch (error) {
    console.error(`Error in getMangaChapters for ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch a list of manga details by their IDs in a single request.
 * 
 * @param {Array<string>} ids - Array of MangaDex UUIDs
 * @returns {Promise<Array>} List of formatted manga objects
 */
export const getMangaList = async (ids) => {
  if (!ids || ids.length === 0) return [];
  try {
    const url = new URL(`${BASE_URL}/manga`);
    url.searchParams.append('includes[]', 'cover_art');
    url.searchParams.append('includes[]', 'author');
    url.searchParams.append('includes[]', 'artist');
    url.searchParams.append('limit', '100');
    
    ids.slice(0, 100).forEach(id => {
      url.searchParams.append('ids[]', id);
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch manga list: ${response.status}`);
    }

    const data = await response.json();
    return (data.data || []).map(formatMangaData).filter(Boolean);
  } catch (error) {
    console.error('Error in getMangaList:', error);
    return [];
  }
};
