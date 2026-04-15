import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthCopy } from '../constants/authCopy';
import { AmbientBackground } from './AmbientBackground';
import { Palette } from '../types';

type AuthMode = 'login' | 'signup';

type AuthFormScreenProps = {
  mode: AuthMode;
  copy: AuthCopy;
  palette: Palette;
  isArabic: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  onSubmit: () => void;
  onSwitchMode: () => void;
};

export function AuthFormScreen({
  mode,
  copy,
  palette,
  isArabic,
  isDark,
  onToggleTheme,
  onSubmit,
  onSwitchMode,
}: AuthFormScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password.trim()) return false;
    if (mode === 'signup' && (!confirmPassword.trim() || confirmPassword !== password)) return false;
    return true;
  }, [confirmPassword, email, mode, password]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.screen, { backgroundColor: palette.bg }]}>
      <AmbientBackground primary={palette.accent} secondary={palette.accentSoft} tertiary={palette.dangerSoft} />

      <KeyboardAvoidingView style={styles.keyboardWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable
          style={[styles.themeButton, { backgroundColor: palette.card, borderColor: palette.border }]}
          onPress={onToggleTheme}
        >
          <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={palette.textPrimary} />
        </Pressable>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoBlock}>
            <View style={[styles.eyebrowPill, { backgroundColor: palette.cardMuted }]}>
              <Ionicons
                name={mode === 'login' ? 'return-down-forward-outline' : 'person-add-outline'}
                size={16}
                color={palette.textPrimary}
              />
              <Text style={[styles.eyebrowText, { color: palette.textPrimary }]}>
                {mode === 'login' ? copy.login : copy.signup}
              </Text>
            </View>
            <View style={[styles.logoCircle, { backgroundColor: palette.textPrimary }]}>
              <View style={[styles.logoGlow, { backgroundColor: palette.accent }]} />
              <Text style={[styles.logoText, { color: palette.accentStrong }]}>L&F</Text>
            </View>
            <Text style={[styles.title, { color: palette.textPrimary }]}>
              {mode === 'login' ? copy.loginTitle : copy.signupTitle}
            </Text>
            <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{copy.splashSubtitle}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={[styles.cardHeader, isArabic && styles.rowReverse]}>
              <View>
                <Text style={[styles.cardTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
                  {mode === 'login' ? copy.loginTitle : copy.signupTitle}
                </Text>
                <Text style={[styles.cardSubtitle, { color: palette.textSecondary }, isArabic && styles.textRight]}>
                  {mode === 'login' ? copy.login : copy.signup}
                </Text>
              </View>
              <View style={[styles.cardIconWrap, { backgroundColor: palette.cardMuted }]}>
                <Ionicons
                  name={mode === 'login' ? 'log-in-outline' : 'sparkles-outline'}
                  size={20}
                  color={palette.textPrimary}
                />
              </View>
            </View>

            <Field
              label={copy.email}
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              icon="mail-outline"
              palette={palette}
              isArabic={isArabic}
              secureTextEntry={false}
            />
            <Field
              label={copy.password}
              value={password}
              onChangeText={setPassword}
              placeholder="........"
              icon="lock-closed-outline"
              palette={palette}
              isArabic={isArabic}
              secureTextEntry={!showPassword}
              onToggleSecure={() => setShowPassword((value) => !value)}
            />
            {mode === 'signup' && (
              <Field
                label={copy.confirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="........"
                icon="shield-checkmark-outline"
                palette={palette}
                isArabic={isArabic}
                secureTextEntry={!showConfirmPassword}
                onToggleSecure={() => setShowConfirmPassword((value) => !value)}
              />
            )}

            {mode === 'login' && <Text style={[styles.linkText, { color: palette.accent }]}>{copy.forgotPassword}</Text>}

            <Pressable
              style={[styles.primaryButton, { backgroundColor: palette.accent, opacity: canSubmit ? 1 : 0.55 }]}
              disabled={!canSubmit}
              onPress={onSubmit}
            >
              <View style={styles.primarySheen} />
              <Text style={[styles.primaryButtonText, { color: '#102247' }]}>
                {mode === 'login' ? copy.login : copy.signup}
              </Text>
            </Pressable>

            <View style={[styles.switchRow, isArabic && styles.rowReverse]}>
              <Text style={[styles.switchText, { color: palette.textSecondary }]}>
                {mode === 'login' ? copy.noAccount : copy.haveAccount}
              </Text>
              <Pressable onPress={onSwitchMode}>
                <Text style={[styles.switchLink, { color: palette.accent }]}>
                  {mode === 'login' ? copy.signup : copy.login}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  palette: Palette;
  isArabic: boolean;
  secureTextEntry: boolean;
  onToggleSecure?: () => void;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  palette,
  isArabic,
  secureTextEntry,
  onToggleSecure,
}: FieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: palette.textPrimary }, isArabic && styles.textRight]}>{label}</Text>
      <View style={[styles.fieldShell, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}>
        <Ionicons name={icon} size={20} color={palette.textSecondary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={palette.textSecondary}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          keyboardType={icon === 'mail-outline' ? 'email-address' : 'default'}
          returnKeyType={onToggleSecure ? 'done' : 'next'}
          style={[styles.fieldInput, { color: palette.textPrimary, textAlign: isArabic ? 'right' : 'left' }]}
        />
        {onToggleSecure ? (
          <Pressable onPress={onToggleSecure}>
            <Ionicons
              name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={palette.textSecondary}
            />
          </Pressable>
        ) : (
          <View style={styles.eyeSpacer} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  themeButton: {
    position: 'absolute',
    top: 12,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  eyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 14,
  },
  eyebrowText: {
    fontSize: 12,
    fontWeight: '800',
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#9FBF2A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  logoGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 999,
    opacity: 0.22,
    top: -12,
    right: -16,
  },
  logoText: {
    fontSize: 30,
    fontWeight: '800',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    gap: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 12,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldWrap: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  fieldShell: {
    height: 58,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
  },
  eyeSpacer: {
    width: 20,
  },
  linkText: {
    fontSize: 14,
    marginTop: 2,
  },
  primaryButton: {
    marginTop: 6,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#9FBF2A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  primarySheen: {
    position: 'absolute',
    top: -18,
    left: -24,
    width: 70,
    height: 96,
    backgroundColor: 'rgba(255,255,255,0.2)',
    transform: [{ rotate: '22deg' }],
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '800',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  switchText: {
    fontSize: 14,
  },
  switchLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  textRight: {
    textAlign: 'right',
  },
});
