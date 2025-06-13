import express from 'express';
import { auth, checkRole } from '../middleware/auth';
import { AuthRequest } from '../types/express';
import { ServiceProvider } from '../models/ServiceProvider';
import { Booking } from '../models/Booking';

const router = express.Router();

// Get provider dashboard stats
router.get('/stats', auth, checkRole(['service_provider']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    // Find the service provider
    const serviceProvider = await ServiceProvider.findOne({ user: req.user._id });
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      { $match: { provider: serviceProvider._id } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$price', 0] }
          },
          averageRating: { $avg: '$rating' },
          totalReviews: {
            $sum: { $cond: [{ $ne: ['$rating', null] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = bookingStats[0] || {
      totalBookings: 0,
      completedBookings: 0,
      pendingBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0,
      averageRating: 0,
      totalReviews: 0
    };

    return res.json({
      totalBookings: stats.totalBookings,
      completedBookings: stats.completedBookings,
      pendingBookings: stats.pendingBookings,
      cancelledBookings: stats.cancelledBookings,
      totalRevenue: stats.totalRevenue,
      averageRating: Math.round(stats.averageRating * 10) / 10 || 0,
      totalReviews: stats.totalReviews
    });
  } catch (error) {
    console.error('Error fetching provider stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get provider profile
router.get('/profile', auth, checkRole(['service_provider']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const serviceProvider = await ServiceProvider.findOne({ user: req.user._id })
      .populate('user', 'name email phone')
      .populate('categories', 'name');

    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    return res.json({
      id: serviceProvider._id,
      name: serviceProvider.user.name,
      email: serviceProvider.user.email,
      phone: serviceProvider.user.phone,
      businessName: serviceProvider.businessName,
      description: serviceProvider.description,
      location: serviceProvider.location,
      rating: serviceProvider.rating,
      totalReviews: serviceProvider.totalReviews,
      isVerified: serviceProvider.isVerified,
      isActive: serviceProvider.isActive,
      subscriptionStatus: serviceProvider.subscriptionStatus
    });
  } catch (error) {
    console.error('Error fetching provider profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update provider profile
router.put('/profile', auth, checkRole(['service_provider']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const serviceProvider = await ServiceProvider.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');

    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    return res.json({
      id: serviceProvider._id,
      name: serviceProvider.user.name,
      email: serviceProvider.user.email,
      phone: serviceProvider.user.phone,
      businessName: serviceProvider.businessName,
      description: serviceProvider.description,
      location: serviceProvider.location,
      rating: serviceProvider.rating,
      totalReviews: serviceProvider.totalReviews,
      isVerified: serviceProvider.isVerified,
      isActive: serviceProvider.isActive,
      subscriptionStatus: serviceProvider.subscriptionStatus,
      updatedAt: serviceProvider.updatedAt
    });
  } catch (error) {
    console.error('Error updating provider profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 