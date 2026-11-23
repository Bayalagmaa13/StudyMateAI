import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, priorityMeta, radius, spacing } from '@/theme';
import type { Subject, Task } from '@/types';
import { formatDue, isOverdue } from '@/utils/date';

interface Props {
  task: Task;
  subject?: Subject;
  onToggle: () => void;
  onPress?: () => void;
  onDelete?: () => void;
}

export function TaskItem({ task, subject, onToggle, onPress, onDelete }: Props) {
  const overdue = !task.is_completed && isOverdue(task.due_at);
  const p = priorityMeta[task.priority];

  const confirmDelete = () =>
    Alert.alert('Даалгавар устгах', `"${task.title}" устгах уу?`, [
      { text: 'Болих', style: 'cancel' },
      { text: 'Устгах', style: 'destructive', onPress: onDelete },
    ]);

  return (
    <Pressable onPress={onPress} onLongPress={onDelete ? confirmDelete : undefined} style={styles.row}>
      <View style={[styles.bar, { backgroundColor: subject?.color ?? colors.border }]} />
      <Pressable onPress={onToggle} hitSlop={10} accessibilityRole="checkbox" accessibilityState={{ checked: task.is_completed }}>
        <Ionicons
          name={task.is_completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={26}
          color={task.is_completed ? colors.success : colors.textMuted}
        />
      </Pressable>
      <View style={styles.body}>
        <Text style={[styles.title, task.is_completed && styles.done]} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={styles.meta}>
          {subject ? (
            <Text style={styles.subject} numberOfLines={1}>
              {subject.name}
            </Text>
          ) : null}
          <Text numberOfLines={1} style={[styles.due, overdue && { color: colors.danger, fontWeight: '700' }]}>
            <Ionicons name="time-outline" size={12} /> {formatDue(task.due_at)}
          </Text>
        </View>
      </View>
      <View style={[styles.priority, { backgroundColor: p.bg }]}>
        <Text style={[styles.priorityText, { color: p.color }]}>{p.label}</Text>
      </View>
      {onDelete ? (
        <Pressable onPress={confirmDelete} hitSlop={10} style={{ marginLeft: 6 }}>
          <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  bar: { width: 4, alignSelf: 'stretch' },
  body: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  done: { textDecorationLine: 'line-through', color: colors.textMuted },
  meta: { flexDirection: 'row', gap: spacing.sm, marginTop: 3, alignItems: 'center' },
  subject: { fontSize: 12, color: colors.textMuted, flexShrink: 1 },
  due: { fontSize: 12, color: colors.textMuted, flexShrink: 0 },
  priority: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  priorityText: { fontSize: 11, fontWeight: '700' },
});
