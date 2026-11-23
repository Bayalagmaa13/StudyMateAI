import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { TaskItem } from '@/components/TaskItem';
import { Card, EmptyState, ProgressBar, SectionHeader, StatCard, type IconName } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';
import { daysUntil, formatDate, greeting, isToday } from '@/utils/date';
import { completionRate, computeStreak, todayMinutes } from '@/utils/stats';

const quickActions: { icon: IconName; label: string; href: string; color: string }[] = [
  { icon: 'add-circle', label: 'Даалгавар', href: '/task/new', color: colors.primary },
  { icon: 'timer', label: 'Pomodoro', href: '/pomodoro', color: '#EF4444' },
  { icon: 'sparkles', label: 'AI асуух', href: '/tutor', color: '#8B5CF6' },
  { icon: 'help-circle', label: 'Quiz', href: '/quiz', color: '#10B981' },
];

export default function HomeScreen() {
  const { profile, tasks, subjects, studySessions, quizAttempts, settings, toggleTask } = useAppStore();
  const subjectById = useMemo(() => Object.fromEntries(subjects.map((s) => [s.id, s])), [subjects]);

  const todayTasks = tasks.filter((t) => isToday(t.due_at)).sort((a, b) => a.due_at.localeCompare(b.due_at));
  const upcoming = tasks
    .filter((t) => !t.is_completed && daysUntil(t.due_at) > 0 && daysUntil(t.due_at) <= 7)
    .sort((a, b) => a.due_at.localeCompare(b.due_at))
    .slice(0, 3);
  // "Шалгалт" — өндөр ач холбогдолтой хамгийн ойрын дуусаагүй даалгавар
  const nextExam = tasks
    .filter((t) => !t.is_completed && t.priority === 'high' && daysUntil(t.due_at) >= 0)
    .sort((a, b) => a.due_at.localeCompare(b.due_at))[0];

  const rate = completionRate(tasks);
  const streak = computeStreak(studySessions, quizAttempts);
  const minutes = todayMinutes(studySessions);
  const goalPct = Math.round((minutes / settings.dailyGoalMinutes) * 100);

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>{greeting()},</Text>
          <Text style={styles.name}>{profile.full_name} 👋</Text>
          <Text style={styles.date}>{formatDate(new Date().toISOString())}</Text>
        </View>
        <Pressable onPress={() => router.push('/profile')} style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.full_name.charAt(0).toUpperCase()}</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <StatCard icon="flame" label="Streak (өдөр)" value={`${streak}`} color="#F97316" />
        <StatCard icon="checkmark-done" label="Гүйцэтгэл" value={`${rate}%`} color={colors.success} />
        <StatCard icon="time" label="Өнөөдөр (мин)" value={`${minutes}`} color={colors.primary} />
      </View>

      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.goalHead}>
          <Text style={styles.goalTitle}>Өдрийн зорилго</Text>
          <Text style={styles.goalValue}>
            {minutes}/{settings.dailyGoalMinutes} мин
          </Text>
        </View>
        <ProgressBar value={goalPct} color={goalPct >= 100 ? colors.success : colors.primary} />
        <Text style={styles.goalHint}>
          {goalPct >= 100 ? '🎉 Өнөөдрийн зорилгоо биелүүллээ!' : 'Pomodoro эхлүүлж зорилгодоо хүрээрэй.'}
        </Text>
      </Card>

      {nextExam ? (
        <Card style={styles.exam}>
          <Ionicons name="school" size={22} color={colors.white} />
          <View style={{ flex: 1 }}>
            <Text style={styles.examLabel}>Ойртож буй чухал ажил</Text>
            <Text style={styles.examTitle} numberOfLines={1}>
              {nextExam.title}
            </Text>
          </View>
          <View style={styles.examDays}>
            <Text style={styles.examDaysNum}>{daysUntil(nextExam.due_at)}</Text>
            <Text style={styles.examDaysLbl}>хоног</Text>
          </View>
        </Card>
      ) : null}

      <SectionHeader title="Хурдан үйлдэл" />
      <View style={styles.row}>
        {quickActions.map((a) => (
          <Pressable key={a.label} style={styles.quick} onPress={() => router.push(a.href as never)}>
            <View style={[styles.quickIcon, { backgroundColor: a.color + '1A' }]}>
              <Ionicons name={a.icon} size={22} color={a.color} />
            </View>
            <Text style={styles.quickLabel}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader title={`Өнөөдрийн даалгавар (${todayTasks.length})`} action="Бүгд" onAction={() => router.push('/planner')} />
      {todayTasks.length === 0 ? (
        <Card>
          <EmptyState icon="sunny-outline" title="Өнөөдөр даалгавар алга" message="Шинэ даалгавар нэмж өдрөө төлөвлөөрэй." />
        </Card>
      ) : (
        todayTasks.map((t) => (
          <TaskItem
            key={t.id}
            task={t}
            subject={t.subject_id ? subjectById[t.subject_id] : undefined}
            onToggle={() => toggleTask(t.id)}
            onPress={() => router.push(`/task/${t.id}`)}
          />
        ))
      )}

      <SectionHeader title="Ойртож буй хугацаа" />
      {upcoming.length === 0 ? (
        <Text style={styles.muted}>Ирэх 7 хоногт хугацаатай ажил алга.</Text>
      ) : (
        upcoming.map((t) => (
          <TaskItem
            key={t.id}
            task={t}
            subject={t.subject_id ? subjectById[t.subject_id] : undefined}
            onToggle={() => toggleTask(t.id)}
            onPress={() => router.push(`/task/${t.id}`)}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  hello: { fontSize: 15, color: colors.textMuted },
  name: { fontSize: 26, fontWeight: '800', color: colors.text },
  date: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 20, fontWeight: '800' },
  row: { flexDirection: 'row', gap: spacing.sm },
  goalHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  goalTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  goalValue: { fontSize: 14, fontWeight: '700', color: colors.primary },
  goalHint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  exam: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  examLabel: { color: '#C7D2FE', fontSize: 12, fontWeight: '600' },
  examTitle: { color: colors.white, fontSize: 16, fontWeight: '700' },
  examDays: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.md, padding: spacing.sm, minWidth: 56 },
  examDaysNum: { color: colors.white, fontSize: 20, fontWeight: '800' },
  examDaysLbl: { color: '#E0E7FF', fontSize: 11 },
  quick: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    gap: 6,
  },
  quickIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 12, fontWeight: '600', color: colors.text },
  muted: { color: colors.textMuted, fontSize: 14 },
});
