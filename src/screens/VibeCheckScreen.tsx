import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import GlassCard from '../components/GlassCard';
import ActionButton from '../components/ActionButton';
import LoadingOverlay from '../components/LoadingOverlay';
import UsageBanner from '../components/UsageBanner';
import { COLORS, FONT, SPACING } from '../constants/theme';
import { MOOD_OPTIONS } from '../constants/questions';
import { LOADING_MESSAGES } from '../constants/loading';
import { generateAI } from '../utils/api';
import { canUse, incrementUsage, getUsageCount, getRemainingUses } from '../utils/usage';
import { buildVibeShareText, copyText } from '../utils/share';

type Phase = 'input' | 'loading' | 'results';

const AURA_COLORS: Record<string, string> = {
  red: '#EF4444', orange: '#FF6B35', yellow: '#F59E0B', green: '#22C55E',
  blue: '#3B82F6', purple: '#8B5CF6', pink: '#EC4899', white: '#F3F4F6',
  black: '#1F2937', gold: '#D97706',
};

interface VibeResult {
  color: string;
  vibeName: string;
  reading: string;
  affirmation: string;
}

export default function VibeCheckScreen({ navigation }: any) {
  const [phase, setPhase] = useState<Phase>('input');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [vibeText, setVibeText] = useState('');
  const [result, setResult] = useState<VibeResult | null>(null);
  const [remaining, setRemaining] = useState(3);

  useEffect(() => {
    getUsageCount('vibecheck').then((c) => setRemaining(getRemainingUses(c)));
  }, []);

  const handleCheck = async () => {
    if (selectedMood === null) return;
    const allowed = await canUse('vibecheck');
    if (!allowed) {
      Alert.alert('Daily Limit Reached', 'UNHINGED GO Pro coming soon! Try again tomorrow.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPhase('loading');
    try {
      const mood = MOOD_OPTIONS[selectedMood];
      const input = `Mood: ${mood.emoji} ${mood.label}${vibeText ? `\nMore details: ${vibeText}` : ''}`;
      const data = await generateAI('vibecheck', input);
      await incrementUsage('vibecheck');
      setRemaining((r) => r - 1);
      setResult(data);
      setPhase('results');
    } catch {
      Alert.alert('Oops', 'AI generation failed. Try again!');
      setPhase('input');
    }
  };

  const handleShare = () => {
    if (!result) return;
    copyText(buildVibeShareText(result.vibeName, result.color, result.reading));
  };

  const handleRetry = () => {
    setPhase('input');
    setSelectedMood(null);
    setVibeText('');
    setResult(null);
  };

  if (phase === 'loading') {
    return <LoadingOverlay messages={LOADING_MESSAGES.vibeCheck} color={COLORS.vibeCheck} />;
  }

  if (phase === 'results' && result) {
    const auraHex = AURA_COLORS[result.color] || COLORS.vibeCheck;
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.results}>
          <View style={[styles.auraCircle, { backgroundColor: auraHex, shadowColor: auraHex }]} />
          <Text style={[styles.vibeName, { color: auraHex }]}>{result.vibeName}</Text>
          <Text style={styles.auraLabel}>{result.color.toUpperCase()} AURA</Text>

          <GlassCard accentColor={auraHex} style={styles.readingCard}>
            <Text style={styles.readingText}>{result.reading}</Text>
          </GlassCard>

          <GlassCard style={styles.affirmationCard}>
            <Text style={styles.affirmationLabel}>✨ Daily Affirmation</Text>
            <Text style={styles.affirmationText}>{result.affirmation}</Text>
          </GlassCard>

          <ActionButton title="Share My Vibe 📤" color={COLORS.vibeCheck} onPress={handleShare} />
          <ActionButton title="Check Again" color={COLORS.vibeCheck} onPress={handleRetry} outline style={{ marginTop: SPACING.sm }} />
          <ActionButton title="← Back Home" color={COLORS.textSecondary} onPress={() => navigation.goBack()} outline style={{ marginTop: SPACING.sm }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <UsageBanner remaining={remaining} color={COLORS.vibeCheck} />
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
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
