import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert,
  KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import GlassCard from '../components/GlassCard';
import ActionButton from '../components/ActionButton';
import LoadingOverlay from '../components/LoadingOverlay';
import UsageBanner from '../components/UsageBanner';
import { COLORS, FONT, SPACING } from '../constants/theme';
import { LOADING_MESSAGES } from '../constants/loading';
import { generateAI } from '../utils/api';
import { canUse, incrementUsage, getUsageCount, getRemainingUses } from '../utils/usage';
import { buildCookedShareText, copyText } from '../utils/share';

type Phase = 'modeSelect' | 'textInput' | 'photoInput' | 'loading' | 'results';

interface CookedResult {
  score: number;
  roast: string;
  advice: string;
}

const ENCOURAGEMENTS = [
  "The more you share, the harder the roast 🔥",
  "Don't be shy, we've heard worse 💀",
  "Include your relationship status for bonus damage",
  "Tell us about your job for extra spice 🌶️",
  "Mention your screen time if you dare 📱",
];

function getScoreColor(score: number): string {
  if (score <= 2) return '#22C55E';
  if (score <= 4) return '#84CC16';
  if (score <= 6) return '#F59E0B';
  if (score <= 8) return '#EF4444';
  return '#DC2626';
}

export default function CookedScreen({ navigation }: any) {
  const [phase, setPhase] = useState<Phase>('modeSelect');
  const [textDump, setTextDump] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [result, setResult] = useState<CookedResult | null>(null);
  const [remaining, setRemaining] = useState(3);
  const [encourageIndex, setEncourageIndex] = useState(0);

  useEffect(() => {
    getUsageCount('cooked').then((c) => setRemaining(getRemainingUses(c)));
  }, []);

  useEffect(() => {
    if (phase === 'textInput') {
      const interval = setInterval(() => {
        setEncourageIndex((i) => (i + 1) % ENCOURAGEMENTS.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleTextRoast = async () => {
    if (!textDump.trim()) return;
    const allowed = await canUse('cooked');
    if (!allowed) {
      Alert.alert('Daily Limit Reached', 'UNHINGED GO Pro coming soon! Try again tomorrow.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Keyboard.dismiss();
    setPhase('loading');
    try {
      const data = await generateAI('cooked', { mode: 'text', text: textDump });
      await incrementUsage('cooked');
      setRemaining((r) => r - 1);
      setResult(data);
      setPhase('results');
    } catch {
      Alert.alert('Oops', 'AI generation failed. Try again!');
      setPhase('textInput');
    }
  };

  const pickPhoto = async (useCamera: boolean) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', `Please allow ${useCamera ? 'camera' : 'photo library'} access in Settings.`);
      return;
    }

    const pickerFn = useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    const result = await pickerFn({
      mediaTypes: ['images'],
      quality: 0.5,
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setPhotoUri(asset.uri);
    setPhotoBase64(asset.base64 || null);
  };

  const handlePhotoRoast = async () => {
    if (!photoBase64) return;
    const allowed = await canUse('cooked');
    if (!allowed) {
      Alert.alert('Daily Limit Reached', 'UNHINGED GO Pro coming soon! Try again tomorrow.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPhase('loading');
    try {
      const data = await generateAI('cooked', { mode: 'photo', image: photoBase64 });
      await incrementUsage('cooked');
      setRemaining((r) => r - 1);
      setResult(data);
      setPhase('results');
    } catch {
      Alert.alert('Oops', 'AI generation failed. Try again!');
      setPhase('photoInput');
    }
  };

  const handleShare = () => {
    if (!result) return;
    copyText(buildCookedShareText(result.score, result.roast));
  };

  const handleReset = () => {
    setPhase('modeSelect');
    setTextDump('');
    setPhotoUri(null);
    setPhotoBase64(null);
    setResult(null);
  };

  if (phase === 'loading') {
    return <LoadingOverlay messages={LOADING_MESSAGES.cooked} color={COLORS.cooked} />;
  }

  // RESULTS
  if (phase === 'results' && result) {
    const scoreColor = getScoreColor(result.score);
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.results}>
          <Text style={styles.resultLabel}>YOUR COOKED SCORE</Text>
          <Text style={[styles.score, { color: scoreColor }]}>{result.score}</Text>
          <Text style={styles.scoreSubtext}>out of 10 🔥</Text>

          <GlassCard accentColor={scoreColor} style={styles.roastCard}>
            <Text style={styles.roastText}>{result.roast}</Text>
          </GlassCard>

          <GlassCard style={styles.adviceCard}>
            <Text style={styles.adviceLabel}>💡 Real talk though:</Text>
            <Text style={styles.adviceText}>{result.advice}</Text>
          </GlassCard>

          <ActionButton title="Share My Score 📤" color={COLORS.cooked} onPress={handleShare} />
          <ActionButton title="Get Roasted Again" color={COLORS.cooked} onPress={handleReset} outline style={{ marginTop: SPACING.sm }} />
          <ActionButton title="← Back Home" color={COLORS.textSecondary} onPress={() => navigation.goBack()} outline style={{ marginTop: SPACING.sm }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // PHOTO INPUT
  if (phase === 'photoInput') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.photoContainer}>
          <UsageBanner remaining={remaining} color={COLORS.cooked} />
          <Text style={styles.modeTitle}>📸 Roast My Photo</Text>

          {photoUri ? (
            <View style={styles.photoPreviewWrap}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <TouchableOpacity onPress={() => { setPhotoUri(null); setPhotoBase64(null); }} style={styles.changePhoto}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <GlassCard accentColor={COLORS.cooked} onPress={() => pickPhoto(true)} style={styles.photoOption}>
                <Text style={styles.photoOptionEmoji}>📷</Text>
                <Text style={styles.photoOptionLabel}>Take Selfie</Text>
              </GlassCard>
              <GlassCard accentColor={COLORS.cooked} onPress={() => pickPhoto(false)} style={styles.photoOption}>
                <Text style={styles.photoOptionEmoji}>🖼️</Text>
                <Text style={styles.photoOptionLabel}>Choose Photo</Text>
              </GlassCard>
            </View>
          )}

          {photoBase64 && (
            <ActionButton title="ROAST THIS PHOTO 🔥" color={COLORS.cooked} onPress={handlePhotoRoast} style={{ marginTop: SPACING.lg }} />
          )}

          <TouchableOpacity onPress={handleReset} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // TEXT INPUT
  if (phase === 'textInput') {
    return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.textContainer} keyboardShouldPersistTaps="handled">
              <UsageBanner remaining={remaining} color={COLORS.cooked} />
              <Text style={styles.modeTitle}>📝 Spill the Tea</Text>
              <Text style={styles.modeSubtitle}>Tell AI everything. Don't hold back.</Text>

              <TextInput
                style={styles.textInput}
                placeholder="I'm 28, living with my parents, got fired last week, my ex just got engaged, and I had cereal for dinner 3 nights straight..."
                placeholderTextColor={COLORS.textSecondary}
                value={textDump}
                onChangeText={setTextDump}
                multiline
                maxLength={1000}
                textAlignVertical="top"
              />

              <View style={styles.inputMeta}>
                <Text style={styles.charCount}>{textDump.length}/1000</Text>
                <Text style={styles.encouragement}>{ENCOURAGEMENTS[encourageIndex]}</Text>
              </View>

              <ActionButton
                title="ROAST ME 🔥"
                color={textDump.trim().length > 10 ? COLORS.cooked : COLORS.surfaceLight}
                onPress={handleTextRoast}
              />

              <TouchableOpacity onPress={handleReset} style={styles.back}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // MODE SELECT (default)
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.modeSelectContainer}>
        <UsageBanner remaining={remaining} color={COLORS.cooked} />
        <Text style={styles.heroEmoji}>🔥</Text>
        <Text style={styles.heroTitle}>Am I Cooked?</Text>
        <Text style={styles.heroSubtitle}>Choose your method of destruction</Text>

        <GlassCard
          accentColor={COLORS.cooked}
          onPress={() => setPhase('textInput')}
          style={styles.modeCard}
        >
          <Text style={styles.modeCardEmoji}>📝</Text>
          <Text style={styles.modeCardTitle}>SPILL THE TEA</Text>
          <Text style={styles.modeCardDesc}>Type your life story and get roasted</Text>
        </GlassCard>

        <GlassCard
          accentColor={COLORS.hypeUp}
          onPress={() => setPhase('photoInput')}
          style={styles.modeCard}
        >
          <Text style={styles.modeCardEmoji}>📸</Text>
          <Text style={styles.modeCardTitle}>ROAST MY PHOTO</Text>
          <Text style={styles.modeCardDesc}>Snap a pic and let AI destroy you</Text>
        </GlassCard>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  // Mode Select
  modeSelectContainer: { flex: 1, padding: SPACING.lg, justifyContent: 'center' },
  heroEmoji: { fontSize: 64, textAlign: 'center', marginBottom: SPACING.sm },
  heroTitle: { color: COLORS.text, fontSize: FONT.xxl, fontWeight: '900', textAlign: 'center' },
  heroSubtitle: { color: COLORS.textSecondary, fontSize: FONT.sm, textAlign: 'center', marginBottom: SPACING.xl },
  modeCard: { alignItems: 'center', paddingVertical: SPACING.xl, marginBottom: SPACING.md },
  modeCardEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  modeCardTitle: { color: COLORS.text, fontSize: FONT.lg, fontWeight: '800', marginBottom: SPACING.xs },
  modeCardDesc: { color: COLORS.textSecondary, fontSize: FONT.sm },

  // Text Input
  textContainer: { flexGrow: 1, padding: SPACING.lg, paddingTop: SPACING.xl },
  modeTitle: { color: COLORS.text, fontSize: FONT.xl, fontWeight: '900', textAlign: 'center' },
  modeSubtitle: { color: COLORS.textSecondary, fontSize: FONT.sm, textAlign: 'center', marginBottom: SPACING.lg },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONT.md,
    minHeight: 160,
    borderWidth: 1,
    borderColor: COLORS.border,
    lineHeight: 24,
  },
  inputMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm, marginBottom: SPACING.lg },
  charCount: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  encouragement: { color: COLORS.cooked, fontSize: 12, fontWeight: '600', flex: 1, textAlign: 'right', marginLeft: SPACING.sm },

  // Photo Input
  photoContainer: { flexGrow: 1, padding: SPACING.lg, paddingTop: SPACING.xl, alignItems: 'center' },
  photoButtons: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
  photoOption: { alignItems: 'center', paddingVertical: SPACING.xl, paddingHorizontal: SPACING.xl },
  photoOptionEmoji: { fontSize: 48, marginBottom: SPACING.sm },
  photoOptionLabel: { color: COLORS.text, fontSize: FONT.sm, fontWeight: '700' },
  photoPreviewWrap: { alignItems: 'center', marginTop: SPACING.lg },
  photoPreview: { width: 250, height: 250, borderRadius: 20, borderWidth: 2, borderColor: COLORS.cooked },
  changePhoto: { marginTop: SPACING.sm },
  changePhotoText: { color: COLORS.cooked, fontSize: FONT.sm, fontWeight: '700' },

  // Results
  results: { padding: SPACING.lg, alignItems: 'center', paddingBottom: SPACING.xxl },
  resultLabel: { color: COLORS.cooked, fontSize: FONT.sm, fontWeight: '700', letterSpacing: 2, marginTop: SPACING.lg },
  score: { fontSize: 96, fontWeight: '900', marginVertical: SPACING.sm },
  scoreSubtext: { color: COLORS.textSecondary, fontSize: FONT.lg, marginBottom: SPACING.xl },
  roastCard: { marginBottom: SPACING.md, width: '100%' },
  roastText: { color: COLORS.text, fontSize: FONT.md, lineHeight: 26, fontWeight: '500' },
  adviceCard: { marginBottom: SPACING.xl, width: '100%' },
  adviceLabel: { color: COLORS.hypeUp, fontSize: FONT.sm, fontWeight: '700', marginBottom: SPACING.xs },
  adviceText: { color: COLORS.textSecondary, fontSize: FONT.md, lineHeight: 24 },

  // Shared
  back: { marginTop: SPACING.xl, alignItems: 'center' },
  backText: { color: COLORS.textSecondary, fontSize: FONT.sm },
});
