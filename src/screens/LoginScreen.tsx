import React from 'react';

import { AuthFormScreen } from '../components/AuthFormScreen';
import { AuthCopy } from '../constants/authCopy';
import { Palette } from '../types';

type LoginScreenProps = {
  copy: AuthCopy;
  palette: Palette;
  isArabic: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  onSubmit: () => void;
  onSwitchToSignup: () => void;
};

export function LoginScreen({ onSwitchToSignup, ...props }: LoginScreenProps) {
  return <AuthFormScreen {...props} mode="login" onSwitchMode={onSwitchToSignup} />;
}
