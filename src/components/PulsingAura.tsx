import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';

interface PulsingAuraProps {
  color: string;
  size?: number;
}

export default function PulsingAura({ color, size = 140 }: PulsingAuraProps) {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.4)).current;

  // Particle animations
  const particles = useRef(
    Array.from({ length: 8 }, () => ({
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      x: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Main pulse
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulse, { toValue: 1.12, duration: 1500, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0.6, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // Particles floating up
    particles.forEach((p, i) => {
      const delay = i * 500;
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(p.y, { toValue: -120, duration: 2500, useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(p.opacity, { toValue: 0.7, duration: 500, useNativeDriver: true }),
              Animated.timing(p.opacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
            ]),
          ]),
          Animated.timing(p.y, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const half = size / 2;

  return (
    <View style={[styles.wrap, { width: size + 60, height: size + 80 }]}>
      {/* Particles */}
      {particles.map((p, i) => {
        const offsetX = (i - 4) * 14;
        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                backgroundColor: color,
                left: half + 26 + offsetX,
                bottom: 40,
                opacity: p.opacity,
                transform: [{ translateY: p.y }],
              },
            ]}
          />
        );
      })}

      {/* Glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size + 40,
            height: size + 40,
            borderRadius: (size + 40) / 2,
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
  },
  circle: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
