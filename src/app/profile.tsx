import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Card, FieldLabel } from '@/components/ui';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';

function Stepper({ label, value, step, min, max, unit, onChange }: {
  label: string; value: number; step: number; min: number; max: number; unit: string; onChange: (v: number) => void;
}) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepLabel}>{label}</Text>
      <Pressable onPress={() => onChange(Math.max(min, value - step))} style={styles.stepBtn} hitSlop={6}>
        <Ionicons name="remove" size={18} color={colors.primary} />
      </Pressable>
      <Text style={styles.stepValue}>
        {value} {unit}
      </Text>
      <Pressable onPress={() => onChange(Math.min(max, value + step))} style={styles.stepBtn} hitSlop={6}>
        <Ionicons name="add" size={18} color={colors.primary} />
      </Pressable>
    </View>
  );
}

export default function ProfileScreen() {
  const { profile, settings, updateProfile, updateSettings, resetDemoData } = useAppStore();
  const [name, setName] = useState(profile.full_name);
  const [email, setEmail] = useState(profile.email);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (name.trim().length < 2) return setError('Нэр хамгийн багадаа 2 тэмдэгт.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('И-мэйл хаяг буруу байна.');
    updateProfile({ full_name: name.trim(), email: email.trim() });
    setError(null);
    Alert.alert('Хадгаллаа', 'Профайл шинэчлэгдлээ.');
  };

  const reset = () =>
    Alert.alert('Demo өгөгдөл сэргээх', 'Бүх өгөгдөл анхны жишээ өгөгдлөөр солигдоно. Үргэлжлүүлэх үү?', [
      { text: 'Болих', style: 'cancel' },
      {
        text: 'Сэргээх',
        style: 'destructive',
        onPress: () => {
          resetDemoData();
          router.back();
        },
      },
    ]);

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.section}>Хэрэглэгчийн мэдээлэл</Text>
      <Card>
        <FieldLabel>Нэр</FieldLabel>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Таны нэр" placeholderTextColor={colors.textMuted} />
        <FieldLabel>И-мэйл</FieldLabel>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="name@example.com"
          placeholderTextColor={colors.textMuted}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Хадгалах" icon="checkmark" onPress={save} style={{ marginTop: spacing.lg }} />
      </Card>

      <Text style={styles.section}>Суралцах тохиргоо</Text>
      <Card style={{ gap: spacing.sm }}>
        <Stepper label="Төвлөрөх хугацаа" value={settings.focusMinutes} step={5} min={5} max={60} unit="мин" onChange={(v) => updateSettings({ focusMinutes: v })} />
        <Stepper label="Амралт" value={settings.breakMinutes} step={1} min={1} max={30} unit="мин" onChange={(v) => updateSettings({ breakMinutes: v })} />
        <Stepper label="Өдрийн зорилго" value={settings.dailyGoalMinutes} step={15} min={15} max={300} unit="мин" onChange={(v) => updateSettings({ dailyGoalMinutes: v })} />
      </Card>

      <Text style={styles.section}>Системийн төлөв</Text>
      <Card style={{ gap: spacing.md }}>
        <View style={styles.statusRow}>
          <Ionicons name="server-outline" size={20} color={colors.textMuted} />
          <Text style={styles.statusText}>Supabase</Text>
          <Text style={[styles.badge, isSupabaseConfigured ? styles.badgeOn : styles.badgeOff]}>
            {isSupabaseConfigured ? 'Тохируулсан' : 'Mock горим'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Ionicons name="sparkles-outline" size={20} color={colors.textMuted} />
          <Text style={styles.statusText}>AI туслах</Text>
          <Text style={[styles.badge, styles.badgeOff]}>Mock хариулт</Text>
        </View>
        <View style={styles.statusRow}>
          <Ionicons name="phone-portrait-outline" size={20} color={colors.textMuted} />
          <Text style={styles.statusText}>Өгөгдөл төхөөрөмж дээр (AsyncStorage) хадгалагдана</Text>
        </View>
      </Card>

      <Button title="Demo өгөгдөл сэргээх" icon="refresh" variant="danger" onPress={reset} style={{ marginTop: spacing.xl }} />
      <Text style={styles.version}>StudyMate AI · v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 48 },
  section: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  error: { color: colors.danger, fontWeight: '600', marginTop: spacing.md },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepLabel: { flex: 1, fontSize: 15, color: colors.text },
  stepBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 64, textAlign: 'center', fontWeight: '700', color: colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusText: { flex: 1, fontSize: 14, color: colors.text },
  badge: { fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, overflow: 'hidden' },
  badgeOn: { backgroundColor: colors.successSoft, color: '#047857' },
  badgeOff: { backgroundColor: colors.warningSoft, color: '#B45309' },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: spacing.lg },
});
