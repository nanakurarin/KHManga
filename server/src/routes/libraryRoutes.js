import express from 'express';
import {
  addToLibrary,
  getLibrary,
  updateLibrary,
  removeFromLibrary,
} from '../controllers/libraryController.js';

const router = express.Router();

// 1. Add manga to library (POST /api/library)
router.post('/', addToLibrary);

// 2. Get user's library (GET /api/library/:identifier)
router.get('/:identifier', getLibrary);

// 3. Update manga status/details (PUT /api/library/:identifier/:mangaId)
router.put('/:identifier/:mangaId', updateLibrary);

// 4. Remove manga from library (DELETE /api/library/:identifier/:mangaId)
router.delete('/:identifier/:mangaId', removeFromLibrary);

export default router;
