# Payment Gateway Integration Setup Guide

This guide will help you set up the payment gateway integration for your Souk Al Khadamat platform.

## 🚀 **What's Been Implemented**

### Backend Components
- ✅ **Payment Model** - Complete payment transaction tracking
- ✅ **Payment Service** - Stripe integration with full payment processing
- ✅ **Payment Controller** - API endpoints for payment operations
- ✅ **Payment Routes** - Route definitions for payment endpoints
- ✅ **Webhook Handling** - Real-time payment status updates

### Frontend Components
- ✅ **Payment Form** - Stripe Elements integration
- ✅ **Payment Page** - Complete payment flow UI
- ✅ **Payment Integration** - Seamless booking-to-payment flow

## 🔧 **Setup Instructions**

### 1. **Install Dependencies**

**Backend:**
```bash
cd backend
npm install stripe @types/stripe
```

**Frontend:**
```bash
cd frontend
npm install @stripe/react-stripe-js @stripe/stripe-js
```

### 2. **Stripe Account Setup**

1. **Create a Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Sign up for a free account
   - Complete your business verification

2. **Get Your API Keys**
   - Go to Stripe Dashboard → Developers → API Keys
   - Copy your **Publishable Key** and **Secret Key**

3. **Set Up Webhooks**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/payments/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
   - Copy the webhook signing secret

### 3. **Environment Configuration**

Create a `.env` file in the backend directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/souk-al-khadamat

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
```

Create a `.env` file in the frontend directory:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 4. **Database Updates**

The payment system requires the following database updates:

1. **Payment Collection** - Automatically created when you first use the payment system
2. **User Metadata** - Added Stripe customer ID tracking
3. **Booking Updates** - Payment status tracking

### 5. **Testing the Integration**

#### Test Card Numbers (Stripe Test Mode)
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

#### Test Flow
1. Create a booking
2. Navigate to payment page
3. Use test card numbers
4. Verify payment completion

## 📋 **API Endpoints**

### Payment Endpoints
- `POST /api/payments/booking` - Create booking payment intent
- `POST /api/payments/subscription` - Create subscription payment intent
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payments/refund` - Process refund
- `GET /api/payments/:paymentId` - Get payment details
- `GET /api/payments/customer/payments` - Get customer payments
- `GET /api/payments/provider/payments` - Get provider payments
- `POST /api/payments/webhook` - Stripe webhook handler

### Frontend Routes
- `/payment/:bookingId` - Payment page for bookings

## 🔒 **Security Features**

- **PCI Compliance** - All card data handled by Stripe
- **Webhook Verification** - Signed webhook events
- **Authentication** - All payment endpoints protected
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Secure error responses

## 💰 **Payment Flow**

### Booking Payment Flow
1. Customer creates booking
2. System creates payment intent
3. Customer enters card details
4. Stripe processes payment
5. Webhook confirms payment
6. Booking status updated
7. Customer redirected to success page

### Subscription Payment Flow
1. Provider initiates subscription
2. System creates payment intent
3. Provider enters card details
4. Stripe processes payment
5. Webhook confirms payment
6. Subscription status updated
7. Provider access granted

## 🛠 **Customization Options**

### Payment Methods
- Credit/Debit Cards (default)
- Mobile Money (can be added)
- Bank Transfer (can be added)
- Cash on Delivery (can be added)

### Currency Support
- MAD (Moroccan Dirham) - default
- USD (US Dollar) - can be added
- EUR (Euro) - can be added

### Fee Structure
- Transaction fees configurable
- Platform commission adjustable
- Tax handling customizable

## 🚨 **Important Notes**

1. **Test Mode First** - Always test in Stripe test mode before going live
2. **Webhook Security** - Keep webhook secrets secure
3. **Error Handling** - Monitor payment failures and refunds
4. **Compliance** - Ensure compliance with local payment regulations
5. **Backup** - Regular database backups for payment records

## 🔧 **Troubleshooting**

### Common Issues
1. **Webhook Failures** - Check webhook endpoint URL and secret
2. **Payment Declines** - Verify test card numbers
3. **CORS Issues** - Ensure proper CORS configuration
4. **Database Errors** - Check MongoDB connection and indexes

### Support
- Stripe Documentation: [stripe.com/docs](https://stripe.com/docs)
- Stripe Support: Available in your Stripe dashboard
- Local Payment Regulations: Check with your local financial authority

## 🎯 **Next Steps**

After setup, consider implementing:
1. **Advanced Analytics** - Payment performance tracking
2. **Refund Management** - Automated refund processing
3. **Subscription Management** - Recurring payment handling
4. **Multi-currency** - Support for additional currencies
5. **Payment Methods** - Additional payment options

---

**Need Help?** Check the troubleshooting section or contact support with specific error messages. 