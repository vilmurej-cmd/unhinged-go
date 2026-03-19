import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import GlassCard from '../components/GlassCard';
import ActionButton from '../components/ActionButton';
import LoadingOverlay from '../components/LoadingOverlay';
import UsageBanner from '../components/UsageBanner';
import { COLORS, FONT, SPACING } from '../constants/theme';
import { LOADING_MESSAGES } from '../constants/loading';
import { generateAI } from '../utils/api';
import { canUse, incrementUsage, getUsageCount, getRemainingUses } from '../utils/usage';
import { buildHypeShareText, copyText } from '../utils/share';

type Phase = 'input' | 'intensity' | 'loading' | 'results';
type Intensity = 'gentle' | 'max' | 'unhinged';

interface HypeResult {
  speech: string;
}

const INTENSITIES: { key: Intensity; emoji: string; label: string; desc: string; color: string }[] = [
  { key: 'gentle', emoji: '💚', label: 'GENTLE', desc: 'Encouraging best friend energy', color: '#22C55E' },
  { key: 'max', emoji: '🔥', label: 'MAX', desc: 'Full motivational speaker mode', color: COLORS.hypeUp },
  { key: 'unhinged', emoji: '💀', label: 'UNHINGED', desc: 'Over-the-top absurd hype', color: COLORS.vibeCheck },
];

export default function HypeUpScreen({ navigation }: any) {
  const [phase, setPhase] = useState<Phase>('input');
  const [input, setInput] = useState('');
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [result, setResult] = useState<HypeResult | null>(null);
  const [remaining, setRemaining] = useState(3);

  useEffect(() => {
    getUsageCount('hypeup').then((c) => setRemaining(getRemainingUses(c)));
  }, []);

  const handleContinue = () => {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Keyboard.dismiss();
    setPhase('intensity');
  };

  const handleHype = async (selectedIntensity: Intensity) => {
    setIntensity(selectedIntensity);
    const allowed = await canUse('hypeup');
    if (!allowed) {
      Alert.alert('Daily Limit Reached', 'UNHINGED GO Pro coming soon! Try again tomorrow.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPhase('loading');
    try {
      const data = await generateAI('hypeup', { situation: input, intensity: selectedIntensity });
      await incrementUsage('hypeup');
      setRemaining((r) => r - 1);
      setResult(data);
      setPhase('results');
    } catch {
      Alert.alert('Oops', 'AI generation failed. Try again!');
      setPhase('intensity');
    }
  };

  const handleCopy = () => {
    if (!result) return;
    copyText(result.speech);
  };

  const handleShare = () => {
    if (!result) return;
    copyText(buildHypeShareText(result.speech));
  };

  const handleRetry = () => {
    setPhase('input');
    setInput('');
    setIntensity(null);
    setResult(null);
  };

  if (phase === 'loading') {
    return <LoadingOverlay messages={LOADING_MESSAGES.hypeUp} color={COLORS.hypeUp} />;
  }

  if (phase === 'results' && result) {
    const intensityData = INTENSITIES.find((i) => i.key === intensity);
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.results}>
          <Text style={styles.resultEmoji}>⚡</Text>
          <Text style={styles.resultLabel}>YOUR HYPE SPEECH</Text>
          {intensityData && (
            <Text style={[styles.intensityBadge, { color: intensityData.color }]}>
              {intensityData.emoji} {intensityData.label} MODE
            </Text>
          )}

          <GlassCard accentColor={COLORS.hypeUp} style={styles.speechCard}>
            <Text style={styles.speechText}>{result.speech}</Text>
          </GlassCard>

          <View style={styles.buttonRow}>
            <ActionButton title="Copy 📋" color={COLORS.hypeUp} onPress={handleCopy} style={{ flex: 1 }} />
            <View style={{ width: SPACING.sm }} />
            <ActionButton title="Share 📤" color={COLORS.hypeUp} onPress={handleShare} outline style={{ flex: 1 }} />
          </View>

          <ActionButton title="Hype Me Again" color={COLORS.hypeUp} onPress={handleRetry} outline style={{ marginTop: SPACING.sm, width: '100%' }} />
          <ActionButton title="← Back Home" color={COLORS.textSecondary} onPress={() => navigation.goBack()} outline style={{ marginTop: SPACING.sm, width: '100%' }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // INTENSITY SELECTOR
  if (phase === 'intensity') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.intensityContainer}>
          <Text style={styles.emoji}>⚡</Text>
          <Text style={styles.title}>Choose your hype level</Text>

          {INTENSITIES.map((item) => (
            <GlassCard
              key={item.key}
              accentColor={item.color}
              onPress={() => handleHype(item.key)}
              style={styles.intensityCard}
            >
              <Text style={styles.intensityEmoji}>{item.emoji}</Text>
              <View style={styles.intensityInfo}>
                <Text style={[styles.intensityLabel, { color: item.color }]}>{item.label}</Text>
                <Text style={styles.intensityDesc}>{item.desc}</Text>
              </View>
            </GlassCard>
          ))}

          <TouchableOpacity onPress={() => setPhase('input')} style={styles.back}>
            <Text style={styles.backText}>← Change situation</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // INPUT
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <UsageBanner remaining={remaining} color={COLORS.hypeUp} />
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
              title="NEXT →"
              color={input.trim() ? COLORS.hypeUp : COLORS.surfaceLight}
              onPress={handleContinue}
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
  container: { flexGrow: 1, padding: SPACING.lg, justifyContent: 'center' },
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

  // Intensity
  intensityContainer: { flex: 1, padding: SPACING.lg, justifyContent: 'center' },
  intensityCard: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, paddingVertical: SPACING.lg },
  intensityEmoji: { fontSize: 40, marginRight: SPACING.md },
  intensityInfo: { flex: 1 },
  intensityLabel: { fontSize: FONT.lg, fontWeight: '800', marginBottom: 2 },
  intensityDesc: { color: COLORS.textSecondary, fontSize: FONT.sm },

  // Results
  back: { marginTop: SPACING.xl, alignItems: 'center' },
  backText: { color: COLORS.textSecondary, fontSize: FONT.sm },
  results: { padding: SPACING.lg, alignItems: 'center', paddingBottom: SPACING.xxl },
  resultEmoji: { fontSize: 64, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  resultLabel: { color: COLORS.hypeUp, fontSize: FONT.sm, fontWeight: '700', letterSpacing: 2 },
  intensityBadge: { fontSize: FONT.sm, fontWeight: '800', marginTop: SPACING.xs, marginBottom: SPACING.lg },
  speechCard: { marginBottom: SPACING.lg, width: '100%' },
  speechText: { color: COLORS.text, fontSize: FONT.lg, lineHeight: 30, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', width: '100%' },
});
