
import { supabase } from '@/config/supabase';

export interface Order {
  id?: string;
  user_id: string;
  user_email: string;
  items: OrderItem[];
  shipping_info: ShippingInfo;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method?: string;
  payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_id?: string;
  payment_details?: any;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
}

export interface ShippingInfo {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at?: string;
}

// Orders
export const createOrder = async (order: Order) => {
  try {
    console.log('Creating order in Supabase:', order);
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }

    console.log('Order created successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
};

export const getUserOrders = async (userId: string) => {
  try {
    console.log('Fetching orders for user:', userId);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }

    console.log('Orders fetched successfully:', data?.length);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId: string) => {
  try {
    console.log('Fetching order:', orderId);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      throw error;
    }

    console.log('Order fetched successfully');
    return data;
  } catch (error) {
    console.error('Failed to fetch order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  try {
    console.log('Updating order status:', orderId, status);
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }

    console.log('Order status updated successfully');
    return data;
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (
  orderId: string, 
  paymentStatus: Order['payment_status'],
  paymentDetails?: any
) => {
  try {
    console.log('Updating payment status:', orderId, paymentStatus);
    const updateData: any = { 
      payment_status: paymentStatus, 
      updated_at: new Date().toISOString() 
    };
    
    if (paymentDetails) {
      updateData.payment_details = paymentDetails;
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }

    console.log('Payment status updated successfully');
    return data;
  } catch (error) {
    console.error('Failed to update payment status:', error);
    throw error;
  }
};

// Contact Messages
export const createContactMessage = async (message: ContactMessage) => {
  try {
    console.log('Creating contact message in Supabase');
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([message])
      .select()
      .single();

    if (error) {
      console.error('Error creating contact message:', error);
      throw error;
    }

    console.log('Contact message created successfully');
    return data;
  } catch (error) {
    console.error('Failed to create contact message:', error);
    throw error;
  }
};

// User Profiles
export const createUserProfile = async (userId: string, email: string, displayName?: string) => {
  try {
    console.log('Creating user profile in Supabase');
    
    // First check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      console.log('User profile already exists, skipping creation');
      return existingProfile;
    }

    // Create new profile
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: userId,
          email,
          display_name: displayName,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate key error
      if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
        console.log('Profile already exists (duplicate key), fetching existing profile');
        const { data: existingData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        return existingData;
      }
      
      console.error('Error creating user profile:', error);
      throw error;
    }

    console.log('User profile created successfully');
    return data;
  } catch (error) {
    console.error('Failed to create user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    console.log('Fetching user profile:', userId);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }

    console.log('User profile fetched successfully');
    return data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<{
  display_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}>) => {
  try {
    console.log('Updating user profile:', userId);
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    console.log('User profile updated successfully');
    return data;
  } catch (error) {
    console.error('Failed to update user profile:', error);
    throw error;
  }
};
