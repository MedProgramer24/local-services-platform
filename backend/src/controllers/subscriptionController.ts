import { Request, Response } from 'express';
import { ServiceProvider } from '../models/ServiceProvider';
import { Subscription } from '../models/Subscription';
import { addDays } from 'date-fns';

// Initialize subscription for new service provider
export const initializeSubscription = async (serviceProviderId: string) => {
  const trialEndDate = addDays(new Date(), 14); // 14 days trial
  const subscriptionEndDate = addDays(new Date(), 30); // 30 days subscription

  // Create subscription record
  const subscription = await Subscription.create({
    serviceProvider: serviceProviderId,
    status: 'trial',
    startDate: new Date(),
    endDate: subscriptionEndDate,
    trialEndDate: trialEndDate
  });

  // Update service provider with subscription info
  await ServiceProvider.findByIdAndUpdate(serviceProviderId, {
    subscriptionStatus: 'trial',
    subscriptionEndDate: subscriptionEndDate,
    trialEndDate: trialEndDate
  });

  return subscription;
};

// Get subscription status
export const getSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const serviceProvider = await ServiceProvider.findOne({ user: req.user._id });
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    const subscription = await Subscription.findOne({ serviceProvider: serviceProvider._id });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json({
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      trialEndDate: subscription.trialEndDate,
      lastPaymentDate: subscription.lastPaymentDate,
      paymentAmount: subscription.paymentAmount,
      paymentStatus: subscription.paymentStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription status', error });
  }
};

// Process subscription payment
export const processSubscriptionPayment = async (req: Request, res: Response) => {
  try {
    const { paymentMethod } = req.body;
    const serviceProvider = await ServiceProvider.findOne({ user: req.user._id });
    
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    const subscription = await Subscription.findOne({ serviceProvider: serviceProvider._id });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // TODO: Integrate with actual payment gateway
    // For now, we'll simulate a successful payment
    const paymentAmount = 100; // 100 DH
    const subscriptionEndDate = addDays(new Date(), 30);

    // Update subscription
    subscription.status = 'active';
    subscription.lastPaymentDate = new Date();
    subscription.paymentAmount = paymentAmount;
    subscription.paymentStatus = 'completed';
    subscription.endDate = subscriptionEndDate;
    await subscription.save();

    // Update service provider
    serviceProvider.subscriptionStatus = 'active';
    serviceProvider.subscriptionEndDate = subscriptionEndDate;
    await serviceProvider.save();

    res.json({
      message: 'Payment processed successfully',
      subscription: {
        status: subscription.status,
        endDate: subscription.endDate,
        paymentAmount: subscription.paymentAmount,
        paymentStatus: subscription.paymentStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment', error });
  }
};

// Check subscription status (middleware)
export const checkSubscriptionStatus = async (req: Request, res: Response, next: Function) => {
  try {
    const serviceProvider = await ServiceProvider.findOne({ user: req.user._id });
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    const subscription = await Subscription.findOne({ serviceProvider: serviceProvider._id });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if subscription is expired
    if (subscription.status === 'trial' && new Date() > subscription.trialEndDate) {
      subscription.status = 'expired';
      serviceProvider.subscriptionStatus = 'expired';
      await Promise.all([subscription.save(), serviceProvider.save()]);
    } else if (subscription.status === 'active' && new Date() > subscription.endDate) {
      subscription.status = 'expired';
      serviceProvider.subscriptionStatus = 'expired';
      await Promise.all([subscription.save(), serviceProvider.save()]);
    }

    // Add subscription info to request
    req.subscription = subscription;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking subscription status', error });
  }
}; 