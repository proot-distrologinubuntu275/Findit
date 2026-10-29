const prisma = require('../prisma');
const fs = require('fs');
const path = require('path');

// Get all items with rich filtering & search
const getItems = async (req, res) => {
  try {
    const { type, category, status, search, location, sort = 'newest' } = req.query;

    const where = {};

    if (type && type !== 'ALL') {
      where.type = type.toUpperCase();
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (location) {
      where.location = { contains: location };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
        { category: { contains: search } }
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'date_desc') orderBy = { date: 'desc' };
    if (sort === 'date_asc') orderBy = { date: 'asc' };

    const items = await prisma.item.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, collegeId: true }
        },
        _count: {
          select: { claims: true }
        }
      }
    });

    res.json({ items, total: items.length });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Error retrieving items.' });
  }
};

// Get single item by ID
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const itemId = parseInt(id, 10);

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, collegeId: true }
        },
        claims: {
          include: {
            claimant: {
              select: { id: true, name: true, email: true, phone: true, collegeId: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Mask claims info if current viewer is neither the item owner nor an admin
    const currentUserId = req.user ? req.user.id : null;
    const isOwnerOrAdmin = req.user && (req.user.id === item.userId || req.user.role === 'ADMIN');

    if (!isOwnerOrAdmin) {
      // Filter out claims that don't belong to the logged-in viewer
      item.claims = item.claims.filter(c => c.claimantId === currentUserId);
    }

    res.json({ item });
  } catch (error) {
    console.error('Error fetching item details:', error);
    res.status(500).json({ message: 'Error retrieving item details.' });
  }
};

// Create new Lost or Found item
const createItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      location,
      date,
      securityQuestion,
      contactEmail,
      contactPhone
    } = req.body;

    if (!title || !description || !category || !type || !location || !date) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const item = await prisma.item.create({
      data: {
        title,
        description,
        category,
        type: type.toUpperCase(),
        location,
        date: new Date(date),
        imageUrl,
        securityQuestion: securityQuestion || null,
        contactEmail: contactEmail || req.user.email,
        contactPhone: contactPhone || req.user.phone,
        userId: req.user.id
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: `${type.toUpperCase() === 'LOST' ? 'Lost' : 'Found'} item application published successfully!`,
      item
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Error creating item application.' });
  }
};

// Update item (Owner or Admin)
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const itemId = parseInt(id, 10);

    const existing = await prisma.item.findUnique({ where: { id: itemId } });
    if (!existing) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    if (existing.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized to edit this item.' });
    }

    const {
      title,
      description,
      category,
      status,
      location,
      date,
      securityQuestion,
      contactEmail,
      contactPhone
    } = req.body;

    let imageUrl = existing.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      // Clean up previous image file if exists
      if (existing.imageUrl) {
        const oldPath = path.join(__dirname, '../../', existing.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const updated = await prisma.item.update({
      where: { id: itemId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(status && { status }),
        ...(location && { location }),
        ...(date && { date: new Date(date) }),
        ...(imageUrl && { imageUrl }),
        ...(securityQuestion !== undefined && { securityQuestion }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(contactPhone !== undefined && { contactPhone })
      }
    });

    res.json({ message: 'Item updated successfully', item: updated });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Error updating item.' });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const itemId = parseInt(id, 10);

    const existing = await prisma.item.findUnique({ where: { id: itemId } });
    if (!existing) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    if (existing.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized to delete this item.' });
    }

    if (existing.imageUrl) {
      const imgPath = path.join(__dirname, '../../', existing.imageUrl);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await prisma.item.delete({ where: { id: itemId } });

    res.json({ message: 'Item application removed successfully.' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Error deleting item.' });
  }
};

// Get current user's items
const getMyItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      where: { userId: req.user.id },
      include: {
        claims: {
          include: {
            claimant: {
              select: { id: true, name: true, email: true, phone: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your items.' });
  }
};

// Get statistics for the dashboard
const getStats = async (req, res) => {
  try {
    const [totalLost, totalFound, totalResolved, totalUsers] = await Promise.all([
      prisma.item.count({ where: { type: 'LOST' } }),
      prisma.item.count({ where: { type: 'FOUND' } }),
      prisma.item.count({ where: { status: 'RESOLVED' } }),
      prisma.user.count()
    ]);

    const recentItems = await prisma.item.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    });

    res.json({
      totalLost,
      totalFound,
      totalResolved,
      totalUsers,
      recentItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving statistics.' });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getMyItems,
  getStats
};
