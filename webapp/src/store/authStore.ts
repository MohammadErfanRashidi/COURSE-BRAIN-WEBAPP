/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { User, SubscriptionStatus } from '../types';
import { AuthService, SubscriptionService } from '../services/api';
import { migrateAllPreauthChats } from '../services/chatEngine';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  
  // Actions
  loginWithOtp: (phoneNumber: string, code: string) => Promise<User>;
  updateUser: (user: User) => void;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
  checkSession: () => Promise<void>;
  logout: () => void;
  setError: (error: string | null) => void;
  syncSubscription: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  subscriptionStatus: null,

  loginWithOtp: async (phoneNumber: string, code: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.verifyOtp(phoneNumber, code);
      set({ 
        user: response.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      // Fetch subscription status immediately after successful auth
      await get().syncSubscription();
      // Migrate any preauth conversations to this user's account
      migrateAllPreauthChats();
      window.dispatchEvent(new CustomEvent('cb-user-authenticated'));
      return response.user;
    } catch (err: any) {
      const errMsg = err.message || 'خطا در تایید کد پیامک شده';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  updateUser: (user: User) => {
    set({ user });
  },

  setSubscriptionStatus: (subscriptionStatus: SubscriptionStatus) => {
    set({ subscriptionStatus });
  },

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('cb_access_token');
      const cachedUserData = localStorage.getItem('cb_user_data');
      
      if (token && cachedUserData) {
        const user = JSON.parse(cachedUserData) as User;
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        // Sync subscription from backend
        await get().syncSubscription();
        // Migrate any preauth conversations to this user's account
        migrateAllPreauthChats();
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (err) {
      console.error('Session hydration failed', err);
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  logout: () => {
    AuthService.logout();
    set({ 
      user: null, 
      isAuthenticated: false, 
      subscriptionStatus: null,
      error: null 
    });
  },

  setError: (error: string | null) => set({ error }),

  syncSubscription: async () => {
    try {
      const status = await SubscriptionService.getStatus();
      set({ subscriptionStatus: status });
      
      // Update hasActiveSubscription on user object if changed
      const currentUser = get().user;
      if (currentUser && currentUser.hasActiveSubscription !== status.active) {
        const updatedUser = { ...currentUser, hasActiveSubscription: status.active };
        set({ user: updatedUser });
        localStorage.setItem('cb_user_data', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Subscription sync failed', err);
    }
  }
}));
