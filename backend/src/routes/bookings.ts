import express from 'express';
import { auth, checkRole } from '../middleware/auth';
import { AuthRequest } from '../types/express';
import { Booking } from '../models/Booking';
import { ServiceProvider } from '../models/ServiceProvider';
import { User } from '../models/User';

const router = express.Router();

// Get provider's bookings
router.get('/provider', auth, checkRole(['service_provider']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    // Find the service provider
    const serviceProvider = await ServiceProvider.findOne({ user: req.user._id });
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    // Get bookings for this provider
    const bookings = await Booking.find({ provider: serviceProvider._id })
      .populate('customer', 'name email phone')
      .sort({ date: -1, createdAt: -1 });

    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      customerName: booking.customer.name,
      customerId: booking.customer._id,
      serviceName: booking.serviceName,
      date: booking.date.toISOString().split('T')[0],
      time: booking.time,
      status: booking.status,
      price: booking.price,
      address: booking.address,
      customerNotes: booking.customerNotes,
      providerNotes: booking.providerNotes,
      rating: booking.rating,
      review: booking.review,
      createdAt: booking.createdAt
    }));

    return res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get customer's bookings
router.get('/customer', auth, checkRole(['customer']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    // Get bookings for this customer
    const bookings = await Booking.find({ customer: req.user._id })
      .populate('provider', 'businessName')
      .sort({ date: -1, createdAt: -1 });

    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      providerName: booking.provider.businessName,
      providerId: booking.provider._id,
      serviceName: booking.serviceName,
      date: booking.date.toISOString().split('T')[0],
      time: booking.time,
      status: booking.status,
      price: booking.price,
      address: booking.address,
      customerNotes: booking.customerNotes,
      providerNotes: booking.providerNotes,
      rating: booking.rating,
      review: booking.review,
      createdAt: booking.createdAt
    }));

    return res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new booking
router.post('/', auth, checkRole(['customer']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const { providerId, serviceName, serviceDescription, date, time, price, address, customerNotes } = req.body;

    // Validate provider exists
    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    // Create new booking
    const newBooking = new Booking({
      customer: req.user._id,
      provider: providerId,
      serviceName,
      serviceDescription,
      date: new Date(date),
      time,
      price,
      address,
      customerNotes,
      status: 'pending'
    });

    await newBooking.save();

    // Populate customer and provider info for response
    await newBooking.populate('customer', 'name email phone');
    await newBooking.populate('provider', 'businessName');

    return res.status(201).json({
      id: newBooking._id,
      customerName: newBooking.customer.name,
      customerId: newBooking.customer._id,
      providerName: newBooking.provider.businessName,
      providerId: newBooking.provider._id,
      serviceName: newBooking.serviceName,
      date: newBooking.date.toISOString().split('T')[0],
      time: newBooking.time,
      status: newBooking.status,
      price: newBooking.price,
      address: newBooking.address,
      customerNotes: newBooking.customerNotes,
      createdAt: newBooking.createdAt
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update booking status
router.patch('/:id/status', auth, checkRole(['service_provider']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Find the service provider
    const serviceProvider = await ServiceProvider.findOne({ user: req.user._id });
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    // Update booking status
    const booking = await Booking.findOneAndUpdate(
      { _id: id, provider: serviceProvider._id },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).populate('customer', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.json({
      id: booking._id,
      customerName: booking.customer.name,
      customerId: booking.customer._id,
      serviceName: booking.serviceName,
      date: booking.date.toISOString().split('T')[0],
      time: booking.time,
      status: booking.status,
      price: booking.price,
      address: booking.address,
      updatedAt: booking.updatedAt
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 