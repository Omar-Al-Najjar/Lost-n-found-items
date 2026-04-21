import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { AmbientBackground } from '../components/AmbientBackground';
import { AccountCopy } from '../constants/accountCopy';
import { darkPalette } from '../theme';
import { Language, Palette, ThemeMode } from '../types';

type ProfileScreenProps = {
  t: any;
  copy: AccountCopy;
  palette: Palette;
  isArabic: boolean;
  userDisplayName: string;
  userEmail: string;
  userAvatarUrl?: string | null;
  darkEnabled: boolean;
  setDarkEnabled: (value: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeChatsCount: number;
  myReportsCount: number;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenMyReports: () => void;
  isUpdatingAvatar?: boolean;
  onEditAvatar: () => void;
  onLogout: () => void;
};

export function ProfileScreen({
  t,
  copy,
  palette,
  isArabic,
  userDisplayName,
  userEmail,
  userAvatarUrl,
  darkEnabled,
  setDarkEnabled,
  setThemeMode,
  language,
  setLanguage,
  activeChatsCount,
  myReportsCount,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenMyReports,
  isUpdatingAvatar = false,
  onEditAvatar,
  onLogout,
}: ProfileScreenProps) {
  const isDark = palette.bg === darkPalette.bg;
  const accentInk = isDark ? palette.bg : '#102247';
  const heroBackground = isDark ? palette.surfaceAlt : palette.textPrimary;
  const heroBorderColor = isDark ? palette.border : 'transparent';
  const heroEyebrowColor = palette.accent;
  const heroTitleColor = isDark ? palette.textPrimary : '#ffffff';
  const heroSubtitleColor = isDark ? palette.textSecondary : '#dfe8c9';
  const languageSwitcherBackground = isDark ? palette.surfaceAlt : palette.cardMuted;
  const shortcutIconBackground = isDark ? palette.surfaceAlt : palette.cardMuted;
  const reportsPillBackground = isDark ? palette.surfaceAlt : palette.textPrimary;
  const reportsPillTextColor = isDark ? palette.textPrimary : palette.accentStrong;
  const shortcutLinkColor = isDark ? palette.accent : palette.accentSoft;
  const logoutBackground = isDark ? palette.dangerSoft : '#f2dbdb';
  const logoutBorderColor = isDark ? palette.border : '#e8b9be';
  const headerY = useRef(new Animated.Value(-70)).current;
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

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 180,
        friction: 20,
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
    headerY,
    logoutOpacity,
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
      <AmbientBackground primary={palette.accent} secondary={palette.accentSoft} tertiary={palette.danger} />

      <Animated.View
        style={[
          styles.topBar,
          { backgroundColor: palette.topBar, borderBottomColor: palette.border, transform: [{ translateY: headerY }] },
        ]}
      >
        <Text style={[styles.topBarTitle, { color: palette.textPrimary }]}>{t.profile}</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.heroBanner,
            {
              width: '92%',
              backgroundColor: heroBackground,
              borderColor: heroBorderColor,
              borderWidth: isDark ? 1 : 0,
              opacity: profileOpacity,
              transform: [{ translateY: profileY }],
            },
          ]}
        >
          <Text style={[styles.heroEyebrow, { color: heroEyebrowColor }]}>{t.profile}</Text>
          <Text style={[styles.heroTitle, { color: heroTitleColor }]}>{userDisplayName}</Text>
          <Text style={[styles.heroSubtitle, { color: heroSubtitleColor }]}>{copy.shortcutsTitle}</Text>
        </Animated.View>

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
                {userAvatarUrl ? (
                  <Image source={{ uri: userAvatarUrl }} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <>
                    <View style={styles.avatarOverlay} />
                    <Text style={[styles.avatarText, { color: palette.accentStrong }]}>
                      {userDisplayName.charAt(0).toUpperCase()}
                    </Text>
                  </>
                )}
              </View>
            </Animated.View>

            <View style={styles.centerTextWrap}>
              <Text style={[styles.profileName, { color: palette.textPrimary }]}>{userDisplayName}</Text>
              <Text style={[styles.profileMeta, { color: palette.textSecondary }]}>{userEmail}</Text>
            </View>
            <Pressable
              style={[styles.avatarEditButton, { borderColor: palette.border, backgroundColor: palette.surfaceAlt }]}
              onPress={onEditAvatar}
              disabled={isUpdatingAvatar}
            >
              <Ionicons name="camera-outline" size={16} color={palette.textPrimary} />
              <Text style={[styles.avatarEditText, { color: palette.textPrimary }]}>
                {isUpdatingAvatar
                  ? isArabic
                    ? 'جارٍ التحديث...'
                    : 'Updating...'
                  : isArabic
                    ? 'تعديل الصورة'
                    : 'Edit photo'}
              </Text>
            </Pressable>
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
            <View style={[styles.statCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <Animated.Text style={[styles.statValue, { color: palette.accent, transform: [{ scale: countPulse }] }]}>
                {activeChatsCount}
              </Animated.Text>
              <Text style={[styles.statLabel, { color: palette.textSecondary }]}>{t.activeChats}</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              flex: 1,
              opacity: statRightOpacity,
              transform: [{ translateX: statRightX }],
            }}
          >
            <View style={[styles.statCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <Animated.Text style={[styles.statValue, { color: palette.accent, transform: [{ scale: countPulse }] }]}>
                {myReportsCount}
              </Animated.Text>
              <Text style={[styles.statLabel, { color: palette.textSecondary }]}>{copy.myReportsTitle}</Text>
            </View>
          </Animated.View>
        </View>

        <Animated.View style={{ width: '92%', opacity: sectionOpacity, transform: [{ translateY: sectionY }] }}>
          <View style={[styles.settingsHeader, isArabic && styles.rightAligned]}>
            <View style={[styles.settingsTitleWrap, isArabic && styles.rowReverse]}>
              <Ionicons name="settings-outline" size={24} color={palette.textPrimary} />
              <Text style={[styles.settingsTitle, { color: palette.textPrimary }]}>{t.settings}</Text>
            </View>
          </View>

          <View style={[styles.settingCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
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
                thumbColor={darkEnabled ? palette.topBar : palette.card}
              />
            </View>
          </View>

          <View style={[styles.settingCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={[styles.settingRow, isArabic && styles.rowReverse]}>
              <View style={[styles.settingLabelWrap, isArabic && styles.rowReverse]}>
                <Ionicons name="globe-outline" size={24} color={palette.textPrimary} />
                <Text style={[styles.settingText, { color: palette.textPrimary }]}>{t.language}</Text>
              </View>
              <View style={[styles.langSwitchWrap, { backgroundColor: languageSwitcherBackground }]}>
                {(['ar', 'en'] as Language[]).map((lng) => {
                  const active = lng === language;
                  return (
                    <Pressable
                      key={lng}
                      onPress={() => setLanguage(lng)}
                      style={[styles.langButton, { backgroundColor: active ? palette.accent : 'transparent' }]}
                    >
                      <Text style={[styles.langText, { color: active ? accentInk : palette.textSecondary }]}>
                        {lng === 'en' ? 'English' : '\u0627\u0644\u0639\u0631\u0628\u064a\u0629'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={{
            width: '92%',
            opacity: postsOpacity,
            transform: [{ translateY: postsY }],
          }}
        >
          <View style={[styles.postsHeader, isArabic && styles.rightAligned]}>
            <Text style={[styles.postsTitle, { color: palette.textPrimary }]}>{copy.shortcutsTitle}</Text>
          </View>

          <Pressable
            style={[styles.shortcutCard, { backgroundColor: palette.card, borderColor: palette.border }]}
            onPress={onOpenNotifications}
          >
            <View style={[styles.shortcutTopRow, isArabic && styles.rowReverse]}>
              <View style={[styles.shortcutIconWrap, { backgroundColor: shortcutIconBackground }]}>
                <Ionicons name="notifications-outline" size={22} color={palette.textPrimary} />
              </View>
              <View style={[styles.shortcutCountPill, { backgroundColor: palette.accent }]}>
                <Text style={[styles.shortcutCountText, { color: accentInk }]}>
                  {unreadNotificationsCount} {copy.unreadCountLabel}
                </Text>
              </View>
            </View>
            <Text style={[styles.postTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
              {copy.notificationsShortcutTitle}
            </Text>
            <Text style={[styles.postDescription, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {copy.notificationsShortcutDescription}
            </Text>
            <View style={[styles.shortcutFooter, isArabic && styles.rowReverse]}>
              <Text style={[styles.shortcutMeta, { color: palette.textSecondary }]}>
                {unreadNotificationsCount} {copy.unreadCountLabel}
              </Text>
              <Text style={[styles.shortcutLink, { color: shortcutLinkColor }]}>{copy.openShortcut}</Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.shortcutCard, { backgroundColor: palette.card, borderColor: palette.border }]}
            onPress={onOpenMyReports}
          >
            <View style={[styles.shortcutTopRow, isArabic && styles.rowReverse]}>
              <View style={[styles.shortcutIconWrap, { backgroundColor: shortcutIconBackground }]}>
                <Ionicons name="folder-open-outline" size={22} color={palette.textPrimary} />
              </View>
              <View style={[styles.shortcutCountPill, { backgroundColor: reportsPillBackground }]}>
                <Text style={[styles.shortcutCountText, { color: reportsPillTextColor }]}>
                  {myReportsCount} {copy.reportsCountLabel}
                </Text>
              </View>
            </View>
            <Text style={[styles.postTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
              {copy.myReportsShortcutTitle}
            </Text>
            <Text style={[styles.postDescription, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {copy.myReportsShortcutDescription}
            </Text>
            <View style={[styles.shortcutFooter, isArabic && styles.rowReverse]}>
              <Text style={[styles.shortcutMeta, { color: palette.textSecondary }]}>
                {myReportsCount} {copy.reportsCountLabel}
              </Text>
              <Text style={[styles.shortcutLink, { color: shortcutLinkColor }]}>{copy.openShortcut}</Text>
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View style={{ width: '92%', opacity: logoutOpacity, transform: [{ translateY: logoutY }] }}>
          <Pressable
            style={[
              styles.logoutButton,
              {
                backgroundColor: logoutBackground,
                borderColor: logoutBorderColor,
              },
            ]}
            onPress={onLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#e11d48" />
            <Text style={styles.logoutText}>{t.logout}</Text>
          </Pressable>
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
    minHeight: 72,
    paddingVertical: 12,
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
  textRight: {
    textAlign: 'right',
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
  heroBanner: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    marginTop: 4,
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
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 50,
    fontWeight: '700',
  },
  avatarEditButton: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 999,
    minHeight: 34,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarEditText: {
    fontSize: 13,
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
  shortcutCard: {
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
  shortcutTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shortcutIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutCountPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  shortcutCountText: {
    fontSize: 11,
    fontWeight: '800',
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
    fontSize: 19,
    fontWeight: '700',
  },
  postDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
  shortcutFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shortcutMeta: {
    fontSize: 12,
  },
  shortcutLink: {
    fontSize: 13,
    fontWeight: '800',
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
  },
  logoutText: {
    color: '#e11d48',
    fontSize: 14,
    fontWeight: '700',
  },
});
