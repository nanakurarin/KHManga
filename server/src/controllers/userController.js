import admin from '../config/firebaseAdmin.js';
import * as userService from '../services/userService.js';

/**
 * Check whether a username is available.
 * GET /api/users/check-username/:username
 */
export const checkUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    // Validate username
    if (!username || username.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Username is required.',
      });
    }

    // Check if username already exists
    const existingUser = await userService.findUserByUsername(username.trim());

    return res.status(200).json({
      success: true,
      available: !existingUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sync user from Firebase Auth to the MySQL database.
 * If user exists (by firebaseUid), returns 200 with the user data.
 * If user does not exist, creates the user and returns 201.
 */
export const syncUser = async (req, res, next) => {
  try {
    const { firebaseUid, email, username } = req.body;

    // 1. Validate required fields
    if (!firebaseUid || typeof firebaseUid !== 'string' || firebaseUid.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'firebaseUid is required and must be a non-empty string.',
      });
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'email is required and must be a non-empty string.',
      });
    }

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'username is required and must be a non-empty string.',
      });
    }

    const cleanUid = firebaseUid.trim();
    const cleanEmail = email.trim();
    const cleanUsername = username.trim();

    // 2. Check if user already exists by firebaseUid
    const existingUser = await userService.findUserByFirebaseUid(cleanUid);
    if (existingUser) {
      return res.status(200).json({
        success: true,
        user: existingUser,
      });
    }

    // 3. Cleanup orphaned record by email if account was deleted from Firebase Console
    const existingByEmail = await userService.findUserByEmail(cleanEmail);
    if (existingByEmail && existingByEmail.firebaseUid !== cleanUid) {
      console.log(`Cleaning up old orphaned MySQL record for email: ${cleanEmail}`);
      await userService.deleteUserByFirebaseUid(existingByEmail.firebaseUid);
    }

    // 4. Cleanup orphaned record by username if account was deleted from Firebase Console
    const existingByUsername = await userService.findUserByUsername(cleanUsername);
    if (existingByUsername && existingByUsername.firebaseUid !== cleanUid) {
      console.log(`Cleaning up old orphaned MySQL record for username: ${cleanUsername}`);
      await userService.deleteUserByFirebaseUid(existingByUsername.firebaseUid);
    }

    // 5. Create new user in MySQL
    const newUser = await userService.createUser({
      firebaseUid: cleanUid,
      email: cleanEmail,
      username: cleanUsername,
    });

    // Return status 201
    return res.status(201).json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const targets = Array.isArray(error.meta?.target)
        ? error.meta.target.join(', ')
        : error.meta?.target || 'field';

      return res.status(409).json({
        success: false,
        error: `Unique constraint failed on the field(s): (${targets})`,
      });
    }

    next(error);
  }
};

/**
 * Delete user from Firebase Auth and MySQL database by firebaseUid.
 * DELETE /api/users/:firebaseUid
 */
export const deleteUserAccount = async (req, res, next) => {
  try {
    const { firebaseUid } = req.params;

    if (!firebaseUid || typeof firebaseUid !== 'string' || firebaseUid.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'firebaseUid is required.',
      });
    }

    const uid = firebaseUid.trim();

    // 1. Delete user from Firebase Authentication using Admin SDK (No session token / recent login limit!)
    if (admin.apps.length) {
      try {
        await admin.auth().deleteUser(uid);
        console.log(`Firebase Auth user ${uid} successfully deleted via Admin SDK.`);
      } catch (firebaseErr) {
        // If user is already deleted or not found in Firebase Auth, proceed to clean up MySQL
        if (firebaseErr.code !== 'auth/user-not-found') {
          console.warn('Firebase Admin Auth deletion notice:', firebaseErr.message);
        }
      }
    }

    // 2. Delete user record from MySQL database
    const existingUser = await userService.findUserByFirebaseUid(uid);
    if (existingUser) {
      await userService.deleteUserByFirebaseUid(uid);
    }

    return res.status(200).json({
      success: true,
      message: 'Account permanently deleted from Firebase Auth and MySQL database.',
    });
  } catch (error) {
    next(error);
  }
};