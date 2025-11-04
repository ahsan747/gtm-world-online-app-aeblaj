
# PayPal Integration Setup Guide for GTM Store

This guide will help you set up real PayPal payments for your GTM Store app.

## Overview

The app is already configured to process PayPal payments through Supabase Edge Functions. You just need to add your PayPal credentials to enable real transactions.

## Step 1: Create a PayPal Business Account

1. Go to [PayPal Business](https://www.paypal.com/business)
2. Click "Sign Up" and create a business account
3. Complete the verification process

## Step 2: Get PayPal API Credentials

### For Testing (Sandbox)

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Log in with your PayPal account
3. Click "Apps & Credentials" in the left sidebar
4. Make sure you're on the "Sandbox" tab
5. Click "Create App"
6. Enter an app name (e.g., "GTM Store Sandbox")
7. Click "Create App"
8. You'll see your credentials:
   - **Client ID**: Copy this value
   - **Secret**: Click "Show" and copy this value

### For Production (Live)

1. In the PayPal Developer Dashboard, switch to the "Live" tab
2. Click "Create App"
3. Enter an app name (e.g., "GTM Store Live")
4. Click "Create App"
5. Copy your Live credentials:
   - **Client ID**: Copy this value
   - **Secret**: Click "Show" and copy this value

## Step 3: Configure Supabase Edge Function

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `qwatzdbnjjvyqqeuvxmy`
3. Navigate to "Edge Functions" in the left sidebar
4. Click on the "process-payment" function
5. Click "Secrets" or "Environment Variables"
6. Add the following secrets:

### For Sandbox Testing:
```
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_secret_here
PAYPAL_MODE=sandbox
```

### For Production:
```
PAYPAL_CLIENT_ID=your_live_client_id_here
PAYPAL_CLIENT_SECRET=your_live_secret_here
PAYPAL_MODE=live
```

## Step 4: Test Your Integration

### Testing in Sandbox Mode

1. Make sure `PAYPAL_MODE=sandbox` is set
2. Use PayPal sandbox test accounts to make payments
3. Create test accounts at [PayPal Sandbox Accounts](https://developer.paypal.com/dashboard/accounts)

### Testing in Production

1. Switch `PAYPAL_MODE=live`
2. Use real PayPal accounts
3. Real money will be transferred

## How It Works

### Current Implementation

The app uses a **server-side** PayPal integration:

1. User selects PayPal as payment method
2. User enters demo credentials (in demo mode)
3. App sends payment request to Supabase Edge Function
4. Edge Function:
   - Authenticates with PayPal using OAuth 2.0
   - Creates a PayPal order
   - Captures the payment immediately
   - Saves order to database
5. User receives confirmation

### Payment Flow

```
Client App → Supabase Edge Function → PayPal API → Database
```

## Advanced: Client-Side PayPal SDK (Optional)

For a better user experience, you can integrate the PayPal JavaScript SDK on the client side:

### Benefits:
- Users see PayPal's official payment popup
- Better mobile experience
- Automatic handling of payment methods (PayPal balance, cards, etc.)
- No need to collect PayPal credentials

### Implementation:

1. Install PayPal SDK in your app (web only):
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID"></script>
```

2. Create order on client:
```javascript
paypal.Buttons({
  createOrder: function(data, actions) {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: '99.99'
        }
      }]
    });
  },
  onApprove: function(data, actions) {
    // Send order ID to your Edge Function
    return fetch('/api/capture-paypal', {
      method: 'POST',
      body: JSON.stringify({ orderID: data.orderID })
    });
  }
}).render('#paypal-button-container');
```

3. Update Edge Function to capture existing order instead of creating new one

## Security Best Practices

- ✅ Never expose your PayPal Secret in client-side code
- ✅ Always process payments server-side (Edge Functions)
- ✅ Use HTTPS for all API calls
- ✅ Validate all payment amounts server-side
- ✅ Log all transactions for audit purposes
- ✅ Use sandbox mode for testing
- ✅ Implement proper error handling

## Troubleshooting

### "PayPal credentials not configured"
- Make sure you've added the secrets to Supabase Edge Function
- Verify the secret names are exactly: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`

### "Failed to get PayPal access token"
- Check that your Client ID and Secret are correct
- Verify you're using the right credentials for your mode (sandbox vs live)
- Ensure your PayPal app is active

### "Payment capture failed"
- Check PayPal dashboard for transaction details
- Verify the order amount matches
- Ensure the order hasn't already been captured

### "CORS errors"
- Edge Functions handle CORS automatically
- If you see CORS errors, check your Edge Function deployment

## Testing Checklist

- [ ] PayPal credentials added to Supabase
- [ ] PAYPAL_MODE set correctly (sandbox or live)
- [ ] Test payment with sandbox account
- [ ] Verify order appears in database
- [ ] Check PayPal dashboard for transaction
- [ ] Test error scenarios (declined payment, etc.)
- [ ] Verify email confirmations are sent

## Support

- PayPal Developer Documentation: https://developer.paypal.com/docs/
- PayPal REST API Reference: https://developer.paypal.com/api/rest/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions

## Current Status

✅ Edge Function deployed and ready
✅ Database schema configured
✅ Payment processing logic implemented
⏳ Waiting for PayPal credentials to enable real payments

Once you add your PayPal credentials, the app will automatically switch from simulation mode to real payment processing!
