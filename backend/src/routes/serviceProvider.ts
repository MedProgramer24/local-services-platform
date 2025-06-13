import express from 'express';
import { body } from 'express-validator';
import {
  createServiceProvider,
  getServiceProvider,
  updateServiceProvider,
  searchServiceProviders,
  getServiceProviderById
} from '../controllers/serviceProviderController';
import { auth, checkRole } from '../middleware/auth';
import { ServiceProvider } from '../models/ServiceProvider'; // <-- Make sure this import exists

const router = express.Router();

// Validation middleware
const serviceProviderValidation = [
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('categories').isArray().withMessage('Categories must be an array'),
  body('categories.*').isMongoId().withMessage('Invalid category ID'),
  body('services').isArray().withMessage('Services must be an array'),
  body('services.*.name').notEmpty().withMessage('Service name is required'),
  body('services.*.description').notEmpty().withMessage('Service description is required'),
  body('services.*.price').isNumeric().withMessage('Service price must be a number'),
  body('services.*.duration').isInt({ min: 15 }).withMessage('Service duration must be at least 15 minutes'),
  body('services.*.category').isMongoId().withMessage('Invalid service category ID'),
  body('location.coordinates').isArray().withMessage('Location coordinates must be an array'),
  body('location.coordinates.*').isNumeric().withMessage('Coordinates must be numbers'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('location.country').notEmpty().withMessage('Country is required'),
  body('location.postalCode').notEmpty().withMessage('Postal code is required'),
  body('contactInfo.phone').notEmpty().withMessage('Phone number is required'),
  body('contactInfo.email').isEmail().withMessage('Valid email is required'),
  body('availability.days').isArray().withMessage('Availability days must be an array'),
  body('availability.days.*.day').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day'),
  body('availability.days.*.slots').isArray().withMessage('Time slots must be an array'),
  body('availability.days.*.slots.*.start').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format (HH:mm)'),
  body('availability.days.*.slots.*.end').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format (HH:mm)')
];

// --- NEW: Get all providers for chat sidebar ---
router.get('/', auth, async (req, res) => {
  try {
    console.log('=== FETCHING PROVIDERS FOR CHAT ===');
    const providers = await ServiceProvider.find({ isActive: true }).populate('user', 'firstName lastName businessName email');
    
    console.log('Raw providers from database:', providers.length);
    
    const formattedProviders = providers.map(provider => {
      const user = provider.user as any;
      const formattedProvider = {
        id: user._id, // This should match the conversation participant ID
        _id: user._id,
        name: user.businessName || `${user.firstName} ${user.lastName || ''}`.trim(),
        businessName: user.businessName,
        email: user.email,
        contactInfo: {
          email: user.email
        }
      };
      
      console.log('Formatted provider:', {
        id: formattedProvider.id,
        name: formattedProvider.name,
        businessName: formattedProvider.businessName,
        email: formattedProvider.email
      });
      
      return formattedProvider;
    });
    
    console.log('Formatted providers for chat:', formattedProviders.length);
    res.json({ providers: formattedProviders });
  } catch (err) {
    console.error('Error fetching providers for chat:', err);
    res.status(500).json({ message: 'Failed to fetch providers' });
  }
});

// Protected routes (require authentication)
router.post('/', auth, checkRole(['service_provider']), serviceProviderValidation, createServiceProvider);
router.get('/profile', auth, checkRole(['service_provider']), getServiceProvider);
router.patch('/profile', auth, checkRole(['service_provider']), serviceProviderValidation, updateServiceProvider);

// Public routes
router.get('/search', searchServiceProviders);
router.get('/:id', getServiceProviderById);

export default router;