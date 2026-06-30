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
  degree: string; // 'md' for Doctor of Medicine, extensible later
}

export interface University {
  id: string;
  name: string;
  city?: string;
}

export interface Course {
  id: string;
  name: string;
  degree: string;
  semester: number;
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
    lastDailyReset?: string;
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

export type SourceType = 'lecture' | 'textbook' | 'pdf' | 'slide' | 'note' | 'webpage';

export interface ChatSource {
  type: SourceType;
  title: string;
  excerpt?: string;
  page?: string | number;
  timestamp?: string;
  url?: string;
  domain?: string;
  publisher?: string;
}

export type AIStatus = 
  | 'queued'
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

