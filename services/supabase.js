import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://hsxwccbprhdabdzxxkhj.supabase.co'; // e.g., 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzeHdjY2JwcmhkYWJkenh4a2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjQ4MDIsImV4cCI6MjA3MzgwMDgwMn0.mXD-K2S5HYy1V9eRcNz9_ZPcagJOt0hhl2sPLtTSmxU'; // Your anon/public key

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Enable automatic refresh of tokens
    autoRefreshToken: true,
    // Persist session in AsyncStorage
    persistSession: true,
    // Detect session from URL (for OAuth redirects)
    detectSessionInUrl: true,
    // Storage key for session persistence
    storageKey: 'weather-ai-app-auth',
    // Flow type for OAuth
    flowType: 'pkce',
  },
  // Global configuration
  global: {
    headers: {
      'X-Client-Info': 'weather-ai-app@1.0.0',
    },
  },
});

// Authentication helper functions
export const AuthService = {
  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData, // Additional user metadata
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sign in with Google OAuth
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'weatheraiapp://auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sign in with Apple OAuth
  async signInWithApple() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'weatheraiapp://auth/callback',
          queryParams: {
            response_mode: 'form_post',
          },
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Apple sign in error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, user };
    } catch (error) {
      console.error('Get user error:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session error:', error);
        return false;
      }
      return !!session;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Helper function to check if we have a valid session before making user calls
  async hasValidSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return !error && !!session;
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'weatheraiapp://auth/reset-password',
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update user profile
  async updateProfile(updates) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        console.error('Update profile error:', error);
        throw error;
      }
      return { success: true, data };
    } catch (error) {
      console.error('Update profile error:', error);
      throw error; // Re-throw to be caught by the calling function
    }
  },

  // Check if user has completed personal details
  async hasCompletedPersonalDetails() {
    try {
      // First check if we have a valid session
      const hasSession = await this.hasValidSession();
      if (!hasSession) {
        console.log('No valid session for personal details check');
        return false;
      }

      // Now get the user data
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting user for personal details check:', error);
        return false;
      }
      
      return user?.user_metadata?.personal_details_completed === true;
    } catch (error) {
      console.error('Error checking personal details status:', error);
      return false;
    }
  },

  // Check if user has completed preferences
  async hasCompletedPreferences() {
    try {
      // First check if we have a valid session
      const hasSession = await this.hasValidSession();
      if (!hasSession) {
        console.log('No valid session for preferences check');
        return false;
      }

      // Now get the user data
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting user for preferences check:', error);
        return false;
      }
      
      return user?.user_metadata?.preferences_completed === true;
    } catch (error) {
      console.error('Error checking preferences status:', error);
      return false;
    }
  },

  // Get user preferences
  async getUserPreferences() {
    try {
      // First check if we have a valid session
      const hasSession = await this.hasValidSession();
      if (!hasSession) {
        console.log('No valid session for preferences retrieval');
        return null;
      }

      // Now get the user data
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      return user?.user_metadata?.preferences || null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  },

  // Handle OAuth redirect
  async handleOAuthRedirect(url) {
    try {
      const { data, error } = await supabase.auth.getSessionFromUrl(url);
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('OAuth redirect error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get session from URL (for deep linking)
  async getSessionFromUrl(url) {
    try {
      const { data, error } = await supabase.auth.getSessionFromUrl(url);
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get session from URL error:', error);
      return { success: false, error: error.message };
    }
  },
};

export default AuthService;
