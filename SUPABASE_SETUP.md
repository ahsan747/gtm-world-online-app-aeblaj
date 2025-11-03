
# Supabase Setup Instructions

Your app is now configured to use Supabase for storing orders, user profiles, and contact messages!

## 🚀 Quick Setup

### 1. Run the SQL Migration

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `qwatzdbnjjvyqqeuvxmy`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase-setup.sql` file
6. Paste it into the SQL Editor
7. Click **Run** to execute the migration

This will create the following tables:
- **user_profiles** - Stores additional user information
- **orders** - Stores all customer orders
- **contact_messages** - Stores messages from the contact form

### 2. Verify Tables Were Created

1. Go to **Table Editor** in the left sidebar
2. You should see three new tables:
   - `user_profiles`
   - `orders`
   - `contact_messages`

### 3. Test the Integration

Your app is already configured with your Supabase credentials:
- **URL**: `https://qwatzdbnjjvyqqeuvxmy.supabase.co`
- **Anon Key**: Already configured in `config/supabase.ts`

## 📱 Features Now Available

### ✅ Order Management
- Orders are automatically saved to Supabase when users complete checkout
- View order history in the **My Orders** screen
- Track order status (pending, processing, shipped, delivered, cancelled)

### ✅ Contact Form
- Users can send messages through the **Contact Us** screen
- Messages are stored in Supabase for you to review

### ✅ User Profiles
- User profiles are automatically created when placing orders
- Stores shipping information for faster future checkouts

## 🔒 Security

Row Level Security (RLS) is enabled on all tables with the following policies:
- Users can view and manage their own data
- Contact messages can be submitted by anyone
- All data is secured with Supabase authentication

## 📊 Viewing Your Data

### Orders
1. Go to **Table Editor** → **orders**
2. You'll see all orders with:
   - Order ID
   - User information
   - Items purchased
   - Shipping details
   - Order status
   - Timestamps

### Contact Messages
1. Go to **Table Editor** → **contact_messages**
2. You'll see all customer inquiries with:
   - Name and email
   - Subject and message
   - Timestamp

### User Profiles
1. Go to **Table Editor** → **user_profiles**
2. You'll see user information including:
   - Display name
   - Email and phone
   - Shipping address

## 🎨 Customization

### Update Order Status
You can manually update order statuses in the Supabase dashboard:
1. Go to **Table Editor** → **orders**
2. Click on an order
3. Change the `status` field to:
   - `pending` - Order received
   - `processing` - Order being prepared
   - `shipped` - Order shipped
   - `delivered` - Order delivered
   - `cancelled` - Order cancelled

### Email Notifications (Optional)
You can set up email notifications using Supabase Edge Functions:
1. Create an Edge Function to send emails when orders are placed
2. Use services like SendGrid, Resend, or Mailgun
3. Trigger the function on order creation

## 🔧 Troubleshooting

### Orders Not Saving
- Check the browser console for errors
- Verify the SQL migration ran successfully
- Ensure RLS policies are enabled

### Can't View Orders
- Make sure you're logged in with Firebase
- Check that the user_id matches between Firebase and Supabase

### Contact Form Not Working
- Verify the `contact_messages` table exists
- Check RLS policies allow inserts

## 📚 Next Steps

1. **Set up email notifications** for new orders
2. **Create an admin dashboard** to manage orders
3. **Add product reviews** stored in Supabase
4. **Implement wishlist** functionality
5. **Add push notifications** for order updates

## 🆘 Need Help?

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Check the console logs in your app for detailed error messages

---

**Your app is now fully integrated with Supabase! 🎉**

Start shopping and placing orders to see the data flow into your Supabase database.
