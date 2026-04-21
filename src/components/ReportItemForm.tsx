import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from './AmbientBackground';
import { CreatePostCopy } from '../constants/createPostCopy';
import { FeedPost, Palette, SelectedImage } from '../types';

type ReportItemFormProps = {
  copy: CreatePostCopy;
  palette: Palette;
  isArabic: boolean;
  variant: 'lost' | 'found';
  requireImage?: boolean;
  submitLabel?: string;
  onBack: () => void;
  onSubmitPost: (post: FeedPost) => void;
};

const categories: FeedPost['category'][] = ['electronics', 'bags', 'documents', 'accessories'];

export function ReportItemForm({
  copy,
  palette,
  isArabic,
  variant,
  requireImage = false,
  submitLabel,
  onBack,
  onSubmitPost,
}: ReportItemFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FeedPost['category']>('electronics');
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  const isLost = variant === 'lost';
  const accentColor = isLost ? palette.danger : palette.accent;
  const accentSoft = isLost ? palette.dangerSoft : palette.accentSoft;

  const categoryLabels = useMemo(
    () => ({
      electronics: copy.electronics,
      bags: copy.bags,
      documents: copy.documents,
      accessories: copy.accessories,
    }),
    [copy]
  );

  const canSubmit =
    (isLost ? title.trim().length > 0 : true) &&
    description.trim().length > 0 &&
    location.trim().length > 0 &&
    selectedCategory.length > 0 &&
    (!requireImage || Boolean(selectedImage));

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(requireImage ? copy.foundImageRequiredTitle : copy.noImageTitle, copy.imageMissingError);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (result.canceled || !result.assets.length) {
        return;
      }

      const asset = result.assets[0];
      setSelectedImage({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
      });
    } catch {
      Alert.alert(requireImage ? copy.foundImageRequiredTitle : copy.noImageTitle, copy.imageMissingError);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      if (requireImage && !selectedImage) {
        Alert.alert(copy.foundImageRequiredTitle, copy.foundImageRequiredDescription);
      }
      return;
    }

    onSubmitPost({
      id: Date.now().toString(),
      type: variant,
      title: title.trim() || (isLost ? '' : description.trim().slice(0, 60)),
      description: description.trim(),
      location: location.trim(),
      category: selectedCategory,
      time: '',
      contactName: '',
      image: selectedImage,
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AmbientBackground primary={accentColor} secondary={accentSoft} tertiary={palette.accent} />

      <View style={[styles.topBar, { backgroundColor: palette.topBar, borderBottomColor: palette.border }]}>
        <View style={[styles.topBarRow, isArabic && styles.rowReverse]}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name={isArabic ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.textPrimary} />
          </Pressable>

          <View style={styles.topBarCopy}>
            <Text style={[styles.topBarTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
              {isLost ? copy.lostTitle : copy.foundTitle}
            </Text>
            <Text style={[styles.topBarSubtitle, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {copy.subtitle}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
            {copy.titleField}
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={copy.titlePlaceholder}
            placeholderTextColor={palette.textSecondary}
            style={[
              styles.input,
              { color: palette.textPrimary, borderColor: palette.border, textAlign: isArabic ? 'right' : 'left' },
            ]}
          />

          <Text style={[styles.sectionTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
            {copy.descriptionField}
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={copy.descriptionPlaceholder}
            placeholderTextColor={palette.textSecondary}
            multiline
            style={[
              styles.textArea,
              { color: palette.textPrimary, borderColor: palette.border, textAlign: isArabic ? 'right' : 'left' },
            ]}
          />

          <Text style={[styles.sectionTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
            {copy.locationField}
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder={copy.locationPlaceholder}
            placeholderTextColor={palette.textSecondary}
            style={[
              styles.input,
              { color: palette.textPrimary, borderColor: palette.border, textAlign: isArabic ? 'right' : 'left' },
            ]}
          />

          <Text style={[styles.sectionTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
            {copy.categoryField}
          </Text>
          <View style={styles.chipsWrap}>
            {categories.map((category) => {
              const active = selectedCategory === category;
              return (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? accentColor : palette.surfaceAlt,
                      borderColor: active ? accentColor : palette.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? '#ffffff' : palette.textPrimary }]}>
                    {categoryLabels[category]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.imageCard, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}>
            <View style={[styles.imageHeader, isArabic && styles.rowReverse]}>
              <View style={styles.imageHeaderText}>
                <Text style={[styles.sectionTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
                  {requireImage ? copy.foundImageRequiredTitle : copy.imageAllowed}
                </Text>
                <Text style={[styles.imageHint, { color: palette.textSecondary }, isArabic && styles.textRight]}>
                  {requireImage ? copy.foundImageRequiredDescription : copy.noImageDescription}
                </Text>
              </View>
              <Pressable
                onPress={pickImage}
                style={[styles.imageButton, { backgroundColor: accentColor }]}
              >
                <Ionicons name="image-outline" size={18} color="#ffffff" />
                <Text style={styles.imageButtonText}>{selectedImage ? copy.imageAdded : copy.imageAllowed}</Text>
              </Pressable>
            </View>

            {selectedImage ? (
              <View style={styles.previewWrap}>
                <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} resizeMode="cover" />
                <Pressable
                  onPress={() => setSelectedImage(null)}
                  style={[styles.removeImageButton, { backgroundColor: palette.card }]}
                >
                  <Ionicons name="close-outline" size={18} color={palette.textPrimary} />
                </Pressable>
              </View>
            ) : null}
          </View>

          <Text style={[styles.aiHint, { color: palette.textSecondary }, isArabic && styles.textRight]}>
            {requireImage ? copy.imageRequiredHint : copy.aiHint}
          </Text>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={[
            styles.submitButton,
            {
              backgroundColor: accentColor,
              opacity: canSubmit ? 1 : 0.45,
            },
          ]}
        >
          <Text style={styles.submitButtonText}>{submitLabel || (isLost ? copy.submitLost : copy.submitFound)}</Text>
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
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
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
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  imageCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  imageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageHeaderText: {
    flex: 1,
    gap: 4,
  },
  imageHint: {
    fontSize: 13,
    lineHeight: 20,
  },
  imageButton: {
    minHeight: 40,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imageButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  previewWrap: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 18,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiHint: {
    fontSize: 13,
    lineHeight: 20,
  },
  submitButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  textRight: {
    textAlign: 'right',
  },
});
