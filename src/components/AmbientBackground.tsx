import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

type AmbientBackgroundProps = {
  primary: string;
  secondary: string;
  tertiary?: string;
};

export function AmbientBackground({ primary, secondary, tertiary }: AmbientBackgroundProps) {
  const floatA = useRef(new Animated.Value(0)).current;
  const floatB = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0.16)).current;

  useEffect(() => {
    const orbA = Animated.loop(
      Animated.sequence([
        Animated.timing(floatA, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatA, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const orbB = Animated.loop(
      Animated.sequence([
        Animated.timing(floatB, {
          toValue: 1,
          duration: 6200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatB, {
          toValue: 0,
          duration: 6200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const glowPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 0.28,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.14,
          duration: 2400,
          useNativeDriver: true,
        }),
      ])
    );

    orbA.start();
    orbB.start();
    glowPulse.start();

    return () => {
      orbA.stop();
      orbB.stop();
      glowPulse.stop();
    };
  }, [floatA, floatB, glow]);

  const moveA = floatA.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 22],
  });

  const moveB = floatB.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -26],
  });

  const scaleA = floatA.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.16],
  });

  const scaleB = floatB.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          styles.orb,
          styles.orbTop,
          {
            backgroundColor: primary,
            opacity: glow,
            transform: [{ translateY: moveA }, { scale: scaleA }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orbBottom,
          {
            backgroundColor: secondary,
            opacity: glow,
            transform: [{ translateY: moveB }, { scale: scaleB }],
          },
        ]}
      />
      {tertiary ? <View style={[styles.edgeGlow, { backgroundColor: tertiary }]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbTop: {
    width: 220,
    height: 220,
    top: 72,
    right: -48,
  },
  orbBottom: {
    width: 260,
    height: 260,
    bottom: 96,
    left: -96,
  },
  edgeGlow: {
    position: 'absolute',
    top: '28%',
    left: -30,
    right: -30,
    height: 120,
    borderRadius: 999,
    opacity: 0.08,
  },
});
