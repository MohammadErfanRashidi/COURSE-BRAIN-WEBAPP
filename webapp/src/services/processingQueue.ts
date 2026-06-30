/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RecordingService } from './api';

function getCurrentUserId(): string | null {
  try {
    const raw = localStorage.getItem('cb_user_data');
    if (raw) {
      const user = JSON.parse(raw);
      return user.id || null;
    }
  } catch {}
  return null;
}

function getJobsStorageKey(): string {
  const uid = getCurrentUserId();
  return uid ? `cb_processing_jobs_${uid}` : 'cb_processing_jobs_preauth';
}

export type JobStage =
  | 'uploading'
  | 'queued'
  | 'preparing'
  | 'uploading_audio'
  | 'transcribing'
  | 'generating_transcript'
  | 'chunking'
  | 'embedding'
  | 'indexing'
  | 'saving_metadata'
  | 'completed'
  | 'failed';

export interface ProcessJob {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  duration: number;
  classId: string;
  className: string;
  createdAt: string;
  stage: JobStage;
  progress: number; // 0 to 100
  elapsedTime: number; // in seconds
  estimatedTimeRemaining: number; // in seconds
  queuePosition?: number;
}

export const ProcessingQueueService = {
  getJobs: (): ProcessJob[] => {
    try {
      const cached = localStorage.getItem(getJobsStorageKey());
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  },

  saveJobs: (jobs: ProcessJob[]): void => {
    try {
      localStorage.setItem(getJobsStorageKey(), JSON.stringify(jobs));
      window.dispatchEvent(new CustomEvent('cb-jobs-changed'));
    } catch (e) {
      console.error('Error saving jobs', e);
    }
  },

  addJob: (job: Omit<ProcessJob, 'id' | 'createdAt' | 'stage' | 'progress' | 'elapsedTime' | 'estimatedTimeRemaining' | 'queuePosition'>): ProcessJob => {
    const jobs = ProcessingQueueService.getJobs();
    const newJob: ProcessJob = {
      ...job,
      id: `job_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      stage: 'uploading',
      progress: 0,
      elapsedTime: 0,
      estimatedTimeRemaining: 45, // starts at 45s estimate
      queuePosition: jobs.filter(j => j.stage !== 'completed' && j.stage !== 'failed').length + 1
    };

    jobs.push(newJob);
    ProcessingQueueService.saveJobs(jobs);

    // Trigger simulation processing
    ProcessingQueueService.startProcessingJob(newJob.id);

    return newJob;
  },

  removeJob: (id: string): void => {
    const jobs = ProcessingQueueService.getJobs();
    const updated = jobs.filter(j => j.id !== id);
    ProcessingQueueService.saveJobs(updated);
  },

  startProcessingJob: (jobId: string): void => {
    let tickCount = 0;
    const stages: { stage: JobStage; duration: number; progressRange: [number, number] }[] = [
      { stage: 'uploading', duration: 3, progressRange: [0, 15] },
      { stage: 'queued', duration: 2, progressRange: [15, 25] },
      { stage: 'preparing', duration: 2, progressRange: [25, 35] },
      { stage: 'uploading_audio', duration: 3, progressRange: [35, 45] },
      { stage: 'transcribing', duration: 5, progressRange: [45, 60] },
      { stage: 'generating_transcript', duration: 4, progressRange: [60, 70] },
      { stage: 'chunking', duration: 3, progressRange: [70, 80] },
      { stage: 'embedding', duration: 3, progressRange: [80, 90] },
      { stage: 'indexing', duration: 3, progressRange: [90, 95] },
      { stage: 'saving_metadata', duration: 2, progressRange: [95, 100] },
    ];

    const interval = setInterval(async () => {
      const jobs = ProcessingQueueService.getJobs();
      const jobIdx = jobs.findIndex(j => j.id === jobId);
      if (jobIdx === -1) {
        clearInterval(interval);
        return;
      }

      const job = jobs[jobIdx];
      tickCount++;
      job.elapsedTime = tickCount;

      // Find current stage based on elapsed time
      let cumulativeTime = 0;
      let currentStageIdx = 0;
      for (let i = 0; i < stages.length; i++) {
        cumulativeTime += stages[i].duration;
        if (tickCount <= cumulativeTime) {
          currentStageIdx = i;
          break;
        }
        if (i === stages.length - 1) {
          currentStageIdx = i;
        }
      }

      const currentStageDef = stages[currentStageIdx];
      job.stage = currentStageDef.stage;

      // Estimate progress
      const totalEstimatedTime = stages.reduce((sum, s) => sum + s.duration, 0);
      const stageStartCumulative = stages.slice(0, currentStageIdx).reduce((sum, s) => sum + s.duration, 0);
      const timeInStage = tickCount - stageStartCumulative;
      const stageProgressFraction = Math.min(1, timeInStage / currentStageDef.duration);
      const [pStart, pEnd] = currentStageDef.progressRange;
      job.progress = Math.min(99, Math.round(pStart + (pEnd - pStart) * stageProgressFraction));
      job.estimatedTimeRemaining = Math.max(1, totalEstimatedTime - tickCount);
      job.queuePosition = Math.max(1, Math.round((totalEstimatedTime - tickCount) / 10));

      if (tickCount >= totalEstimatedTime) {
        clearInterval(interval);
        job.stage = 'completed';
        job.progress = 100;
        job.estimatedTimeRemaining = 0;
        job.queuePosition = undefined;

        // Persist completed recording to api / local storage
        try {
          await RecordingService.uploadRecording({
            name: job.name,
            duration: job.duration,
            classId: job.classId,
            size: job.fileSize
          });
        } catch (e) {
          console.error('Failed to auto persist recording', e);
        }
      }

      ProcessingQueueService.saveJobs(jobs);
    }, 1000);
  },

  resumeUnfinishedJobs: (): void => {
    try {
      const jobs = ProcessingQueueService.getJobs();
      jobs.forEach(job => {
        if (job.stage !== 'completed' && job.stage !== 'failed') {
          ProcessingQueueService.startProcessingJob(job.id);
        }
      });
    } catch (e) {
      console.error('Error resuming unfinished jobs', e);
    }
  },

  clearFinishedJobs: (): void => {
    try {
      const jobs = ProcessingQueueService.getJobs();
      const updated = jobs.filter(job => job.stage !== 'completed' && job.stage !== 'failed');
      ProcessingQueueService.saveJobs(updated);
    } catch (e) {
      console.error('Error clearing finished jobs', e);
    }
  }
};
