
export enum View {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  ART_GEN = 'ART_GEN',
  FACE_GEN = 'FACE_GEN',
  WEDDING_GEN = 'WEDDING_GEN',
  TTS = 'TTS',
  VOICE_CLONE = 'VOICE_CLONE',
  BG_GEN = 'BG_GEN',
  ADMIN_PANEL = 'ADMIN_PANEL',
  TET_2026_GEN = 'TET_2026_GEN',
  CHRISTMAS_GEN = 'CHRISTMAS_GEN',
  SLIDE_GEN = 'SLIDE_GEN',
  POSTER_GEN = 'POSTER_GEN',
  QUIZ_GEN = 'QUIZ_GEN',
  QUIZ_GRADER = 'QUIZ_GRADER',
}

export enum UserRole {
  USER = 'USER',
  CREATOR = 'CREATOR',
  ADMIN = 'ADMIN',
}

export interface User {
  email: string;
  name?: string;
  photoURL?: string;
  role: UserRole;
  credits: number;
}

export interface GenerationResult {
  id: string;
  type: 'image' | 'audio' | 'video';
  url: string; 
  createdAt: Date;
  prompt: string;
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '3:4' | '4:3';

export interface VoiceProfile {
  id: string;
  name: string;
  region: 'North' | 'Central' | 'South';
  gender: 'Male' | 'Female';
  style: 'News' | 'Story' | 'Promo';
  geminiVoiceName: string; // internal mapping
}

export interface SlideContent {
  title: string;
  subtitle: string;
  points: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string; // The text of the correct option
}

export interface GradingResult {
  studentInfo: {
    name: string;
    studentId: string;
    class: string;
  };
  quizCode: string;
  studentAnswers: { q: number; marked: string | null }[];
}
