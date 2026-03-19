import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { COLORS, FONT, SPACING } from '../constants/theme';

interface LoadingOverlayProps {
  messages: string[];
  color: string;
}

export default function LoadingOverlay({ messages, color }: LoadingOverlayProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={color} style={styles.spinner} />
      <Text style={[styles.message, { color }]}>{messages[index]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  spinner: {
    marginBottom: SPACING.lg,
    transform: [{ scale: 1.5 }],
  },
  message: {
    fontSize: FONT.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
});
