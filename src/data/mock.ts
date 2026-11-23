import type { Profile, QuizAttempt, StudySession, Subject, Task } from '@/types';
import { addDays, startOfDay } from '@/utils/date';

export const DEMO_USER_ID = 'demo-user';

const at = (dayOffset: number, hour: number, minute = 0) => {
  const d = addDays(startOfDay(), dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export function createSeed() {
  const now = new Date().toISOString();

  const profile: Profile = {
    id: DEMO_USER_ID,
    full_name: 'Оюутан',
    email: 'student@example.com',
    created_at: now,
  };

  const subjects: Subject[] = [
    { id: 's1', user_id: DEMO_USER_ID, name: 'Мобайл програмчлал', instructor: 'Багш Б.', color: '#4F46E5', created_at: now },
    { id: 's2', user_id: DEMO_USER_ID, name: 'Өгөгдлийн сан', instructor: 'Багш Д.', color: '#0EA5E9', created_at: now },
    { id: 's3', user_id: DEMO_USER_ID, name: 'Хүн-компьютерын харилцаа', instructor: 'Багш Г.', color: '#EC4899', created_at: now },
    { id: 's4', user_id: DEMO_USER_ID, name: 'Өгөгдөл олборлолт', instructor: 'Багш Н.', color: '#10B981', created_at: now },
  ];

  const t = (
    id: string,
    subject_id: string,
    title: string,
    description: string,
    due_at: string,
    priority: Task['priority'],
    is_completed = false,
  ): Task => ({ id, user_id: DEMO_USER_ID, subject_id, title, description, due_at, priority, is_completed, created_at: now });

  const tasks: Task[] = [
    t('t1', 's1', 'Expo Router navigation хийх', 'Tab болон stack navigation тохируулах', at(0, 18), 'high'),
    t('t2', 's2', 'SQL лабораторийн ажил 5', 'JOIN болон GROUP BY дасгалууд', at(0, 23, 59), 'medium'),
    t('t3', 's3', 'Usability test тайлан', '5 хэрэглэгчтэй тест хийж дүгнэлт бичих', at(2, 12), 'high'),
    t('t4', 's4', 'RapidMiner decision tree', 'Churn өгөгдөл дээр загвар сургах', at(4, 18), 'medium'),
    t('t5', 's1', 'Figma prototype засах', 'Багшийн өгсөн санал оруулах', at(-1, 18), 'low', true),
    t('t6', 's2', 'Явцын шалгалтад бэлдэх', 'Normalization, ER diagram давтах', at(6, 9), 'high'),
    t('t7', 's3', 'Унших материал: Nielsen-ийн 10 зарчим', '', at(-2, 20), 'low', true),
  ];

  const quizAttempts: QuizAttempt[] = [
    { id: 'qa1', user_id: DEMO_USER_ID, quiz_title: 'React Native үндэс', score: 4, total_questions: 5, completed_at: at(-3, 20) },
    { id: 'qa2', user_id: DEMO_USER_ID, quiz_title: 'Өгөгдлийн сан ба SQL', score: 3, total_questions: 5, completed_at: at(-1, 21) },
  ];

  const studySessions: StudySession[] = [
    { id: 'ss1', user_id: DEMO_USER_ID, subject_id: 's1', duration_minutes: 50, studied_at: at(-4, 19) },
    { id: 'ss2', user_id: DEMO_USER_ID, subject_id: 's2', duration_minutes: 25, studied_at: at(-3, 20) },
    { id: 'ss3', user_id: DEMO_USER_ID, subject_id: 's3', duration_minutes: 75, studied_at: at(-2, 18) },
    { id: 'ss4', user_id: DEMO_USER_ID, subject_id: 's1', duration_minutes: 25, studied_at: at(-1, 21) },
  ];

  return { profile, subjects, tasks, quizAttempts, studySessions };
}
