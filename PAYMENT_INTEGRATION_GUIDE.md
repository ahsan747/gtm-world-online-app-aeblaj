
# Payment Integration Guide

This guide explains how to integrate real payment gateways (Stripe and PayPal) into your app using Supabase Edge Functions for secure, PCI DSS compliant payment processing.

## Current Implementation

The app currently uses a **demo/simulation mode** for payment processing. When payment gateway credentials are not configured, the Edge Function automatically falls back to simulated payments with a 95% success rate.

## Architecture Overview

```
Client (React Native App)
    ↓
Supabase Edge Function (process-payment)
    ↓
Payment Gateway (Stripe / PayPal)
    ↓
Database (Orders table)
```

### Why Use Edge Functions?

- **Security**: Sensitive payment credentials never exposed to client
- **PCI DSS Compliance**: Card data handled server-side only
- **Centralized Logic**: Payment processing logic in one secure location
- **Scalability**: Serverless architecture scales automatically

## Setting Up Stripe Integration

### Step 1: Get Stripe API Keys

1. Sign up at [stripe.com](https://stripe.com)
2. Navigate to **Developers → API Keys**
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Step 2: Configure Stripe in Supabase

Set your Stripe secret key as an environment variable in your Supabase Edge Function:

```bash
# Using Supabase CLI
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Or via Supabase Dashboard
# Go to: Project Settings → Edge Functions → Secrets
# Add: STRIPE_SECRET_KEY = sk_test_your_secret_key_here
```

### Step 3: Implement Stripe Elements on Client Side

For PCI DSS compliance, you must use Stripe Elements or Stripe SDK to tokenize card data on the client side. **Never send raw card numbers to your server.**

#### Install Stripe React Native SDK

```bash
npm install @stripe/stripe-react-native
```

#### Update payment-process.tsx

Replace the card input fields with Stripe's CardField component:

```typescript
import { CardField, useStripe } from '@stripe/stripe-react-native';

const PaymentProcessScreen = () => {
  const { createToken } = useStripe();
  
  // Replace card input fields with:
  const [cardDetails, setCardDetails] = useState(null);
  
  // In your render:
  <CardField
    postalCodeEnabled={false}
    placeholders={{
      number: '4242 4242 4242 4242',
    }}
    cardStyle={{
      backgroundColor: colors.card,
      textColor: colors.text,
    }}
    style={{
      width: '100%',
      height: 50,
      marginVertical: 30,
    }}
    onCardChange={(details) => {
      setCardDetails(details);
    }}
  />
  
  // When processing payment:
  const handlePayment = async () => {
    // Create token from card details
    const { token, error } = await createToken({
      type: 'Card',
    });
    
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    
    // Pass token to Edge Function
    const result = await processPaymentViaEdgeFunction(token.id);
  };
};
```

#### Initialize Stripe Provider

Wrap your app with StripeProvider in `_layout.tsx`:

```typescript
import { StripeProvider } from '@stripe/stripe-react-native';

export default function RootLayout() {
  return (
    <StripeProvider publishableKey="pk_test_your_publishable_key">
      {/* Your app content */}
    </StripeProvider>
  );
}
```

### Step 4: Test Stripe Integration

Use Stripe's test card numbers:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

Any future expiry date and any 3-digit CVV will work in test mode.

## Setting Up PayPal Integration

### Step 1: Get PayPal API Credentials

1. Sign up at [developer.paypal.com](https://developer.paypal.com)
2. Create a new app in the Dashboard
3. Copy your **Client ID** and **Client Secret**

### Step 2: Configure PayPal in Supabase

Set your PayPal credentials as environment variables:

```bash
# Using Supabase CLI
supabase secrets set PAYPAL_CLIENT_ID=your_client_id_here
supabase secrets set PAYPAL_CLIENT_SECRET=your_client_secret_here

# Or via Supabase Dashboard
# Go to: Project Settings → Edge Functions → Secrets
# Add both credentials
```

### Step 3: Implement PayPal SDK on Client Side

For proper PayPal integration, use the PayPal JavaScript SDK to create orders on the client side.

#### Install PayPal SDK

```bash
npm install react-native-paypal
```

#### Update payment-process.tsx for PayPal

```typescript
import PayPal from 'react-native-paypal';

const PaymentProcessScreen = () => {
  const handlePayPalPayment = async () => {
    try {
      // Create PayPal order on client
      const order = await PayPal.createOrder({
        amount: orderData.total_amount,
        currency: 'USD',
      });
      
      // Pass order ID to Edge Function for capture
      const result = await processPaymentViaEdgeFunction(order.id);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
};
```

### Step 4: Test PayPal Integration

Use PayPal's sandbox accounts:

1. Create test accounts at [developer.paypal.com/dashboard/accounts](https://developer.paypal.com/dashboard/accounts)
2. Use sandbox credentials for testing
3. Switch to live credentials for production

## PCI DSS Compliance Checklist

✅ **Never store raw card numbers** - Use tokenization (Stripe Elements)
✅ **Use HTTPS/SSL** - All communication encrypted (Supabase provides this)
✅ **Server-side processing** - Payment logic in Edge Functions
✅ **Secure credential storage** - API keys in environment variables
✅ **Minimal data retention** - Only store payment IDs, not card details
✅ **Access control** - Use Supabase RLS policies on orders table
✅ **Audit logging** - Log payment attempts (already implemented)

## Security Best Practices

### 1. Never Log Sensitive Data

```typescript
// ❌ BAD
console.log('Card number:', cardNumber);

// ✅ GOOD
console.log('Processing payment for order:', orderId);
```

### 2. Validate on Server Side

Always validate payment amounts and order details in the Edge Function, not just on the client.

### 3. Use Idempotency Keys

For Stripe, use idempotency keys to prevent duplicate charges:

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount,
  currency: 'usd',
  // Add idempotency key
  idempotencyKey: `order_${orderId}_${timestamp}`,
});
```

### 4. Implement Webhooks

Set up webhooks to handle asynchronous payment events:

```typescript
// Create a new Edge Function: payment-webhook
Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const event = stripe.webhooks.constructEvent(
    await req.text(),
    signature,
    webhookSecret
  );
  
  // Handle events like payment_intent.succeeded
  if (event.type === 'payment_intent.succeeded') {
    // Update order status
  }
});
```

## Testing Your Integration

### 1. Test in Demo Mode

The current implementation works in demo mode without any configuration. Test the full flow:

1. Add items to cart
2. Go to checkout
3. Select payment method
4. Complete payment
5. Verify order creation

### 2. Test with Stripe Test Mode

1. Configure `STRIPE_SECRET_KEY` with test key
2. Use Stripe test cards
3. Verify payments in Stripe Dashboard

### 3. Test with PayPal Sandbox

1. Configure PayPal sandbox credentials
2. Use PayPal test accounts
3. Verify transactions in PayPal sandbox

## Production Deployment

### 1. Switch to Live Credentials

```bash
# Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_live_key

# PayPal
supabase secrets set PAYPAL_CLIENT_ID=your_live_client_id
supabase secrets set PAYPAL_CLIENT_SECRET=your_live_client_secret
```

### 2. Update Publishable Keys

Update your client-side Stripe publishable key to the live version:

```typescript
<StripeProvider publishableKey="pk_live_your_live_key">
```

### 3. Enable Webhooks

Set up webhook endpoints in your payment gateway dashboards:

- **Stripe**: `https://your-project.supabase.co/functions/v1/payment-webhook`
- **PayPal**: Configure IPN or webhooks in PayPal dashboard

### 4. Monitor and Log

- Set up error monitoring (Sentry, LogRocket, etc.)
- Monitor payment success rates
- Set up alerts for failed payments

## Troubleshooting

### Payment Fails with "Demo Mode" Message

**Solution**: Configure payment gateway credentials in Supabase Edge Function secrets.

### "Invalid Token" Error

**Solution**: Ensure you're using Stripe Elements to create tokens, not sending raw card data.

### PayPal Order Not Found

**Solution**: Verify PayPal order is created on client side before calling Edge Function.

### CORS Errors

**Solution**: Edge Function includes CORS headers. Ensure you're calling from allowed origins.

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer Docs](https://developer.paypal.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [PCI DSS Compliance](https://www.pcisecuritystandards.org/)

## Support

For issues or questions:

1. Check Supabase Edge Function logs: `supabase functions logs process-payment`
2. Review payment gateway dashboard for transaction details
3. Check app console logs for client-side errors

---

**Important**: This implementation provides a secure foundation for payment processing. Always conduct thorough testing and security audits before going live with real payments.
