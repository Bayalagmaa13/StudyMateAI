import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip, DemoBadge } from '@/components/ui';
import { aiService } from '@/services/ai';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';
import type { AssistantMode, ChatMessage } from '@/types';

const modes: { key: AssistantMode; label: string }[] = [
  { key: 'answer', label: '💬 Асуулт' },
  { key: 'summary', label: '📝 Хураангуй' },
  { key: 'explain', label: '💡 Тайлбар' },
  { key: 'review', label: '🔁 Давтлага' },
];

const suggestions = ['SQL JOIN гэж юу вэ?', 'React Native state тайлбарла', 'Usability test хэрхэн хийх вэ?', 'Decision tree хураангуй'];

export default function TutorScreen() {
  const { chat, addChatMessage, clearChat } = useAppStore();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<AssistantMode>('answer');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [chat.length, loading]);

  const send = async (text = input) => {
    const prompt = text.trim();
    if (!prompt || loading) return;
    setInput('');
    addChatMessage({ role: 'user', text: prompt, mode });
    setLoading(true);
    try {
      const res = await aiService.ask({ prompt, mode });
      addChatMessage({ role: 'assistant', text: res.text, mode, isMock: res.isMock });
    } catch {
      addChatMessage({ role: 'assistant', text: 'Уучлаарай, хариулт авахад алдаа гарлаа. Дахин оролдоно уу.', isMock: true });
    } finally {
      setLoading(false);
    }
  };

  const confirmClear = () =>
    Alert.alert('Чат цэвэрлэх', 'Бүх мессежийг устгах уу?', [
      { text: 'Болих', style: 'cancel' },
      { text: 'Цэвэрлэх', style: 'destructive', onPress: clearChat },
    ]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={styles.botIcon}>
            <Ionicons name="sparkles" size={20} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>AI Study Assistant</Text>
            <DemoBadge label="Туршилтын горим · бодит AI холбогдоогүй" />
          </View>
          {chat.length > 0 ? (
            <Pressable onPress={confirmClear} hitSlop={10}>
              <Ionicons name="trash-outline" size={22} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <FlatList
          ref={listRef}
          data={chat}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.welcome}>
              <Text style={styles.welcomeTitle}>Сайн уу! 👋</Text>
              <Text style={styles.welcomeText}>
                Хичээлийн асуултаа бичээрэй. Доорх горимоор хураангуй, энгийн тайлбар эсвэл давтлагын санал авч болно.
              </Text>
              <Text style={styles.welcomeNote}>
                Анхаар: Энэ хувилбарт хариултууд урьдчилан бэлтгэсэн жишээ (mock) өгөгдөл юм.
              </Text>
              <View style={styles.suggestions}>
                {suggestions.map((s) => (
                  <Pressable key={s} style={styles.suggestion} onPress={() => send(s)}>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? styles.user : styles.bot]}>
              {item.role === 'assistant' && item.isMock ? <DemoBadge /> : null}
              <Text style={[styles.msg, item.role === 'user' && { color: colors.white }]}>{item.text}</Text>
            </View>
          )}
          ListFooterComponent={
            loading ? (
              <View style={[styles.bubble, styles.bot, styles.typing]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.typingText}>Бичиж байна...</Text>
              </View>
            ) : undefined
          }
        />

        <View style={styles.composer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modes}>
            {modes.map((m) => (
              <Chip key={m.key} label={m.label} active={mode === m.key} onPress={() => setMode(m.key)} />
            ))}
          </ScrollView>
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Асуултаа бичнэ үү..."
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              multiline
              onSubmitEditing={() => send()}
            />
            <Pressable
              onPress={() => send()}
              disabled={!input.trim() || loading}
              style={[styles.send, (!input.trim() || loading) && { opacity: 0.4 }]}
            >
              <Ionicons name="send" size={20} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  botIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 3 },
  list: { padding: spacing.lg, flexGrow: 1 },
  welcome: { paddingTop: spacing.lg },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  welcomeText: { fontSize: 15, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 22 },
  welcomeNote: {
    fontSize: 13,
    color: '#B45309',
    backgroundColor: colors.warningSoft,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  suggestions: { gap: spacing.sm, marginTop: spacing.lg },
  suggestion: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, padding: spacing.md, borderRadius: radius.md },
  suggestionText: { color: colors.primary, fontWeight: '600' },
  bubble: { maxWidth: '85%', padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.sm, gap: 6 },
  user: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bot: { alignSelf: 'flex-start', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  msg: { fontSize: 15, color: colors.text, lineHeight: 21 },
  typing: { flexDirection: 'row', alignItems: 'center' },
  typingText: { color: colors.textMuted, fontSize: 13 },
  composer: { backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: spacing.sm },
  modes: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, paddingHorizontal: spacing.lg },
  input: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 110,
    color: colors.text,
  },
  send: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
