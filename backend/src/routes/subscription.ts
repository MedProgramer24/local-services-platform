import express from 'express';
import { auth, checkRole } from '../middleware/auth';
import {
  getSubscriptionStatus,
  processSubscriptionPayment,
  checkSubscriptionStatus
} from '../controllers/subscriptionController';

const router = express.Router();

// Protected routes (require authentication)
router.get('/status', auth, checkRole(['service_provider']), getSubscriptionStatus);
router.post('/payment', auth, checkRole(['service_provider']), processSubscriptionPayment);

// Export middleware for use in other routes
export { checkSubscriptionStatus };

export default router; 