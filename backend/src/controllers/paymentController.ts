import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { AuthRequest } from '../types/express';
import { body, validationResult } from 'express-validator';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Create payment intent for subscription
export const createSubscriptionPayment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { amount, description } = req.body;

    const result = await PaymentService.createSubscriptionPayment(
      req.user._id,
      amount,
      description
    );

    return res.status(201).json({
      message: 'Subscription payment intent created successfully',
      payment: {
        id: result.payment._id,
        amount: result.payment.amount,
        currency: result.payment.currency,
        status: result.payment.status,
        description: result.payment.description,
      },
      clientSecret: result.clientSecret,
    });
  } catch (error: any) {
    console.error('Error creating subscription payment:', error);
    return res.status(500).json({ 
      message: 'Error creating subscription payment intent',
      error: error.message 
    });
  }
};

// Confirm payment
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID is required' });
    }

    const payment = await PaymentService.confirmPayment(paymentIntentId);

    return res.json({
      message: 'Payment confirmed successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
        description: payment.description,
      },
    });
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    return res.status(500).json({ 
      message: 'Error confirming payment',
      error: error.message 
    });
  }
};

// Process refund
export const processRefund = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const { paymentId, refundAmount, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({ message: 'Payment ID is required' });
    }

    const payment = await PaymentService.processRefund(paymentId, refundAmount, reason);

    return res.json({
      message: 'Refund processed successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        refundAmount: payment.refundAmount,
        status: payment.status,
        refundReason: payment.refundReason,
      },
    });
  } catch (error: any) {
    console.error('Error processing refund:', error);
    return res.status(500).json({ 
      message: 'Error processing refund',
      error: error.message 
    });
  }
};

// Get payment by ID
export const getPaymentById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const { paymentId } = req.params;

    const payment = await PaymentService.getPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user has access to this payment
    if (payment.customer.toString() !== req.user._id && 
        payment.provider?.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json({
      payment: {
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        description: payment.description,
        createdAt: payment.createdAt,
        customer: payment.customer,
        provider: payment.provider,
        booking: payment.booking,
        refundAmount: payment.refundAmount,
        refundReason: payment.refundReason,
      },
    });
  } catch (error: any) {
    console.error('Error getting payment:', error);
    return res.status(500).json({ 
      message: 'Error retrieving payment',
      error: error.message 
    });
  }
};

// Get customer payments
export const getCustomerPayments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const payments = await PaymentService.getCustomerPayments(req.user._id);

    return res.json({
      payments: payments.map(payment => ({
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        description: payment.description,
        createdAt: payment.createdAt,
        provider: payment.provider,
        booking: payment.booking,
      })),
    });
  } catch (error: any) {
    console.error('Error getting customer payments:', error);
    return res.status(500).json({ 
      message: 'Error retrieving payments',
      error: error.message 
    });
  }
};

// Get provider payments
export const getProviderPayments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    // Get provider ID from user
    const { ServiceProvider } = require('../models/ServiceProvider');
    const provider = await ServiceProvider.findOne({ user: req.user._id });
    
    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    const payments = await PaymentService.getProviderPayments(provider._id);

    return res.json({
      payments: payments.map(payment => ({
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        description: payment.description,
        createdAt: payment.createdAt,
        customer: payment.customer,
        booking: payment.booking,
      })),
    });
  } catch (error: any) {
    console.error('Error getting provider payments:', error);
    return res.status(500).json({ 
      message: 'Error retrieving payments',
      error: error.message 
    });
  }
};

// Handle Stripe webhook
export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ message: 'No signature provided' });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    await PaymentService.handleWebhookEvent(event);

    return res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(400).json({ message: 'Webhook error' });
  }
};

// Get payment methods for customer
export const getPaymentMethods = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    // Get Stripe customer ID from user
    const stripeCustomerId = req.user.metadata?.stripeCustomerId;

    if (!stripeCustomerId) {
      return res.json({ paymentMethods: [] });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });

    return res.json({
      paymentMethods: paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        card: pm.card ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        } : null,
      })),
    });
  } catch (error: any) {
    console.error('Error getting payment methods:', error);
    return res.status(500).json({ 
      message: 'Error retrieving payment methods',
      error: error.message 
    });
  }
};

// Validation middleware
export const validateSubscriptionPayment = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount is required'),
  body('description').notEmpty().withMessage('Description is required'),
];

export const validateRefund = [
  body('paymentId').isMongoId().withMessage('Valid payment ID is required'),
  body('refundAmount').optional().isFloat({ min: 0.01 }).withMessage('Valid refund amount is required'),
  body('reason').optional().isString().withMessage('Reason must be a string'),
]; 