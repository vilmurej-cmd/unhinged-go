import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import GlassCard from '../components/GlassCard';
import ActionButton from '../components/ActionButton';
import LoadingOverlay from '../components/LoadingOverlay';
import { COLORS, FONT, SPACING } from '../constants/theme';
import { LOADING_MESSAGES } from '../constants/loading';
import { generateAI } from '../utils/api';

type Phase = 'input' | 'loading' | 'results';

interface GhostResult {
  nice: string;
  savage: string;
  unhinged: string;
}

const REPLY_TYPES = [
  { key: 'nice' as const, label: 'NICE', color: COLORS.nice, emoji: '😇' },
  { key: 'savage' as const, label: 'SAVAGE', color: COLORS.savage, emoji: '😈' },
  { key: 'unhinged' as const, label: 'UNHINGED', color: COLORS.unhinged, emoji: '🤪' },
];

export default function GhostWriterScreen({ navigation }: any) {
  const [phase, setPhase] = useState<Phase>('input');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<GhostResult | null>(null);

  const handleGenerate = async () => {
    if (!message.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPhase('loading');
    try {
      const data = await generateAI('ghostwriter', message);
      setResult(data);
      setPhase('results');
    } catch {
      Alert.alert('Oops', 'AI generation failed. Try again!');
      setPhase('input');
    }
  };

  const handleCopy = (text: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Clipboard wired in Phase 4
  };

  const handleRegenerate = async () => {
    setPhase('loading');
    try {
      const data = await generateAI('ghostwriter', message);
      setResult(data);
      setPhase('results');
    } catch {
      Alert.alert('Oops', 'AI generation failed. Try again!');
      setPhase('results');
    }
  };

  if (phase === 'loading') {
    return <LoadingOverlay messages={LOADING_MESSAGES.ghostWriter} color={COLORS.ghostWriter} />;
  }

  if (phase === 'results' && result) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.results}>
          <Text style={styles.resultEmoji}>👻</Text>
          <Text style={styles.resultLabel}>YOUR REPLIES</Text>

          {REPLY_TYPES.map((type) => (
            <GlassCard key={type.key} accentColor={type.color} style={styles.replyCard}>
              <View style={styles.replyHeader}>
                <Text style={[styles.replyType, { color: type.color }]}>
                  {type.emoji} {type.label}
                </Text>
                <TouchableOpacity
                  onPress={() => handleCopy(result[type.key])}
                  style={[styles.copyButton, { borderColor: type.color }]}
                >
                  <Text style={[styles.copyText, { color: type.color }]}>Copy</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.replyText}>{result[type.key]}</Text>
            </GlassCard>
          ))}

          <ActionButton title="Regenerate 🔄" color={COLORS.ghostWriter} onPress={handleRegenerate} style={{ width: '100%' }} />
          <ActionButton title="New Message" color={COLORS.ghostWriter} onPress={() => { setPhase('input'); setMessage(''); setResult(null); }} outline style={{ marginTop: SPACING.sm, width: '100%' }} />
          <ActionButton title="← Back Home" color={COLORS.textSecondary} onPress={() => navigation.goBack()} outline style={{ marginTop: SPACING.sm, width: '100%' }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.emoji}>👻</Text>
        <Text style={styles.title}>Paste the message you received</Text>

        <TextInput
          style={styles.input}
          placeholder="Paste their text message here..."
          placeholderTextColor={COLORS.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />

        <ActionButton
          title="WRITE MY REPLY ✍️"
          color={message.trim() ? COLORS.ghostWriter : COLORS.surfaceLight}
          onPress={handleGenerate}
        />

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: SPACING.lg, justifyContent: 'center' },
  emoji: { fontSize: 64, textAlign: 'center', marginBottom: SPACING.md },
  title: { color: COLORS.text, fontSize: FONT.xl, fontWeight: '800', textAlign: 'center', marginBottom: SPACING.xl },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONT.md,
    minHeight: 140,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  back: { marginTop: SPACING.xl, alignItems: 'center' },
  backText: { color: COLORS.textSecondary, fontSize: FONT.sm },
  results: { padding: SPACING.lg, alignItems: 'center', paddingBottom: SPACING.xxl },
  resultEmoji: { fontSize: 64, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  resultLabel: { color: COLORS.ghostWriter, fontSize: FONT.sm, fontWeight: '700', letterSpacing: 2, marginBottom: SPACING.lg },
  replyCard: { marginBottom: SPACING.md, width: '100%' },
  replyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  replyType: { fontSize: FONT.md, fontWeight: '800' },
  copyButton: { borderWidth: 1, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12 },
  copyText: { fontSize: 12, fontWeight: '700' },
  replyText: { color: COLORS.text, fontSize: FONT.md, lineHeight: 24 },
});
