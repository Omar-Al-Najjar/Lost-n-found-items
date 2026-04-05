import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleProp, StyleSheet, Switch, Text, View, ViewStyle } from 'react-native';

import { Language, Palette, ThemeMode } from '../types';

type ProfileScreenProps = {
  t: any;
  palette: Palette;
  isArabic: boolean;
  darkEnabled: boolean;
  setDarkEnabled: (value: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
};

type InteractiveCardProps = {
  children: React.ReactNode;
  style: StyleProp<ViewStyle>;
  radius?: number;
};

function InteractiveCard({ children, style, radius = 18 }: InteractiveCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.02, useNativeDriver: true, tension: 240, friction: 16 }),
      Animated.spring(lift, { toValue: -2, useNativeDriver: true, tension: 240, friction: 16 }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 240, friction: 16 }),
      Animated.spring(lift, { toValue: 0, useNativeDriver: true, tension: 240, friction: 16 }),
    ]).start();
  };

  return (
    <Animated.View style={{ transform: [{ translateY: lift }, { scale }] }}>
      <Pressable
        style={[style, styles.interactivePressable, { borderRadius: radius }]}
        onHoverIn={animateIn}
        onHoverOut={animateOut}
        onPressIn={animateIn}
        onPressOut={animateOut}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function ProfileScreen({
  t,
  palette,
  isArabic,
  darkEnabled,
  setDarkEnabled,
  setThemeMode,
  language,
  setLanguage,
}: ProfileScreenProps) {
  const headerY = useRef(new Animated.Value(-70)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const profileOpacity = useRef(new Animated.Value(0)).current;
  const profileY = useRef(new Animated.Value(20)).current;
  const avatarScale = useRef(new Animated.Value(0.6)).current;
  const avatarRotate = useRef(new Animated.Value(-1)).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.05)).current;
  const statLeftOpacity = useRef(new Animated.Value(0)).current;
  const statLeftX = useRef(new Animated.Value(-20)).current;
  const statRightOpacity = useRef(new Animated.Value(0)).current;
  const statRightX = useRef(new Animated.Value(20)).current;
  const sectionOpacity = useRef(new Animated.Value(0)).current;
  const sectionY = useRef(new Animated.Value(18)).current;
  const postsOpacity = useRef(new Animated.Value(0)).current;
  const postsY = useRef(new Animated.Value(18)).current;
  const logoutOpacity = useRef(new Animated.Value(0)).current;
  const logoutY = useRef(new Animated.Value(20)).current;
  const countPulse = useRef(new Animated.Value(1)).current;
  const logoutScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 180,
        friction: 20,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(80),
        Animated.parallel([
          Animated.timing(profileOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(profileY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(avatarScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 10,
          }),
          Animated.timing(avatarRotate, {
            toValue: 0,
            duration: 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(160),
        Animated.parallel([
          Animated.timing(statLeftOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(statLeftX, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(220),
        Animated.parallel([
          Animated.timing(statRightOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(statRightX, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(280),
        Animated.parallel([
          Animated.timing(sectionOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(sectionY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(340),
        Animated.parallel([
          Animated.timing(postsOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(postsY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(400),
        Animated.parallel([
          Animated.timing(logoutOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(logoutY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowScale, {
            toValue: 1.2,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(glowScale, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.05,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(countPulse, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(countPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    glowAnimation.start();
    pulseAnimation.start();

    return () => {
      glowAnimation.stop();
      pulseAnimation.stop();
    };
  }, [
    avatarRotate,
    avatarScale,
    countPulse,
    glowOpacity,
    glowScale,
    headerOpacity,
    headerY,
    logoutOpacity,
    logoutScale,
    logoutY,
    postsOpacity,
    postsY,
    profileOpacity,
    profileY,
    sectionOpacity,
    sectionY,
    statLeftOpacity,
    statLeftX,
    statRightOpacity,
    statRightX,
  ]);

  const avatarRotateDeg = avatarRotate.interpolate({
    inputRange: [-1, 0],
    outputRange: ['-160deg', '0deg'],
  });

  return (
    <>
      <Animated.View
        style={[
          styles.topBar,
          {
            backgroundColor: palette.topBar,
            borderBottomColor: palette.border,
            opacity: headerOpacity,
            transform: [{ translateY: headerY }],
          },
        ]}
      >
        <Text style={[styles.topBarTitle, { color: palette.textPrimary }]}>{t.profile}</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
              opacity: profileOpacity,
              transform: [{ translateY: profileY }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.profileGlow,
              {
                backgroundColor: palette.accent,
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />
          <View style={styles.profileRowCenter}>
            <Animated.View style={{ transform: [{ scale: avatarScale }, { rotate: avatarRotateDeg }] }}>
              <View style={[styles.avatar, { backgroundColor: palette.accentSoft }]}>
                <View style={styles.avatarOverlay} />
                <Text style={[styles.avatarText, { color: palette.accentStrong }]}>{isArabic ? '\u0639' : 'A'}</Text>
              </View>
            </Animated.View>

            <View style={styles.centerTextWrap}>
              <Text style={[styles.profileName, { color: palette.textPrimary }]}>{t.fullName}</Text>
              <Text style={[styles.profileMeta, { color: palette.textSecondary }]}>{t.email}</Text>
            </View>
          </View>
        </Animated.View>

        <View style={[styles.statsRow, isArabic && styles.rowReverse]}>
          <Animated.View
            style={{
              flex: 1,
              opacity: statLeftOpacity,
              transform: [{ translateX: statLeftX }],
            }}
          >
            <InteractiveCard style={[styles.statCard, { backgroundColor: palette.card, borderColor: palette.border }]} radius={22}>
              <Animated.Text style={[styles.statValue, { color: palette.accent, transform: [{ scale: countPulse }] }]}>
                3
              </Animated.Text>
              <Text style={[styles.statLabel, { color: palette.textSecondary }]}>{t.activeChats}</Text>
            </InteractiveCard>
          </Animated.View>

          <Animated.View
            style={{
              flex: 1,
              opacity: statRightOpacity,
              transform: [{ translateX: statRightX }],
            }}
          >
            <InteractiveCard style={[styles.statCard, { backgroundColor: palette.card, borderColor: palette.border }]} radius={22}>
              <Animated.Text style={[styles.statValue, { color: palette.accent, transform: [{ scale: countPulse }] }]}>
                2
              </Animated.Text>
              <Text style={[styles.statLabel, { color: palette.textSecondary }]}>{t.myPosts}</Text>
            </InteractiveCard>
          </Animated.View>
        </View>

        <Animated.View style={{ width: '92%', opacity: sectionOpacity, transform: [{ translateY: sectionY }] }}>
          <View style={[styles.settingsHeader, isArabic && styles.rightAligned]}>
            <View style={[styles.settingsTitleWrap, isArabic && styles.rowReverse]}>
              <Ionicons name="settings-outline" size={24} color={palette.textPrimary} />
              <Text style={[styles.settingsTitle, { color: palette.textPrimary }]}>{t.settings}</Text>
            </View>
          </View>

          <InteractiveCard style={[styles.settingCard, { backgroundColor: palette.card, borderColor: palette.border }]} radius={18}>
            <View style={[styles.settingRow, isArabic && styles.rowReverse]}>
              <View style={[styles.settingLabelWrap, isArabic && styles.rowReverse]}>
                <Ionicons name="sunny-outline" size={24} color={palette.textPrimary} />
                <Text style={[styles.settingText, { color: palette.textPrimary }]}>{t.darkMode}</Text>
              </View>
              <Switch
                value={darkEnabled}
                onValueChange={(value) => {
                  setDarkEnabled(value);
                  setThemeMode(value ? 'dark' : 'light');
                }}
                trackColor={{ false: palette.toggleTrack, true: palette.accent }}
                thumbColor={palette.card}
              />
            </View>
          </InteractiveCard>

          <InteractiveCard style={[styles.settingCard, { backgroundColor: palette.card, borderColor: palette.border }]} radius={18}>
            <View style={[styles.settingRow, isArabic && styles.rowReverse]}>
              <View style={[styles.settingLabelWrap, isArabic && styles.rowReverse]}>
                <Ionicons name="globe-outline" size={24} color={palette.textPrimary} />
                <Text style={[styles.settingText, { color: palette.textPrimary }]}>{t.language}</Text>
              </View>
              <View style={[styles.langSwitchWrap, { backgroundColor: palette.cardMuted }]}>
                {(['ar', 'en'] as Language[]).map((lng) => {
                  const active = lng === language;
                  return (
                    <Pressable
                      key={lng}
                      onPress={() => setLanguage(lng)}
                      style={[styles.langButton, { backgroundColor: active ? palette.accent : 'transparent' }]}
                    >
                      <Text style={[styles.langText, { color: active ? '#102247' : palette.textSecondary }]}>
                        {lng === 'en' ? 'English' : '\u0627\u0644\u0639\u0631\u0628\u064a\u0629'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </InteractiveCard>
        </Animated.View>

        <Animated.View
          style={{
            width: '92%',
            opacity: postsOpacity,
            transform: [{ translateY: postsY }],
          }}
        >
          <View style={[styles.postsHeader, isArabic && styles.rightAligned]}>
            <Text style={[styles.postsTitle, { color: palette.textPrimary }]}>{t.myPosts}</Text>
          </View>

          <InteractiveCard style={[styles.postCard, { backgroundColor: palette.card, borderColor: palette.border }]} radius={20}>
            <View style={[styles.postTopRow, isArabic && styles.rowReverse]}>
              <View style={styles.badgeLost}>
                <Text style={styles.badgeLostText}>{t.lost}</Text>
              </View>
              <Text style={[styles.postTime, { color: palette.textSecondary }]}>{t.ago2d}</Text>
            </View>
            <Text style={[styles.postTitle, { color: palette.textPrimary }]}>{t.wallet}</Text>
          </InteractiveCard>

          <InteractiveCard style={[styles.postCard, { backgroundColor: palette.card, borderColor: palette.border }]} radius={20}>
            <View style={[styles.postTopRow, isArabic && styles.rowReverse]}>
              <View style={styles.badgeFound}>
                <Text style={styles.badgeFoundText}>{t.found}</Text>
              </View>
              <Text style={[styles.postTime, { color: palette.textSecondary }]}>{t.ago1w}</Text>
            </View>
            <Text style={[styles.postTitle, { color: palette.textPrimary }]}>{t.keys}</Text>
          </InteractiveCard>
        </Animated.View>

        <Animated.View style={{ width: '92%', opacity: logoutOpacity, transform: [{ translateY: logoutY }] }}>
          <Animated.View style={{ transform: [{ scale: logoutScale }] }}>
            <Pressable
              style={styles.logoutButton}
              onHoverIn={() => {
                Animated.spring(logoutScale, { toValue: 1.02, useNativeDriver: true, tension: 280, friction: 18 }).start();
              }}
              onHoverOut={() => {
                Animated.spring(logoutScale, { toValue: 1, useNativeDriver: true, tension: 280, friction: 18 }).start();
              }}
              onPressIn={() => {
                Animated.spring(logoutScale, { toValue: 0.97, useNativeDriver: true, tension: 320, friction: 18 }).start();
              }}
              onPressOut={() => {
                Animated.spring(logoutScale, { toValue: 1, useNativeDriver: true, tension: 320, friction: 18 }).start();
              }}
            >
              <Ionicons name="log-out-outline" size={22} color="#e11d48" />
              <Text style={styles.logoutText}>{t.logout}</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>

        <View style={{ height: 140 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 62,
  },
  topBarTitle: {
    fontSize: 23,
    fontWeight: '700',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    alignItems: 'center',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  rightAligned: {
    alignItems: 'flex-end',
  },
  interactivePressable: {
    width: '100%',
    overflow: 'hidden',
  },
  card: {
    width: '92%',
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  profileGlow: {
    position: 'absolute',
    top: -36,
    right: -16,
    width: 130,
    height: 130,
    borderRadius: 100,
  },
  profileRowCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 98,
    height: 98,
    borderRadius: 49,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(184, 237, 68, 0.2)',
  },
  avatarText: {
    fontSize: 50,
    fontWeight: '700',
  },
  centerTextWrap: {
    marginTop: 10,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 21,
    fontWeight: '700',
  },
  profileMeta: {
    marginTop: 6,
    fontSize: 11,
  },
  statsRow: {
    width: '92%',
    flexDirection: 'row',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 18,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 10,
  },
  settingsHeader: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  settingsTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  settingCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginHorizontal: 8,
    fontWeight: '500',
  },
  langSwitchWrap: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 3,
  },
  langButton: {
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  langText: {
    fontSize: 16,
    fontWeight: '700',
  },
  postsHeader: {
    width: '100%',
    marginTop: 14,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  postsTitle: {
    fontSize: 19,
    fontWeight: '700',
  },
  postCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  postTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeLost: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f6e7e8',
  },
  badgeLostText: {
    color: '#ea7f89',
    fontWeight: '700',
    fontSize: 10,
  },
  badgeFound: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ecf5d7',
  },
  badgeFoundText: {
    color: '#41621d',
    fontWeight: '700',
    fontSize: 10,
  },
  postTime: {
    fontSize: 10,
  },
  postTitle: {
    marginTop: 12,
    fontSize: 19,
    fontWeight: '500',
  },
  logoutButton: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 15,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f2dbdb',
    borderColor: '#e8b9be',
  },
  logoutText: {
    color: '#e11d48',
    fontSize: 14,
    fontWeight: '700',
  },
});
