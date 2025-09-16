// Shared types for ChordCraft Studio

export interface Track {
  id: string;
  name: string;
  type: "audio" | "midi";
  duration: string;
  volume: number;
  muted: boolean;
  solo: boolean;
}

export interface AudioSettings {
  volume: number;
  tempo: number;
  key: string;
  instrument: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  volume: number;
  tempo: number;
  key: string;
  instrument: string;
  autoSave: boolean;
  showTutorials: boolean;
  enableHaptics: boolean;
  language: string;
}

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: number;
}

export interface Note {
  id: string;
  pitch: string;
  startTime: number;
  duration: number;
  velocity: number;
  muted?: boolean;
}

export interface Project {
  id: string;
  name: string;
  tracks: Track[];
  notes: Note[];
  tempo: number;
  key: string;
  createdAt: Date;
  updatedAt: Date;
}
