import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, ProgressBar } from '@/components/ui';
import { findQuestion, findQuiz } from '@/data/quizzes';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';
import type { QuizQuestion } from '@/types';

const MISTAKES_ID = 'mistakes';
const letters = ['A', 'B', 'C', 'D', 'E'];

export default function QuizRunScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mistakes, recordQuizAttempt, addMistakes, removeMistakes } = useAppStore();

  // Quiz-ийг эхлэх үед нэг удаа тогтооно (дунд нь mistakes өөрчлөгдөхөд асуулт солигдохгүй)
  const initialMistakes = useRef(mistakes).current;
  const { title, questions, quizIdOf } = useMemo(() => {
    if (id === MISTAKES_ID) {
      const items = initialMistakes
        .map((m) => findQuestion(m.questionId))
        .filter((x): x is NonNullable<typeof x> => Boolean(x));
      return {
        title: 'Алдааны давтлага',
        questions: items.map((x) => x.question),
        quizIdOf: Object.fromEntries(items.map((x) => [x.question.id, x.quiz.id])) as Record<string, string>,
      };
    }
    const quiz = findQuiz(id);
    return {
      title: quiz?.title ?? '',
      questions: quiz?.questions ?? ([] as QuizQuestion[]),
      quizIdOf: Object.fromEntries((quiz?.questions ?? []).map((q) => [q.id, quiz!.id])) as Record<string, string>,
    };
  }, [id, initialMistakes]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);

  if (questions.length === 0) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Quiz' }} />
        <Text style={{ color: colors.textMuted }}>Асуулт олдсонгүй.</Text>
        <Button title="Буцах" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  const q = questions[index];
  const isLast = index === questions.length - 1;
  const isCorrect = selected === q.correctIndex;

  const check = () => {
    if (selected === null) return;
    setRevealed(true);
  };

  const next = () => {
    const all = [...answers, selected as number];
    if (!isLast) {
      setAnswers(all);
      setIndex(index + 1);
      setSelected(null);
      setRevealed(false);
      return;
    }
    // Оноо тооцох
    const score = all.filter((a, i) => a === questions[i].correctIndex).length;
    const wrongIds = questions.filter((qq, i) => all[i] !== qq.correctIndex).map((qq) => qq.id);
    const rightIds = questions.filter((qq, i) => all[i] === qq.correctIndex).map((qq) => qq.id);

    recordQuizAttempt({ quiz_title: title, score, total_questions: questions.length });
    if (id === MISTAKES_ID) {
      removeMistakes(rightIds); // зөв хариулсан бол давтлагаас хасна
    } else {
      wrongIds.forEach((qid) => addMistakes(quizIdOf[qid], [qid]));
    }

    router.replace({
      pathname: '/quiz/result',
      params: {
        title,
        score: String(score),
        total: String(questions.length),
        quizId: id,
        questionIds: questions.map((qq) => qq.id).join(','),
        answers: all.join(','),
      },
    });
  };

  const optionStyle = (i: number) => {
    if (!revealed) return selected === i ? styles.optSelected : null;
    if (i === q.correctIndex) return styles.optCorrect;
    if (i === selected) return styles.optWrong;
    return styles.optDim;
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressRow}>
          <Text style={styles.counter}>
            Асуулт {index + 1}/{questions.length}
          </Text>
          <Text style={styles.counter}>{Math.round(((index + (revealed ? 1 : 0)) / questions.length) * 100)}%</Text>
        </View>
        <ProgressBar value={((index + (revealed ? 1 : 0)) / questions.length) * 100} />

        <Text style={styles.question}>{q.question}</Text>

        {q.options.map((opt, i) => (
          <Pressable key={i} disabled={revealed} onPress={() => setSelected(i)} style={[styles.option, optionStyle(i)]}>
            <View style={[styles.letter, selected === i && !revealed && { backgroundColor: colors.primary }]}>
              <Text style={[styles.letterText, selected === i && !revealed && { color: colors.white }]}>{letters[i]}</Text>
            </View>
            <Text style={styles.optText}>{opt}</Text>
            {revealed && i === q.correctIndex ? <Ionicons name="checkmark-circle" size={22} color={colors.success} /> : null}
            {revealed && i === selected && i !== q.correctIndex ? <Ionicons name="close-circle" size={22} color={colors.danger} /> : null}
          </Pressable>
        ))}

        {revealed ? (
          <View style={[styles.feedback, { backgroundColor: isCorrect ? colors.successSoft : colors.dangerSoft }]}>
            <Text style={[styles.feedbackTitle, { color: isCorrect ? '#047857' : colors.danger }]}>
              {isCorrect ? '✅ Зөв!' : '❌ Буруу'}
            </Text>
            <Text style={styles.feedbackText}>{q.explanation}</Text>
          </View>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        {revealed ? (
          <Button title={isLast ? 'Дуусгах' : 'Дараагийн асуулт'} icon={isLast ? 'flag' : 'arrow-forward'} onPress={next} />
        ) : (
          <Button title="Шалгах" icon="checkmark" onPress={check} disabled={selected === null} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  counter: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  question: { fontSize: 20, fontWeight: '800', color: colors.text, marginVertical: spacing.xl, lineHeight: 28 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 56,
  },
  optSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optCorrect: { borderColor: colors.success, backgroundColor: colors.successSoft },
  optWrong: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  optDim: { opacity: 0.55 },
  letter: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  letterText: { fontWeight: '800', color: colors.textMuted },
  optText: { flex: 1, fontSize: 15, color: colors.text },
  feedback: { borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, gap: 4 },
  feedbackTitle: { fontSize: 16, fontWeight: '800' },
  feedbackText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
});
