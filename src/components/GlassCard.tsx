import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  accentColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function GlassCard({ children, accentColor, onPress, style }: GlassCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress ? handlePress : undefined}
      style={[
        styles.card,
        accentColor ? { borderColor: accentColor, shadowColor: accentColor } : {},
        style,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
