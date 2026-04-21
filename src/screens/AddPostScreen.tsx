import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '../components/AmbientBackground';
import { CreatePostCopy } from '../constants/createPostCopy';
import { useProfilePageMotion } from '../hooks/useProfilePageMotion';
import { Palette } from '../types';

type AddPostScreenProps = {
  copy: CreatePostCopy;
  palette: Palette;
  isArabic: boolean;
  onOpenLost: () => void;
  onOpenFound: () => void;
};

export function AddPostScreen({ copy, palette, isArabic, onOpenLost, onOpenFound }: AddPostScreenProps) {
  const { headerAnimatedStyle, getItemAnimatedStyle } = useProfilePageMotion();

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AmbientBackground primary={palette.accent} secondary={palette.accentSoft} tertiary={palette.danger} />

      <Animated.View
        style={[styles.topBar, { backgroundColor: palette.topBar, borderBottomColor: palette.border }, headerAnimatedStyle]}
      >
        <Text style={[styles.topBarTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>{copy.title}</Text>
        <Text style={[styles.topBarSubtitle, { color: palette.textSecondary }, isArabic && styles.textRight]}>
          {copy.subtitle}
        </Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={getItemAnimatedStyle(0)}>
          <View style={[styles.heroCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={[styles.heroHeader, isArabic && styles.rowReverse]}>
              <View style={[styles.heroIconWrap, { backgroundColor: palette.cardMuted }]}>
                <Ionicons name="add-circle-outline" size={24} color={palette.textPrimary} />
              </View>
              <View style={styles.heroCopy}>
                <Text style={[styles.heroTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
                  {copy.chooseTypeTitle}
                </Text>
                <Text style={[styles.heroText, { color: palette.textSecondary }, isArabic && styles.textRight]}>
                  {copy.chooseTypeSubtitle}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={getItemAnimatedStyle(1)}>
          <Pressable style={[styles.routeCard, { backgroundColor: '#FDE7E9', borderColor: '#D95C63' }]} onPress={onOpenLost}>
            <View style={[styles.routeIcon, { backgroundColor: '#D95C63' }]}>
              <Ionicons name="image-outline" size={20} color="#ffffff" />
            </View>
            <View style={styles.routeCopy}>
              <Text style={[styles.routeTitle, { color: '#1D2433' }, isArabic && styles.textRight]}>{copy.lostTitle}</Text>
              <Text style={[styles.routeText, { color: '#495066' }, isArabic && styles.textRight]}>
                {copy.lostRouteDescription}
              </Text>
            </View>
            <Ionicons name={isArabic ? 'chevron-back' : 'chevron-forward'} size={20} color="#D95C63" />
          </Pressable>
        </Animated.View>

        <Animated.View style={getItemAnimatedStyle(2)}>
          <Pressable style={[styles.routeCard, { backgroundColor: '#E9F6DE', borderColor: '#6FAE3C' }]} onPress={onOpenFound}>
            <View style={[styles.routeIcon, { backgroundColor: '#6FAE3C' }]}>
              <Ionicons name="document-text-outline" size={20} color="#ffffff" />
            </View>
            <View style={styles.routeCopy}>
              <Text style={[styles.routeTitle, { color: '#1D2433' }, isArabic && styles.textRight]}>{copy.foundTitle}</Text>
              <Text style={[styles.routeText, { color: '#495066' }, isArabic && styles.textRight]}>
                {copy.foundRouteDescription}
              </Text>
            </View>
            <Ionicons name={isArabic ? 'chevron-back' : 'chevron-forward'} size={20} color="#6FAE3C" />
          </Pressable>
        </Animated.View>

        <Animated.View style={getItemAnimatedStyle(3)}>
          <View style={[styles.hintCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Ionicons name="sparkles-outline" size={20} color={palette.accent} />
            <Text style={[styles.hintText, { color: palette.textPrimary }, isArabic && styles.textRight]}>{copy.aiHint}</Text>
          </View>
        </Animated.View>

        <View style={{ height: 130 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    borderBottomWidth: 1,
    justifyContent: 'center',
    minHeight: 88,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  topBarTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  topBarSubtitle: {
    marginTop: 4,
    fontSize: 13,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
    paddingBottom: 120,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  heroText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 21,
  },
  routeCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  routeIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeCopy: {
    flex: 1,
    gap: 4,
  },
  routeTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  routeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  hintCard: {
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  textRight: {
    textAlign: 'right',
  },
});
