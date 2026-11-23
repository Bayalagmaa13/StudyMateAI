import type { QuizAttempt, StudySession, Task } from '@/types';
import { addDays, dayKey, startOfDay } from './date';

export function completionRate(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((t) => t.is_completed).length / tasks.length) * 100);
}

export function averageQuizPercent(attempts: QuizAttempt[]): number {
  if (attempts.length === 0) return 0;
  const sum = attempts.reduce((acc, a) => acc + a.score / a.total_questions, 0);
  return Math.round((sum / attempts.length) * 100);
}

/** Өдөр бүрийн суралцсан минут (dayKey → минут) */
export function minutesByDay(sessions: StudySession[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const s of sessions) {
    const k = dayKey(s.studied_at);
    map[k] = (map[k] ?? 0) + s.duration_minutes;
  }
  return map;
}

/** Сүүлийн n өдрийн суралцсан минут (хуучнаас шинэ рүү) */
export function lastNDays(sessions: StudySession[], n: number): { date: Date; minutes: number }[] {
  const map = minutesByDay(sessions);
  const today = startOfDay();
  return Array.from({ length: n }, (_, i) => {
    const date = addDays(today, i - (n - 1));
    return { date, minutes: map[dayKey(date)] ?? 0 };
  });
}

/**
 * Streak — дараалсан идэвхтэй өдрийн тоо.
 * Идэвхтэй өдөр = study session, quiz эсвэл тэр өдөр хугацаатай дууссан даалгавар.
 * Өнөөдөр хараахан идэвхгүй бол өчигдрөөс тоолно (streak тасрахгүй).
 */
export function computeStreak(sessions: StudySession[], attempts: QuizAttempt[]): number {
  const active = new Set<string>([
    ...sessions.map((s) => dayKey(s.studied_at)),
    ...attempts.map((a) => dayKey(a.completed_at)),
  ]);
  let day = startOfDay();
  if (!active.has(dayKey(day))) day = addDays(day, -1);
  let streak = 0;
  while (active.has(dayKey(day))) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

export function todayMinutes(sessions: StudySession[]): number {
  return minutesByDay(sessions)[dayKey(new Date())] ?? 0;
}
