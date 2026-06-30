/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { 
  User, 
  University, 
  Course,
  Class, 
  SubscriptionStatus, 
  AuthResponse,
  AcademicProfile,
  Recording,
  ChatMessage,
  ChatSource,
  AIStatus
} from '../types';

// Standard storage keys
const ACCESS_TOKEN_KEY = 'cb_access_token';
const REFRESH_TOKEN_KEY = 'cb_refresh_token';
const USER_DATA_KEY = 'cb_user_data';

// Create Axios Instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Mock Master Data for fallback & sandbox testing
const MOCK_UNIVERSITIES: University[] = [
  { id: '1', name: 'دانشگاه تهران', city: 'تهران' },
  { id: '2', name: 'دانشگاه صنعتی شریف', city: 'تهران' },
  { id: '3', name: 'دانشگاه صنعتی امیرکبیر', city: 'تهران' },
  { id: '4', name: 'دانشگاه شهید بهشتی', city: 'تهران' },
  { id: '5', name: 'دانشگاه شیراز', city: 'شیراز' },
  { id: '6', name: 'دانشگاه فردوسی مشهد', city: 'مشهد' },
  { id: '7', name: 'دانشگاه صنعتی اصفهان', city: 'اصفهان' },
  { id: '8', name: 'دانشگاه علوم پزشکی تهران', city: 'تهران' },
];

const MD_COURSES: Course[] = [
  // Semester 1
  { id: 'md_s1_c1', name: 'مقدمه علوم تشریح', degree: 'md', semester: 1 },
  { id: 'md_s1_c2', name: 'اصول خدمات سلامت', degree: 'md', semester: 1 },
  { id: 'md_s1_c3', name: 'آشنایی با رایانه نظری و عملی', degree: 'md', semester: 1 },
  { id: 'md_s1_c4', name: 'فیزیک پزشکی', degree: 'md', semester: 1 },
  { id: 'md_s1_c5', name: 'زبان مقدماتی', degree: 'md', semester: 1 },
  { id: 'md_s1_c6', name: 'بیوشیمی مولکول و سلول (نظری)', degree: 'md', semester: 1 },
  { id: 'md_s1_c7', name: 'بیوشیمی مولکول و سلول (عملی)', degree: 'md', semester: 1 },
  // Semester 2
  { id: 'md_s2_c1', name: 'آداب پزشکی ۱', degree: 'md', semester: 2 },
  { id: 'md_s2_c2', name: 'بیوشیمی دیسیپلین نظری', degree: 'md', semester: 2 },
  { id: 'md_s2_c3', name: 'بیوشیمی دیسیپلین عملی', degree: 'md', semester: 2 },
  { id: 'md_s2_c4', name: 'اصول اپیدمیولوژی', degree: 'md', semester: 2 },
  { id: 'md_s2_c5', name: 'زبان تخصصی ۱', degree: 'md', semester: 2 },
  { id: 'md_s2_c6', name: 'روانشناسی سلامت', degree: 'md', semester: 2 },
  { id: 'md_s2_c7', name: 'فیزیولوژی سلول', degree: 'md', semester: 2 },
  { id: 'md_s2_c8', name: 'علوم تشریح اسکلتی–عضلانی (نظری)', degree: 'md', semester: 2 },
  { id: 'md_s2_c9', name: 'علوم تشریح اسکلتی–عضلانی (عملی)', degree: 'md', semester: 2 },
  // Semester 3
  { id: 'md_s3_c1', name: 'زبان تخصصی ۲', degree: 'md', semester: 3 },
  { id: 'md_s3_c2', name: 'آداب پزشکی ۲', degree: 'md', semester: 3 },
  { id: 'md_s3_c3', name: 'علوم تشریح حواس ویژه (نظری–عملی)', degree: 'md', semester: 3 },
  { id: 'md_s3_c4', name: 'علوم تشریح غدد درون‌ریز (نظری–عملی)', degree: 'md', semester: 3 },
  { id: 'md_s3_c5', name: 'فیزیولوژی اعصاب و حواس ویژه', degree: 'md', semester: 3 },
  { id: 'md_s3_c6', name: 'قارچ‌شناسی', degree: 'md', semester: 3 },
  { id: 'md_s3_c7', name: 'علوم تشریح سر و گردن (نظری)', degree: 'md', semester: 3 },
  { id: 'md_s3_c8', name: 'علوم تشریح سر و گردن (عملی)', degree: 'md', semester: 3 },
  // Semester 4
  { id: 'md_s4_c1', name: 'آداب پزشکی ۳', degree: 'md', semester: 4 },
  { id: 'md_s4_c2', name: 'فیزیولوژی گردش خون', degree: 'md', semester: 4 },
  { id: 'md_s4_c3', name: 'باکتری‌شناسی عملی', degree: 'md', semester: 4 },
  { id: 'md_s4_c4', name: 'فیزیولوژی قلب', degree: 'md', semester: 4 },
  { id: 'md_s4_c5', name: 'باکتری‌شناسی نظری', degree: 'md', semester: 4 },
  { id: 'md_s4_c6', name: 'اصول کلی تغذیه', degree: 'md', semester: 4 },
  { id: 'md_s4_c7', name: 'ژنتیک پزشکی', degree: 'md', semester: 4 },
  { id: 'md_s4_c8', name: 'علوم تشریح دستگاه قلب و عروق (نظری)', degree: 'md', semester: 4 },
  { id: 'md_s4_c9', name: 'علوم تشریح دستگاه قلب و عروق (عملی)', degree: 'md', semester: 4 },
  { id: 'md_s4_c10', name: 'ایمنی‌شناسی پزشکی', degree: 'md', semester: 4 },
  { id: 'md_s4_c11', name: 'علوم تشریح دستگاه تنفس (نظری–عملی)', degree: 'md', semester: 4 },
  { id: 'md_s4_c12', name: 'فیزیولوژی خون', degree: 'md', semester: 4 },
  // Semester 5
  { id: 'md_s5_c1', name: 'کلیات پاتولوژی و آسیب سلولی', degree: 'md', semester: 5 },
  { id: 'md_s5_c2', name: 'اصول پایه فارماکولوژی پزشکی', degree: 'md', semester: 5 },
  { id: 'md_s5_c3', name: 'پاتولوژی اختلالات سیستم ایمنی بدن انسان', degree: 'md', semester: 5 },
  { id: 'md_s5_c4', name: 'بیوشیمی کلیه', degree: 'md', semester: 5 },
  { id: 'md_s5_c5', name: 'ویروس‌شناسی پزشکی', degree: 'md', semester: 5 },
  { id: 'md_s5_c6', name: 'پاتولوژی اختلالات ژنتیک و بیماری‌های دوره کودکی', degree: 'md', semester: 5 },
  { id: 'md_s5_c7', name: 'پاتولوژی نئوپلازی', degree: 'md', semester: 5 },
  { id: 'md_s5_c8', name: 'آداب پزشکی ۴', degree: 'md', semester: 5 },
  { id: 'md_s5_c9', name: 'پاتولوژی بیماری‌های محیطی، تغذیه‌ای و عفونی', degree: 'md', semester: 5 },
  { id: 'md_s5_c10', name: 'علوم تشریح گوارش (نظری)', degree: 'md', semester: 5 },
  { id: 'md_s5_c11', name: 'علوم تشریح گوارش (عملی)', degree: 'md', semester: 5 },
  { id: 'md_s5_c12', name: 'علوم تشریح ادراری تناسلی (نظری–عملی)', degree: 'md', semester: 5 },
  { id: 'md_s5_c13', name: 'فیزیولوژی گوارش', degree: 'md', semester: 5 },
  { id: 'md_s5_c14', name: 'فیزیولوژی کلیه', degree: 'md', semester: 5 },
  { id: 'md_s5_c15', name: 'فیزیولوژی غدد و تولیدمثل', degree: 'md', semester: 5 },
  { id: 'md_s5_c16', name: 'فیزیولوژی عملی', degree: 'md', semester: 5 },
  { id: 'md_s5_c17', name: 'بیوشیمی هورمون‌ها', degree: 'md', semester: 5 },
  { id: 'md_s5_c18', name: 'آسیب، ترمیم بافتی و اختلالات همودینامیک', degree: 'md', semester: 5 },
  { id: 'md_s5_c19', name: 'پاتولوژی عملی', degree: 'md', semester: 5 },
];

// Simulated storage state for robust mock fallback
let simulatedUser: User | null = (() => {
  try {
    const raw = localStorage.getItem(USER_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

function getStorageKey(base: string): string {
  const uid = simulatedUser?.id;
  return uid ? `${base}_${uid}` : `${base}_preauth`;
}

export const getSimulatedClasses = (): Class[] => {
  try {
    const cached = localStorage.getItem(getStorageKey('cb_simulated_classes'));
    if (cached) return JSON.parse(cached);
    return [];
  } catch {
    return [];
  }
};

export const getSimulatedRecordings = (): Recording[] => {
  try {
    const cached = localStorage.getItem(getStorageKey('cb_simulated_recordings'));
    if (cached) return JSON.parse(cached);
    return [];
  } catch {
    return [];
  }
};

interface PurchaseRecord {
  id: string;
  amount: number;
  date: string;
  status: 'success' | 'failed';
  refId: string;
  description: string;
}

function getPurchaseHistory(): PurchaseRecord[] {
  try {
    const cached = localStorage.getItem(getStorageKey('cb_purchase_history'));
    if (cached) return JSON.parse(cached);
    return [];
  } catch {
    return [];
  }
}

function savePurchaseHistory(records: PurchaseRecord[]): void {
  localStorage.setItem(getStorageKey('cb_purchase_history'), JSON.stringify(records));
}

export const UNIVERSITY_PLAN_ID = 'plan_university_v1';

export const PLANS_CONFIG: Record<string, { planName: string; maxRecordingHours: number; maxClasses: number; maxDailyTokens: number; price: number }> = {
  plan_starter_v1: {
    planName: 'طرح آغازین (Starter)',
    maxRecordingHours: 10,
    maxClasses: 5,
    maxDailyTokens: 60000,
    price: 39000
  },
  plan_pro_v1: {
    planName: 'طرح پیشرفته (Pro)',
    maxRecordingHours: 30,
    maxClasses: 15,
    maxDailyTokens: 150000,
    price: 79000
  },
  plan_premium_v1: {
    planName: 'طرح ویژه (Premium)',
    maxRecordingHours: 100,
    maxClasses: 100,
    maxDailyTokens: 500000,
    price: 149000
  },
  [UNIVERSITY_PLAN_ID]: {
    planName: 'طرح استاندارد دانشگاهی (تک‌کاربره)',
    maxRecordingHours: 10,
    maxClasses: 5,
    maxDailyTokens: 60000,
    price: 499999
  }
};

// Daily reset: returns YYYY-MM-DD in Asia/Tehran timezone
function getTodayDateString(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' }).format(new Date());
}

let simulatedSubscription: SubscriptionStatus | null = null;
let lastSubscriptionUserId: string | null = null;

function loadSubscriptionForCurrentUser(): SubscriptionStatus {
  const uid = simulatedUser?.id || null;
  if (simulatedSubscription && lastSubscriptionUserId === uid) {
    return simulatedSubscription;
  }
  
  const key = getStorageKey('cb_simulated_subscription');
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached) as SubscriptionStatus;
      if (simulatedUser) {
        parsed.active = simulatedUser.hasActiveSubscription;
      }
      simulatedSubscription = parsed;
      lastSubscriptionUserId = uid;
      return simulatedSubscription;
    }
  } catch {}
  
  const newSub: SubscriptionStatus = {
    active: simulatedUser?.hasActiveSubscription || false,
    planId: 'plan_starter_v1',
    planName: 'طرح آغازین (Starter)',
    expiresAt: null,
    lastRenewalAt: undefined,
    autoRenew: false,
    isCancelled: false,
    usage: {
      classesCount: 0,
      maxClasses: 5,
      recordingHoursUsed: 0,
      maxRecordingHours: 10,
      dailyTokensUsed: 0,
      maxDailyTokens: 60000,
      lastDailyReset: getTodayDateString(),
    }
  };
  localStorage.setItem(key, JSON.stringify(newSub));
  simulatedSubscription = newSub;
  lastSubscriptionUserId = uid;
  return simulatedSubscription;
}

function resetSubscriptionCache(): void {
  simulatedSubscription = null;
  lastSubscriptionUserId = null;
}

export const saveSimulatedSubscription = (sub: SubscriptionStatus) => {
  simulatedSubscription = sub;
  lastSubscriptionUserId = simulatedUser?.id || null;
  localStorage.setItem(getStorageKey('cb_simulated_subscription'), JSON.stringify(sub));
};

export const saveSimulatedClasses = (classes: Class[]) => {
  localStorage.setItem(getStorageKey('cb_simulated_classes'), JSON.stringify(classes));
  
  // Update subscription usage count
  const sub = loadSubscriptionForCurrentUser();
  sub.usage.classesCount = classes.length;
  saveSimulatedSubscription(sub);
};

export const saveSimulatedRecordings = (recs: Recording[]) => {
  localStorage.setItem(getStorageKey('cb_simulated_recordings'), JSON.stringify(recs));
  
  // Calculate total recording duration in hours since lastRenewalAt
  const sub = loadSubscriptionForCurrentUser();
  const lastRenewal = sub.lastRenewalAt || new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString();
  const currentBillingCycleRecs = recs.filter(r => new Date(r.createdAt).getTime() >= new Date(lastRenewal).getTime());
  const totalSeconds = currentBillingCycleRecs.reduce((sum, r) => sum + r.duration, 0);
  const totalHours = Number((totalSeconds / 3600).toFixed(1));
  
  sub.usage.recordingHoursUsed = totalHours;
  saveSimulatedSubscription(sub);
};

// Attach access token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for Token Refresh
api.interceptors.response.use(
  (response) => {
    const contentType = response.headers['content-type'];
    if (contentType && typeof contentType === 'string' && contentType.includes('text/html')) {
      throw new Error('API route returned HTML instead of JSON');
    }
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!')) {
      throw new Error('API route returned HTML page');
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Check if error is 401 Unauthorized and not already retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (refreshToken) {
        try {
          // Attempt refreshing token on FastAPI backend
          const response = await axios.post<AuthResponse>('/api/auth/refresh', {
            refresh_token: refreshToken
          });
          
          const { accessToken, refreshToken: newRefreshToken, user } = response.data;
          
          localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear authentication and redirect to login
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(USER_DATA_KEY);
          window.location.reload();
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// High-fidelity fallback logic wrapper
async function apiCall<T>(realCall: () => Promise<T>, fallbackCall: () => T | Promise<T>): Promise<T> {
  try {
    return await realCall();
  } catch (error) {
    console.warn('FastAPI backend connection error. Falling back to high-fidelity simulated response.', error);
    // Return mock data for robust sandbox testability
    return await fallbackCall();
  }
}

// Export Authentication, Onboarding and Subscription Service Calls
export const AuthService = {
  sendOtp: async (phoneNumber: string): Promise<{ success: boolean; simulatedCode?: string }> => {
    return apiCall(
      async () => {
        const response = await api.post('/auth/send-otp', { phoneNumber });
        return response.data;
      },
      () => {
        // High fidelity mock: Generate a realistic verification code for visual assistance
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[SIMULATED SMS OTP] Sent to ${phoneNumber}: ${otpCode}`);
        
        // Save the OTP globally in session storage for verification checking
        sessionStorage.setItem(`cb_otp_${phoneNumber}`, otpCode);
        
        return { success: true, simulatedCode: otpCode };
      }
    );
  },

  verifyOtp: async (phoneNumber: string, code: string): Promise<AuthResponse> => {
    return apiCall(
      async () => {
        const response = await api.post<AuthResponse>('/auth/verify-otp', { phoneNumber, code });
        const { accessToken, refreshToken, user } = response.data;
        
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
        
        return response.data;
      },
      () => {
        // High fidelity simulated code validation
        const storedCode = sessionStorage.getItem(`cb_otp_${phoneNumber}`) || '123456';
        if (code !== storedCode && code !== '123456') {
          throw new Error('کد تایید وارد شده نادرست است');
        }
        
        // Setup mock user state
        const isExisting = localStorage.getItem(`cb_user_${phoneNumber}`) !== null;
        const savedData = isExisting 
          ? JSON.parse(localStorage.getItem(`cb_user_${phoneNumber}`)!)
          : null;

        const user: User = savedData || {
          id: `usr_${Math.random().toString(36).substring(2, 9)}`,
          phoneNumber,
          isNewUser: !isExisting,
          onboardingCompleted: false,
          hasActiveSubscription: false,
          createdAt: new Date().toISOString(),
        };

        // Cache simulated state
        simulatedUser = user;
        resetSubscriptionCache();
        localStorage.setItem(ACCESS_TOKEN_KEY, 'mock_access_token_jwt');
        localStorage.setItem(REFRESH_TOKEN_KEY, 'mock_refresh_token_jwt');
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
        localStorage.setItem(`cb_user_${phoneNumber}`, JSON.stringify(user));

        return {
          accessToken: 'mock_access_token_jwt',
          refreshToken: 'mock_refresh_token_jwt',
          user
        };
      }
    );
  },

  logout: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    simulatedUser = null;
    resetSubscriptionCache();
  }
};

export const AcademicService = {
  getUniversities: async (): Promise<University[]> => {
    return apiCall(
      async () => {
        const response = await api.get<University[]>('/academic/universities');
        return response.data;
      },
      () => MOCK_UNIVERSITIES
    );
  },

  getMDCourses: async (): Promise<Course[]> => {
    return apiCall(
      async () => {
        const response = await api.get<Course[]>('/academic/courses/md');
        return response.data;
      },
      () => MD_COURSES
    );
  },

  submitOnboarding: async (data: {
    universityId: string;
    degree: string;
  }): Promise<User> => {
    return apiCall(
      async () => {
        const response = await api.post<User>('/onboarding', data);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data));
        return response.data;
      },
      () => {
        if (!simulatedUser) throw new Error('کاربر یافت نشد. مجددا وارد شوید.');

        const selectedUni = MOCK_UNIVERSITIES.find(u => u.id === data.universityId);

        const academicProfile: AcademicProfile = {
          universityId: data.universityId,
          universityName: selectedUni?.name || 'دانشگاه پیش‌فرض',
          degree: data.degree,
        };

        const updatedUser: User = {
          ...simulatedUser,
          onboardingCompleted: true,
          academicProfile
        };

        simulatedUser = updatedUser;
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
        localStorage.setItem(`cb_user_${updatedUser.phoneNumber}`, JSON.stringify(updatedUser));

        return updatedUser;
      }
    );
  }
};

export const SubscriptionService = {
  getStatus: async (): Promise<SubscriptionStatus> => {
    return apiCall(
      async () => {
        const response = await api.get<SubscriptionStatus>('/subscription/status');
        return response.data;
      },
      () => {
        const sub = loadSubscriptionForCurrentUser();
        if (simulatedUser) {
          sub.active = simulatedUser.hasActiveSubscription;
        }
        
        // Recalculate recording usage hours dynamically based on current billing cycle (since lastRenewalAt)
        const recs = getSimulatedRecordings();
        const lastRenewal = sub.lastRenewalAt || new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString();
        const currentBillingCycleRecs = recs.filter(r => new Date(r.createdAt).getTime() >= new Date(lastRenewal).getTime());
        const totalSeconds = currentBillingCycleRecs.reduce((sum, r) => sum + r.duration, 0);
        sub.usage.recordingHoursUsed = Number((totalSeconds / 3600).toFixed(1));
        
        // Daily AI token reset
        const todayStr = getTodayDateString();
        if (sub.usage.lastDailyReset !== todayStr) {
          sub.usage.dailyTokensUsed = 0;
          sub.usage.lastDailyReset = todayStr;
        }

        // Sync active classes count
        const classes = getSimulatedClasses();
        sub.usage.classesCount = classes.length;
        
        saveSimulatedSubscription(sub);
        return sub;
      }
    );
  },

  activateDemoSubscription: async (): Promise<{ success: boolean; user: User }> => {
    return apiCall(
      async () => {
        const response = await api.post<{ success: boolean; user: User }>('/subscription/activate-demo');
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data.user));
        return response.data;
      },
      () => {
        if (!simulatedUser) throw new Error('کاربر یافت نشد. مجددا وارد شوید.');

        const updatedUser: User = {
          ...simulatedUser,
          hasActiveSubscription: true,
        };

        simulatedUser = updatedUser;
        const sub = loadSubscriptionForCurrentUser();
        sub.active = true;
        sub.isCancelled = false;
        sub.autoRenew = true;
        sub.lastRenewalAt = new Date().toISOString();
        sub.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
        localStorage.setItem(`cb_user_${updatedUser.phoneNumber}`, JSON.stringify(updatedUser));

        // Sync initial subscription classes
        const initialClasses = getSimulatedClasses();
        sub.usage.classesCount = initialClasses.length;
        sub.usage.recordingHoursUsed = 0;
        saveSimulatedSubscription(sub);

        // Record the purchase
        const purchases = getPurchaseHistory();
        purchases.push({
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          amount: PLANS_CONFIG[UNIVERSITY_PLAN_ID]?.price || 499999,
          date: new Date().toISOString(),
          status: 'success',
          refId: `IRN-${Math.floor(100000000 + Math.random() * 900000000)}`,
          description: 'اشتراک ماهانه رایا'
        });
        savePurchaseHistory(purchases);

        return {
          success: true,
          user: updatedUser
        };
      }
    );
  },

  renewSubscription: async (): Promise<SubscriptionStatus> => {
    return apiCall(
      async () => {
        const response = await api.post<SubscriptionStatus>('/subscription/renew');
        return response.data;
      },
      () => {
        const now = new Date();
        const sub = loadSubscriptionForCurrentUser();
        const extendedExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        sub.expiresAt = extendedExpiry;
        sub.lastRenewalAt = now.toISOString();
        sub.usage.recordingHoursUsed = 0;
        sub.usage.dailyTokensUsed = 1200;
        sub.isCancelled = false;
        sub.autoRenew = true;
        
        saveSimulatedSubscription(sub);

        // Record the renewal as a new purchase
        const purchases = getPurchaseHistory();
        purchases.push({
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          amount: PLANS_CONFIG[UNIVERSITY_PLAN_ID]?.price || 499999,
          date: now.toISOString(),
          status: 'success',
          refId: `IRN-${Math.floor(100000000 + Math.random() * 900000000)}`,
          description: 'اشتراک ماهانه رایا (تمدید ۳۰ روزه)'
        });
        savePurchaseHistory(purchases);

        return sub;
      }
    );
  },

  changePlan: async (planId: string): Promise<SubscriptionStatus> => {
    return apiCall(
      async () => {
        const response = await api.post<SubscriptionStatus>('/subscription/change-plan', { planId });
        return response.data;
      },
      () => {
        const plan = PLANS_CONFIG[planId];
        if (!plan) throw new Error('طرح انتخاب شده معتبر نمی‌باشد.');
        
        const sub = loadSubscriptionForCurrentUser();
        sub.planId = planId;
        sub.planName = plan.planName;
        sub.usage.maxRecordingHours = plan.maxRecordingHours;
        sub.usage.maxClasses = plan.maxClasses;
        sub.usage.maxDailyTokens = plan.maxDailyTokens;
        
        saveSimulatedSubscription(sub);
        return sub;
      }
    );
  },

  cancelSubscription: async (): Promise<SubscriptionStatus> => {
    return apiCall(
      async () => {
        const response = await api.post<SubscriptionStatus>('/subscription/cancel');
        return response.data;
      },
      () => {
        const sub = loadSubscriptionForCurrentUser();
        sub.autoRenew = false;
        sub.isCancelled = true;
        saveSimulatedSubscription(sub);
        return sub;
      }
    );
  },

  getPaymentHistory: async (): Promise<any[]> => {
    const history = getPurchaseHistory();
    return [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
};

export const ClassService = {
  getClasses: async (): Promise<Class[]> => {
    return apiCall(
      async () => {
        const response = await api.get<Class[]>('/classes');
        return response.data;
      },
      () => {
        return getSimulatedClasses();
      }
    );
  },

  createClass: async (name: string, instructor?: string, code?: string): Promise<Class> => {
    return apiCall(
      async () => {
        const response = await api.post<Class>('/classes', { name, instructor, code });
        return response.data;
      },
      () => {
        const currentClasses = getSimulatedClasses();
        if (currentClasses.length >= 5) {
          throw new Error('شما به حداکثر ۵ کلاس مجاز در طرح جاری رسیده‌اید.');
        }

        const newClass: Class = {
          id: `class_${Math.random().toString(36).substring(2, 9)}`,
          name,
          instructor: instructor || '',
          code: code || '',
          createdAt: new Date().toISOString()
        };

        const updated = [...currentClasses, newClass];
        saveSimulatedClasses(updated);
        return newClass;
      }
    );
  },


  deleteClass: async (id: string): Promise<{ success: boolean }> => {
    return apiCall(
      async () => {
        const response = await api.delete<{ success: boolean }>(`/classes/${id}`);
        return response.data;
      },
      () => {
        const currentClasses = getSimulatedClasses();
        const updatedClasses = currentClasses.filter(c => c.id !== id);
        saveSimulatedClasses(updatedClasses);

        // Permanently delete associated recordings too!
        const currentRecordings = getSimulatedRecordings();
        const updatedRecordings = currentRecordings.filter(r => r.classId !== id);
        saveSimulatedRecordings(updatedRecordings);

        return { success: true };
      }
    );
  },

  getAvailableTemplates: async (): Promise<string[]> => {
    return [
      'زیست‌شناسی سلولی و مولکولی',
      'فیزیک عمومی ۱ (هالیدی)',
      'شیمی کاربردی',
      'ریاضی عمومی ۱',
      'مبانی برنامه‌نویسی',
      'طراحی الگوریتم',
      'هوش مصنوعی پیشرفته',
      'اقتصاد خرد و کلان',
      'آناتومی و فیزیولوژی',
      'مبانی علوم کامپیوتر',
      'معماری کامپیوتر',
      'سیستم‌های عامل',
      'معادلات دیفرانسیل',
      'آمار و احتمال مهندسی'
    ];
  }
};

export const RecordingService = {
  getRecordings: async (classId?: string): Promise<Recording[]> => {
    return apiCall(
      async () => {
        const response = await api.get<Recording[]>('/recordings', { params: { classId } });
        return response.data;
      },
      () => {
        const recs = getSimulatedRecordings();
        if (classId) {
          return recs.filter(r => r.classId === classId);
        }
        return recs;
      }
    );
  },

  uploadRecording: async (data: { name: string; duration: number; classId: string; size: number }): Promise<Recording> => {
    return apiCall(
      async () => {
        const response = await api.post<Recording>('/recordings', data);
        return response.data;
      },
      () => {
        const classes = getSimulatedClasses();
        const assignedClass = classes.find(c => c.id === data.classId);
        if (!assignedClass) throw new Error('کلاس اختصاص‌یافته معتبر نیست.');

        const newRec: Recording = {
          id: `rec_${Math.random().toString(36).substring(2, 9)}`,
          name: data.name,
          duration: data.duration,
          size: data.size,
          classId: data.classId,
          className: assignedClass.name,
          createdAt: new Date().toISOString(),
          status: 'completed',
          transcriptStatus: 'completed'
        };

        const recs = getSimulatedRecordings();
        const updated = [newRec, ...recs];
        saveSimulatedRecordings(updated);
        return newRec;
      }
    );
  },

  deleteRecording: async (id: string): Promise<{ success: boolean }> => {
    return apiCall(
      async () => {
        const response = await api.delete<{ success: boolean }>(`/recordings/${id}`);
        return response.data;
      },
      () => {
        const recs = getSimulatedRecordings();
        const updated = recs.filter(r => r.id !== id);
        saveSimulatedRecordings(updated);
        return { success: true };
      }
    );
  },

  renameRecording: async (id: string, newName: string): Promise<Recording> => {
    return apiCall(
      async () => {
        const response = await api.patch<Recording>(`/recordings/${id}`, { name: newName });
        return response.data;
      },
      () => {
        const recs = getSimulatedRecordings();
        const foundIndex = recs.findIndex(r => r.id === id);
        if (foundIndex === -1) throw new Error('ضبط یافت نشد.');
        
        recs[foundIndex] = {
          ...recs[foundIndex],
          name: newName
        };
        saveSimulatedRecordings(recs);
        return recs[foundIndex];
      }
    );
  },

  retryProcessing: async (id: string): Promise<Recording> => {
    return apiCall(
      async () => {
        const response = await api.post<Recording>(`/recordings/${id}/retry`);
        return response.data;
      },
      () => {
        const recs = getSimulatedRecordings();
        const foundIndex = recs.findIndex(r => r.id === id);
        if (foundIndex === -1) throw new Error('ضبط یافت نشد.');
        
        recs[foundIndex] = {
          ...recs[foundIndex],
          status: 'completed',
          transcriptStatus: 'completed'
        };
        saveSimulatedRecordings(recs);
        return recs[foundIndex];
      }
    );
  }
};

function getChatKey(classId: string): string {
  try {
    const raw = localStorage.getItem(USER_DATA_KEY);
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.id) return `cb_chat_messages_${user.id}_${classId}`;
    }
  } catch {}
  return `cb_chat_messages_preauth_${classId}`;
}

export const ChatService = {
  getMessages: async (classId: string): Promise<ChatMessage[]> => {
    return apiCall(
      async () => {
        const response = await api.get<ChatMessage[]>(`/chat/messages?classId=${classId}`);
        return response.data;
      },
      () => {
        const cached = localStorage.getItem(getChatKey(classId));
        if (cached) return JSON.parse(cached);
        return [];
      }
    );
  },

  saveMessages: async (classId: string, messages: ChatMessage[]): Promise<void> => {
    localStorage.setItem(getChatKey(classId), JSON.stringify(messages));
    try {
      await api.post(`/chat/messages?classId=${classId}`, { messages });
    } catch (e) {
      // safe fallback
    }
  },

  deleteConversation: async (classId: string): Promise<{ success: boolean }> => {
    return apiCall(
      async () => {
        const response = await api.delete<{ success: boolean }>(`/chat/conversation?classId=${classId}`);
        return response.data;
      },
      () => {
        localStorage.removeItem(getChatKey(classId));
        return { success: true };
      }
    );
  },

  sendMessageStream: async (
    classId: string,
    className: string,
    message: string,
    searchMode: 'lecture' | 'hybrid',
    onStatusChange: (status: AIStatus) => void,
    onChunk: (chunk: string) => void,
    onSources: (sources: ChatSource[]) => void,
    onUsageUpdate: (usage: { dailyTokensUsed: number; maxDailyTokens: number }) => void,
    onComplete: (fullText: string) => void,
    onError: (err: any) => void,
    signal?: AbortSignal
  ): Promise<void> => {
    if (message.length > 10000) {
      onError(new Error('پیام شما بسیار طولانی است. لطفاً قبل از ارسال آن را کوتاه‌تر کنید (حداکثر ۱۰,۰۰۰ کاراکتر).'));
      return;
    }

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    
    try {
      onStatusChange('thinking');
      
      const response = await fetch(`/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ classId, message, searchMode }),
        signal
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      onStatusChange('generating');
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.substring(6);
            if (dataStr === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.status) {
                onStatusChange(parsed.status as AIStatus);
              }
              if (parsed.text || parsed.content || parsed.delta) {
                const chunk = parsed.text || parsed.content || parsed.delta;
                fullText += chunk;
                onChunk(chunk);
              }
              if (parsed.sources) {
                onSources(parsed.sources);
              }
              if (parsed.usage) {
                onUsageUpdate(parsed.usage);
              }
            } catch (e) {
              // Raw string fallback
              if (dataStr) {
                fullText += dataStr;
                onChunk(dataStr);
              }
            }
          }
        }
      }

      onStatusChange('completed');
      onComplete(fullText);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream generation was aborted by user.');
        return;
      }
      
      console.warn('Real API Stream failed, running high-fidelity simulation...', err);
      
      // RUN SIMULATOR FALLBACK
      try {
        let simulatedResponse = '';
        let simulatedSources: ChatSource[] = [];
        let estimatedTokens = 0;

        const normalizedMsg = message.toLowerCase();

        if (normalizedMsg.includes('حد') || normalizedMsg.includes('پیوستگی') || normalizedMsg.includes('limit')) {
          simulatedResponse = `### مبحث حد و پیوستگی توابع ریاضی

تعریف صوری حد یکی از پایه‌ای‌ترین مفاهیم در حساب دیفرانسیل و انتگرال است. به زبان ساده، وقتی می‌گوییم حد تابع $f(x)$ در نقطه $x = a$ برابر $L$ است (یعنی $\\lim_{x \\to a} f(x) = L$)، منظور این است که با نزدیک کردن $x$ به نقطه $a$ از چپ و راست، مقادیر $f(x)$ به $L$ نزدیک و نزدیک‌تر می‌شود.

#### شرایط پیوستگی تابع در یک نقطه
یک تابع $f(x)$ در نقطه‌ای مانند $x = a$ **پیوسته** نامیده می‌شود اگر و تنها اگر هر سه شرط زیر به طور همزمان برقرار باشند:

1. **وجود تعریف**: تابع در نقطه $a$ تعریف شده باشد (یعنی $f(a)$ موجود و یک عدد حقیقی باشد).
2. **وجود حد**: حد تابع در نقطه $a$ موجود باشد (حد چپ و حد راست با هم برابر باشند: $\\lim_{x \\to a^-} f(x) = \\lim_{x \\to a^+} f(x)$).
3. **برابری حد و مقدار**: حد تابع با مقدار تابع در آن نقطه برابر باشد:
   $$\\lim_{x \\to a} f(x) = f(a)$$

#### جدول همگرایی حد چپ و راست نمونه:
| مقدار $x$ از چپ | مقدار $f(x)$ | مقدار $x$ از راست | مقدار $f(x)$ |
| :--- | :--- | :--- | :--- |
| $1.9$ | $3.80$ | $2.1$ | $4.20$ |
| $1.99$ | $3.98$ | $2.01$ | $4.02$ |
| $1.999$ | $3.998$ | $2.001$ | $4.002$ |

همانطور که در جدول بالا مشاهده می‌کنید، حد تابع $f(x) = 2x$ در نقطه $x=2$ برابر با **$۴$** است و چون $f(2) = 4$ است، تابع در این نقطه کاملاً پیوسته است.

آیا مایلید مثال‌های سخت‌تر کلاسی را به همراه فرمول‌های هوش مصنوعی حل کنیم؟`;
          
          simulatedSources = [
            { type: 'lecture', title: 'جلسه دوم: حد و پیوستگی توابع ریاضی عمومی ۱', timestamp: 'دقیقه ۱۲:۴۰' },
            ...(searchMode === 'hybrid' ? [
              { type: 'textbook', title: 'کتاب حساب دیفرانسیل و انتگرال توماس - جلد اول', page: 'صفحه ۷۸ تا ۸۴' } as ChatSource,
              { type: 'pdf', title: 'جزوه تمرین حد و پیوستگی - دانشگاه تهران', page: 'صفحه ۱۲' } as ChatSource,
              { type: 'slide', title: 'اسلایدهای جلسه دوم - مفاهیم حد', page: 'اسلاید ۲۴' } as ChatSource,
            ] : [])
          ];
          estimatedTokens = 680;
        } 
        else if (normalizedMsg.includes('مشتق') || normalizedMsg.includes('derivat')) {
          simulatedResponse = `### بررسی مفهوم مشتق و نرخ تغییرات آنی

**مشتق (Derivative)** در حقیقت نرخ تغییرات آنی یک تابع نسبت به متغیر مستقل آن است. از نظر هندسی، مشتق تابع در یک نقطه، شیب خط مماس بر منحنی تابع در آن نقطه را نشان می‌دهد.

#### تعریف حدی مشتق
مشتق تابع $f(x)$ را با $f'(x)$ نشان داده و به صورت زیر تعریف می‌کنیم:
$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$

#### پرکاربردترین فرمول‌های مشتق‌گیری:
* **مشتق تابع ثابت**: $(c)' = 0$
* **قاعده توان**: $(x^n)' = n \\cdot x^{n-1}$
* **مشتق توابع مثلثاتی**: 
  - $(\\sin x)' = \\cos x$
  - $(\\cos x)' = -\\sin x$
* **مشتق توابع نمایی و لگاریتمی**:
  - $(e^x)' = e^x$
  - $(\\ln x)' = \\frac{1}{x}$

#### مثال حل‌شده کلاسی:
فرض کنید می‌خواهیم مشتق تابع $f(x) = 3x^2 + 5x - 2$ را در نقطه $x = 1$ پیدا کنیم.
1. ابتدا فرمول عمومی مشتق را با قانون توان به دست می‌آوریم:
   $$f'(x) = 6x + 5$$
2. حال مقدار $x = 1$ را در رابطه مشتق قرار می‌دهیم:
   $$f'(1) = 6(1) + 5 = 11$$

بنابراین، نرخ تغییرات آنی تابع در این نقطه برابر با **$۱۱$** است.`;
          simulatedSources = [
            { type: 'lecture', title: 'جلسه سوم: روش‌های مشتق‌گیری پیشرفته کلاسی', timestamp: 'دقیقه ۴۵:۱۵' },
            ...(searchMode === 'hybrid' ? [
              { type: 'textbook', title: 'کتاب حساب دیفرانسیل و انتگرال توماس - فصل ۳', page: 'صفحه ۱۲۰' } as ChatSource,
              { type: 'note', title: 'خلاصه نکات مشتق‌گیری - جزوه دانشجو', page: 'صفحه ۸' } as ChatSource,
              { type: 'slide', title: 'اسلایدهای جلسه سوم - قواعد مشتق', page: 'اسلاید ۱۵' } as ChatSource,
            ] : [])
          ];
          estimatedTokens = 540;
        } 
        else if (normalizedMsg.includes('کوییز') || normalizedMsg.includes('آزمون') || normalizedMsg.includes('سوال') || normalizedMsg.includes('امتحان')) {
          simulatedResponse = `### کوییز خودکار سنجش مفاهیم درس

من بر اساس مباحث تدریس شده و مراجع درسی این کلاس، یک کوییز تستی کوتاه برای شما طراحی کرده‌ام. پاسخ‌های خود را یادداشت کنید تا در گام بعدی آنها را با هم تحلیل کنیم:

#### سوال ۱:
کدام یک از شرایط زیر برای پیوستگی تابع $f(x)$ در نقطه $x = c$ الزامی **نیست**؟
1. تابع در نقطه $c$ تعریف شده باشد.
2. مشتق تابع در نقطه $c$ موجود باشد.
3. حد چپ و راست تابع در نقطه $c$ برابر باشند.
4. حد تابع با مقدار تابع در نقطه $c$ برابر باشد.

#### سوال ۲:
حد تابع $f(x) = \\frac{x^2 - 9}{x - 3}$ وقتی $x$ به سمت $3$ میل می‌کند چقدر است؟
1. صفر ($0$)
2. تعریف‌نشده
3. شش ($6$)
4. سه ($3$)

#### سوال ۳:
مشتق تابع $g(x) = \\sin(2x)$ کدام گزینه است            ؟
1. $2\\cos(2x)$
2. $-2\\cos(2x)$
3. $\\cos(2x)$
4. $2\\sin(x)$

---
*پس از انتخاب گزینه‌ها، شماره سوالات را ارسال کنید تا پاسخ تشریحی و درصد شما را محاسبه کنم!*`;
          simulatedSources = [
            { type: 'lecture', title: 'خلاصه جلسات ۱ تا ۳ کلاس ریاضی', timestamp: 'تحلیل خودکار موضوعی' },
            ...(searchMode === 'hybrid' ? [
              { type: 'textbook', title: 'بانک سوالات تشریحی و تستی دانشگاهی', page: 'فصل ۱ و ۲' } as ChatSource,
              { type: 'pdf', title: 'نمونه سوالات امتحانی میانترم - سال گذشته', page: 'صفحه ۵' } as ChatSource,
              { type: 'note', title: 'یادداشت‌های مروری استاد - مبحث حد و مشتق' } as ChatSource,
            ] : [])
          ];
          estimatedTokens = 490;
        } 
        else {
          simulatedResponse = `سلام! من دستیار هوشمند علمی و کمک‌آموزشی اختصاصی شما در کلاس **«${className}»** هستم. 

من با دسترسی کامل به رونوشت جلسات ضبط شده شما، جزوات کلاسی و کتاب‌های مرجع طراحی شده‌ام تا به سخت‌ترین سوالات درسی شما پاسخ دهم.

#### قابلیت‌های فعال من در این کلاس:
* **تحلیل دقیق ضبط کلاس**: پاسخ به سوالاتی مثل *"استاد در جلسه قبل درباره چه موضوعاتی آزمون خواهد گرفت؟"*
* **حل تشریحی تمارین**: تولید فرمول‌ها، پاسخ‌های گام‌به‌گام و خلاصه فصول به زبان فارسی روان.
* **طراحی کوییز و شبیه‌ساز آزمون**: کافیست بنویسید *"از مباحث جلسه گذشته یک آزمون تستی بگیر"*.
* **حالت جستجوی انتخابی**:
  * **فقط تدریس کلاسی**: پاسخ‌ها را به آنچه استاد در کلاس گفت محدود می‌کند.
  * **ترکیبی**: علاوه بر تدریس کلاسی، کتاب‌های مرجع، جزوات پی‌دی‌اف، اسلایدها و یادداشت‌های درسی را نیز جستجو می‌کند.

در حال حاضر شما روی **حالت ${searchMode === 'hybrid' ? 'ترکیبی' : 'فقط تدریس کلاسی'}** قرار دارید. چه سوالی از مباحث این درس دارید؟`;
          simulatedSources = [
            { type: 'lecture', title: `پایگاه دانش ضبط‌های کلاسی ${className}` },
            ...(searchMode === 'hybrid' ? [
              { type: 'textbook', title: `کتاب مرجع موضوعی این حوزه تحصیلی` } as ChatSource,
              { type: 'webpage', title: `منابع تکمیلی درس ${className}`, domain: 'academic.resources.edu' } as ChatSource,
            ] : [])
          ];
          estimatedTokens = 380;
        }

        // 1. Thinking status
        onStatusChange('thinking');
        await new Promise(resolve => setTimeout(resolve, 600));

        // 2. Searching status
        onStatusChange('searching_lecture');
        await new Promise(resolve => setTimeout(resolve, 700));

        if (searchMode === 'hybrid') {
          onStatusChange('searching_textbook');
          await new Promise(resolve => setTimeout(resolve, 800));
        }

        // 3. Generating status
        onStatusChange('generating');
        onSources(simulatedSources);

        // 4. Stream response word by word
        const words = simulatedResponse.split(' ');
        let currentText = '';
        
        for (let i = 0; i < words.length; i++) {
          if (signal?.aborted) {
            console.log('Stream aborted.');
            return;
          }
          const word = words[i] + (i === words.length - 1 ? '' : ' ');
          currentText += word;
          onChunk(word);
          // Wait briefly to simulate streaming
          await new Promise(resolve => setTimeout(resolve, Math.max(10, 30 - (i % 5))));
        }

        // 5. Update backend token usage
        const currentSubscription = loadSubscriptionForCurrentUser();
        const updatedSubscription = { ...currentSubscription };
        updatedSubscription.usage.dailyTokensUsed = Math.min(
          updatedSubscription.usage.maxDailyTokens,
          updatedSubscription.usage.dailyTokensUsed + estimatedTokens
        );
        saveSimulatedSubscription(updatedSubscription);
        onUsageUpdate({
          dailyTokensUsed: updatedSubscription.usage.dailyTokensUsed,
          maxDailyTokens: updatedSubscription.usage.maxDailyTokens
        });

        // 6. Complete
        onStatusChange('completed');
        onComplete(currentText);

      } catch (simErr) {
        onError(simErr);
      }
    }
  }
};
