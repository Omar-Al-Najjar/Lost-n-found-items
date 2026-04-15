import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '../components/AmbientBackground';
import { CreatePostCopy } from '../constants/createPostCopy';
import { Palette } from '../types';

type CreatePostFlowScreenProps = {
  copy: CreatePostCopy;
  palette: Palette;
  isArabic: boolean;
  onOpenLost: () => void;
  onOpenFound: () => void;
};

export function CreatePostFlowScreen({ copy, palette, isArabic, onOpenLost, onOpenFound }: CreatePostFlowScreenProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AmbientBackground primary={palette.accent} secondary={palette.accentSoft} tertiary={palette.danger} />

      <View style={[styles.topBar, { backgroundColor: palette.topBar, borderBottomColor: palette.border }]}>
        <Text style={[styles.topBarTitle, { color: palette.textPrimary }]}>{copy.title}</Text>
        <Text style={[styles.topBarSubtitle, { color: palette.textSecondary }]}>{copy.subtitle}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.introCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.statusTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
            {copy.chooseTypeTitle}
          </Text>
          <Text style={[styles.statusText, { color: palette.textSecondary }, isArabic && styles.textRight]}>
            {copy.chooseTypeSubtitle}
          </Text>
        </View>

        <Pressable
          style={[styles.routeCard, { backgroundColor: '#FDE7E9', borderColor: '#D95C63' }]}
          onPress={onOpenLost}
        >
          <View style={[styles.statusIcon, { backgroundColor: '#D95C63' }]}>
            <Ionicons name="image-outline" size={20} color="#ffffff" />
          </View>
          <View style={styles.statusCopy}>
            <Text style={[styles.statusTitle, { color: '#1D2433' }, isArabic && styles.textRight]}>{copy.lostTitle}</Text>
            <Text style={[styles.statusText, { color: '#495066' }, isArabic && styles.textRight]}>
              {copy.lostRouteDescription}
            </Text>
          </View>
          <Ionicons name={isArabic ? 'chevron-back' : 'chevron-forward'} size={20} color="#D95C63" />
        </Pressable>

        <Pressable
          style={[styles.routeCard, { backgroundColor: '#E9F6DE', borderColor: '#6FAE3C' }]}
          onPress={onOpenFound}
        >
          <View style={[styles.statusIcon, { backgroundColor: '#6FAE3C' }]}>
            <Ionicons name="document-text-outline" size={20} color="#ffffff" />
          </View>
          <View style={styles.statusCopy}>
            <Text style={[styles.statusTitle, { color: '#1D2433' }, isArabic && styles.textRight]}>{copy.foundTitle}</Text>
            <Text style={[styles.statusText, { color: '#495066' }, isArabic && styles.textRight]}>
              {copy.foundRouteDescription}
            </Text>
          </View>
          <Ionicons name={isArabic ? 'chevron-back' : 'chevron-forward'} size={20} color="#6FAE3C" />
        </Pressable>

        <View style={[styles.hintCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Ionicons name="sparkles-outline" size={20} color={palette.accent} />
          <Text style={[styles.hintText, { color: palette.textPrimary }, isArabic && styles.textRight]}>{copy.aiHint}</Text>
        </View>

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
  introCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 6,
  },
  routeCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCopy: {
    flex: 1,
    gap: 4,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  statusText: {
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
