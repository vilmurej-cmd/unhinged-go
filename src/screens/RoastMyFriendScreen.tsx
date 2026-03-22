import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert,
  KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import GlassCard from '../components/GlassCard';
import ActionButton from '../components/ActionButton';
import UsageBanner from '../components/UsageBanner';
import { COLORS, FONT, SPACING } from '../constants/theme';
import { generateAI } from '../utils/api';
import { canUse, incrementUsage, getUsageCount, getRemainingUses } from '../utils/usage';
import { copyText } from '../utils/share';

type Phase = 'input' | 'loading' | 'results';

export default function RoastMyFriendScreen({ navigation }: any) {
  const [phase, setPhase] = useState<Phase>('input');
  const [friendName, setFriendName] = useState('');
  const [trait1, setTrait1] = useState('');
  const [trait2, setTrait2] = useState('');
  const [trait3, setTrait3] = useState('');
  const [roast, setRoast] = useState('');
  const [remaining, setRemaining] = useState(3);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getUsageCount('roast').then((c) => setRemaining(getRemainingUses(c)));
  }, []);

  useEffect(() => {
    if (phase === 'results') {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }
  }, [phase]);

  const handleRoast = async () => {
    if (!friendName.trim() || !trait1.trim()) return;
    const allowed = await canUse('roast');
    if (!allowed) {
      Alert.alert('Daily Limit Reached', 'UNHINGED GO Pro coming soon! Try again tomorrow.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Keyboard.dismiss();
    setPhase('loading');

    try {
      const traits = [trait1, trait2, trait3].filter(Boolean).join(', ');
      const input = `Friend's name: ${friendName}\nTraits: ${traits}\n\nGenerate a playful, funny roast. Keep it lighthearted and NOT mean-spirited. Make it feel like something you'd say to your best friend. 2-3 sentences.`;
      const data = await generateAI('roast', input);
      await incrementUsage('roast');
      setRemaining((r) => r - 1);
      setRoast(typeof data === 'string' ? data : data.roast || data.text || JSON.stringify(data));
      setPhase('results');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('Oops', 'Roast generation failed. Try again!');
      setPhase('input');
    }
  };

  const handleShare = () => {
    copyText(`🔥 ROAST for ${friendName}:\n\n${roast}\n\n— via UNHINGED GO`);
  };

  const handleRetry = () => {
    setPhase('input');
    setFriendName('');
    setTrait1('');
    setTrait2('');
    setTrait3('');
    setRoast('');
  };

  if (phase === 'loading') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>🔥</Text>
          <Text style={styles.loadingText}>Cooking up a roast...</Text>
          <Text style={styles.loadingSub}>This is gonna be good</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'results') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          <Animated.View style={[styles.resultContent, { opacity: fadeAnim }]}>
            <Text style={styles.resultEmoji}>🔥</Text>
            <Text style={styles.resultTitle}>Roast for {friendName}</Text>

            <GlassCard accentColor={COLORS.cooked} style={styles.roastCard}>
              <Text style={styles.roastText}>{roast}</Text>
            </GlassCard>

            <ActionButton title="Copy & Share 📤" color={COLORS.cooked} onPress={handleShare} />
            <ActionButton title="Roast Again" color={COLORS.cooked} onPress={handleRetry} outline style={{ marginTop: SPACING.sm }} />
            <ActionButton title="← Back Home" color={COLORS.textSecondary} onPress={() => navigation.goBack()} outline style={{ marginTop: SPACING.sm }} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <UsageBanner remaining={remaining} color={COLORS.cooked} />
            <Text style={styles.heroEmoji}>🔥</Text>
            <Text style={styles.title}>Roast My Friend</Text>
            <Text style={styles.subtitle}>Playful roasts only — no actual burns allowed</Text>

            <Text style={styles.label}>Friend's Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Who's getting roasted?"
              placeholderTextColor={COLORS.textSecondary}
              value={friendName}
              onChangeText={setFriendName}
              maxLength={30}
            />

            <Text style={styles.label}>3 Traits (at least 1)</Text>
            <TextInput
              style={styles.input}
              placeholder="Trait 1 (e.g. always late)"
              placeholderTextColor={COLORS.textSecondary}
              value={trait1}
              onChangeText={setTrait1}
              maxLength={50}
            />
            <TextInput
              style={styles.input}
              placeholder="Trait 2 (e.g. terrible at cooking)"
              placeholderTextColor={COLORS.textSecondary}
              value={trait2}
              onChangeText={setTrait2}
              maxLength={50}
            />
            <TextInput
              style={styles.input}
              placeholder="Trait 3 (e.g. sends too many memes)"
              placeholderTextColor={COLORS.textSecondary}
              value={trait3}
              onChangeText={setTrait3}
              maxLength={50}
            />

            <ActionButton
              title="🔥 GENERATE ROAST"
              color={friendName.trim() && trait1.trim() ? COLORS.cooked : COLORS.surfaceLight}
              onPress={handleRoast}
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
  container: { padding: SPACING.lg, paddingTop: SPACING.xl },
  heroEmoji: { fontSize: 64, textAlign: 'center', marginBottom: SPACING.sm },
  title: { color: COLORS.text, fontSize: FONT.xl, fontWeight: '800', textAlign: 'center', marginBottom: SPACING.xs },
  subtitle: { color: COLORS.textSecondary, fontSize: FONT.sm, textAlign: 'center', marginBottom: SPACING.xl },
  label: { color: COLORS.text, fontSize: FONT.md, fontWeight: '700', marginBottom: SPACING.sm },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONT.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  back: { marginTop: SPACING.xl, alignItems: 'center' },
  backText: { color: COLORS.textSecondary, fontSize: FONT.sm },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingEmoji: { fontSize: 80, marginBottom: SPACING.md },
  loadingText: { color: COLORS.text, fontSize: FONT.xl, fontWeight: '800' },
  loadingSub: { color: COLORS.textSecondary, fontSize: FONT.md, marginTop: SPACING.xs },
  resultsContainer: { padding: SPACING.lg, alignItems: 'center', paddingBottom: SPACING.xxl },
  resultContent: { alignItems: 'center', width: '100%' },
  resultEmoji: { fontSize: 64, marginBottom: SPACING.md },
  resultTitle: { color: COLORS.cooked, fontSize: FONT.xl, fontWeight: '900', textAlign: 'center', marginBottom: SPACING.lg },
  roastCard: { marginBottom: SPACING.xl, width: '100%' },
  roastText: { color: COLORS.text, fontSize: FONT.md, lineHeight: 26, textAlign: 'center' },
});
