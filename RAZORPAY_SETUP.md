# Razorpay Payment Gateway Setup Guide

This guide will help you set up Razorpay payment gateway for course checkout in the VP Learning Platform.

## Prerequisites

1. **Razorpay Account**
   - Sign up at: https://razorpay.com/
   - Complete KYC verification
   - Get your API keys from the Dashboard

## Setup Steps

### 1. Get Razorpay API Keys

1. Log in to your Razorpay Dashboard: https://dashboard.razorpay.com/
2. Go to **Settings** → **API Keys**
3. Generate a new Key ID and Key Secret (or use existing ones)
4. Copy your **Key ID** (starts with `rzp_test_` for test mode or `rzp_live_` for live mode)

### 2. Configure Environment Variables

Add your Razorpay Key ID to your `.env` file in the `VP` folder:

```env
# Razorpay Payment Gateway
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

**Note:** 
- For testing, use keys starting with `rzp_test_`
- For production, use keys starting with `rzp_live_`
- Never commit your Key Secret to the frontend. In production, create orders on your backend.

### 3. Test Mode vs Production Mode

#### Test Mode
- Use test keys (`rzp_test_...`)
- Use Razorpay test cards: https://razorpay.com/docs/payments/test-cards/
- No real money is charged

#### Production Mode
- Use live keys (`rzp_live_...`)
- Real payments will be processed
- Ensure you have completed KYC

### 4. Backend Integration (Recommended for Production)

For production, you should create payment orders on your backend server for security. Here's what you need to implement:

#### Backend API Endpoint

Create an endpoint to generate Razorpay orders:

```javascript
// Example: server/routes/payments.js
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post('/api/payments/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    
    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };
    
    const order = await razorpay.orders.create(options);
    
    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});
```

#### Update Payment Service

Then update `VP/src/services/paymentService.ts` to call your backend:

```typescript
// In initiatePayment method, replace the order creation with:
const orderResponse = await fetch('/api/payments/create-order', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`, // If using auth
  },
  body: JSON.stringify({ 
    amount: options.amount, 
    currency: options.currency 
  }),
});
const orderData = await orderResponse.json();
options.order_id = orderData.id;
```

### 5. Payment Verification

The current implementation verifies payments on the frontend. For production, you should verify payments on your backend:

```javascript
// Backend: server/routes/payments.js
import crypto from 'crypto';

app.post('/api/payments/verify', async (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  
  const text = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');
  
  if (generatedSignature === signature) {
    // Payment verified - update order status in Firestore
    res.json({ verified: true });
  } else {
    res.status(400).json({ verified: false });
  }
});
```

### 6. Firestore Security Rules

Add security rules for the `payments` collection:

```javascript
// Firestore Rules
match /payments/{paymentId} {
  // Users can only read their own payments
  allow read: if request.auth != null && request.auth.uid == resource.data.userId;
  
  // Only authenticated users can create payments
  allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
  
  // Only system can update payment status (use Cloud Functions or backend)
  allow update: if false; // Disable direct updates from client
}
```

### 7. Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to a course detail page
3. Click "Enroll Now" for a paid course
4. Use Razorpay test cards:
   - **Success**: `4111 1111 1111 1111`
   - **Failure**: `4000 0000 0000 0002`
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date
   - **Name**: Any name

### 8. Enable UPI Payments (For QR Code/UPI)

To enable UPI payments and QR code scanning:

1. **Complete KYC Verification**:
   - Go to Razorpay Dashboard → **Settings** → **Account & Settings**
   - Complete KYC verification (business details, bank account, documents)
   - Wait for approval (usually 24-48 hours)

2. **Enable UPI Payment Method**:
   - Go to **Settings** → **Payment Methods**
   - Toggle **UPI** to **ON**
   - Save changes

3. **Verify Account Status**:
   - Ensure account status is **Active**
   - Check that bank account is verified

**Note**: UPI payments require complete KYC. If you see "beneficiary upi id incorrect" error, see [RAZORPAY_UPI_FIX.md](./RAZORPAY_UPI_FIX.md) for detailed troubleshooting.

### 9. Webhook Setup (Optional but Recommended)

Set up webhooks to handle payment events:

1. Go to Razorpay Dashboard → **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Implement webhook handler on your backend to update Firestore

## Troubleshooting

### Payment Modal Not Opening
- Check if Razorpay script is loaded: `console.log(window.Razorpay)`
- Verify `VITE_RAZORPAY_KEY_ID` is set correctly
- Check browser console for errors

### Payment Verification Fails
- Ensure payment signature is verified correctly
- Check that order ID, payment ID, and signature match
- Verify Firestore permissions for payments collection

### "Invalid Key ID" Error
- Verify your Key ID is correct
- Ensure you're using the right key (test vs live)
- Check if the key is active in Razorpay Dashboard

### "Beneficiary UPI ID Incorrect" Error
- Complete KYC verification in Razorpay Dashboard
- Enable UPI in Settings → Payment Methods
- Verify bank account is linked and verified
- Wait for account activation (24-48 hours after KYC)
- See [RAZORPAY_UPI_FIX.md](./RAZORPAY_UPI_FIX.md) for detailed steps

## Security Best Practices

1. **Never expose Key Secret** in frontend code
2. **Create orders on backend** in production
3. **Verify payments on backend** using webhooks
4. **Use HTTPS** in production
5. **Validate amounts** on backend before creating orders
6. **Store payment records** securely in Firestore
7. **Implement rate limiting** on payment endpoints

## Support

- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com
- Test Cards: https://razorpay.com/docs/payments/test-cards/

