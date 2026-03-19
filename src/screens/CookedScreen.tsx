import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import GlassCard from '../components/GlassCard';
import ActionButton from '../components/ActionButton';
import LoadingOverlay from '../components/LoadingOverlay';
import { COLORS, FONT, SPACING } from '../constants/theme';
import { COOKED_QUESTIONS } from '../constants/questions';
import { LOADING_MESSAGES } from '../constants/loading';

type Phase = 'questions' | 'loading' | 'results';

// Mock result — will be replaced with AI in Phase 3
const MOCK_RESULT = {
  score: 7,
  roast: "Your gym membership is essentially a charitable donation at this point. Your screen time could qualify as a part-time job, and your inbox is basically a digital hoarder's paradise. But hey, at least your relationship status isn't 'it's complicated' — oh wait. 💀",
  advice: "Start with just ONE unread email a day. Baby steps, champ.",
};

export default function CookedScreen({ navigation }: any) {
  const [phase, setPhase] = useState<Phase>('questions');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const currentQuestion = COOKED_QUESTIONS[questionIndex];

  const selectAnswer = (answer: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (questionIndex < COOKED_QUESTIONS.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setPhase('loading');
      // Simulate AI call — replaced in Phase 3
      setTimeout(() => setPhase('results'), 3000);
    }
  };

  const handleShare = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Will wire up sharing in Phase 4
  };

  const handleRetry = () => {
    setPhase('questions');
    setQuestionIndex(0);
    setAnswers([]);
  };

  if (phase === 'loading') {
    return <LoadingOverlay messages={LOADING_MESSAGES.cooked} color={COLORS.cooked} />;
  }

  if (phase === 'results') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.results}>
          <Text style={styles.resultLabel}>YOUR COOKED SCORE</Text>
          <Text style={styles.score}>{MOCK_RESULT.score}</Text>
          <Text style={styles.scoreSubtext}>out of 10 🔥</Text>

          <GlassCard accentColor={COLORS.cooked} style={styles.roastCard}>
            <Text style={styles.roastText}>{MOCK_RESULT.roast}</Text>
          </GlassCard>

          <GlassCard style={styles.adviceCard}>
            <Text style={styles.adviceLabel}>💡 Real talk:</Text>
            <Text style={styles.adviceText}>{MOCK_RESULT.advice}</Text>
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
        <Text style={styles.progress}>
          {questionIndex + 1} / {COOKED_QUESTIONS.length}
        </Text>
        <Text style={styles.question}>{currentQuestion.question}</Text>

        <View style={styles.options}>
          {currentQuestion.options.map((option, i) => (
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
