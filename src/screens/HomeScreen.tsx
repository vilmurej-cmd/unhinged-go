import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
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
  {
    name: 'Roast My Friend',
    emoji: '🍗',
    tagline: 'Playful roasts on demand',
    color: COLORS.cooked,
    screen: 'RoastMyFriend',
  },
];

const DAILY_ROASTS: Record<number, string> = {
  0: "Sunday? More like Sun-die on the couch doing absolutely nothing productive. At least you're consistent.",
  1: "Monday hit you like a truck and you didn't even have the decency to dodge. Respect the commitment to suffering.",
  2: "It's Tuesday. Nobody has ever been excited about Tuesday. You're both mid.",
  3: "Wednesday: the day where you're too far from last weekend and too far from the next one. You're stuck in the void.",
  4: "Thursday is just Friday's annoying little sibling that shows up uninvited to every party.",
  5: "TGIF? More like Thank God I Faked my way through another week. Legend.",
  6: "Saturday you: plans to be productive. Also Saturday you: watched 6 hours of content and called it self-care.",
};

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
          <Text style={styles.title}>UNHINGED <Text style={styles.go}>GO</Text></Text>
          <Text style={styles.subtitle}>Pick your weapon</Text>
        </View>

        {/* Daily Roast */}
        <GlassCard accentColor={COLORS.cooked} style={styles.dailyRoastCard}>
          <Text style={styles.dailyRoastLabel}>🔥 DAILY ROAST</Text>
          <Text style={styles.dailyRoastText}>{DAILY_ROASTS[new Date().getDay()]}</Text>
        </GlassCard>

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
  settingsButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: SPACING.xs,
  },
  settingsIcon: {
    fontSize: 24,
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
  dailyRoastCard: {
    marginBottom: SPACING.lg,
  },
  dailyRoastLabel: {
    fontSize: FONT.sm,
    fontWeight: '800',
    color: COLORS.cooked,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  dailyRoastText: {
    fontSize: FONT.md,
    color: COLORS.text,
    lineHeight: 24,
  },
});
