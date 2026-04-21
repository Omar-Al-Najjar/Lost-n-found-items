import { Language } from '../types';

export type AuthCopy = {
  splashTitle: string;
  splashSubtitle: string;
  privacyPolicy: string;
  loginTitle: string;
  signupTitle: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  pickProfilePhoto: string;
  changeProfilePhoto: string;
  removeProfilePhoto: string;
  forgotPassword: string;
  noAccount: string;
  haveAccount: string;
  login: string;
  signup: string;
  emailVerification: string;
};

const authCopy: Record<Language, AuthCopy> = {
  en: {
    splashTitle: 'Lost & Found',
    splashSubtitle: 'A calm, fast way to report and recover items around you.',
    privacyPolicy: 'Privacy Policy',
    loginTitle: 'Welcome back',
    signupTitle: 'Create your account',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    pickProfilePhoto: 'Pick profile photo',
    changeProfilePhoto: 'Change photo',
    removeProfilePhoto: 'Remove',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    login: 'Login',
    signup: 'Sign Up',
    emailVerification: 'Sign up flow will be completed in the next iteration.',
  },
  ar: {
    splashTitle: '\u0627\u0644\u0645\u0641\u0642\u0648\u062f\u0627\u062a \u0648\u0627\u0644\u0645\u0648\u062c\u0648\u062f\u0627\u062a',
    splashSubtitle: '\u0637\u0631\u064a\u0642\u0629 \u0647\u0627\u062f\u0626\u0629 \u0648\u0633\u0631\u064a\u0639\u0629 \u0644\u0644\u0625\u0628\u0644\u0627\u063a \u0639\u0646 \u0627\u0644\u0623\u0634\u064a\u0627\u0621 \u0627\u0644\u0645\u0641\u0642\u0648\u062f\u0629 \u0648\u0627\u0633\u062a\u0639\u0627\u062f\u062a\u0647\u0627.',
    privacyPolicy: '\u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629',
    loginTitle: '\u0623\u0647\u0644\u064b\u0627 \u0628\u0639\u0648\u062f\u062a\u0643',
    signupTitle: '\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628 \u062c\u062f\u064a\u062f',
    username: '\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645',
    email: '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a',
    password: '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
    confirmPassword: '\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
    pickProfilePhoto: '\u0627\u062e\u062a\u0631 \u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0644\u0641',
    changeProfilePhoto: '\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0635\u0648\u0631\u0629',
    removeProfilePhoto: '\u0625\u0632\u0627\u0644\u0629',
    forgotPassword: '\u0646\u0633\u064a\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u061f',
    noAccount: '\u0644\u064a\u0633 \u0644\u062f\u064a\u0643 \u062d\u0633\u0627\u0628\u061f',
    haveAccount: '\u0644\u062f\u064a\u0643 \u062d\u0633\u0627\u0628 \u0628\u0627\u0644\u0641\u0639\u0644\u061f',
    login: '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
    signup: '\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628',
    emailVerification: '\u0633\u064a\u062a\u0645 \u062a\u062c\u0647\u064a\u0632 \u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u0641\u064a \u0627\u0644\u062c\u0648\u0644\u0629 \u0627\u0644\u062a\u0627\u0644\u064a\u0629 \u0628\u0639\u062f \u0625\u0646\u0647\u0627\u0621 \u0623\u0648\u0644 \u0634\u0627\u0634\u062a\u064a\u0646.',
  },
};

export function getAuthCopy(language: Language) {
  return authCopy[language];
}
