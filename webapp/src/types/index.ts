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
  subscriptionTier?: 'free' | 'pro' | 'power';
  academicProfile?: AcademicProfile;
  createdAt: string;
}

export interface AcademicProfile {
  universityId: string;
  universityName: string;
  degree: string; // 'md' for Doctor of Medicine, extensible later
  customUniversityName?: string; // Custom name when "سایر (Others)" is selected
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
  tier: 'free' | 'pro' | 'power';
  limits: {
    maxClasses: number;
    maxRecordingHours: number;
    maxDailyTokens: number;
    maxDailyMessages: number;
    monthlyTranscriptionMinutes: number;
    pdfUploadAllowed: boolean;
    imageUploadAllowed: boolean;
  };
}

export interface SubscriptionStatus {
  active: boolean;
  planId: string;
  planName: string;
  planTier: 'free' | 'pro' | 'power';
  expiresAt: string | null;
  lastRenewalAt?: string;
  isCancelled?: boolean;
  autoRenew?: boolean;
  usage: {
    classesCount: number;
    maxClasses: number;
    recordingHoursUsed: number;
    maxRecordingHours: number;
    monthlyTranscriptionMinutesUsed: number;
    monthlyTranscriptionMinutesLimit: number;
    dailyTokensUsed: number;
    maxDailyTokens: number;
    dailyMessagesSentCount: number;
    maxDailyMessages: number;
    lastDailyReset?: string;
    lastMonthlyReset?: string;
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

// ──────────────────────────────────────────────
// Support / Live Chat types
// ──────────────────────────────────────────────

export type SupportSenderRole = 'user' | 'admin';

export type ConversationStatus = 'open' | 'waiting_user' | 'waiting_support' | 'resolved' | 'closed';

export type SupportCategory = 'TECHNICAL' | 'BILLING' | 'ACADEMIC' | 'GENERAL';

export interface SupportMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: SupportSenderRole;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface SupportConversation {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  status: ConversationStatus;
  category: SupportCategory;
  subject: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  messages: SupportMessage[];
}

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

export interface ChatConversation {
  id: string;
  classId: string;
  title: string;
  messages: ChatMessage[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

