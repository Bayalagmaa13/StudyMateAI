import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { TaskItem } from '@/components/TaskItem';
import { Card, Chip, EmptyState, FAB, ProgressBar } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';
import type { Task } from '@/types';
import { isOverdue, isToday } from '@/utils/date';

type Segment = 'tasks' | 'subjects';
type Filter = 'all' | 'today' | 'active' | 'done' | 'overdue';

const filters: { key: Filter; label: string; test: (t: Task) => boolean }[] = [
  { key: 'all', label: 'Бүгд', test: () => true },
  { key: 'today', label: 'Өнөөдөр', test: (t) => isToday(t.due_at) },
  { key: 'active', label: 'Хийгдээгүй', test: (t) => !t.is_completed },
  { key: 'done', label: 'Дууссан', test: (t) => t.is_completed },
  { key: 'overdue', label: 'Хоцорсон', test: (t) => !t.is_completed && isOverdue(t.due_at) },
];

export default function PlannerScreen() {
  const { tasks, subjects, toggleTask, deleteTask, deleteSubject } = useAppStore();
  const [segment, setSegment] = useState<Segment>('tasks');
  const [filter, setFilter] = useState<Filter>('all');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);

  const subjectById = useMemo(() => Object.fromEntries(subjects.map((s) => [s.id, s])), [subjects]);

  const visible = useMemo(() => {
    const f = filters.find((x) => x.key === filter)!;
    return tasks
      .filter(f.test)
      .filter((t) => !subjectFilter || t.subject_id === subjectFilter)
      .sort((a, b) => Number(a.is_completed) - Number(b.is_completed) || a.due_at.localeCompare(b.due_at));
  }, [tasks, filter, subjectFilter]);

  const confirmDeleteSubject = (id: string, name: string) =>
    Alert.alert('Хичээл устгах', `"${name}" хичээлийг устгах уу? Холбоотой даалгаврууд хичээлгүй болж үлдэнэ.`, [
      { text: 'Болих', style: 'cancel' },
      { text: 'Устгах', style: 'destructive', onPress: () => deleteSubject(id) },
    ]);

  return (
    <Screen
      title="Төлөвлөгч"
      subtitle={`${tasks.filter((t) => !t.is_completed).length} хийгдээгүй · ${subjects.length} хичээл`}
      overlay={<FAB onPress={() => router.push(segment === 'tasks' ? '/task/new' : '/subject/new')} />}
    >
      <View style={styles.segment}>
        {(['tasks', 'subjects'] as Segment[]).map((s) => (
          <Pressable key={s} onPress={() => setSegment(s)} style={[styles.segBtn, segment === s && styles.segActive]}>
            <Text style={[styles.segText, segment === s && styles.segTextActive]}>
              {s === 'tasks' ? 'Даалгавар' : 'Хичээл'}
            </Text>
          </Pressable>
        ))}
      </View>

      {segment === 'tasks' ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {filters.map((f) => (
              <Chip key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chips, { marginBottom: spacing.md }]}>
            <Chip label="Бүх хичээл" active={!subjectFilter} onPress={() => setSubjectFilter(null)} color={colors.text} />
            {subjects.map((s) => (
              <Chip
                key={s.id}
                label={s.name}
                color={s.color}
                active={subjectFilter === s.id}
                onPress={() => setSubjectFilter(subjectFilter === s.id ? null : s.id)}
              />
            ))}
          </ScrollView>

          {visible.length === 0 ? (
            <Card>
              <EmptyState
                icon="clipboard-outline"
                title="Даалгавар олдсонгүй"
                message="Шүүлтүүрээ өөрчлөх эсвэл шинэ даалгавар нэмээрэй."
                actionLabel="Даалгавар нэмэх"
                onAction={() => router.push('/task/new')}
              />
            </Card>
          ) : (
            visible.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                subject={t.subject_id ? subjectById[t.subject_id] : undefined}
                onToggle={() => toggleTask(t.id)}
                onPress={() => router.push(`/task/${t.id}`)}
                onDelete={() => deleteTask(t.id)}
              />
            ))
          )}
          {visible.length > 0 ? <Text style={styles.hint}>Даралтаар засна · ✓ дарж дуусгана · 🗑 устгана</Text> : null}
        </>
      ) : subjects.length === 0 ? (
        <Card>
          <EmptyState
            icon="book-outline"
            title="Хичээл бүртгээгүй байна"
            actionLabel="Хичээл нэмэх"
            onAction={() => router.push('/subject/new')}
          />
        </Card>
      ) : (
        subjects.map((s) => {
          const own = tasks.filter((t) => t.subject_id === s.id);
          const done = own.filter((t) => t.is_completed).length;
          const pct = own.length ? Math.round((done / own.length) * 100) : 0;
          return (
            <Pressable key={s.id} onPress={() => router.push(`/subject/${s.id}`)}>
              <Card style={styles.subject}>
                <View style={[styles.dot, { backgroundColor: s.color }]}>
                  <Ionicons name="book" size={18} color={colors.white} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.subjectName}>{s.name}</Text>
                  <Text style={styles.subjectMeta}>
                    {s.instructor || 'Багш тодорхойгүй'} · {done}/{own.length} даалгавар
                  </Text>
                  <ProgressBar value={pct} color={s.color} height={6} />
                </View>
                <Pressable onPress={() => confirmDeleteSubject(s.id, s.name)} hitSlop={10}>
                  <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
                </Pressable>
              </Card>
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center' },
  segActive: { backgroundColor: colors.card },
  segText: { fontWeight: '600', color: colors.textMuted },
  segTextActive: { color: colors.text },
  chips: { gap: spacing.sm, paddingBottom: spacing.sm },
  hint: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  subject: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  dot: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  subjectName: { fontSize: 16, fontWeight: '700', color: colors.text },
  subjectMeta: { fontSize: 12, color: colors.textMuted },
});
