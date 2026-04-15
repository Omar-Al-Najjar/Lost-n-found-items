import React from 'react';

import { AuthFormScreen } from '../components/AuthFormScreen';
import { AuthCopy } from '../constants/authCopy';
import { Palette } from '../types';

type SignupScreenProps = {
  copy: AuthCopy;
  palette: Palette;
  isArabic: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  onSubmit: () => void;
  onSwitchToLogin: () => void;
};

export function SignupScreen({ onSwitchToLogin, ...props }: SignupScreenProps) {
  return <AuthFormScreen {...props} mode="signup" onSwitchMode={onSwitchToLogin} />;
}
