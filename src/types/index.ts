// Өгөгдлийн төрлүүд — Supabase-ийн хүснэгтүүдтэй (supabase/schema.sql) нэг бүтэцтэй.

export type Priority = 'low' | 'medium' | 'high';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  instructor: string;
  color: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  description: string;
  due_at: string; // ISO огноо
  priority: Priority;
  is_completed: boolean;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  completed_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject_id: string | null;
  duration_minutes: number;
  studied_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  subjectName: string;
  questions: QuizQuestion[];
}

/** Буруу хариулсан асуулт — "Алдааны давтлага" горимд ашиглана (бонус). */
export interface MistakeItem {
  questionId: string;
  quizId: string;
  addedAt: string;
}

export interface Settings {
  focusMinutes: number;
  breakMinutes: number;
  dailyGoalMinutes: number;
}

export type ChatRole = 'user' | 'assistant';
export type AssistantMode = 'answer' | 'summary' | 'explain' | 'review';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  mode?: AssistantMode;
  createdAt: string;
  isMock?: boolean;
}
