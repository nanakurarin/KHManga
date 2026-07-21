import { Status } from '@prisma/client';
import * as libraryService from '../services/libraryService.js';
import * as userService from '../services/userService.js';

/**
 * 1. Add manga to user library
 * POST /api/library
 */
export const addToLibrary = async (req, res, next) => {
  try {
    const { userId, firebaseUid, mangaId, status, chaptersRead, score, notes, startDate, finishDate } = req.body;
    const userIdentifier = userId || firebaseUid;

    if (!userIdentifier) {
      return res.status(400).json({ success: false, error: 'userId or firebaseUid is required.' });
    }

    if (!mangaId || typeof mangaId !== 'string' || mangaId.trim() === '') {
      return res.status(400).json({ success: false, error: 'mangaId is required.' });
    }

    if (status && !Object.values(Status).includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Allowed values: ${Object.values(Status).join(', ')}`,
      });
    }

    // Resolve user by numeric userId or string firebaseUid
    const user = await userService.resolveUser(userIdentifier);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Check if entry already exists
    const existing = await libraryService.findLibraryEntry(user.id, mangaId.trim());
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'This manga is already in your library.',
        libraryEntry: existing,
      });
    }

    const newEntry = await libraryService.addMangaToLibrary({
      userId: user.id,
      mangaId: mangaId.trim(),
      status: status || 'plan_to_read',
      chaptersRead: typeof chaptersRead === 'number' ? chaptersRead : 0,
      score: score || null,
      notes: notes || null,
      startDate: startDate || null,
      finishDate: finishDate || null,
    });

    return res.status(201).json({
      success: true,
      libraryEntry: newEntry,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'This manga is already in your library.',
      });
    }
    next(error);
  }
};

/**
 * 2. Get user library
 * GET /api/library/:identifier
 * (:identifier can be numeric userId or string firebaseUid)
 */
export const getLibrary = async (req, res, next) => {
  try {
    const { identifier, firebaseUid } = req.params;
    const userParam = identifier || firebaseUid;
    const { status } = req.query;

    if (!userParam || userParam.trim() === '') {
      return res.status(400).json({ success: false, error: 'User identifier parameter is required.' });
    }

    const user = await userService.resolveUser(userParam.trim());
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const library = await libraryService.getUserLibrary(user.id, status || null);

    return res.status(200).json({
      success: true,
      count: library.length,
      library,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Update manga status or details in library
 * PUT /api/library/:identifier/:mangaId
 * (:identifier can be numeric userId or string firebaseUid)
 */
export const updateLibrary = async (req, res, next) => {
  try {
    const { identifier, firebaseUid, mangaId } = req.params;
    const userParam = identifier || firebaseUid;

    if (!userParam || !mangaId) {
      return res.status(400).json({ success: false, error: 'User identifier and mangaId parameters are required.' });
    }

    const { status } = req.body;
    if (status && !Object.values(Status).includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Allowed values: ${Object.values(Status).join(', ')}`,
      });
    }

    const user = await userService.resolveUser(userParam.trim());
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const existing = await libraryService.findLibraryEntry(user.id, mangaId.trim());
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Library entry not found.',
      });
    }

    const updatedEntry = await libraryService.updateLibraryEntry(
      user.id,
      mangaId.trim(),
      req.body
    );

    return res.status(200).json({
      success: true,
      libraryEntry: updatedEntry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Remove manga from library
 * DELETE /api/library/:identifier/:mangaId
 * (:identifier can be numeric userId or string firebaseUid)
 */
export const removeFromLibrary = async (req, res, next) => {
  try {
    const { identifier, firebaseUid, mangaId } = req.params;
    const userParam = identifier || firebaseUid;

    if (!userParam || !mangaId) {
      return res.status(400).json({ success: false, error: 'User identifier and mangaId parameters are required.' });
    }

    const user = await userService.resolveUser(userParam.trim());
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const existing = await libraryService.findLibraryEntry(user.id, mangaId.trim());
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Manga is not in user library.',
      });
    }

    await libraryService.removeMangaFromLibrary(user.id, mangaId.trim());

    return res.status(200).json({
      success: true,
      message: 'Manga successfully removed from library.',
    });
  } catch (error) {
    next(error);
  }
};
