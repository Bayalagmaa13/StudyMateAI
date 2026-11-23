import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, FieldLabel } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing, subjectColors } from '@/theme';

export default function SubjectFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { subjects, tasks, addSubject, updateSubject, deleteSubject } = useAppStore();
  const existing = id !== 'new' ? subjects.find((s) => s.id === id) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [instructor, setInstructor] = useState(existing?.instructor ?? '');
  const [color, setColor] = useState(existing?.color ?? subjectColors[subjects.length % subjectColors.length]);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const n = name.trim();
    if (n.length < 2) return setError('Хичээлийн нэр хамгийн багадаа 2 тэмдэгт.');
    const dup = subjects.some((s) => s.name.toLowerCase() === n.toLowerCase() && s.id !== existing?.id);
    if (dup) return setError('Ийм нэртэй хичээл аль хэдийн байна.');
    const payload = { name: n, instructor: instructor.trim(), color };
    if (existing) updateSubject(existing.id, payload);
    else addSubject(payload);
    router.back();
  };

  const remove = () =>
    existing &&
    Alert.alert('Хичээл устгах', 'Холбоотой даалгаврууд хичээлгүй болж үлдэнэ. Устгах уу?', [
      { text: 'Болих', style: 'cancel' },
      {
        text: 'Устгах',
        style: 'destructive',
        onPress: () => {
          deleteSubject(existing.id);
          router.back();
        },
      },
    ]);

  const taskCount = existing ? tasks.filter((t) => t.subject_id === existing.id).length : 0;

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: existing ? 'Хичээл засах' : 'Шинэ хичээл' }} />

      <View style={[styles.preview, { backgroundColor: color }]}>
        <Ionicons name="book" size={28} color={colors.white} />
        <Text style={styles.previewText} numberOfLines={1}>
          {name || 'Хичээлийн нэр'}
        </Text>
        {existing ? <Text style={styles.previewMeta}>{taskCount} даалгавар</Text> : null}
      </View>

      <FieldLabel>Хичээлийн нэр *</FieldLabel>
      <TextInput
        value={name}
        onChangeText={(v) => {
          setName(v);
          setError(null);
        }}
        placeholder="Жишээ: Мобайл програмчлал"
        style={styles.input}
        placeholderTextColor={colors.textMuted}
      />

      <FieldLabel>Багш</FieldLabel>
      <TextInput value={instructor} onChangeText={setInstructor} placeholder="Багшийн нэр" style={styles.input} placeholderTextColor={colors.textMuted} />

      <FieldLabel>Өнгө</FieldLabel>
      <View style={styles.colors}>
        {subjectColors.map((c) => (
          <Pressable key={c} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchActive]}>
            {color === c ? <Ionicons name="checkmark" size={18} color={colors.white} /> : null}
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title={existing ? 'Хадгалах' : 'Нэмэх'} icon="checkmark" onPress={save} style={{ marginTop: spacing.xl }} />
      {existing ? <Button title="Устгах" icon="trash" variant="danger" onPress={remove} style={{ marginTop: spacing.sm }} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 48 },
  preview: { borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', gap: 6 },
  previewText: { color: colors.white, fontSize: 18, fontWeight: '800' },
  previewMeta: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
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
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  swatch: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  swatchActive: { borderWidth: 3, borderColor: colors.text },
  error: { color: colors.danger, fontWeight: '600', marginTop: spacing.lg },
});
