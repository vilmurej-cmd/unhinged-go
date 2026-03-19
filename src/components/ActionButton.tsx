import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONT, SPACING } from '../constants/theme';

interface ActionButtonProps {
  title: string;
  color: string;
  onPress: () => void;
  style?: ViewStyle;
  outline?: boolean;
}

export default function ActionButton({ title, color, onPress, style, outline }: ActionButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[
        styles.button,
        outline
          ? { borderColor: color, borderWidth: 2, backgroundColor: 'transparent' }
          : { backgroundColor: color },
        style,
      ]}
    >
      <Text style={[styles.text, outline ? { color } : {}]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.text,
    fontSize: FONT.md,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
