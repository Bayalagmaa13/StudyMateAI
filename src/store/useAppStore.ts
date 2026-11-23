import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createSeed, DEMO_USER_ID } from '@/data/mock';
import type {
  ChatMessage,
  MistakeItem,
  Profile,
  QuizAttempt,
  Settings,
  StudySession,
  Subject,
  Task,
} from '@/types';
import { uid } from '@/utils/date';

type NewTask = Omit<Task, 'id' | 'user_id' | 'created_at' | 'is_completed'>;
type NewSubject = Omit<Subject, 'id' | 'user_id' | 'created_at'>;

interface AppState {
  profile: Profile;
  subjects: Subject[];
  tasks: Task[];
  quizAttempts: QuizAttempt[];
  studySessions: StudySession[];
  mistakes: MistakeItem[];
  chat: ChatMessage[];
  settings: Settings;

  // Хичээл (FR-02)
  addSubject: (s: NewSubject) => void;
  updateSubject: (id: string, s: Partial<NewSubject>) => void;
  deleteSubject: (id: string) => void;

  // Даалгавар (FR-03)
  addTask: (t: NewTask) => void;
  updateTask: (id: string, t: Partial<NewTask>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // Quiz (FR-05)
  recordQuizAttempt: (a: { quiz_title: string; score: number; total_questions: number }) => void;
  addMistakes: (quizId: string, questionIds: string[]) => void;
  removeMistakes: (questionIds: string[]) => void;

  // Pomodoro / study sessions (бонус)
  addStudySession: (subject_id: string | null, duration_minutes: number) => void;

  // AI Tutor (FR-04)
  addChatMessage: (m: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  clearChat: () => void;

  // Профайл (FR-07)
  updateProfile: (p: Partial<Pick<Profile, 'full_name' | 'email'>>) => void;
  updateSettings: (s: Partial<Settings>) => void;
  resetDemoData: () => void;
}

const defaultSettings: Settings = { focusMinutes: 25, breakMinutes: 5, dailyGoalMinutes: 60 };

const initialData = () => ({
  ...createSeed(),
  mistakes: [] as MistakeItem[],
  chat: [] as ChatMessage[],
  settings: defaultSettings,
});

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialData(),

      addSubject: (s) =>
        set((st) => ({
          subjects: [...st.subjects, { ...s, id: uid(), user_id: DEMO_USER_ID, created_at: new Date().toISOString() }],
        })),
      updateSubject: (id, s) => set((st) => ({ subjects: st.subjects.map((x) => (x.id === id ? { ...x, ...s } : x)) })),
      deleteSubject: (id) =>
        set((st) => ({
          subjects: st.subjects.filter((x) => x.id !== id),
          // Хичээл устгахад даалгаврууд устахгүй, хичээлгүй болно (ON DELETE SET NULL)
          tasks: st.tasks.map((t) => (t.subject_id === id ? { ...t, subject_id: null } : t)),
        })),

      addTask: (t) =>
        set((st) => ({
          tasks: [
            ...st.tasks,
            { ...t, id: uid(), user_id: DEMO_USER_ID, is_completed: false, created_at: new Date().toISOString() },
          ],
        })),
      updateTask: (id, t) => set((st) => ({ tasks: st.tasks.map((x) => (x.id === id ? { ...x, ...t } : x)) })),
      toggleTask: (id) =>
        set((st) => ({ tasks: st.tasks.map((x) => (x.id === id ? { ...x, is_completed: !x.is_completed } : x)) })),
      deleteTask: (id) => set((st) => ({ tasks: st.tasks.filter((x) => x.id !== id) })),

      recordQuizAttempt: (a) =>
        set((st) => ({
          quizAttempts: [
            ...st.quizAttempts,
            { ...a, id: uid(), user_id: DEMO_USER_ID, completed_at: new Date().toISOString() },
          ],
        })),
      addMistakes: (quizId, questionIds) =>
        set((st) => {
          const existing = new Set(st.mistakes.map((m) => m.questionId));
          const fresh = questionIds
            .filter((q) => !existing.has(q))
            .map((questionId) => ({ questionId, quizId, addedAt: new Date().toISOString() }));
          return { mistakes: [...st.mistakes, ...fresh] };
        }),
      removeMistakes: (questionIds) =>
        set((st) => ({ mistakes: st.mistakes.filter((m) => !questionIds.includes(m.questionId)) })),

      addStudySession: (subject_id, duration_minutes) =>
        set((st) => ({
          studySessions: [
            ...st.studySessions,
            { id: uid(), user_id: DEMO_USER_ID, subject_id, duration_minutes, studied_at: new Date().toISOString() },
          ],
        })),

      addChatMessage: (m) =>
        set((st) => ({ chat: [...st.chat, { ...m, id: uid(), createdAt: new Date().toISOString() }] })),
      clearChat: () => set({ chat: [] }),

      updateProfile: (p) => set((st) => ({ profile: { ...st.profile, ...p } })),
      updateSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s } })),
      resetDemoData: () => set(initialData()),
    }),
    {
      name: 'studymate-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
