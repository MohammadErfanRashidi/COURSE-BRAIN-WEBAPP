/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { Recording } from '../types';

interface PlayerState {
  activeRecording: Recording | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  volume: number;
  isMuted: boolean;
  seekTrigger: number | null;
  
  play: (recording: Recording) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (isMuted: boolean) => void;
  triggerSeek: (seconds: number) => void;
  clearSeekTrigger: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  activeRecording: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  speed: 1,
  volume: 0.8,
  isMuted: false,
  seekTrigger: null,

  play: (recording) => set({ 
    activeRecording: recording, 
    isPlaying: true, 
    currentTime: 0, 
    duration: recording.duration || 0,
    seekTrigger: 0
  }),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  stop: () => set({ activeRecording: null, isPlaying: false, currentTime: 0, duration: 0 }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setSpeed: (speed) => set({ speed }),
  setVolume: (volume) => set({ volume }),
  setIsMuted: (isMuted) => set({ isMuted }),
  triggerSeek: (seconds) => set({ seekTrigger: seconds }),
  clearSeekTrigger: () => set({ seekTrigger: null }),
}));
