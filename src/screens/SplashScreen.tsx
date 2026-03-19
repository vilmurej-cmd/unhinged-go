import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT, SPACING } from '../constants/theme';

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UNHINGED</Text>
      <Text style={styles.go}>GO</Text>
      <Text style={styles.subtitle}>AI With No Filter</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT.hero,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 4,
  },
  go: {
    fontSize: FONT.hero + 12,
    fontWeight: '900',
    color: COLORS.accent,
    marginTop: -SPACING.sm,
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: FONT.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    fontWeight: '600',
    letterSpacing: 2,
  },
});
