import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import GlassCard from '../components/GlassCard';
import ActionButton from '../components/ActionButton';
import LoadingOverlay from '../components/LoadingOverlay';
import UsageBanner from '../components/UsageBanner';
import { COLORS, FONT, SPACING } from '../constants/theme';
import { COOKED_QUESTIONS } from '../constants/questions';
import { LOADING_MESSAGES } from '../constants/loading';
import { generateAI } from '../utils/api';
import { canUse, incrementUsage, getUsageCount, getRemainingUses } from '../utils/usage';
import { buildCookedShareText, copyText } from '../utils/share';

type Phase = 'questions' | 'loading' | 'results';

interface CookedResult {
  score: number;
  roast: string;
  advice: string;
}

export default function CookedScreen({ navigation }: any) {
  const [phase, setPhase] = useState<Phase>('questions');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<CookedResult | null>(null);
  const [remaining, setRemaining] = useState(3);

  useEffect(() => {
    getUsageCount('cooked').then((c) => setRemaining(getRemainingUses(c)));
  }, []);

  const fetchResult = async (allAnswers: string[]) => {
    const allowed = await canUse('cooked');
    if (!allowed) {
      Alert.alert('Daily Limit Reached', 'UNHINGED GO Pro coming soon! Try again tomorrow.');
      return;
    }

    setPhase('loading');
    try {
      const input = COOKED_QUESTIONS.map((q, i) =>
        `Q: ${q.question}\nA: ${allAnswers[i]}`
      ).join('\n\n');
      const data = await generateAI('cooked', input);
      await incrementUsage('cooked');
      setRemaining((r) => r - 1);
      setResult(data);
      setPhase('results');
    } catch {
      Alert.alert('Oops', 'AI generation failed. Try again!');
      setPhase('questions');
      setQuestionIndex(0);
      setAnswers([]);
    }
  };

  const selectAnswer = (answer: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (questionIndex < COOKED_QUESTIONS.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      fetchResult(newAnswers);
    }
  };

  const handleShare = () => {
    if (!result) return;
    copyText(buildCookedShareText(result.score, result.roast));
  };

  const handleRetry = () => {
    setPhase('questions');
    setQuestionIndex(0);
    setAnswers([]);
    setResult(null);
  };

  if (phase === 'loading') {
    return <LoadingOverlay messages={LOADING_MESSAGES.cooked} color={COLORS.cooked} />;
  }

  if (phase === 'results' && result) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.results}>
          <Text style={styles.resultLabel}>YOUR COOKED SCORE</Text>
          <Text style={styles.score}>{result.score}</Text>
          <Text style={styles.scoreSubtext}>out of 10 🔥</Text>

          <GlassCard accentColor={COLORS.cooked} style={styles.roastCard}>
            <Text style={styles.roastText}>{result.roast}</Text>
          </GlassCard>

          <GlassCard style={styles.adviceCard}>
            <Text style={styles.adviceLabel}>💡 Real talk:</Text>
            <Text style={styles.adviceText}>{result.advice}</Text>
          </GlassCard>

          <ActionButton title="Share My Score 📤" color={COLORS.cooked} onPress={handleShare} />
          <ActionButton title="Try Again" color={COLORS.cooked} onPress={handleRetry} outline style={{ marginTop: SPACING.sm }} />
          <ActionButton title="← Back Home" color={COLORS.textSecondary} onPress={() => navigation.goBack()} outline style={{ marginTop: SPACING.sm }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <UsageBanner remaining={remaining} color={COLORS.cooked} />
        <Text style={styles.progress}>
          {questionIndex + 1} / {COOKED_QUESTIONS.length}
        </Text>
        <Text style={styles.question}>{COOKED_QUESTIONS[questionIndex].question}</Text>

        <View style={styles.options}>
          {COOKED_QUESTIONS[questionIndex].options.map((option, i) => (
            <TouchableOpacity
              key={i}
              style={styles.optionButton}
              activeOpacity={0.7}
              onPress={() => selectAnswer(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
  progress: { color: COLORS.cooked, fontSize: FONT.sm, fontWeight: '700', textAlign: 'center', marginBottom: SPACING.md },
  question: { color: COLORS.text, fontSize: FONT.xl, fontWeight: '800', textAlign: 'center', marginBottom: SPACING.xl },
  options: { gap: SPACING.sm },
  optionButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionText: { color: COLORS.text, fontSize: FONT.md, fontWeight: '600', textAlign: 'center' },
  back: { marginTop: SPACING.xl, alignItems: 'center' },
  backText: { color: COLORS.textSecondary, fontSize: FONT.sm },
  results: { padding: SPACING.lg, alignItems: 'center', paddingBottom: SPACING.xxl },
  resultLabel: { color: COLORS.cooked, fontSize: FONT.sm, fontWeight: '700', letterSpacing: 2, marginTop: SPACING.lg },
  score: { color: COLORS.text, fontSize: 96, fontWeight: '900', marginVertical: SPACING.sm },
  scoreSubtext: { color: COLORS.textSecondary, fontSize: FONT.lg, marginBottom: SPACING.xl },
  roastCard: { marginBottom: SPACING.md, width: '100%' },
  roastText: { color: COLORS.text, fontSize: FONT.md, lineHeight: 26, fontWeight: '500' },
  adviceCard: { marginBottom: SPACING.xl, width: '100%' },
  adviceLabel: { color: COLORS.hypeUp, fontSize: FONT.sm, fontWeight: '700', marginBottom: SPACING.xs },
  adviceText: { color: COLORS.textSecondary, fontSize: FONT.md, lineHeight: 24 },
});
