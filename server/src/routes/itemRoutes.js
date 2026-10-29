const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getMyItems,
  getStats
} = require('../controllers/itemController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes (or with optional auth to customize claim visibility)
router.get('/stats', getStats);
router.get('/', getItems);
router.get('/my', authMiddleware, getMyItems);
router.get('/:id', optionalAuthMiddleware, getItemById);

// Protected routes
router.post('/', authMiddleware, upload.single('image'), createItem);
router.put('/:id', authMiddleware, upload.single('image'), updateItem);
router.delete('/:id', authMiddleware, deleteItem);

module.exports = router;
