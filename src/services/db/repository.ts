import { supabase } from '@/lib/supabase';
import type { QuizAttempt, StudySession, Subject, Task } from '@/types';

/**
 * Supabase-тэй ажиллах давхарга (дараагийн шатанд бэлтгэсэн).
 * RLS идэвхтэй тул query бүр нэвтэрсэн хэрэглэгчийн мөрүүдийг л буцаана.
 * Одоогийн demo нь store/useAppStore.ts дахь mock өгөгдлөөр ажилладаг.
 */
function client() {
  if (!supabase) throw new Error('Supabase тохируулаагүй байна (.env)');
  return supabase;
}

export const subjectsRepo = {
  list: async () => (await client().from('subjects').select('*').order('created_at')).data as Subject[] | null,
  insert: async (s: Omit<Subject, 'id' | 'created_at'>) => client().from('subjects').insert(s).select().single(),
  update: async (id: string, s: Partial<Subject>) => client().from('subjects').update(s).eq('id', id),
  remove: async (id: string) => client().from('subjects').delete().eq('id', id),
};

export const tasksRepo = {
  list: async () => (await client().from('tasks').select('*').order('due_at')).data as Task[] | null,
  insert: async (t: Omit<Task, 'id' | 'created_at'>) => client().from('tasks').insert(t).select().single(),
  update: async (id: string, t: Partial<Task>) => client().from('tasks').update(t).eq('id', id),
  remove: async (id: string) => client().from('tasks').delete().eq('id', id),
};

export const quizAttemptsRepo = {
  list: async () =>
    (await client().from('quiz_attempts').select('*').order('completed_at', { ascending: false })).data as
      | QuizAttempt[]
      | null,
  insert: async (a: Omit<QuizAttempt, 'id'>) => client().from('quiz_attempts').insert(a),
};

export const studySessionsRepo = {
  list: async () => (await client().from('study_sessions').select('*')).data as StudySession[] | null,
  insert: async (s: Omit<StudySession, 'id'>) => client().from('study_sessions').insert(s),
};
