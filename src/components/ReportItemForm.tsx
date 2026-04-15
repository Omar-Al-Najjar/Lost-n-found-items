import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from './AmbientBackground';
import { CreatePostCopy } from '../constants/createPostCopy';
import { FeedPost, Palette } from '../types';

type CategoryOption = FeedPost['category'];

type ReportItemFormProps = {
  variant: 'lost' | 'found';
  copy: CreatePostCopy;
  palette: Palette;
  isArabic: boolean;
  onBack: () => void;
  onSubmitPost: (post: FeedPost) => void;
};

const categories: CategoryOption[] = ['electronics', 'bags', 'documents', 'accessories'];

export function ReportItemForm({
  variant,
  copy,
  palette,
  isArabic,
  onBack,
  onSubmitPost,
}: ReportItemFormProps) {
  const isLost = variant === 'lost';
  const activeColor = isLost ? '#D95C63' : '#6FAE3C';
  const activeSoft = isLost ? '#FDE7E9' : '#E9F6DE';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryOption>('documents');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [hasImage, setHasImage] = useState(false);

  const canSubmit = useMemo(() => {
    const baseReady = Boolean(title.trim() && category && location.trim() && date.trim() && description.trim());
    return isLost ? baseReady && hasImage : baseReady;
  }, [category, date, description, hasImage, isLost, location, title]);

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmitPost({
      id: `post-${Date.now()}`,
      type: variant,
      title: title.trim(),
      category,
      location: location.trim(),
      description: `${description.trim()} ${isArabic ? '• التاريخ:' : '• Date:'} ${date.trim()}`.trim(),
      time: '',
      contactName: isArabic ? 'صاحب البلاغ' : 'Report owner',
    });

    setTitle('');
    setCategory('documents');
    setLocation('');
    setDate('');
    setDescription('');
    setHasImage(false);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AmbientBackground primary={palette.accent} secondary={palette.accentSoft} tertiary={palette.danger} />

      <View style={[styles.topBar, { backgroundColor: palette.topBar, borderBottomColor: palette.border }]}>
        <View style={[styles.topBarRow, isArabic && styles.rowReverse]}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name={isArabic ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.textPrimary} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[styles.topBarTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
              {isLost ? copy.submitLost : copy.submitFound}
            </Text>
            <Text style={[styles.topBarSubtitle, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {isLost ? copy.imageRequiredHint : copy.noImageDescription}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Field
          label={copy.titleField}
          value={title}
          onChangeText={setTitle}
          placeholder={copy.titlePlaceholder}
          palette={palette}
          isArabic={isArabic}
        />

        <Text style={[styles.fieldLabel, { color: palette.textPrimary }, isArabic && styles.textRight]}>
          {copy.categoryField}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.categoryRow, isArabic && styles.rowReverse]}
        >
          {categories.map((item) => {
            const active = category === item;
            const label =
              item === 'electronics'
                ? copy.electronics
                : item === 'bags'
                  ? copy.bags
                  : item === 'documents'
                    ? copy.documents
                    : copy.accessories;

            return (
              <Pressable
                key={item}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: active ? activeColor : palette.card,
                    borderColor: active ? activeColor : palette.border,
                  },
                ]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.categoryText, { color: active ? '#ffffff' : palette.textPrimary }]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Field
          label={copy.locationField}
          value={location}
          onChangeText={setLocation}
          placeholder={copy.locationPlaceholder}
          palette={palette}
          isArabic={isArabic}
        />

        <Field
          label={copy.dateField}
          value={date}
          onChangeText={setDate}
          placeholder={copy.datePlaceholder}
          palette={palette}
          isArabic={isArabic}
        />

        <Field
          label={copy.descriptionField}
          value={description}
          onChangeText={setDescription}
          placeholder={copy.descriptionPlaceholder}
          palette={palette}
          isArabic={isArabic}
          multiline
        />

        {isLost ? (
          <Pressable
            style={[styles.imageButton, { backgroundColor: palette.card, borderColor: activeColor }]}
            onPress={() => setHasImage((value) => !value)}
          >
            <View style={[styles.imageIconWrap, { backgroundColor: activeSoft }]}>
              <Ionicons name={hasImage ? 'checkmark-circle' : 'image-outline'} size={20} color={activeColor} />
            </View>
            <View style={styles.imageCopy}>
              <Text style={[styles.imageButtonText, { color: palette.textPrimary }, isArabic && styles.textRight]}>
                {hasImage ? copy.imageAdded : copy.imageAllowed}
              </Text>
              <Text style={[styles.imageHint, { color: palette.textSecondary }, isArabic && styles.textRight]}>
                {copy.imageRequiredHint}
              </Text>
            </View>
          </Pressable>
        ) : null}

        <View style={[styles.hintCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Ionicons name="sparkles-outline" size={20} color={activeColor} />
          <Text style={[styles.hintText, { color: palette.textPrimary }, isArabic && styles.textRight]}>
            {copy.aiHint}
          </Text>
        </View>

        <Pressable
          style={[
            styles.submitButton,
            {
              backgroundColor: activeColor,
              opacity: canSubmit ? 1 : 0.55,
            },
          ]}
          disabled={!canSubmit}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>{isLost ? copy.submitLost : copy.submitFound}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  palette: Palette;
  isArabic: boolean;
  multiline?: boolean;
};

function Field({ label, value, onChangeText, placeholder, palette, isArabic, multiline }: FieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: palette.textPrimary }, isArabic && styles.textRight]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.textSecondary}
        multiline={multiline}
        style={[
          styles.fieldInput,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
            color: palette.textPrimary,
            textAlign: isArabic ? 'right' : 'left',
            minHeight: multiline ? 120 : 58,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    borderBottomWidth: 1,
    minHeight: 88,
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
  headerCopy: {
    flex: 1,
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
  fieldWrap: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '800',
  },
  imageButton: {
    borderWidth: 1,
    borderRadius: 20,
    minHeight: 74,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCopy: {
    flex: 1,
    gap: 3,
  },
  imageButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  imageHint: {
    fontSize: 13,
    lineHeight: 19,
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
  submitButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  textRight: {
    textAlign: 'right',
  },
});
