const express = require('express');
const router = express.Router();
const {
  createClaim,
  updateClaimStatus,
  getMyClaims,
  getNotifications,
  markNotificationRead
} = require('../controllers/claimController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', authMiddleware, upload.single('proofImage'), createClaim);
router.put('/:id/status', authMiddleware, updateClaimStatus);
router.get('/my', authMiddleware, getMyClaims);
router.get('/notifications', authMiddleware, getNotifications);
router.put('/notifications/:id/read', authMiddleware, markNotificationRead);

module.exports = router;
