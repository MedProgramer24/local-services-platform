import Stripe from 'stripe';
import { Payment, IPayment } from '../models/Payment';
import { User } from '../models/User';
import { ServiceProvider } from '../models/ServiceProvider';
import { Booking } from '../models/Booking';

// Initialize Stripe with error handling
let stripe: Stripe | null = null;
try {
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here') {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });
  } else {
    console.warn('Stripe secret key not configured. Payment processing will be disabled.');
  }
} catch (error) {
  console.error('Error initializing Stripe:', error);
}

export class PaymentService {
  // Create a payment intent for subscription
  static async createSubscriptionPayment(
    customerId: string,
    amount: number,
    description: string
  ): Promise<{ payment: IPayment; clientSecret: string }> {
    try {
      // Check if Stripe is configured
      if (!stripe) {
        console.log('Stripe not configured, creating mock subscription payment for testing');
        return this.createMockSubscriptionPayment(customerId, amount, description);
      }

      const customer = await User.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Create or get Stripe customer
      let stripeCustomerId = customer.metadata?.stripeCustomerId;
      if (!stripeCustomerId) {
        const stripeCustomer = await stripe.customers.create({
          email: customer.email,
          name: `${customer.firstName} ${customer.lastName || ''}`.trim(),
          metadata: {
            userId: customer._id.toString(),
          },
        });
        stripeCustomerId = stripeCustomer.id;
        
        await User.findByIdAndUpdate(customerId, {
          'metadata.stripeCustomerId': stripeCustomerId,
        });
      }

      // Create payment record
      const payment = new Payment({
        customer: customerId,
        amount,
        currency: 'usd', // Use USD instead of MAD for testing
        paymentMethod: 'card',
        paymentProvider: 'stripe',
        description,
        metadata: {
          type: 'subscription',
        },
      });

      await payment.save();

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd', // Use USD instead of MAD for testing
        customer: stripeCustomerId,
        description,
        metadata: {
          paymentId: payment._id.toString(),
          type: 'subscription',
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      payment.stripePaymentIntentId = paymentIntent.id;
      await payment.save();

      return {
        payment,
        clientSecret: paymentIntent.client_secret!,
      };
    } catch (error) {
      console.error('Error creating subscription payment:', error);
      throw error;
    }
  }

  // Create a mock subscription payment for testing when Stripe is not configured
  private static async createMockSubscriptionPayment(
    customerId: string,
    amount: number,
    description: string
  ): Promise<{ payment: IPayment; clientSecret: string }> {
    try {
      const customer = await User.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Create payment record
      const payment = new Payment({
        customer: customerId,
        amount,
        currency: 'usd',
        paymentMethod: 'card',
        paymentProvider: 'mock',
        description,
        status: 'pending',
        metadata: {
          type: 'subscription',
          isMockPayment: true,
        },
      });

      await payment.save();

      // Generate a mock client secret
      const mockClientSecret = `pi_mock_subscription_${payment._id}_secret_${Date.now()}`;

      return {
        payment,
        clientSecret: mockClientSecret,
      };
    } catch (error) {
      console.error('Error creating mock subscription payment:', error);
      throw error;
    }
  }

  // Confirm payment
  static async confirmPayment(paymentIntentId: string): Promise<IPayment> {
    try {
      const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Check if Stripe is configured
      if (!stripe) {
        // If Stripe is not configured, just mark the payment as completed for testing
        payment.status = 'completed';
        await payment.save();

        // If this is a booking payment, update booking status
        if (payment.booking) {
          await Booking.findByIdAndUpdate(payment.booking, {
            status: 'confirmed',
            paymentStatus: 'paid',
          });
        }

        return payment;
      }

      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        payment.status = 'completed';
        await payment.save();

        // If this is a booking payment, update booking status
        if (payment.booking) {
          await Booking.findByIdAndUpdate(payment.booking, {
            status: 'confirmed',
            paymentStatus: 'paid',
          });
        }

        // If this is a subscription payment, update subscription
        if (payment.metadata?.type === 'subscription') {
          // Update subscription status (implement subscription update logic)
          console.log('Subscription payment completed');
        }
      } else if (paymentIntent.status === 'canceled') {
        payment.status = 'cancelled';
        await payment.save();
      } else {
        payment.status = 'pending';
        await payment.save();
      }

      return payment;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  // Process refund
  static async processRefund(
    paymentId: string,
    refundAmount?: number,
    reason?: string
  ): Promise<IPayment> {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'completed') {
        throw new Error('Payment must be completed to refund');
      }

      if (!payment.stripePaymentIntentId) {
        throw new Error('No Stripe payment intent found');
      }

      // Process refund through Stripe
      const refundAmountInCents = refundAmount 
        ? Math.round(refundAmount * 100)
        : Math.round(payment.amount * 100);

      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: refundAmountInCents,
        reason: reason ? 'requested_by_customer' : 'duplicate',
        metadata: {
          reason: reason || 'No reason provided',
        },
      });

      // Update payment record
      payment.status = 'refunded';
      payment.refundAmount = refundAmount || payment.amount;
      payment.refundReason = reason;
      payment.refundedAt = new Date();
      await payment.save();

      return payment;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // Get payment by ID
  static async getPaymentById(paymentId: string): Promise<IPayment | null> {
    return Payment.findById(paymentId)
      .populate('customer', 'firstName lastName email')
      .populate('provider', 'businessName')
      .populate('booking', 'serviceName date time');
  }

  // Get customer payments
  static async getCustomerPayments(customerId: string): Promise<IPayment[]> {
    return Payment.find({ customer: customerId })
      .populate('provider', 'businessName')
      .populate('booking', 'serviceName date time')
      .sort({ createdAt: -1 });
  }

  // Get provider payments
  static async getProviderPayments(providerId: string): Promise<IPayment[]> {
    return Payment.find({ provider: providerId })
      .populate('customer', 'firstName lastName email')
      .populate('booking', 'serviceName date time')
      .sort({ createdAt: -1 });
  }

  // Handle webhook events
  static async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.confirmPayment(event.data.object.id);
          break;
        
        case 'payment_intent.payment_failed':
          const payment = await Payment.findOne({ 
            stripePaymentIntentId: event.data.object.id 
          });
          if (payment) {
            payment.status = 'failed';
            payment.failureReason = event.data.object.last_payment_error?.message || 'Payment failed';
            await payment.save();
          }
          break;
        
        case 'charge.refunded':
          // Handle refund webhook if needed
          console.log('Refund processed:', event.data.object.id);
          break;
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }
} 