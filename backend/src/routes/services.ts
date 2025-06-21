import express, { Response } from 'express';
import { body } from 'express-validator';
import { auth, checkRole } from '../middleware/auth';
import { getProviderServices } from '../controllers/serviceController';
import { AuthRequest } from '../types/express';
import { ServiceProvider } from '../models/ServiceProvider';
import { ServiceCategory } from '../models/ServiceCategory';

const router = express.Router();

// Get all services for the logged-in provider
router.get('/provider', auth, checkRole(['service_provider']), getProviderServices);

// Create new service
router.post('/', auth, checkRole(['service_provider']), [
  body('name').notEmpty().withMessage('Service name is required'),
  body('category').notEmpty().withMessage('Service category is required'),
  body('description').notEmpty().withMessage('Service description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('duration').isNumeric().withMessage('Duration must be a number')
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const { 
      name, 
      category, 
      description, 
      price, 
      duration, 
      images, 
      priceType, 
      location, 
      cities, 
      availability, 
      tags, 
      contactPhone, 
      contactEmail, 
      experience, 
      certifications 
    } = req.body;

    // Validate category exists
    const categoryExists = await ServiceCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Find or create the service provider
    let serviceProvider = await ServiceProvider.findOne({ user: req.user._id });
    
    if (!serviceProvider) {
      // Create a new service provider with default values
      serviceProvider = new ServiceProvider({
        user: req.user._id,
        businessName: req.user.firstName + ' ' + req.user.lastName,
        description: 'Service provider',
        categories: [category],
        services: [],
        location: {
          type: 'Point',
          coordinates: [0, 0], // Default coordinates
          address: 'Address not set',
          city: 'City not set',
          state: 'State not set',
          country: 'Country not set',
          postalCode: '00000'
        },
        contactInfo: {
          phone: req.user.phoneNumber || 'Phone not set',
          email: req.user.email
        },
        availability: {
          days: [
            { day: 'monday', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
            { day: 'tuesday', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
            { day: 'wednesday', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
            { day: 'thursday', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
            { day: 'friday', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
            { day: 'saturday', isAvailable: false, slots: [] },
            { day: 'sunday', isAvailable: false, slots: [] }
          ]
        }
      });
      
      await serviceProvider.save();
    }

    // Add new service to provider's services array
    serviceProvider.services.push({
      name,
      description,
      price: Number(price),
      duration: Number(duration),
      category: category,
      images: images || [] // Add images field
    });

    await serviceProvider.save();

    // Populate category info for response
    await serviceProvider.populate('services.category', 'name');

    const newService = serviceProvider.services[serviceProvider.services.length - 1];

    return res.status(201).json({
      id: newService._id,
      name: newService.name,
      description: newService.description,
      price: newService.price,
      duration: newService.duration,
      images: newService.images,
      category: {
        id: newService.category._id,
        name: newService.category.name
      },
      isActive: true,
      createdAt: serviceProvider.updatedAt
    });
  } catch (error) {
    console.error('Error creating service:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      user: req.user?._id,
      body: req.body
    });
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Update service
router.put('/:id', auth, checkRole(['service_provider']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const { id } = req.params;
    const { 
      name, 
      category, 
      description, 
      price, 
      duration, 
      images, 
      priceType, 
      location, 
      cities, 
      availability, 
      tags, 
      contactPhone, 
      contactEmail, 
      experience, 
      certifications 
    } = req.body;

    // Find the service provider
    const serviceProvider = await ServiceProvider.findOne({ user: req.user._id });
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    // Find and update the specific service
    const serviceIndex = serviceProvider.services.findIndex(
      service => service._id.toString() === id
    );

    if (serviceIndex === -1) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Update service fields
    if (name) serviceProvider.services[serviceIndex].name = name;
    if (description) serviceProvider.services[serviceIndex].description = description;
    if (price) serviceProvider.services[serviceIndex].price = Number(price);
    if (duration) serviceProvider.services[serviceIndex].duration = Number(duration);
    if (category) serviceProvider.services[serviceIndex].category = category;
    if (images !== undefined) serviceProvider.services[serviceIndex].images = images;

    await serviceProvider.save();

    // Populate category info for response
    await serviceProvider.populate('services.category', 'name');

    const updatedService = serviceProvider.services[serviceIndex];

    return res.json({
      id: updatedService._id,
      name: updatedService.name,
      description: updatedService.description,
      price: updatedService.price,
      duration: updatedService.duration,
      images: updatedService.images,
      category: {
        id: updatedService.category._id,
        name: updatedService.category.name
      },
      isActive: true,
      updatedAt: serviceProvider.updatedAt
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete service
router.delete('/:id', auth, checkRole(['service_provider']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const { id } = req.params;

    // Find the service provider
    const serviceProvider = await ServiceProvider.findOne({ user: req.user._id });
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    // Remove the service from the services array
    const serviceIndex = serviceProvider.services.findIndex(
      service => service._id.toString() === id
    );

    if (serviceIndex === -1) {
      return res.status(404).json({ message: 'Service not found' });
    }

    serviceProvider.services.splice(serviceIndex, 1);
    await serviceProvider.save();

    return res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 