import { useKeepAwake } from 'expo-keep-awake';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, Vibration, View } from 'react-native';

import { Button, Card, Chip, FieldLabel, ProgressBar } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';
import { todayMinutes } from '@/utils/stats';

type Phase = 'focus' | 'break';

/** Бонус функц: Pomodoro төвлөрөх таймер → study_sessions-д бүртгэнэ → Ахиц, streak шинэчлэгдэнэ */
export default function PomodoroScreen() {
  useKeepAwake(); // таймер ажиллах үед дэлгэц унтрахгүй
  const { subjects, settings, studySessions, addStudySession } = useAppStore();

  const [subjectId, setSubjectId] = useState<string | null>(subjects[0]?.id ?? null);
  const [phase, setPhase] = useState<Phase>('focus');
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(settings.focusMinutes * 60);
  const [completed, setCompleted] = useState(0);
  const endAt = useRef<number | null>(null);

  const total = (phase === 'focus' ? settings.focusMinutes : settings.breakMinutes) * 60;

  // Таймер: эцсийн цагийг хадгалж тооцдог тул апп background-д орсон ч зөв ажиллана
  useEffect(() => {
    if (!running) return;
    endAt.current = Date.now() + left * 1000;
    const iv = setInterval(() => {
      const remain = Math.max(0, Math.round(((endAt.current ?? 0) - Date.now()) / 1000));
      setLeft(remain);
      if (remain === 0) {
        clearInterval(iv);
        finishPhase();
      }
    }, 250);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const finishPhase = () => {
    setRunning(false);
    Vibration.vibrate([0, 400, 200, 400]);
    if (phase === 'focus') {
      addStudySession(subjectId, settings.focusMinutes);
      setCompleted((c) => c + 1);
      setPhase('break');
      setLeft(settings.breakMinutes * 60);
      Alert.alert('🎉 Сайн ажиллалаа!', `${settings.focusMinutes} минут бүртгэгдлээ. ${settings.breakMinutes} минут амраарай.`);
    } else {
      setPhase('focus');
      setLeft(settings.focusMinutes * 60);
      Alert.alert('⏰ Амралт дууслаа', 'Дараагийн төвлөрөлтөө эхлүүлэх үү?');
    }
  };

  const reset = () => {
    setRunning(false);
    setLeft(total);
  };

  const skip = () => {
    setRunning(false);
    const nextPhase: Phase = phase === 'focus' ? 'break' : 'focus';
    setPhase(nextPhase);
    setLeft((nextPhase === 'focus' ? settings.focusMinutes : settings.breakMinutes) * 60);
  };

  /** Хэсэгчлэн хийсэн хугацааг (≥1 мин) хадгалах */
  const savePartial = () => {
    const mins = Math.floor((total - left) / 60);
    if (phase !== 'focus' || mins < 1) return;
    addStudySession(subjectId, mins);
    Alert.alert('Хадгаллаа', `${mins} минут бүртгэгдлээ.`);
    reset();
  };

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const pct = ((total - left) / total) * 100;
  const accent = phase === 'focus' ? '#EF4444' : colors.success;
  const today = todayMinutes(studySessions);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card style={[styles.timer, { borderColor: accent }]}>
        <Text style={[styles.phase, { color: accent }]}>{phase === 'focus' ? '🎯 Төвлөрөл' : '☕ Амралт'}</Text>
        <Text style={styles.time}>
          {mm}:{ss}
        </Text>
        <ProgressBar value={pct} color={accent} height={10} />
        <Text style={styles.meta}>
          Энэ удаад {completed} pomodoro · Өнөөдөр нийт {today} мин
        </Text>
      </Card>

      <View style={styles.row}>
        <Button
          title={running ? 'Түр зогсоох' : 'Эхлүүлэх'}
          icon={running ? 'pause' : 'play'}
          onPress={() => setRunning(!running)}
          style={{ flex: 2, backgroundColor: accent, borderColor: accent }}
        />
        <Button title="Шинэчлэх" icon="refresh" variant="ghost" onPress={reset} style={{ flex: 1 }} />
      </View>
      <View style={[styles.row, { marginTop: spacing.sm }]}>
        <Button title="Алгасах" icon="play-skip-forward" variant="secondary" onPress={skip} style={{ flex: 1 }} />
        <Button
          title="Хадгалах"
          icon="save"
          variant="secondary"
          onPress={savePartial}
          disabled={phase !== 'focus' || total - left < 60}
          style={{ flex: 1 }}
        />
      </View>

      <FieldLabel>Аль хичээлд суралцах вэ?</FieldLabel>
      <View style={styles.wrap}>
        <Chip label="Ерөнхий" active={subjectId === null} onPress={() => setSubjectId(null)} color={colors.text} />
        {subjects.map((s) => (
          <Chip key={s.id} label={s.name} color={s.color} active={subjectId === s.id} onPress={() => setSubjectId(s.id)} />
        ))}
      </View>

      <Text style={styles.tip}>
        Зөвлөгөө: {settings.focusMinutes} минут төвлөрч, {settings.breakMinutes} минут амар. Хугацааг Профайл → Тохиргооноос өөрчилнө.
        Дууссан session бүр "Ахиц" дэлгэцийн график, streak-д автоматаар орно.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 48 },
  timer: { alignItems: 'center', paddingVertical: spacing.xl, borderWidth: 2, gap: spacing.md },
  phase: { fontSize: 18, fontWeight: '800' },
  time: { fontSize: 72, fontWeight: '900', color: colors.text, fontVariant: ['tabular-nums'] },
  meta: { fontSize: 13, color: colors.textMuted },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tip: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xl, lineHeight: 19 },
});
