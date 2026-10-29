const prisma = require('../prisma');

// Admin campus stats
const getAdminOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalItems,
      totalLost,
      totalFound,
      totalResolved,
      totalClaims,
      pendingClaims
    ] = await Promise.all([
      prisma.user.count(),
      prisma.item.count(),
      prisma.item.count({ where: { type: 'LOST' } }),
      prisma.item.count({ where: { type: 'FOUND' } }),
      prisma.item.count({ where: { status: 'RESOLVED' } }),
      prisma.claim.count(),
      prisma.claim.count({ where: { status: 'PENDING' } })
    ]);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        collegeId: true,
        role: true,
        createdAt: true,
        _count: { select: { items: true, claims: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const recentClaims = await prisma.claim.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        item: { select: { id: true, title: true, type: true } },
        claimant: { select: { id: true, name: true, email: true } }
      }
    });

    res.json({
      stats: {
        totalUsers,
        totalItems,
        totalLost,
        totalFound,
        totalResolved,
        totalClaims,
        pendingClaims
      },
      users,
      recentClaims
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ message: 'Error retrieving admin metrics.' });
  }
};

// Change user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['STUDENT', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be STUDENT or ADMIN.' });
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });

    res.json({ message: `User role updated to ${role}.`, user: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role.' });
  }
};

// Admin delete any item
const adminDeleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.item.delete({ where: { id: parseInt(id, 10) } });
    res.json({ message: 'Item deleted by college administrator.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item.' });
  }
};

module.exports = {
  getAdminOverview,
  updateUserRole,
  adminDeleteItem
};
