import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Palette } from '../types';

type TypingIndicatorProps = {
  palette: Palette;
  label: string;
  isArabic: boolean;
};

export function TypingIndicator({ palette, label, isArabic }: TypingIndicatorProps) {
  const dotA = useRef(new Animated.Value(0.35)).current;
  const dotB = useRef(new Animated.Value(0.35)).current;
  const dotC = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const buildPulse = (animatedValue: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 220,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0.35,
            duration: 220,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(240),
        ])
      );

    const pulseA = buildPulse(dotA, 0);
    const pulseB = buildPulse(dotB, 120);
    const pulseC = buildPulse(dotC, 240);

    pulseA.start();
    pulseB.start();
    pulseC.start();

    return () => {
      pulseA.stop();
      pulseB.stop();
      pulseC.stop();
    };
  }, [dotA, dotB, dotC]);

  return (
    <View style={styles.wrap}>
      <View style={[styles.bubble, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { backgroundColor: palette.accent, opacity: dotA, transform: [{ scale: dotA }] }]} />
          <Animated.View style={[styles.dot, { backgroundColor: palette.accent, opacity: dotB, transform: [{ scale: dotB }] }]} />
          <Animated.View style={[styles.dot, { backgroundColor: palette.accent, opacity: dotC, transform: [{ scale: dotC }] }]} />
        </View>
      </View>
      <Text style={[styles.label, { color: palette.textSecondary, textAlign: isArabic ? 'right' : 'left' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    maxWidth: '70%',
    marginBottom: 14,
  },
  bubble: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    marginTop: 6,
    fontSize: 11,
    paddingHorizontal: 4,
  },
});
