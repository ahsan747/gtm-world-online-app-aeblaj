
# Supabase Integration Guide

## Overview

This app uses a **hybrid authentication approach**:
- **Firebase Authentication** for user login/signup
- **Supabase** for data storage (orders, profiles, contact messages)

This approach leverages Firebase's robust authentication while using Supabase's powerful database and real-time features.

## Database Schema

### 1. Orders Table (`orders`)

Stores customer order information.

**Columns:**
- `id` (uuid, primary key) - Unique order identifier
- `user_id` (text) - Firebase user ID
- `user_email` (text) - User's email address
- `items` (jsonb) - Array of order items with product details
- `shipping_info` (jsonb) - Shipping address and contact information
- `total_amount` (numeric) - Total order amount
- `status` (text) - Order status: pending, processing, shipped, delivered, cancelled
- `created_at` (timestamptz) - Order creation timestamp
- `updated_at` (timestamptz) - Last update timestamp

**RLS Policies:**
- Users can view their own orders
- Users can create new orders
- Users can update their own orders

### 2. User Profiles Table (`user_profiles`)

Stores additional user profile information beyond Firebase Auth.

**Columns:**
- `id` (uuid, primary key) - Unique profile identifier
- `user_id` (text, unique) - Firebase user ID
- `email` (text) - User's email address
- `display_name` (text) - User's display name
- `phone` (text) - Phone number
- `address` (text) - Street address
- `city` (text) - City
- `state` (text) - State/Province
- `zip_code` (text) - Postal code
- `country` (text) - Country (default: USA)
- `created_at` (timestamptz) - Profile creation timestamp
- `updated_at` (timestamptz) - Last update timestamp

**RLS Policies:**
- Users can view their own profile
- Users can insert their own profile
- Users can update their own profile

### 3. Contact Messages Table (`contact_messages`)

Stores contact form submissions.

**Columns:**
- `id` (uuid, primary key) - Unique message identifier
- `name` (text) - Sender's name
- `email` (text) - Sender's email
- `subject` (text) - Message subject
- `message` (text) - Message content
- `created_at` (timestamptz) - Message creation timestamp

**RLS Policies:**
- Anyone can create contact messages
- Anyone can view contact messages (for admin purposes)

## API Functions

All database functions are located in `services/database.ts`:

### Orders

```typescript
// Create a new order
await createOrder({
  user_id: user.uid,
  user_email: user.email,
  items: [...],
  shipping_info: {...},
  total_amount: 99.99,
  status: 'pending'
});

// Get user's order history
const orders = await getUserOrders(userId);

// Get specific order
const order = await getOrderById(orderId);

// Update order status
await updateOrderStatus(orderId, 'shipped');
```

### User Profiles

```typescript
// Create user profile
await createUserProfile(userId, email, displayName);

// Get user profile
const profile = await getUserProfile(userId);

// Update user profile
await updateUserProfile(userId, {
  display_name: 'John Doe',
  phone: '+1234567890',
  address: '123 Main St',
  city: 'New York',
  state: 'NY',
  zip_code: '10001',
  country: 'USA'
});
```

### Contact Messages

```typescript
// Create contact message
await createContactMessage({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Product Inquiry',
  message: 'I have a question about...'
});
```

## App Screens

### 1. Checkout Screen (`/checkout`)
- Collects shipping information
- Displays order summary with pricing
- Creates order in Supabase
- Clears cart after successful order
- Redirects to home screen

### 2. Orders Screen (`/orders`)
- Displays user's order history
- Shows order status with color-coded badges
- Pull-to-refresh functionality
- Requires user authentication

### 3. Contact Screen (`/contact`)
- Contact form with validation
- Saves messages to Supabase
- Email validation
- Success confirmation

### 4. Edit Profile Screen (`/edit-profile`)
- Load existing profile data
- Update personal information
- Update address information
- Save to Supabase

### 5. Profile Screen (`/(tabs)/profile`)
- User profile overview
- Navigation to orders, contact, and edit profile
- Logout functionality
- Login prompt for guests

## Security

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Orders**: Users can only access their own orders
- **Profiles**: Users can only access their own profile
- **Contact Messages**: Public insert, admin read access

### Authentication Flow

1. User signs up/logs in via Firebase Authentication
2. Firebase provides a user ID (`uid`)
3. This `uid` is used as the `user_id` in Supabase tables
4. RLS policies check the `user_id` against the authenticated user

## Configuration

### Supabase Client (`config/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://qwatzdbnjjvyqqeuvxmy.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## Data Flow

### Order Placement Flow

1. User adds items to cart (stored in AsyncStorage via CartContext)
2. User navigates to checkout screen
3. User fills in shipping information
4. User clicks "Place Order"
5. Order data is validated
6. User profile is created/updated if needed
7. Order is saved to Supabase `orders` table
8. Cart is cleared
9. Success message is shown
10. User is redirected to home screen

### Profile Management Flow

1. User navigates to profile screen
2. User clicks "Edit Profile"
3. Existing profile data is loaded from Supabase
4. User updates information
5. User clicks "Save Profile"
6. Profile is created or updated in Supabase
7. Success message is shown
8. User is returned to profile screen

### Contact Form Flow

1. User navigates to contact screen
2. User fills in contact form
3. User clicks "Send Message"
4. Form data is validated
5. Message is saved to Supabase `contact_messages` table
6. Success message is shown
7. Form is cleared
8. User is returned to previous screen

## Error Handling

All database operations include comprehensive error handling:

- Try-catch blocks around all async operations
- Console logging for debugging
- User-friendly error messages via Alert
- Haptic feedback for success/error states
- Loading states during async operations

## Future Enhancements

Potential improvements to the Supabase integration:

1. **Real-time Order Updates**: Use Supabase Realtime to notify users of order status changes
2. **Admin Dashboard**: Create admin interface to manage orders and contact messages
3. **Order Tracking**: Add tracking numbers and shipment details
4. **Email Notifications**: Send order confirmations and updates via email
5. **Payment Integration**: Add payment processing (Stripe, PayPal, etc.)
6. **Product Reviews**: Allow users to review products they've purchased
7. **Wishlist**: Store user wishlists in Supabase
8. **Search History**: Track and store user search queries
9. **Analytics**: Track user behavior and order patterns
10. **Push Notifications**: Notify users of order updates and promotions

## Troubleshooting

### Common Issues

**Issue**: Orders not appearing in order history
- **Solution**: Check that the user is logged in and the `user_id` matches the Firebase `uid`

**Issue**: RLS policy errors
- **Solution**: Verify that RLS policies are correctly configured in Supabase dashboard

**Issue**: Profile not saving
- **Solution**: Check that the user has permission to create/update profiles

**Issue**: Contact form not submitting
- **Solution**: Verify email validation and network connectivity

## Testing

To test the Supabase integration:

1. **Orders**:
   - Add items to cart
   - Complete checkout process
   - Verify order appears in orders screen
   - Check Supabase dashboard for order data

2. **Profiles**:
   - Navigate to edit profile
   - Update profile information
   - Save and verify changes persist
   - Check Supabase dashboard for profile data

3. **Contact Messages**:
   - Fill out contact form
   - Submit message
   - Check Supabase dashboard for message data

## Support

For issues or questions about the Supabase integration:
- Check the Supabase documentation: https://supabase.com/docs
- Review the code in `services/database.ts`
- Check console logs for error messages
- Verify RLS policies in Supabase dashboard
