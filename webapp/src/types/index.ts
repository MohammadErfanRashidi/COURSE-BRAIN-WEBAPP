/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  phoneNumber: string;
  fullName?: string;
  isNewUser: boolean;
  onboardingCompleted: boolean;
  hasActiveSubscription: boolean;
  academicProfile?: AcademicProfile;
  createdAt: string;
}

export interface AcademicProfile {
  universityId: string;
  universityName: string;
  degree: string; // 'bachelor' | 'master' | 'phd' | 'associate'
  majorId: string;
  majorName: string;
  semesterId: string;
  semesterName: string;
  classIds: string[];
  classes: Class[];
}

export interface University {
  id: string;
  name: string;
  city?: string;
}

export interface Major {
  id: string;
  name: string;
}

export interface Semester {
  id: string;
  name: string; // e.g., "نیمسال اول ۱۴۰۴-۱۴۰۵"
}

export interface Class {
  id: string;
  name: string; // e.g., "ریاضی عمومی ۱"
  code?: string;
  instructor?: string;
  isArchived?: boolean;
  createdAt?: string;
}

export interface TranscriptSegment {
  start: number; // in seconds
  end: number; // in seconds
  text: string;
  speaker?: string;
  isAiReferenced?: boolean;
}

export interface Recording {
  id: string;
  name: string;
  duration: number; // in seconds
  size: number; // in bytes
  classId: string;
  className: string;
  createdAt: string;
  status: 'uploading' | 'queued' | 'transcribing' | 'chunking' | 'embedding' | 'saving' | 'completed' | 'failed';
  transcriptStatus: 'not_started' | 'processing' | 'completed' | 'failed';
  url?: string;
  transcript?: string;
  segments?: TranscriptSegment[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  price: number; // in Tomans
  durationDays: number;
  features: string[];
  limits: {
    maxClasses: number;
    maxRecordingHours: number;
    maxDailyTokens: number;
    pdfUploadAllowed: boolean;
    imageUploadAllowed: boolean;
  };
}

export interface SubscriptionStatus {
  active: boolean;
  planId: string;
  planName: string;
  expiresAt: string | null;
  lastRenewalAt?: string;
  isCancelled?: boolean;
  autoRenew?: boolean;
  usage: {
    classesCount: number;
    maxClasses: number;
    recordingHoursUsed: number;
    maxRecordingHours: number;
    dailyTokensUsed: number;
    maxDailyTokens: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
}

export interface ChatSource {
  type: 'lecture' | 'textbook';
  title: string;
  excerpt?: string;
  page?: string | number;
  timestamp?: string;
}

export type AIStatus = 
  | 'thinking' 
  | 'searching_lecture' 
  | 'searching_textbook' 
  | 'generating' 
  | 'completed' 
  | 'failed';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: ChatSource[];
  searchMode?: 'lecture' | 'hybrid';
  status?: AIStatus;
  isStreaming?: boolean;
}

