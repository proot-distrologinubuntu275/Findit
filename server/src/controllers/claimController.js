const prisma = require('../prisma');

// Submit a claim on an item
const createClaim = async (req, res) => {
  try {
    const { itemId, message, claimantContact } = req.body;

    if (!itemId || !message) {
      return res.status(400).json({ message: 'Item ID and verification message/description are required.' });
    }

    const item = await prisma.item.findUnique({
      where: { id: parseInt(itemId, 10) },
      include: { user: true }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    if (item.userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot submit a claim on your own posted item.' });
    }

    // Check if user already claimed this item
    const existingClaim = await prisma.claim.findFirst({
      where: {
        itemId: item.id,
        claimantId: req.user.id
      }
    });

    if (existingClaim) {
      return res.status(400).json({ message: 'You have already submitted a claim on this item.' });
    }

    let proofImageUrl = null;
    if (req.file) {
      proofImageUrl = `/uploads/${req.file.filename}`;
    }

    const claim = await prisma.claim.create({
      data: {
        itemId: item.id,
        claimantId: req.user.id,
        message,
        claimantContact: claimantContact || req.user.phone || req.user.email,
        proofImageUrl
      },
      include: {
        claimant: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    // Notify item owner
    await prisma.notification.create({
      data: {
        userId: item.userId,
        title: 'New Claim Received',
        message: `${req.user.name} submitted a claim request for "${item.title}". Check your dashboard to verify.`,
        link: `/items/${item.id}`
      }
    });

    // Update item status to CLAIM_PENDING if currently OPEN
    if (item.status === 'OPEN') {
      await prisma.item.update({
        where: { id: item.id },
        data: { status: 'CLAIM_PENDING' }
      });
    }

    res.status(201).json({
      message: 'Claim request submitted successfully! The poster has been notified.',
      claim
    });
  } catch (error) {
    console.error('Error submitting claim:', error);
    res.status(500).json({ message: 'Server error while submitting claim.' });
  }
};

// Update claim status (Approve / Reject) by item owner or Admin
const updateClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "APPROVED" or "REJECTED"

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be APPROVED or REJECTED.' });
    }

    const claim = await prisma.claim.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        item: true,
        claimant: true
      }
    });

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found.' });
    }

    const isOwnerOrAdmin = claim.item.userId === req.user.id || req.user.role === 'ADMIN';
    if (!isOwnerOrAdmin) {
      return res.status(403).json({ message: 'Unauthorized. Only item poster or admin can review claims.' });
    }

    const updatedClaim = await prisma.claim.update({
      where: { id: claim.id },
      data: { status }
    });

    if (status === 'APPROVED') {
      // Mark item as RESOLVED
      await prisma.item.update({
        where: { id: claim.itemId },
        data: { status: 'RESOLVED' }
      });

      // Reject all other pending claims on this item
      await prisma.claim.updateMany({
        where: {
          itemId: claim.itemId,
          id: { not: claim.id },
          status: 'PENDING'
        },
        data: { status: 'REJECTED' }
      });

      // Notify claimant with contact instructions
      await prisma.notification.create({
        data: {
          userId: claim.claimantId,
          title: 'Claim Approved! 🎉',
          message: `Great news! Your claim for "${claim.item.title}" was approved. You can contact the owner to collect it.`,
          link: `/items/${claim.itemId}`
        }
      });
    } else {
      // Notify claimant of rejection
      await prisma.notification.create({
        data: {
          userId: claim.claimantId,
          title: 'Claim Update',
          message: `Your claim for "${claim.item.title}" was not approved by the poster.`,
          link: `/items/${claim.itemId}`
        }
      });
    }

    res.json({ message: `Claim has been ${status.toLowerCase()}.`, claim: updatedClaim });
  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({ message: 'Server error while updating claim status.' });
  }
};

// Get current user's submitted claims
const getMyClaims = async (req, res) => {
  try {
    const claims = await prisma.claim.findMany({
      where: { claimantId: req.user.id },
      include: {
        item: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ claims });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving your claims.' });
  }
};

// Get notifications for user
const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving notifications.' });
  }
};

// Mark notification as read
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.update({
      where: { id: parseInt(id, 10), userId: req.user.id },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification.' });
  }
};

module.exports = {
  createClaim,
  updateClaimStatus,
  getMyClaims,
  getNotifications,
  markNotificationRead
};
