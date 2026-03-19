import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT, SPACING } from '../constants/theme';

interface UsageBannerProps {
  remaining: number;
  color: string;
}

export default function UsageBanner({ remaining, color }: UsageBannerProps) {
  if (remaining > 3) return null;

  return (
    <View style={[styles.banner, { borderColor: remaining === 0 ? COLORS.cooked : color }]}>
      {remaining === 0 ? (
        <>
          <Text style={styles.limitText}>Daily limit reached 🔒</Text>
          <Text style={styles.subText}>UNHINGED GO Pro coming soon!</Text>
        </>
      ) : (
        <Text style={[styles.countText, { color }]}>
          {remaining} free use{remaining !== 1 ? 's' : ''} left today
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    padding: SPACING.sm,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  countText: {
    fontSize: FONT.sm,
    fontWeight: '700',
  },
  limitText: {
    color: COLORS.cooked,
    fontSize: FONT.md,
    fontWeight: '800',
  },
  subText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
