import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import GlassCard from '../components/GlassCard';
import ActionButton from '../components/ActionButton';
import LoadingOverlay from '../components/LoadingOverlay';
import { COLORS, FONT, SPACING } from '../constants/theme';
import { LOADING_MESSAGES } from '../constants/loading';

type Phase = 'input' | 'loading' | 'results';

const MOCK_RESULT = {
  speech: "Listen to me RIGHT NOW. You are about to walk into that job interview and absolutely DOMINATE. They don't even know what's about to hit them. You've got the skills, you've got the confidence, and you've got that unshakable energy that makes people sit up and pay attention. When you walk through those doors, the whole room is going to feel it. They're not interviewing you — you're interviewing THEM. Now go in there and show them why they'd be lucky to have you. THIS IS YOUR MOMENT. 🔥",
};

export default function HypeUpScreen({ navigation }: any) {
  const [phase, setPhase] = useState<Phase>('input');
  const [input, setInput] = useState('');

  const handleHype = () => {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPhase('loading');
    setTimeout(() => setPhase('results'), 3000);
  };

  const handleRetry = () => {
    setPhase('input');
    setInput('');
  };

  if (phase === 'loading') {
    return <LoadingOverlay messages={LOADING_MESSAGES.hypeUp} color={COLORS.hypeUp} />;
  }

  if (phase === 'results') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.results}>
          <Text style={styles.resultEmoji}>⚡</Text>
          <Text style={styles.resultLabel}>YOUR HYPE SPEECH</Text>

          <GlassCard accentColor={COLORS.hypeUp} style={styles.speechCard}>
            <Text style={styles.speechText}>{MOCK_RESULT.speech}</Text>
          </GlassCard>

          <View style={styles.buttonRow}>
            <ActionButton title="Copy 📋" color={COLORS.hypeUp} onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)} style={{ flex: 1 }} />
            <View style={{ width: SPACING.sm }} />
            <ActionButton title="Share 📤" color={COLORS.hypeUp} onPress={() => {}} outline style={{ flex: 1 }} />
          </View>

          <ActionButton title="Hype Me Again" color={COLORS.hypeUp} onPress={handleRetry} outline style={{ marginTop: SPACING.sm, width: '100%' }} />
          <ActionButton title="← Back Home" color={COLORS.textSecondary} onPress={() => navigation.goBack()} outline style={{ marginTop: SPACING.sm, width: '100%' }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.emoji}>⚡</Text>
        <Text style={styles.title}>What do you need hype for?</Text>

        <TextInput
          style={styles.input}
          placeholder="job interview, first date, gym session, presentation..."
          placeholderTextColor={COLORS.textSecondary}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={300}
        />

        <ActionButton
          title="HYPE ME 🔥"
          color={input.trim() ? COLORS.hypeUp : COLORS.surfaceLight}
          onPress={handleHype}
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
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  back: { marginTop: SPACING.xl, alignItems: 'center' },
  backText: { color: COLORS.textSecondary, fontSize: FONT.sm },
  results: { padding: SPACING.lg, alignItems: 'center', paddingBottom: SPACING.xxl },
  resultEmoji: { fontSize: 64, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  resultLabel: { color: COLORS.hypeUp, fontSize: FONT.sm, fontWeight: '700', letterSpacing: 2, marginBottom: SPACING.lg },
  speechCard: { marginBottom: SPACING.lg, width: '100%' },
  speechText: { color: COLORS.text, fontSize: FONT.lg, lineHeight: 30, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', width: '100%' },
});
