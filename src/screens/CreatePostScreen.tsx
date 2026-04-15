import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AmbientBackground } from '../components/AmbientBackground';
import { FeedPost, Palette } from '../types';

type CreatePostScreenProps = {
  t: any;
  palette: Palette;
  isArabic: boolean;
  onSubmitPost: (post: FeedPost) => void;
};

export function CreatePostScreen({ t, palette, isArabic, onSubmitPost }: CreatePostScreenProps) {
  const [postType, setPostType] = useState<'lost' | 'found'>('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [hasImage, setHasImage] = useState(false);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return;

    onSubmitPost({
      id: `post-${Date.now()}`,
      type: postType,
      title: title.trim(),
      description: description.trim(),
      location: location.trim() || 'Amman',
      category: postType === 'lost' ? 'documents' : 'accessories',
      time: t.postSuccess,
      contactName: t.fullName,
    });

    setTitle('');
    setDescription('');
    setLocation('');
    setHasImage(false);
  };

  return (
    <>
      <AmbientBackground primary={palette.accent} secondary={palette.accentSoft} tertiary={palette.danger} />

      <View style={[styles.topBar, { backgroundColor: palette.topBar, borderBottomColor: palette.border }]}>
        <Text style={[styles.topBarTitle, { color: palette.textPrimary }]}>{t.addPostTitle}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.toggleWrap, { backgroundColor: palette.card, borderColor: palette.border }]}>
          {([
            ['lost', t.lostItem],
            ['found', t.foundItem],
          ] as const).map(([key, label]) => {
            const active = postType === key;
            return (
              <Pressable
                key={key}
                style={[
                  styles.toggleButton,
                  { backgroundColor: active ? (key === 'lost' ? palette.danger : palette.accent) : 'transparent' },
                ]}
                onPress={() => setPostType(key)}
              >
                <Text style={[styles.toggleText, { color: active ? '#102247' : palette.textPrimary }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Field
          label={isArabic ? 'العنوان' : 'Title'}
          value={title}
          onChangeText={setTitle}
          placeholder={isArabic ? 'مثال: محفظة جلدية سوداء' : 'Example: Black leather wallet'}
          palette={palette}
          isArabic={isArabic}
        />
        <Field
          label={t.description}
          value={description}
          onChangeText={setDescription}
          placeholder={t.descriptionPlaceholder}
          palette={palette}
          isArabic={isArabic}
          multiline
        />
        <Field
          label={t.location}
          value={location}
          onChangeText={setLocation}
          placeholder={t.locationPlaceholder}
          palette={palette}
          isArabic={isArabic}
        />

        <Pressable
          style={[styles.imageButton, { backgroundColor: palette.card, borderColor: palette.border }]}
          onPress={() => setHasImage((value) => !value)}
        >
          <Ionicons name={hasImage ? 'checkmark-circle' : 'image-outline'} size={20} color={palette.accent} />
          <Text style={[styles.imageButtonText, { color: palette.textPrimary }]}>
            {hasImage ? t.imageAdded : t.addImage}
          </Text>
        </Pressable>

        <View style={[styles.hintCard, { backgroundColor: palette.cardMuted }]}>
          <Ionicons name="sparkles-outline" size={20} color={palette.accent} />
          <Text style={[styles.hintText, { color: palette.textPrimary }, isArabic && styles.textRight]}>{t.aiHint}</Text>
        </View>

        <Pressable
          style={[
            styles.submitButton,
            { backgroundColor: palette.accent, opacity: title.trim() && description.trim() ? 1 : 0.55 },
          ]}
          disabled={!title.trim() || !description.trim()}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>{t.submit}</Text>
        </Pressable>

        <View style={{ height: 130 }} />
      </ScrollView>
    </>
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
            minHeight: multiline ? 110 : 56,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    borderBottomWidth: 1,
    justifyContent: 'center',
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  toggleWrap: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 4,
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  toggleButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '800',
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
  imageButton: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  imageButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  hintCard: {
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(159, 191, 42, 0.22)',
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  submitButton: {
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#102247',
    fontSize: 16,
    fontWeight: '800',
  },
  textRight: {
    textAlign: 'right',
  },
});
