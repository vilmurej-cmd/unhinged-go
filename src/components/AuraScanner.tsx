import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { COLORS, FONT, SPACING } from '../constants/theme';

const MESSAGES = [
  "Scanning your energy field...",
  "Reading your aura...",
  "Detecting vibe frequencies...",
  "Almost there... your aura is strong...",
];

const AURA_COLOR = COLORS.vibeCheck;

export default function AuraScanner() {
  const pulse1 = useRef(new Animated.Value(0.4)).current;
  const pulse2 = useRef(new Animated.Value(0.3)).current;
  const pulse3 = useRef(new Animated.Value(0.2)).current;
  const dotScale = useRef(new Animated.Value(1)).current;
  const [messageIndex, setMessageIndex] = useState(0);
  const msgFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Outer ring pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse1, { toValue: 0.7, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse1, { toValue: 0.2, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Middle ring pulse (offset)
    Animated.loop(
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(pulse2, { toValue: 0.6, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse2, { toValue: 0.15, duration: 1400, useNativeDriver: true }),
      ])
    ).start();

    // Inner ring pulse (offset more)
    Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(pulse3, { toValue: 0.5, duration: 1300, useNativeDriver: true }),
        Animated.timing(pulse3, { toValue: 0.1, duration: 1300, useNativeDriver: true }),
      ])
    ).start();

    // Center dot breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(dotScale, { toValue: 0.9, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Rotating messages with fade
    const msgInterval = setInterval(() => {
      Animated.timing(msgFade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setMessageIndex((i) => (i + 1) % MESSAGES.length);
        Animated.timing(msgFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 1800);

    return () => clearInterval(msgInterval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.circleWrap}>
        <Animated.View style={[styles.ring, styles.ringOuter, { opacity: pulse1 }]} />
        <Animated.View style={[styles.ring, styles.ringMiddle, { opacity: pulse2 }]} />
        <Animated.View style={[styles.ring, styles.ringInner, { opacity: pulse3 }]} />
        <Animated.View style={[styles.centerDot, { transform: [{ scale: dotScale }] }]} />
      </View>
      <Animated.Text style={[styles.message, { opacity: msgFade }]}>
        {MESSAGES[messageIndex]}
      </Animated.Text>
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
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: AURA_COLOR,
  },
  ringOuter: {
    width: 200,
    height: 200,
  },
  ringMiddle: {
    width: 140,
    height: 140,
  },
  ringInner: {
    width: 80,
    height: 80,
  },
  centerDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AURA_COLOR,
    shadowColor: AURA_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  message: {
    color: AURA_COLOR,
    fontSize: FONT.md,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
});
