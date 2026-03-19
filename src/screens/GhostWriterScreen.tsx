import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import GlassCard from '../components/GlassCard';
import ActionButton from '../components/ActionButton';
import LoadingOverlay from '../components/LoadingOverlay';
import UsageBanner from '../components/UsageBanner';
import { COLORS, FONT, SPACING } from '../constants/theme';
import { LOADING_MESSAGES } from '../constants/loading';
import { generateAI } from '../utils/api';
import { canUse, incrementUsage, getUsageCount, getRemainingUses } from '../utils/usage';

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
  const [remaining, setRemaining] = useState(3);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Pulse animations for each card
  const pulseAnims = useRef(
    Object.fromEntries(REPLY_TYPES.map((t) => [t.key, new Animated.Value(1)]))
  ).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getUsageCount('ghostwriter').then((c) => setRemaining(getRemainingUses(c)));
  }, []);

  const handleCopy = async (key: string, text: string) => {
    await Clipboard.setStringAsync(text);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Pulse the card
    const anim = pulseAnims[key];
    if (anim) {
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.92, duration: 100, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1.03, duration: 150, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }

    // Show toast
    setCopiedKey(key);
    toastOpacity.setValue(1);
    Animated.sequence([
      Animated.delay(1200),
      Animated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setCopiedKey(null));
  };

  const handleGenerate = async () => {
    if (!message.trim()) return;
    const allowed = await canUse('ghostwriter');
    if (!allowed) {
      Alert.alert('Daily Limit Reached', 'UNHINGED GO Pro coming soon! Try again tomorrow.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Keyboard.dismiss();
    setPhase('loading');
    try {
      const data = await generateAI('ghostwriter', message);
      await incrementUsage('ghostwriter');
      setRemaining((r) => r - 1);
      setResult(data);
      setPhase('results');
    } catch {
      Alert.alert('Oops', 'AI generation failed. Try again!');
      setPhase('input');
    }
  };

  const handleRegenerate = async () => {
    const allowed = await canUse('ghostwriter');
    if (!allowed) {
      Alert.alert('Daily Limit Reached', 'UNHINGED GO Pro coming soon! Try again tomorrow.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPhase('loading');
    try {
      const data = await generateAI('ghostwriter', message);
      await incrementUsage('ghostwriter');
      setRemaining((r) => r - 1);
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
            <Animated.View key={type.key} style={{ width: '100%', transform: [{ scale: pulseAnims[type.key] }] }}>
              <GlassCard accentColor={type.color} style={styles.replyCard}>
                <View style={styles.replyHeader}>
                  <Text style={[styles.replyType, { color: type.color }]}>
                    {type.emoji} {type.label}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleCopy(type.key, result[type.key])}
                    style={[styles.copyButton, { borderColor: type.color, backgroundColor: copiedKey === type.key ? type.color : 'transparent' }]}
                  >
                    <Text style={[styles.copyBtnText, { color: copiedKey === type.key ? '#fff' : type.color }]}>
                      {copiedKey === type.key ? 'Copied!' : 'Copy'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.replyText}>{result[type.key]}</Text>
              </GlassCard>
            </Animated.View>
          ))}

          {/* Prominent regenerate */}
          <GlassCard accentColor={COLORS.ghostWriter} onPress={handleRegenerate} style={styles.regenCard}>
            <Text style={styles.regenEmoji}>🔄</Text>
            <View>
              <Text style={styles.regenTitle}>Don't like these?</Text>
              <Text style={styles.regenSub}>Tap to regenerate all replies</Text>
            </View>
          </GlassCard>

          <ActionButton title="New Message" color={COLORS.ghostWriter} onPress={() => { setPhase('input'); setMessage(''); setResult(null); }} outline style={{ width: '100%' }} />
          <ActionButton title="← Back Home" color={COLORS.textSecondary} onPress={() => navigation.goBack()} outline style={{ marginTop: SPACING.sm, width: '100%' }} />
        </ScrollView>

        {/* Floating toast */}
        {copiedKey && (
          <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
            <Text style={styles.toastText}>Copied to clipboard ✓</Text>
          </Animated.View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <UsageBanner remaining={remaining} color={COLORS.ghostWriter} />
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
  replyCard: { marginBottom: SPACING.md },
  replyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  replyType: { fontSize: FONT.md, fontWeight: '800' },
  copyButton: { borderWidth: 1.5, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 16 },
  copyBtnText: { fontSize: 13, fontWeight: '800' },
  replyText: { color: COLORS.text, fontSize: FONT.md, lineHeight: 24 },

  // Regenerate card
  regenCard: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, paddingVertical: SPACING.lg },
  regenEmoji: { fontSize: 32, marginRight: SPACING.md },
  regenTitle: { color: COLORS.ghostWriter, fontSize: FONT.md, fontWeight: '800' },
  regenSub: { color: COLORS.textSecondary, fontSize: FONT.sm, marginTop: 2 },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.ghostWriter,
  },
  toastText: { color: COLORS.ghostWriter, fontSize: FONT.sm, fontWeight: '700' },
});
