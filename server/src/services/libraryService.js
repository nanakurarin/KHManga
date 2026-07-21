import { Status } from '@prisma/client';
import prisma from '../prisma.js';

/**
 * Find a single library entry by userId and mangaId
 * @param {number} userId
 * @param {string} mangaId
 * @returns {Promise<Object|null>}
 */
export const findLibraryEntry = (userId, mangaId) => {
  return prisma.library.findUnique({
    where: {
      userId_mangaId: {
        userId,
        mangaId,
      },
    },
  });
};

/**
 * Add a manga entry to user library
 * @param {Object} data
 * @param {number} data.userId
 * @param {string} data.mangaId
 * @param {string} [data.status]
 * @param {number} [data.chaptersRead]
 * @param {number} [data.score]
 * @param {string} [data.notes]
 * @param {string|Date} [data.startDate]
 * @param {string|Date} [data.finishDate]
 * @returns {Promise<Object>}
 */
export const addMangaToLibrary = (data) => {
  return prisma.library.create({
    data: {
      userId: data.userId,
      mangaId: data.mangaId,
      status: data.status || 'plan_to_read',
      chaptersRead: data.chaptersRead || 0,
      score: data.score || null,
      notes: data.notes || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      finishDate: data.finishDate ? new Date(data.finishDate) : null,
    },
  });
};

/**
 * Get all library entries for a user with optional status filter
 * @param {number} userId
 * @param {string|null} [statusFilter]
 * @returns {Promise<Array>}
 */
export const getUserLibrary = (userId, statusFilter = null) => {
  const whereCondition = { userId };

  if (statusFilter && Object.values(Status).includes(statusFilter)) {
    whereCondition.status = statusFilter;
  }

  return prisma.library.findMany({
    where: whereCondition,
    orderBy: {
      updatedAt: 'desc',
    },
  });
};

/**
 * Update a library entry
 * @param {number} userId
 * @param {string} mangaId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export const updateLibraryEntry = (userId, mangaId, updateData) => {
  const data = {};

  if (updateData.status && Object.values(Status).includes(updateData.status)) {
    data.status = updateData.status;
  }

  if (typeof updateData.chaptersRead === 'number') {
    data.chaptersRead = updateData.chaptersRead;
  }

  if (typeof updateData.score === 'number' || updateData.score === null) {
    data.score = updateData.score;
  }

  if (typeof updateData.notes === 'string' || updateData.notes === null) {
    data.notes = updateData.notes;
  }

  if (updateData.startDate !== undefined) {
    data.startDate = updateData.startDate ? new Date(updateData.startDate) : null;
  }

  if (updateData.finishDate !== undefined) {
    data.finishDate = updateData.finishDate ? new Date(updateData.finishDate) : null;
  }

  return prisma.library.update({
    where: {
      userId_mangaId: {
        userId,
        mangaId,
      },
    },
    data,
  });
};

/**
 * Remove a manga from user library
 * @param {number} userId
 * @param {string} mangaId
 * @returns {Promise<Object>}
 */
export const removeMangaFromLibrary = (userId, mangaId) => {
  return prisma.library.delete({
    where: {
      userId_mangaId: {
        userId,
        mangaId,
      },
    },
  });
};
