import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthCopy } from '../constants/authCopy';
import { AmbientBackground } from '../components/AmbientBackground';
import { Palette, ThemeMode } from '../types';

type SplashScreenProps = {
  copy: AuthCopy;
  palette: Palette;
  isDark: boolean;
  onDone: () => void;
  onToggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
};

export function SplashScreen({ copy, palette, isDark, onDone, onToggleTheme, setThemeMode }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.15)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const dots = useRef([new Animated.Value(0.25), new Animated.Value(0.25), new Animated.Value(0.25)]).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 110,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    const spin = Animated.loop(
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 0.28, duration: 1400, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.12, duration: 1400, useNativeDriver: true }),
      ])
    );

    const rings = Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, { toValue: 1.14, duration: 1600, useNativeDriver: true }),
        Animated.timing(ringScale, { toValue: 1, duration: 1600, useNativeDriver: true }),
      ])
    );

    const dotsLoop = Animated.loop(
      Animated.stagger(
        180,
        dots.map((dot) =>
          Animated.sequence([
            Animated.timing(dot, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0.25, duration: 500, useNativeDriver: true }),
          ])
        )
      )
    );

    spin.start();
    glow.start();
    rings.start();
    dotsLoop.start();

    const timer = setTimeout(onDone, 2200);
    return () => {
      clearTimeout(timer);
      spin.stop();
      glow.stop();
      rings.stop();
      dotsLoop.stop();
    };
  }, [contentOpacity, dots, glowOpacity, logoRotate, logoScale, onDone, ringScale]);

  const rotate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.screen, { backgroundColor: palette.bg }]}>
      <AmbientBackground primary={palette.accent} secondary={palette.accentSoft} tertiary={palette.textPrimary} />
      <View style={[styles.topFade, { backgroundColor: isDark ? '#10130d' : '#fff9eb' }]} />
      <View style={[styles.bottomFade, { backgroundColor: isDark ? '#151811' : '#eef5dc' }]} />

      <Pressable
        style={[styles.themeButton, { backgroundColor: palette.card, borderColor: palette.border }]}
        onPress={onToggleTheme}
        onLongPress={() => setThemeMode('system')}
      >
        <Ionicons
          name={isDark ? 'sunny-outline' : 'moon-outline'}
          size={22}
          color={palette.textPrimary}
        />
      </Pressable>

      <Animated.View style={[styles.center, { opacity: contentOpacity }]}>
        <View style={[styles.brandPill, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Ionicons name="shield-checkmark-outline" size={16} color={palette.accent} />
          <Text style={[styles.brandPillText, { color: palette.textPrimary }]}>{copy.privacyPolicy}</Text>
        </View>

        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: palette.accent,
              opacity: glowOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.logoWrap,
            { backgroundColor: palette.card, borderColor: palette.border, transform: [{ scale: logoScale }] },
          ]}
        >
          <Animated.View
            style={[styles.ring, { borderColor: palette.accent, transform: [{ rotate }, { scale: ringScale }] }]}
          />
          <Animated.View
            style={[styles.ringSecondary, { borderColor: palette.accentSoft, transform: [{ scale: ringScale }] }]}
          />
          <View style={[styles.logoCore, { backgroundColor: palette.textPrimary }]}>
            <Text style={[styles.logoText, { color: palette.accentStrong }]}>L&F</Text>
          </View>
        </Animated.View>

        <View style={[styles.heroCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.title, { color: palette.textPrimary }]}>{copy.splashTitle}</Text>
          <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{copy.splashSubtitle}</Text>
        </View>

        <View style={styles.loadingRow}>
          {dots.map((dot, index) => (
            <Animated.View
              key={index}
              style={[
                styles.loadingDot,
                {
                  backgroundColor: palette.accent,
                  opacity: dot,
                  transform: [{ scale: dot }],
                },
              ]}
            />
          ))}
        </View>

        <Text style={[styles.loadingLabel, { color: palette.textSecondary }]}>
          {copy.splashTitle}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  topFade: {
    position: 'absolute',
    top: -120,
    width: 320,
    height: 320,
    borderRadius: 999,
    opacity: 0.4,
  },
  bottomFade: {
    position: 'absolute',
    bottom: -160,
    width: 360,
    height: 300,
    borderRadius: 999,
    opacity: 0.32,
  },
  themeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    width: '100%',
    alignItems: 'center',
  },
  brandPill: {
    position: 'absolute',
    top: -92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  brandPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  glow: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
  },
  logoWrap: {
    width: 144,
    height: 144,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#9FBF2A',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 12,
  },
  ring: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  ringSecondary: {
    position: 'absolute',
    width: 144,
    height: 144,
    borderRadius: 36,
    borderWidth: 2,
    opacity: 0.35,
  },
  logoCore: {
    width: 104,
    height: 104,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroCard: {
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 18,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 320,
  },
  loadingRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  loadingLabel: {
    marginTop: 10,
    fontSize: 12,
    letterSpacing: 0.4,
  },
});
