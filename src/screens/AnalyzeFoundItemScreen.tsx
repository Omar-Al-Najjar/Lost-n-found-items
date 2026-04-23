import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Animated, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AmbientBackground } from '../components/AmbientBackground';
import { CreatePostCopy } from '../constants/createPostCopy';
import { useProfilePageMotion } from '../hooks/useProfilePageMotion';
import { FeedPost, Palette, SelectedImage } from '../types';

const categories: FeedPost['category'][] = ['electronics', 'bags', 'documents', 'accessories', 'other'];

type AnalyzeFoundItemScreenProps = {
  copy: CreatePostCopy;
  palette: Palette;
  isArabic: boolean;
  isAnalyzing: boolean;
  onBack: () => void;
  onAnalyze: (payload: {
    image: SelectedImage;
    description: string;
    location: string;
    category: FeedPost['category'];
  }) => void;
};

export function AnalyzeFoundItemScreen({
  copy,
  palette,
  isArabic,
  isAnalyzing,
  onBack,
  onAnalyze,
}: AnalyzeFoundItemScreenProps) {
  const { headerAnimatedStyle, getItemAnimatedStyle } = useProfilePageMotion();
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FeedPost['category']>('electronics');

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(copy.foundImageRequiredTitle, copy.foundImageRequiredDescription);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
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
      Alert.alert(copy.foundImageRequiredTitle, copy.imageMissingError);
    }
  };

  const handleAnalyze = () => {
    if (!selectedImage || isAnalyzing) return;
    onAnalyze({
      image: selectedImage,
      description: description.trim(),
      location: location.trim(),
      category: selectedCategory,
    });
  };

  const canAnalyze = Boolean(selectedImage && description.trim() && location.trim() && !isAnalyzing);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AmbientBackground primary={palette.accent} secondary={palette.accentSoft} tertiary={palette.danger} />

      <Animated.View
        style={[styles.topBar, { backgroundColor: palette.topBar, borderBottomColor: palette.border }, headerAnimatedStyle]}
      >
        <View style={[styles.topBarRow, isArabic && styles.rowReverse]}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name={isArabic ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.textPrimary} />
          </Pressable>

          <View style={styles.topBarCopy}>
            <Text style={[styles.topBarTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
              {copy.analyzeFound}
            </Text>
            <Text style={[styles.topBarSubtitle, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {copy.foundImageRequiredDescription}
            </Text>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={getItemAnimatedStyle(0)}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
            {copy.foundImageRequiredTitle}
          </Text>
          <Text style={[styles.sectionHint, { color: palette.textSecondary }, isArabic && styles.textRight]}>
            {copy.foundImageRequiredDescription}
          </Text>

          <Pressable style={[styles.imageButton, { backgroundColor: palette.accent }]} onPress={pickImage}>
            <Ionicons name="image-outline" size={18} color="#ffffff" />
            <Text style={styles.imageButtonText}>{selectedImage ? copy.imageAdded : copy.imageAllowed}</Text>
          </Pressable>

          {selectedImage ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} resizeMode="cover" />
              <Pressable onPress={() => setSelectedImage(null)} style={[styles.removeImageButton, { backgroundColor: palette.card }]}>
                <Ionicons name="close-outline" size={18} color={palette.textPrimary} />
              </Pressable>
            </View>
          ) : null}

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
              {
                color: palette.textPrimary,
                borderColor: palette.border,
                textAlign: isArabic ? 'right' : 'left',
                writingDirection: isArabic ? 'rtl' : 'ltr',
              },
            ]}
            keyboardType="default"
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
              {
                color: palette.textPrimary,
                borderColor: palette.border,
                textAlign: isArabic ? 'right' : 'left',
                writingDirection: isArabic ? 'rtl' : 'ltr',
              },
            ]}
            keyboardType="default"
          />

          <Text style={[styles.sectionTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
            {copy.categoryField}
          </Text>
          <View style={styles.chipsWrap}>
            {categories.map((category) => {
              const active = selectedCategory === category;
              const label =
                category === 'electronics'
                  ? copy.electronics
                  : category === 'bags'
                    ? copy.bags
                    : category === 'documents'
                      ? copy.documents
                      : category === 'accessories'
                        ? copy.accessories
                        : copy.other;
              return (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? palette.accent : palette.surfaceAlt,
                      borderColor: active ? palette.accent : palette.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? '#ffffff' : palette.textPrimary }]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={handleAnalyze}
          disabled={!canAnalyze}
          style={[
            styles.submitButton,
            {
              backgroundColor: palette.accent,
              opacity: canAnalyze ? 1 : 0.45,
            },
          ]}
        >
          <Text style={styles.submitButtonText}>{isAnalyzing ? copy.analyzeFoundLoading : copy.analyzeFound}</Text>
        </Pressable>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>
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
  sectionHint: {
    fontSize: 13,
    lineHeight: 20,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textArea: {
    minHeight: 110,
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
  imageButton: {
    minHeight: 40,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  imageButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  previewWrap: {
    marginTop: 6,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 16,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#102247',
    fontSize: 15,
    fontWeight: '800',
  },
  textRight: {
    textAlign: 'right',
  },
});
