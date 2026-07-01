/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AdminRole = 
  | 'SUPER_ADMINISTRATOR'
  | 'ADMINISTRATOR'
  | 'SUPPORT_STAFF'
  | 'CONTENT_MANAGER'
  | 'ANALYTICS_VIEWER';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: AdminRole;
  fullName: string;
  avatarUrl?: string;
  twoFactorEnabled: boolean;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  adminRole: AdminRole;
  action: string;
  affectedUser?: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface ManagedUser {
  id: string;
  phoneNumber: string;
  fullName: string;
  university: string;
  major: string;
  degree: string;
  semester: number;
  status: 'ACTIVE' | 'SUSPENDED';
  subscriptionPlan: string;
  subscriptionExpiresAt: string;
  recordingHoursUsed: number;
  dailyTokensUsed: number;
  lastLogin: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userPhone: string;
  userName: string;
  subject: string;
  category: 'TECHNICAL' | 'BILLING' | 'ACADEMIC' | 'GENERAL';
  status: 'OPEN' | 'ASSIGNED' | 'RESOLVED';
  assignedTo?: string;
  createdAt: string;
  messages: {
    sender: 'USER' | 'SUPPORT';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}



export interface TextbookKnowledge {
  id: string;
  title: string;
  subject: string;
  fileName: string;
  fileSize: number;
  chunkCount: number;
  embeddingCount: number;
  status: 'UPLOADED' | 'EXTRACTING' | 'CHUNKING' | 'EMBEDDING' | 'INDEXED' | 'FAILED';
  progress: number; // 0 to 100
  version: string;
  uploadedAt: string;
}

export interface SystemMetrics {
  fastApiStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  aiLatency: number; // ms
  sonioxQueueSize: number;
  postgresDbSize: string;
  chromaCollectionCount: number;
  cpuUsage: number; // %
  memoryUsage: number; // %
  diskUsage: number; // %
}
