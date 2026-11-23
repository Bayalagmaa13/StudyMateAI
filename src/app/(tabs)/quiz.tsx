import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Card, SectionHeader } from '@/components/ui';
import { QUIZZES } from '@/data/quizzes';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';
import { formatDate } from '@/utils/date';

export default function QuizListScreen() {
  const { quizAttempts, mistakes } = useAppStore();
  const recent = [...quizAttempts].sort((a, b) => b.completed_at.localeCompare(a.completed_at)).slice(0, 5);

  const best = (title: string) => {
    const own = quizAttempts.filter((a) => a.quiz_title === title);
    if (!own.length) return null;
    return Math.max(...own.map((a) => Math.round((a.score / a.total_questions) * 100)));
  };

  return (
    <Screen title="Quiz" subtitle="Мэдлэгээ шалгаж, сул талаа давт">
      {/* Бонус: буруу хариулсан асуултуудаас автоматаар үүсдэг давтлага */}
      <Pressable
        disabled={mistakes.length === 0}
        onPress={() => router.push('/quiz/mistakes')}
        style={[styles.mistakes, mistakes.length === 0 && { opacity: 0.6 }]}
      >
        <Ionicons name="refresh-circle" size={34} color={colors.white} />
        <View style={{ flex: 1 }}>
          <Text style={styles.mistakesTitle}>Алдааны давтлага</Text>
          <Text style={styles.mistakesSub}>
            {mistakes.length > 0
              ? `${mistakes.length} асуулт давтах шаардлагатай`
              : 'Буруу хариулсан асуултууд энд цугларна'}
          </Text>
        </View>
        {mistakes.length > 0 ? <Ionicons name="chevron-forward" size={22} color={colors.white} /> : null}
      </Pressable>

      <SectionHeader title="Quiz сонгох" />
      {QUIZZES.map((q) => {
        const b = best(q.title);
        return (
          <Pressable key={q.id} onPress={() => router.push(`/quiz/${q.id}`)}>
            <Card style={styles.quiz}>
              <View style={styles.quizIcon}>
                <Ionicons name="help-circle" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.quizTitle}>{q.title}</Text>
                <Text style={styles.quizMeta}>
                  {q.subjectName} · {q.questions.length} асуулт
                </Text>
              </View>
              {b !== null ? (
                <View style={styles.best}>
                  <Text style={styles.bestText}>{b}%</Text>
                </View>
              ) : (
                <Text style={styles.newTag}>Шинэ</Text>
              )}
            </Card>
          </Pressable>
        );
      })}

      <SectionHeader title="Сүүлийн оролдлогууд" />
      {recent.length === 0 ? (
        <Text style={styles.muted}>Одоохондоо quiz өгөөгүй байна.</Text>
      ) : (
        <Card style={{ paddingVertical: spacing.sm }}>
          {recent.map((a, i) => {
            const pct = Math.round((a.score / a.total_questions) * 100);
            return (
              <View key={a.id} style={[styles.attempt, i > 0 && styles.divider]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.attemptTitle}>{a.quiz_title}</Text>
                  <Text style={styles.quizMeta}>{formatDate(a.completed_at)}</Text>
                </View>
                <Text style={[styles.attemptScore, { color: pct >= 80 ? colors.success : pct >= 50 ? colors.warning : colors.danger }]}>
                  {a.score}/{a.total_questions}
                </Text>
              </View>
            );
          })}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  mistakes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#F97316',
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  mistakesTitle: { color: colors.white, fontSize: 17, fontWeight: '800' },
  mistakesSub: { color: '#FFEDD5', fontSize: 13, marginTop: 2 },
  quiz: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  quizIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  quizTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  quizMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  best: { backgroundColor: colors.successSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  bestText: { color: colors.success, fontWeight: '800' },
  newTag: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  attempt: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  attemptTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  attemptScore: { fontSize: 16, fontWeight: '800' },
  muted: { color: colors.textMuted },
});
