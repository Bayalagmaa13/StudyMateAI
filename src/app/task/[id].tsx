import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Chip, FieldLabel } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { colors, priorityMeta, radius, spacing } from '@/theme';
import type { Priority } from '@/types';
import { addDays, formatDate, formatDue, startOfDay } from '@/utils/date';

const timeOptions = ['09:00', '12:00', '18:00', '23:59'];

function defaultDue() {
  const d = startOfDay();
  d.setHours(23, 59, 0, 0);
  return d;
}

export default function TaskFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, subjects, addTask, updateTask, deleteTask, toggleTask } = useAppStore();
  const existing = id !== 'new' ? tasks.find((t) => t.id === id) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [subjectId, setSubjectId] = useState<string | null>(existing?.subject_id ?? subjects[0]?.id ?? null);
  const [priority, setPriority] = useState<Priority>(existing?.priority ?? 'medium');
  const [due, setDue] = useState<Date>(existing ? new Date(existing.due_at) : defaultDue());
  const [error, setError] = useState<string | null>(null);

  const setDay = (offset: number) => {
    const d = addDays(startOfDay(), offset);
    d.setHours(due.getHours(), due.getMinutes(), 0, 0);
    setDue(d);
  };
  const shiftDay = (n: number) => setDue(addDays(due, n));
  const setTime = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date(due);
    d.setHours(h, m, 0, 0);
    setDue(d);
  };
  const currentTime = `${String(due.getHours()).padStart(2, '0')}:${String(due.getMinutes()).padStart(2, '0')}`;

  const save = () => {
    // Validation
    if (title.trim().length < 3) return setError('Гарчиг хамгийн багадаа 3 тэмдэгт байна.');
    if (!existing && due.getTime() < Date.now()) return setError('Шинэ даалгаврын хугацаа өнгөрсөн байж болохгүй.');
    const payload = {
      title: title.trim(),
      description: description.trim(),
      subject_id: subjectId,
      priority,
      due_at: due.toISOString(),
    };
    if (existing) updateTask(existing.id, payload);
    else addTask(payload);
    router.back();
  };

  const remove = () =>
    existing &&
    Alert.alert('Устгах', 'Энэ даалгаврыг устгах уу?', [
      { text: 'Болих', style: 'cancel' },
      {
        text: 'Устгах',
        style: 'destructive',
        onPress: () => {
          deleteTask(existing.id);
          router.back();
        },
      },
    ]);

  if (id !== 'new' && !existing) {
    return (
      <View style={styles.center}>
        <Text>Даалгавар олдсонгүй.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: existing ? 'Даалгавар засах' : 'Шинэ даалгавар' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FieldLabel>Гарчиг *</FieldLabel>
        <TextInput
          value={title}
          onChangeText={(v) => {
            setTitle(v);
            setError(null);
          }}
          placeholder="Жишээ: SQL лабораторийн ажил"
          style={[styles.input, error && title.trim().length < 3 ? styles.inputError : null]}
          placeholderTextColor={colors.textMuted}
        />

        <FieldLabel>Тайлбар</FieldLabel>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Нэмэлт тэмдэглэл..."
          multiline
          style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
          placeholderTextColor={colors.textMuted}
        />

        <FieldLabel>Хичээл</FieldLabel>
        <View style={styles.wrap}>
          <Chip label="Хичээлгүй" active={subjectId === null} onPress={() => setSubjectId(null)} color={colors.text} />
          {subjects.map((s) => (
            <Chip key={s.id} label={s.name} color={s.color} active={subjectId === s.id} onPress={() => setSubjectId(s.id)} />
          ))}
        </View>

        <FieldLabel>Ач холбогдол</FieldLabel>
        <View style={styles.wrap}>
          {(Object.keys(priorityMeta) as Priority[]).map((p) => (
            <Chip key={p} label={priorityMeta[p].label} color={priorityMeta[p].color} active={priority === p} onPress={() => setPriority(p)} />
          ))}
        </View>

        <FieldLabel>Хугацаа</FieldLabel>
        <View style={styles.dueBox}>
          <Pressable onPress={() => shiftDay(-1)} hitSlop={10} style={styles.stepBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </Pressable>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={styles.dueDate}>{formatDate(due.toISOString())}</Text>
            <Text style={styles.dueRel}>{formatDue(due.toISOString())}</Text>
          </View>
          <Pressable onPress={() => shiftDay(1)} hitSlop={10} style={styles.stepBtn}>
            <Ionicons name="chevron-forward" size={22} color={colors.primary} />
          </Pressable>
        </View>
        <View style={[styles.wrap, { marginTop: spacing.sm }]}>
          <Chip label="Өнөөдөр" onPress={() => setDay(0)} />
          <Chip label="Маргааш" onPress={() => setDay(1)} />
          <Chip label="3 хоног" onPress={() => setDay(3)} />
          <Chip label="1 долоо хоног" onPress={() => setDay(7)} />
        </View>
        <View style={[styles.wrap, { marginTop: spacing.sm }]}>
          {timeOptions.map((t) => (
            <Chip key={t} label={t} active={currentTime === t} onPress={() => setTime(t)} />
          ))}
        </View>

        {error ? (
          <View style={styles.error}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Button title={existing ? 'Хадгалах' : 'Нэмэх'} icon="checkmark" onPress={save} style={{ marginTop: spacing.xl }} />
        {existing ? (
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
            <Button
              title={existing.is_completed ? 'Дуусаагүй болгох' : 'Дууссан болгох'}
              variant="secondary"
              icon="checkmark-done"
              onPress={() => {
                toggleTask(existing.id);
                router.back();
              }}
              style={{ flex: 1 }}
            />
            <Button title="Устгах" variant="danger" icon="trash" onPress={remove} style={{ flex: 1 }} />
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  inputError: { borderColor: colors.danger },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  dueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  stepBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  dueDate: { fontSize: 18, fontWeight: '800', color: colors.text },
  dueRel: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  error: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.lg,
  },
  errorText: { color: colors.danger, fontWeight: '600', flex: 1 },
});
