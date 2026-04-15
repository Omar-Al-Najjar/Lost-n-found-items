import React from 'react';

import { AuthFormScreen } from '../components/AuthFormScreen';
import { AuthCopy } from '../constants/authCopy';
import { Palette } from '../types';

type AuthMode = 'login' | 'signup';

type AuthScreenProps = {
  mode: AuthMode;
  copy: AuthCopy;
  palette: Palette;
  isArabic: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  onSubmit: () => void;
  onSwitchMode: () => void;
};

export function AuthScreen({
  mode,
  copy,
  palette,
  isArabic,
  isDark,
  onToggleTheme,
  onSubmit,
  onSwitchMode,
}: AuthScreenProps) {
  return <AuthFormScreen {...{ mode, copy, palette, isArabic, isDark, onToggleTheme, onSubmit, onSwitchMode }} />;
}
