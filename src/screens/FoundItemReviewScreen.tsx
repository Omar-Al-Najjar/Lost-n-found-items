import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '../components/AmbientBackground';
import { CreatePostCopy } from '../constants/createPostCopy';
import { AiFoundAnalysisDraft, FeedPost, Palette } from '../types';

type FoundItemReviewScreenProps = {
  copy: CreatePostCopy;
  palette: Palette;
  isArabic: boolean;
  draft: AiFoundAnalysisDraft;
  onBack: () => void;
  onPublish: (payload: { title: string; description: string; category: FeedPost['category']; aiDraft: AiFoundAnalysisDraft }) => void;
};

export function FoundItemReviewScreen({
  copy,
  palette,
  isArabic,
  draft,
  onBack,
  onPublish,
}: FoundItemReviewScreenProps) {
  const [title, setTitle] = useState(draft.analysis.title);
  const [summary, setSummary] = useState(draft.analysis.summary);
  const [brand, setBrand] = useState(draft.analysis.brand === 'Unknown' ? '' : draft.analysis.brand);
  const [color, setColor] = useState(draft.analysis.primaryColor === 'Unknown' ? '' : draft.analysis.primaryColor);
  const [material, setMaterial] = useState(draft.analysis.material === 'Unknown' ? '' : draft.analysis.material);
  const [features, setFeatures] = useState(draft.analysis.distinctiveFeatures.join(', '));

  const canPublish = title.trim().length > 0 && summary.trim().length > 0;

  const handlePublish = () => {
    if (!canPublish) return;

    onPublish({
      title: title.trim(),
      description: summary.trim(),
      category: draft.analysis.category,
      aiDraft: {
        ...draft,
        analysis: {
          ...draft.analysis,
          title: title.trim(),
          summary: summary.trim(),
          brand: brand.trim() || 'Unknown',
          primaryColor: color.trim() || 'Unknown',
          material: material.trim() || 'Unknown',
          distinctiveFeatures: features
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        },
      },
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AmbientBackground primary={palette.accent} secondary={palette.accentSoft} tertiary={palette.danger} />

      <View style={[styles.topBar, { backgroundColor: palette.topBar, borderBottomColor: palette.border }]}>
        <View style={[styles.topBarRow, isArabic && styles.rowReverse]}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name={isArabic ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.textPrimary} />
          </Pressable>
          <View style={styles.topBarCopy}>
            <Text style={[styles.topBarTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>{copy.reviewTitle}</Text>
            <Text style={[styles.topBarSubtitle, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {copy.reviewSubtitle}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.previewCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Image source={{ uri: draft.image.uri }} style={styles.previewImage} resizeMode="cover" />
          <View style={[styles.hintPill, { backgroundColor: palette.surfaceAlt }]}>
            <Ionicons name="sparkles-outline" size={16} color={palette.accent} />
            <Text style={[styles.hintText, { color: palette.textPrimary }, isArabic && styles.textRight]}>{draft.analysis.reviewHint}</Text>
          </View>
        </View>

        <View style={[styles.formCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>{copy.aiSuggestedTitle}</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { color: palette.textPrimary, borderColor: palette.border, textAlign: isArabic ? 'right' : 'left' }]}
            placeholder={copy.aiSuggestedTitle}
            placeholderTextColor={palette.textSecondary}
          />

          <Text style={[styles.sectionTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>{copy.aiSuggestedSummary}</Text>
          <TextInput
            value={summary}
            onChangeText={setSummary}
            multiline
            style={[styles.textArea, { color: palette.textPrimary, borderColor: palette.border, textAlign: isArabic ? 'right' : 'left' }]}
            placeholder={copy.aiSuggestedSummary}
            placeholderTextColor={palette.textSecondary}
          />

          <Text style={[styles.sectionTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>{copy.aiSuggestedBrand}</Text>
          <TextInput
            value={brand}
            onChangeText={setBrand}
            style={[styles.input, { color: palette.textPrimary, borderColor: palette.border, textAlign: isArabic ? 'right' : 'left' }]}
            placeholder={copy.aiSuggestedBrand}
            placeholderTextColor={palette.textSecondary}
          />

          <View style={styles.rowGroup}>
            <View style={styles.rowItem}>
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>{copy.aiSuggestedColor}</Text>
              <TextInput
                value={color}
                onChangeText={setColor}
                style={[styles.input, { color: palette.textPrimary, borderColor: palette.border, textAlign: isArabic ? 'right' : 'left' }]}
                placeholder={copy.aiSuggestedColor}
                placeholderTextColor={palette.textSecondary}
              />
            </View>
            <View style={styles.rowItem}>
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>{copy.aiSuggestedMaterial}</Text>
              <TextInput
                value={material}
                onChangeText={setMaterial}
                style={[styles.input, { color: palette.textPrimary, borderColor: palette.border, textAlign: isArabic ? 'right' : 'left' }]}
                placeholder={copy.aiSuggestedMaterial}
                placeholderTextColor={palette.textSecondary}
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>{copy.aiSuggestedFeatures}</Text>
          <TextInput
            value={features}
            onChangeText={setFeatures}
            style={[styles.input, { color: palette.textPrimary, borderColor: palette.border, textAlign: isArabic ? 'right' : 'left' }]}
            placeholder={copy.aiSuggestedFeatures}
            placeholderTextColor={palette.textSecondary}
          />
        </View>

        <Pressable
          style={[styles.publishButton, { backgroundColor: palette.accent, opacity: canPublish ? 1 : 0.45 }]}
          onPress={handlePublish}
          disabled={!canPublish}
        >
          <Text style={styles.publishButtonText}>{copy.publishReviewedFound}</Text>
        </Pressable>

        <View style={{ height: 120 }} />
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
    minHeight: 84,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCopy: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  topBarSubtitle: {
    marginTop: 4,
    fontSize: 13,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
    paddingBottom: 120,
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
  },
  hintPill: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
    gap: 12,
  },
  publishButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishButtonText: {
    color: '#102247',
    fontSize: 15,
    fontWeight: '800',
  },
  textRight: {
    textAlign: 'right',
  },
});
