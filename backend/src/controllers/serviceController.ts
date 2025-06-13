import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { ServiceProvider } from '../models/ServiceProvider';

export const getProviderServices = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    // Find the provider by user ID
    const provider = await ServiceProvider.findOne({ user: req.user._id })
      .populate('services.category', 'name');
    
    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }
    
    // Format services for response
    const formattedServices = provider.services.map(service => ({
      id: service._id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: {
        id: service.category._id,
        name: service.category.name
      },
      isActive: true
    }));

    return res.json(formattedServices);
  } catch (error) {
    console.error('Error fetching provider services:', error);
    return res.status(500).json({ message: 'Error fetching provider services', error });
  }
}; 