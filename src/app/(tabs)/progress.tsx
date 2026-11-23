import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Card, ProgressBar, SectionHeader, StatCard } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';
import { dayKey, formatDate, weekdayShort } from '@/utils/date';
import { averageQuizPercent, completionRate, computeStreak, lastNDays } from '@/utils/stats';

export default function ProgressScreen() {
  const { profile, tasks, subjects, quizAttempts, studySessions, settings } = useAppStore();

  const done = tasks.filter((t) => t.is_completed).length;
  const rate = completionRate(tasks);
  const avgQuiz = averageQuizPercent(quizAttempts);
  const streak = computeStreak(studySessions, quizAttempts);
  const week = lastNDays(studySessions, 7);
  const weekTotal = week.reduce((a, d) => a + d.minutes, 0);
  const maxDay = Math.max(settings.dailyGoalMinutes, ...week.map((d) => d.minutes));
  const heat = lastNDays(studySessions, 28);
  const heatRows = [0, 1, 2, 3].map((r) => heat.slice(r * 7, r * 7 + 7));
  const activeDays = heat.filter((d) => d.minutes > 0).length;
  const [picked, setPicked] = useState<{ date: Date; minutes: number } | null>(null);
  const todayKey = dayKey(new Date());

  const perSubject = useMemo(
    () =>
      subjects.map((s) => {
        const own = tasks.filter((t) => t.subject_id === s.id);
        const minutes = studySessions.filter((x) => x.subject_id === s.id).reduce((a, x) => a + x.duration_minutes, 0);
        return { s, total: own.length, done: own.filter((t) => t.is_completed).length, minutes };
      }),
    [subjects, tasks, studySessions],
  );

  const heatColor = (m: number) =>
    m === 0 ? colors.border : m < 30 ? '#C7D2FE' : m < 60 ? '#818CF8' : colors.primary;

  return (
    <Screen title="Ахиц ба профайл">
      {/* Профайл (FR-07) */}
      <Pressable onPress={() => router.push('/profile')}>
        <Card style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.full_name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile.full_name}</Text>
            <Text style={styles.email}>{profile.email}</Text>
          </View>
          <Ionicons name="settings-outline" size={22} color={colors.textMuted} />
        </Card>
      </Pressable>

      {/* Статистик (FR-06) */}
      <View style={[styles.row, { marginTop: spacing.md }]}>
        <StatCard icon="checkmark-done" label="Дууссан даалгавар" value={`${done}/${tasks.length}`} color={colors.success} />
        <StatCard icon="trophy" label="Quiz дундаж" value={`${avgQuiz}%`} color="#F59E0B" />
      </View>
      <View style={[styles.row, { marginTop: spacing.sm }]}>
        <StatCard icon="flame" label="Streak" value={`${streak} өдөр`} color="#F97316" />
        <StatCard icon="time" label="7 хоногт" value={`${weekTotal} мин`} color={colors.primary} />
      </View>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.cardTitle}>Даалгаврын гүйцэтгэл</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <ProgressBar value={rate} color={colors.success} height={12} />
          </View>
          <Text style={styles.rate}>{rate}%</Text>
        </View>
      </Card>

      <SectionHeader title="Сүүлийн 7 хоногийн суралцалт" />
      <Card>
        <View style={styles.chart}>
          {week.map((d) => {
            const h = Math.max(4, (d.minutes / maxDay) * 120);
            const isToday = dayKey(d.date) === todayKey;
            return (
              <View key={dayKey(d.date)} style={styles.barCol}>
                <Text style={styles.barValue}>{d.minutes || ''}</Text>
                <View
                  style={[
                    styles.bar,
                    { height: h, backgroundColor: d.minutes >= settings.dailyGoalMinutes ? colors.success : isToday ? colors.primary : '#A5B4FC' },
                  ]}
                />
                <Text style={[styles.barLabel, isToday && { color: colors.primary, fontWeight: '800' }]}>
                  {weekdayShort[d.date.getDay()]}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.legend}>Ногоон = өдрийн зорилго ({settings.dailyGoalMinutes} мин) биелсэн</Text>
      </Card>

      <SectionHeader title="Идэвхийн календарь (28 хоног)" />
      <Card>
        <Text style={styles.heatInfo}>
          {picked
            ? `${formatDate(picked.date.toISOString())} (${weekdayShort[picked.date.getDay()]}): ${picked.minutes} мин суралцсан`
            : `28 хоногийн ${activeDays} өдөр идэвхтэй байлаа. Нүдэн дээр дарж дэлгэрэнгүйг харна уу.`}
        </Text>
        {/* 4 мөр × 7 нүд — нүд бүр flex:1 тул Android дээр хэмжээ нь найдвартай тооцогдоно */}
        {heatRows.map((row, ri) => (
          <View key={ri} style={styles.heatRow}>
            {row.map((d) => {
              const k = dayKey(d.date);
              const sel = picked && dayKey(picked.date) === k;
              return (
                <Pressable
                  key={k}
                  onPress={() => setPicked(sel ? null : d)}
                  style={[
                    styles.cell,
                    { backgroundColor: heatColor(d.minutes) },
                    k === todayKey && styles.cellToday,
                    sel && styles.cellSelected,
                  ]}
                >
                  <Text style={[styles.cellText, d.minutes >= 30 && { color: colors.white }]}>{d.date.getDate()}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
        <View style={styles.heatLegend}>
          <Text style={styles.legend}>Бага</Text>
          {[0, 20, 45, 90].map((m) => (
            <View key={m} style={[styles.cellSm, { backgroundColor: heatColor(m) }]} />
          ))}
          <Text style={styles.legend}>Их</Text>
        </View>
      </Card>

      <SectionHeader title="Хичээл тус бүрээр" />
      {perSubject.map(({ s, total, done: d, minutes }) => (
        <Card key={s.id} style={{ marginBottom: spacing.sm, gap: 6 }}>
          <View style={styles.subjHead}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <Text style={styles.subjName}>{s.name}</Text>
            <Text style={styles.subjMeta}>{minutes} мин</Text>
          </View>
          <ProgressBar value={total ? (d / total) * 100 : 0} color={s.color} />
          <Text style={styles.subjMeta}>
            {d}/{total} даалгавар дууссан
          </Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 22, fontWeight: '800' },
  name: { fontSize: 17, fontWeight: '800', color: colors.text },
  email: { fontSize: 13, color: colors.textMuted },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  rate: { fontSize: 18, fontWeight: '800', color: colors.success },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 160 },
  barCol: { alignItems: 'center', flex: 1, gap: 4 },
  bar: { width: 22, borderRadius: radius.sm },
  barValue: { fontSize: 10, color: colors.textMuted, fontWeight: '700' },
  barLabel: { fontSize: 12, color: colors.textMuted },
  legend: { fontSize: 11, color: colors.textMuted, marginTop: spacing.sm },
  heatInfo: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.md },
  heatRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  cell: { flex: 1, height: 38, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  cellToday: { borderWidth: 2, borderColor: colors.text },
  cellSelected: { borderWidth: 2, borderColor: '#F97316' },
  cellText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  heatLegend: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  cellSm: { width: 12, height: 12, borderRadius: 3, marginTop: spacing.sm },
  subjHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 12, height: 12, borderRadius: 6 },
  subjName: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  subjMeta: { fontSize: 12, color: colors.textMuted },
});
