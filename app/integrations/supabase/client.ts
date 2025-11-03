import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://qwatzdbnjjvyqqeuvxmy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3YXR6ZGJuamp2eXFxZXV2eG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzEzNTUsImV4cCI6MjA3Nzc0NzM1NX0.7z5-OjPf_J1ZHj6_ngKW6jIkHfHV20CBSuTLDPQVY3g";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
