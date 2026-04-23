import React from 'react';

import { AuthFormScreen } from '../components/AuthFormScreen';
import { AuthCopy } from '../constants/authCopy';
import { AuthCredentials, Palette } from '../types';

type LoginScreenProps = {
  copy: AuthCopy;
  palette: Palette;
  isArabic: boolean;
  onSubmit: (credentials: AuthCredentials) => void;
  onSwitchToSignup: () => void;
};

export function LoginScreen({ onSwitchToSignup, ...props }: LoginScreenProps) {
  return <AuthFormScreen {...props} mode="login" onSwitchMode={onSwitchToSignup} />;
}
