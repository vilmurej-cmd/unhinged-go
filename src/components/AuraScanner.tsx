import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions } from 'react-native';
import { COLORS, FONT, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');
const CIRCLE_COUNT = 4;
const SCAN_COLORS = ['#8B5CF6', '#3B82F6', '#22C55E', '#D97706', '#EC4899', '#8B5CF6'];

const MESSAGES = [
  "Scanning your energy field...",
  "Reading your aura...",
  "Detecting vibe frequencies...",
  "Almost there... your aura is strong...",
];

export default function AuraScanner() {
  const animations = useRef(
    Array.from({ length: CIRCLE_COUNT }, () => new Animated.Value(0))
  ).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Pulsing circles — staggered
    animations.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 400),
          Animated.timing(anim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    });

    // Color cycling
    Animated.loop(
      Animated.timing(colorAnim, { toValue: SCAN_COLORS.length - 1, duration: 4000, useNativeDriver: false })
    ).start();

    // Rotating messages
    const msgInterval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 1500);

    return () => clearInterval(msgInterval);
  }, []);

  const interpolatedColor = colorAnim.interpolate({
    inputRange: SCAN_COLORS.map((_, i) => i),
    outputRange: SCAN_COLORS,
  });

  return (
    <View style={styles.container}>
      <View style={styles.circleWrap}>
        {animations.map((anim, i) => {
          const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2 + i * 0.5] });
          const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 0.3, 0] });
          return (
            <Animated.View
              key={i}
              style={[
                styles.circle,
                {
                  backgroundColor: interpolatedColor as any,
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            />
          );
        })}
        <Animated.View style={[styles.centerDot, { backgroundColor: interpolatedColor as any }]} />
      </View>
      <Text style={styles.message}>{MESSAGES[messageIndex]}</Text>
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
  circleWrap: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  centerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  message: {
    color: COLORS.vibeCheck,
    fontSize: FONT.md,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
});
