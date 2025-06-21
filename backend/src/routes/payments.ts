import express from 'express';
import { auth, checkRole } from '../middleware/auth';
import {
  createBookingPayment,
  createSubscriptionPayment,
  confirmPayment,
  processRefund,
  getPaymentById,
  getCustomerPayments,
  getProviderPayments,
  handleWebhook,
  getPaymentMethods,
  validateBookingPayment,
  validateSubscriptionPayment,
  validateRefund
} from '../controllers/paymentController';

const router = express.Router();

// Webhook endpoint (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes (require authentication)
router.post('/booking', auth, checkRole(['user']), validateBookingPayment, createBookingPayment);
router.post('/subscription', auth, checkRole(['service_provider']), validateSubscriptionPayment, createSubscriptionPayment);
router.post('/confirm', confirmPayment);
router.post('/refund', auth, validateRefund, processRefund);

// Get payment information
router.get('/:paymentId', auth, getPaymentById);
router.get('/customer/payments', auth, checkRole(['user']), getCustomerPayments);
router.get('/provider/payments', auth, checkRole(['service_provider']), getProviderPayments);
router.get('/methods', auth, getPaymentMethods);

export default router; 