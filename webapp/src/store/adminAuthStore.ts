/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { AdminUser, AdminRole } from '../features/admin/types';

interface AdminAuthState {
  isAdminAuthenticated: boolean;
  activeAdmin: AdminUser | null;
  adminToken: string | null;
  twoFactorStep: boolean;
  tempAdmin: AdminUser | null;
  isLoading: boolean;
  error: string | null;

  loginAdmin: (username: string, passwordHash: string) => Promise<boolean>;
  verifyTwoFactor: (code: string) => Promise<boolean>;
  logoutAdmin: () => void;
  hasPermission: (requiredRole: AdminRole[]) => boolean;
}

// Simulated available administrator accounts
const SIMULATED_ADMINS: Record<string, { admin: AdminUser; pin: string }> = {
  'superadmin': {
    pin: '123456',
    admin: {
      id: 'adm_1',
      username: 'superadmin',
      email: 'super@raya.ir',
      role: 'SUPER_ADMINISTRATOR',
      fullName: 'امیررضا علوی (مدیر ارشد)',
      twoFactorEnabled: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
    }
  },
  'admin': {
    pin: '111111',
    admin: {
      id: 'adm_2',
      username: 'admin',
      email: 'admin@raya.ir',
      role: 'ADMINISTRATOR',
      fullName: 'سارا رضایی (مدیر سیستم)',
      twoFactorEnabled: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80'
    }
  },
  'support': {
    pin: '222222',
    admin: {
      id: 'adm_3',
      username: 'support',
      email: 'support@raya.ir',
      role: 'SUPPORT_STAFF',
      fullName: 'محمدرضا کریمی (کارشناس پشتیبانی)',
      twoFactorEnabled: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
    }
  },
  'content': {
    pin: '333333',
    admin: {
      id: 'adm_4',
      username: 'content',
      email: 'content@raya.ir',
      role: 'CONTENT_MANAGER',
      fullName: 'زهرا احمدی (مسئول منابع درسی)',
      twoFactorEnabled: true,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80'
    }
  }
};

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  isAdminAuthenticated: false,
  activeAdmin: null,
  adminToken: null,
  twoFactorStep: false,
  tempAdmin: null,
  isLoading: false,
  error: null,

  loginAdmin: async (username, password) => {
    set({ isLoading: true, error: null });
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const cleanUsername = username.trim().toLowerCase();
    const match = SIMULATED_ADMINS[cleanUsername];

    if (match) {
      set({ 
        tempAdmin: match.admin,
        twoFactorStep: true,
        isLoading: false,
        error: null
      });
      return true;
    } else {
      set({ 
        isLoading: false, 
        error: 'نام کاربری وارد شده در سیستم ثبت نشده است.' 
      });
      return false;
    }
  },

  verifyTwoFactor: async (code) => {
    set({ isLoading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 600));

    const temp = get().tempAdmin;
    if (!temp) {
      set({ isLoading: false, error: 'جلسه نامعتبر است. مجددا وارد شوید.' });
      return false;
    }

    const match = SIMULATED_ADMINS[temp.username];
    if (match && match.pin === code) {
      set({
        isAdminAuthenticated: true,
        activeAdmin: temp,
        adminToken: 'eyAdminJwsTokenSimulatedHeaderAndPayload_SecretSignatureValue',
        twoFactorStep: false,
        tempAdmin: null,
        isLoading: false,
        error: null
      });
      return true;
    } else {
      set({ 
        isLoading: false, 
        error: 'کد تایید دو مرحله‌ای اشتباه است. لطفا مجددا امتحان کنید.' 
      });
      return false;
    }
  },

  logoutAdmin: () => {
    set({
      isAdminAuthenticated: false,
      activeAdmin: null,
      adminToken: null,
      twoFactorStep: false,
      tempAdmin: null,
      error: null
    });
  },

  hasPermission: (requiredRoles) => {
    const active = get().activeAdmin;
    if (!active) return false;
    // Super admin has all privileges
    if (active.role === 'SUPER_ADMINISTRATOR') return true;
    return requiredRoles.includes(active.role);
  }
}));
