import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, SectionHeader } from '@/components/ui';
import { findQuestion } from '@/data/quizzes';
import { colors, radius, spacing } from '@/theme';

export default function QuizResultScreen() {
  const p = useLocalSearchParams<{ title: string; score: string; total: string; quizId: string; questionIds: string; answers: string }>();
  const score = Number(p.score ?? 0);
  const total = Number(p.total ?? 0);
  const pct = total ? Math.round((score / total) * 100) : 0;
  const ids = (p.questionIds ?? '').split(',').filter(Boolean);
  const answers = (p.answers ?? '').split(',').map(Number);

  const verdict =
    pct === 100
      ? { emoji: '🏆', text: 'Төгс! Бүгдийг зөв хариуллаа.', color: colors.success }
      : pct >= 80
        ? { emoji: '🎉', text: 'Маш сайн!', color: colors.success }
        : pct >= 50
          ? { emoji: '👍', text: 'Сайн байна, бага зэрэг давтаарай.', color: colors.warning }
          : { emoji: '📚', text: 'Дахин давтах хэрэгтэй.', color: colors.danger };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card style={styles.hero}>
        <Text style={styles.emoji}>{verdict.emoji}</Text>
        <Text style={styles.quizTitle}>{p.title}</Text>
        <View style={[styles.ring, { borderColor: verdict.color }]}>
          <Text style={[styles.pct, { color: verdict.color }]}>{pct}%</Text>
          <Text style={styles.scoreText}>
            {score}/{total} зөв
          </Text>
        </View>
        <Text style={styles.verdict}>{verdict.text}</Text>
        {score < total && p.quizId !== 'mistakes' ? (
          <Text style={styles.note}>Буруу хариулсан {total - score} асуулт "Алдааны давтлага"-д нэмэгдлээ.</Text>
        ) : null}
      </Card>

      <SectionHeader title="Хариултын тойм" />
      {ids.map((qid, i) => {
        const found = findQuestion(qid);
        if (!found) return null;
        const { question } = found;
        const ok = answers[i] === question.correctIndex;
        return (
          <Card key={qid} style={styles.review}>
            <View style={styles.reviewHead}>
              <Ionicons name={ok ? 'checkmark-circle' : 'close-circle'} size={20} color={ok ? colors.success : colors.danger} />
              <Text style={styles.reviewQ}>{question.question}</Text>
            </View>
            {!ok ? <Text style={styles.yours}>Таны хариулт: {question.options[answers[i]] ?? '—'}</Text> : null}
            <Text style={styles.correct}>Зөв хариулт: {question.options[question.correctIndex]}</Text>
          </Card>
        );
      })}

      <View style={styles.actions}>
        <Button title="Дахин өгөх" variant="secondary" icon="refresh" onPress={() => router.replace(`/quiz/${p.quizId}`)} style={{ flex: 1 }} />
        <Button title="Quiz жагсаалт" icon="list" onPress={() => router.back()} style={{ flex: 1 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 48 },
  hero: { alignItems: 'center', paddingVertical: spacing.xl },
  emoji: { fontSize: 44 },
  quizTitle: { fontSize: 16, fontWeight: '700', color: colors.textMuted, marginTop: spacing.sm },
  ring: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  pct: { fontSize: 36, fontWeight: '900' },
  scoreText: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  verdict: { fontSize: 17, fontWeight: '700', color: colors.text },
  note: { fontSize: 13, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  review: { marginBottom: spacing.sm, gap: 6 },
  reviewHead: { flexDirection: 'row', gap: spacing.sm },
  reviewQ: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text },
  yours: { fontSize: 13, color: colors.danger, marginLeft: 28 },
  correct: { fontSize: 13, color: '#047857', marginLeft: 28 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
});
