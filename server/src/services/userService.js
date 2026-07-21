import prisma from '../prisma.js';

/**
 * Find a user by their Firebase UID.
 * @param {string} firebaseUid 
 * @returns {Promise<Object|null>}
 */
export const findUserByFirebaseUid = (firebaseUid) => {
  return prisma.user.findUnique({
    where: { firebaseUid },
  });
};



/**
 * Find a user by username.
 * @param {string} username
 * @returns {Promise<Object|null>}
 */
export const findUserByUsername = async (username) => {
  return await prisma.user.findUnique({
    where: { username },
  });
};



/**
 * Create a new user in the database.
 * @param {Object} userData 
 * @param {string} userData.firebaseUid
 * @param {string} userData.email
 * @param {string} userData.username
 * @returns {Promise<Object>}
 */
export const createUser = (userData) => {
  return prisma.user.create({
    data: {
      firebaseUid: userData.firebaseUid,
      email: userData.email,
      username: userData.username,
      avatar: userData.avatar || null,
    },
  });
};

/**
 * Find a user by email.
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
export const findUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

/**
 * Find a user by primary key id.
 * @param {number} id 
 * @returns {Promise<Object|null>}
 */
export const findUserById = (id) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

/**
 * Delete user from database by firebaseUid.
 * @param {string} firebaseUid
 * @returns {Promise<Object>}
 */
export const deleteUserByFirebaseUid = (firebaseUid) => {
  return prisma.user.delete({
    where: { firebaseUid },
  });
};

/**
 * Resolve a user by either numeric id or firebaseUid string.
 * @param {string|number} identifier
 * @returns {Promise<Object|null>}
 */
export const resolveUser = async (identifier) => {
  if (!identifier) return null;
  const numId = Number(identifier);
  if (!isNaN(numId) && Number.isInteger(numId) && numId > 0) {
    const userById = await findUserById(numId);
    if (userById) return userById;
  }
  return await findUserByFirebaseUid(String(identifier).trim());
};


