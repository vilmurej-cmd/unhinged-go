import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassCard from '../components/GlassCard';
import { COLORS, FONT, SPACING } from '../constants/theme';

const TOOLS = [
  {
    name: 'Am I Cooked?',
    emoji: '🔥',
    tagline: 'Get your brutal life score',
    color: COLORS.cooked,
    screen: 'Cooked',
  },
  {
    name: 'Vibe Check',
    emoji: '🔮',
    tagline: 'Read your aura energy',
    color: COLORS.vibeCheck,
    screen: 'VibeCheck',
  },
  {
    name: 'Hype Me Up',
    emoji: '⚡',
    tagline: 'Get an epic pep talk',
    color: COLORS.hypeUp,
    screen: 'HypeUp',
  },
  {
    name: 'Ghost Writer',
    emoji: '👻',
    tagline: 'AI writes your replies',
    color: COLORS.ghostWriter,
    screen: 'GhostWriter',
  },
];

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>UNHINGED <Text style={styles.go}>GO</Text></Text>
          <Text style={styles.subtitle}>Pick your weapon</Text>
        </View>

        <View style={styles.grid}>
          {TOOLS.map((tool) => (
            <GlassCard
              key={tool.name}
              accentColor={tool.color}
              onPress={() => navigation.navigate(tool.screen)}
              style={styles.card}
            >
              <Text style={styles.emoji}>{tool.emoji}</Text>
              <Text style={styles.toolName}>{tool.name}</Text>
              <Text style={styles.tagline}>{tool.tagline}</Text>
            </GlassCard>
          ))}
        </View>

        <Text style={styles.footer}>Powered by Vilmure Ventures</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  title: {
    fontSize: FONT.xxl,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 2,
  },
  go: {
    color: COLORS.accent,
  },
  subtitle: {
    fontSize: FONT.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  grid: {
    gap: SPACING.md,
  },
  card: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  toolName: {
    fontSize: FONT.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: FONT.sm,
    color: COLORS.textSecondary,
  },
  footer: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.xl,
    opacity: 0.5,
  },
});
