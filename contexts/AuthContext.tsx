
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/config/supabase';
import { Session, User } from '@supabase/supabase-js';
import { createUserProfile } from '@/services/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up Supabase auth listener...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email || 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email || 'No user');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      console.log('=== SIGNUP PROCESS STARTED ===');
      console.log('Email:', email);
      console.log('Display Name:', displayName);
      
      // Normalize email (trim and lowercase)
      const normalizedEmail = email.trim().toLowerCase();
      console.log('Normalized email:', normalizedEmail);
      
      // Attempt to sign up
      console.log('Creating new user account...');
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });

      if (error) {
        console.error('Signup error:', error.message, error);
        
        // Handle specific error cases
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please login instead.');
        }
        
        throw error;
      }

      console.log('Signup response:', data);

      // Check if this is a repeated signup (user already exists)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        console.log('User already exists (repeated signup detected)');
        throw new Error('An account with this email already exists. Please login instead.');
      }

      // Create user profile in database if user was created
      if (data.user && data.user.identities && data.user.identities.length > 0) {
        console.log('New user created, now creating profile...');
        try {
          await createUserProfile(data.user.id, normalizedEmail, displayName);
          console.log('User profile created successfully');
        } catch (profileError: any) {
          console.error('Error creating user profile:', profileError);
          // Don't fail signup if profile creation fails
          console.warn('Profile creation failed but continuing with signup');
        }
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        console.log('Email confirmation required');
        throw new Error('CONFIRM_EMAIL:Please check your email to confirm your account before logging in.');
      }

      console.log('User signed up successfully');
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('=== SIGNIN PROCESS STARTED ===');
      console.log('Email:', email);
      
      // Normalize email (trim and lowercase)
      const normalizedEmail = email.trim().toLowerCase();
      console.log('Normalized email:', normalizedEmail);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        console.error('Sign in error:', error.message, error);
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address before logging in. Check your inbox for the confirmation email.');
        }
        
        throw error;
      }

      if (!data.user) {
        throw new Error('Login failed. Please try again.');
      }

      console.log('Sign in successful:', data.user.email);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error.message);
        throw error;
      }

      console.log('User logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
