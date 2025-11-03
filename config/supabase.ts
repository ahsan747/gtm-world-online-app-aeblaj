
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = 'https://qwatzdbnjjvyqqeuvxmy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3YXR6ZGJuamp2eXFxZXV2eG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzEzNTUsImV4cCI6MjA3Nzc0NzM1NX0.7z5-OjPf_J1ZHj6_ngKW6jIkHfHV20CBSuTLDPQVY3g';

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log('Supabase client initialized');

export default supabase;
