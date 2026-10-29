const express = require('express');
const router = express.Router();
const {
  getAdminOverview,
  updateUserRole,
  adminDeleteItem
} = require('../controllers/adminController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.use(authMiddleware, adminOnly);

router.get('/overview', getAdminOverview);
router.put('/users/:id/role', updateUserRole);
router.delete('/items/:id', adminDeleteItem);

module.exports = router;
