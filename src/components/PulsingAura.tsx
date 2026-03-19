import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';

interface PulsingAuraProps {
  color: string;
  size?: number;
}

export default function PulsingAura({ color, size = 140 }: PulsingAuraProps) {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulse, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0.6, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const half = size / 2;

  return (
    <View style={[styles.wrap, { width: size + 60, height: size + 60 }]}>
      {/* Glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size + 30,
            height: size + 30,
            borderRadius: (size + 30) / 2,
            borderColor: color,
            opacity: glow,
            transform: [{ scale: pulse }],
          },
        ]}
      />

      {/* Main circle */}
      <Animated.View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: half,
            backgroundColor: color,
            shadowColor: color,
            transform: [{ scale: pulse }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  circle: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
  },
});
