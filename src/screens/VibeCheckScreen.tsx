import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import GlassCard from '../components/GlassCard';
import ActionButton from '../components/ActionButton';
import LoadingOverlay from '../components/LoadingOverlay';
import { COLORS, FONT, SPACING } from '../constants/theme';
import { MOOD_OPTIONS } from '../constants/questions';
import { LOADING_MESSAGES } from '../constants/loading';

type Phase = 'input' | 'loading' | 'results';

const AURA_COLORS: Record<string, string> = {
  red: '#EF4444', orange: '#FF6B35', yellow: '#F59E0B', green: '#22C55E',
  blue: '#3B82F6', purple: '#8B5CF6', pink: '#EC4899', white: '#F3F4F6',
  black: '#1F2937', gold: '#D97706',
};

// Mock result
const MOCK_RESULT = {
  color: 'purple',
  vibeName: 'Chaotic Academic Energy',
  reading: "You've got that 'three tabs of research open at 2am' energy. Your brain is running at full speed but your body forgot to get the memo. The universe sees your grind — it just wishes you'd drink some water.",
  affirmation: "Your chaos is your superpower. Channel it, don't fight it.",
};

export default function VibeCheckScreen({ navigation }: any) {
  const [phase, setPhase] = useState<Phase>('input');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [vibeText, setVibeText] = useState('');

  const handleCheck = () => {
    if (selectedMood === null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPhase('loading');
    setTimeout(() => setPhase('results'), 3000);
  };

  const handleRetry = () => {
    setPhase('input');
    setSelectedMood(null);
    setVibeText('');
  };

  if (phase === 'loading') {
    return <LoadingOverlay messages={LOADING_MESSAGES.vibeCheck} color={COLORS.vibeCheck} />;
  }

  if (phase === 'results') {
    const auraHex = AURA_COLORS[MOCK_RESULT.color] || COLORS.vibeCheck;
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.results}>
          <View style={[styles.auraCircle, { backgroundColor: auraHex, shadowColor: auraHex }]} />
          <Text style={[styles.vibeName, { color: auraHex }]}>{MOCK_RESULT.vibeName}</Text>
          <Text style={styles.auraLabel}>{MOCK_RESULT.color.toUpperCase()} AURA</Text>

          <GlassCard accentColor={auraHex} style={styles.readingCard}>
            <Text style={styles.readingText}>{MOCK_RESULT.reading}</Text>
          </GlassCard>

          <GlassCard style={styles.affirmationCard}>
            <Text style={styles.affirmationLabel}>✨ Daily Affirmation</Text>
            <Text style={styles.affirmationText}>{MOCK_RESULT.affirmation}</Text>
          </GlassCard>

          <ActionButton title="Share My Vibe 📤" color={COLORS.vibeCheck} onPress={() => {}} />
          <ActionButton title="Check Again" color={COLORS.vibeCheck} onPress={handleRetry} outline style={{ marginTop: SPACING.sm }} />
          <ActionButton title="← Back Home" color={COLORS.textSecondary} onPress={() => navigation.goBack()} outline style={{ marginTop: SPACING.sm }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>How are you feeling right now?</Text>

        <View style={styles.moods}>
          {MOOD_OPTIONS.map((mood, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => { setSelectedMood(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={[styles.moodButton, selectedMood === i && styles.moodSelected]}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={[styles.moodLabel, selectedMood === i && { color: COLORS.vibeCheck }]}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Tell me more about your vibe today..."
          placeholderTextColor={COLORS.textSecondary}
          value={vibeText}
          onChangeText={setVibeText}
          multiline
          maxLength={300}
        />

        <ActionButton
          title="CHECK MY VIBE 🔮"
          color={selectedMood !== null ? COLORS.vibeCheck : COLORS.surfaceLight}
          onPress={handleCheck}
        />

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.lg, paddingTop: SPACING.xxl },
  title: { color: COLORS.text, fontSize: FONT.xl, fontWeight: '800', textAlign: 'center', marginBottom: SPACING.xl },
  moods: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.xl },
  moodButton: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodSelected: { borderColor: COLORS.vibeCheck, backgroundColor: 'rgba(139,92,246,0.1)' },
  moodEmoji: { fontSize: 36, marginBottom: SPACING.xs },
  moodLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONT.md,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  back: { marginTop: SPACING.xl, alignItems: 'center' },
  backText: { color: COLORS.textSecondary, fontSize: FONT.sm },
  results: { padding: SPACING.lg, alignItems: 'center', paddingBottom: SPACING.xxl },
  auraCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
  vibeName: { fontSize: FONT.xl, fontWeight: '900', textAlign: 'center', marginBottom: SPACING.xs },
  auraLabel: { color: COLORS.textSecondary, fontSize: FONT.sm, fontWeight: '700', letterSpacing: 3, marginBottom: SPACING.xl },
  readingCard: { marginBottom: SPACING.md, width: '100%' },
  readingText: { color: COLORS.text, fontSize: FONT.md, lineHeight: 26 },
  affirmationCard: { marginBottom: SPACING.xl, width: '100%' },
  affirmationLabel: { color: COLORS.hypeUp, fontSize: FONT.sm, fontWeight: '700', marginBottom: SPACING.xs },
  affirmationText: { color: COLORS.textSecondary, fontSize: FONT.md, lineHeight: 24, fontStyle: 'italic' },
});
