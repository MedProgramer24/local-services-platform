import { Request, Response } from 'express';
import { ServiceProvider } from '../models/ServiceProvider';
import { ServiceCategory } from '../models/ServiceCategory';
import { AuthRequest } from '../types/express';

// Create a new service provider
export const createServiceProvider = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const {
      businessName,
      description,
      categories,
      services,
      location,
      contactInfo,
      availability
    } = req.body;

    // Verify categories exist
    const categoryIds = await ServiceCategory.find({
      _id: { $in: categories }
    }).select('_id');

    if (categoryIds.length !== categories.length) {
      return res.status(400).json({ message: 'One or more categories do not exist' });
    }

    const serviceProvider = new ServiceProvider({
      user: req.user._id,
      businessName,
      description,
      categories,
      services,
      location,
      contactInfo,
      availability
    });

    await serviceProvider.save();

    return res.status(201).json({
      message: 'Service provider created successfully',
      serviceProvider
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating service provider', error });
  }
};

// Get service provider profile
export const getServiceProvider = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const serviceProvider = await ServiceProvider.findOne({ user: req.user._id })
      .populate('categories')
      .populate('services.category');

    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    return res.json(serviceProvider);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching service provider', error });
  }
};

// Update service provider profile
export const updateServiceProvider = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const updates = req.body;
    const allowedUpdates = [
      'businessName',
      'description',
      'categories',
      'services',
      'location',
      'contactInfo',
      'availability',
      'isActive'
    ];

    // Filter out invalid updates
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    const serviceProvider = await ServiceProvider.findOneAndUpdate(
      { user: req.user._id },
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).populate('categories')
     .populate('services.category');

    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    return res.json({
      message: 'Service provider updated successfully',
      serviceProvider
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating service provider', error });
  }
};

// Search service providers
export const searchServiceProviders = async (req: Request, res: Response) => {
  try {
    const {
      query,
      category,
      location,
      radius = 10, // default 10km radius
      minRating,
      page = 1,
      limit = 10
    } = req.query;

    const searchQuery: any = { isActive: true };

    // Text search
    if (query) {
      searchQuery.$text = { $search: query as string };
    }

    // Category filter
    if (category) {
      searchQuery.categories = category;
    }

    // Location-based search
    if (location && Array.isArray(location) && location.length === 2) {
      searchQuery['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: location
          },
          $maxDistance: (radius as number) * 1000 // convert km to meters
        }
      };
    }

    // Rating filter
    if (minRating) {
      searchQuery.rating = { $gte: Number(minRating) };
    }

    console.log('Search query:', JSON.stringify(searchQuery, null, 2));

    const skip = (Number(page) - 1) * Number(limit);

    // First, let's check if there are any providers at all
    const totalProviders = await ServiceProvider.countDocuments({});
    console.log('Total providers in database:', totalProviders);

    // Then check how many match our search criteria
    const matchingProviders = await ServiceProvider.countDocuments(searchQuery);
    console.log('Providers matching search criteria:', matchingProviders);

    const [serviceProviders, total] = await Promise.all([
      ServiceProvider.find(searchQuery)
        .populate('categories')
        .populate('services.category')
        .skip(skip)
        .limit(Number(limit))
        .sort({ rating: -1 }),
      ServiceProvider.countDocuments(searchQuery)
    ]);

    // Log the first provider's data if any exist
    if (serviceProviders.length > 0) {
      console.log('First provider data:', JSON.stringify(serviceProviders[0], null, 2));
    } else {
      // If no providers found, let's check what providers exist in the database
      const allProviders = await ServiceProvider.find({}).select('businessName isActive categories');
      console.log('All providers in database:', JSON.stringify(allProviders, null, 2));
    }

    return res.json({
      serviceProviders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ message: 'Error searching service providers', error });
  }
};

// Get service provider by ID (public)
export const getServiceProviderById = async (req: Request, res: Response) => {
  try {
    const serviceProvider = await ServiceProvider.findOne({
      _id: req.params.id,
      isActive: true
    })
      .populate('categories')
      .populate('services.category')
      .populate('user', 'firstName lastName businessName');

    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    return res.json(serviceProvider);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching service provider', error });
  }
}; 