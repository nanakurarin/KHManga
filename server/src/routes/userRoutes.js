import express from 'express';
import { syncUser, checkUsername, deleteUserAccount } from '../controllers/userController.js';

const router = express.Router();

// GET /api/users/check-username/:username
router.get('/check-username/:username', checkUsername);
// POST /api/users/sync
router.post('/sync', syncUser);
// DELETE /api/users/:firebaseUid
router.delete('/:firebaseUid', deleteUserAccount);

export default router;

