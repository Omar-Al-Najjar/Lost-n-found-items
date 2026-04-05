import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';
type Theme = 'light' | 'dark';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: string) => string;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const translations = {
  ar: {
    // Auth
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    haveAccount: 'لديك حساب؟',
    noAccount: 'ليس لديك حساب؟',
    emailVerification: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
    
    // Splash
    privacyPolicy: 'سياسة الخصوصية',
    
    // Home Feed
    home: 'الرئيسية',
    chatbot: '��لمساعد الذكي',
    addPost: 'إضافة منشور',
    conversations: 'المحادثات',
    profile: 'الملف الشخصي',
    lost: 'مفقود',
    found: 'تم العثور عليه',
    message: 'تواصل',
    location: 'الموقع',
    timeAgo: 'قبل',
    hours: 'ساعات',
    hour: 'ساعة',
    minutes: 'دقائق',
    days: 'أيام',
    
    // Chatbot
    chatbotTitle: 'المساعد الذكي',
    chatbotPlaceholder: 'صف العنصر المفقود...',
    send: 'إرسال',
    
    // Add Post
    addPostTitle: 'إضافة منشور',
    lostItem: 'عنصر مفقود',
    foundItem: 'عنصر تم العثور عليه',
    description: 'الوصف',
    descriptionPlaceholder: 'اكتب وصفاً للعنصر...',
    locationPlaceholder: 'أدخل الموقع (اختياري)',
    addImage: 'إضافة صورة',
    submit: 'نشر',
    aiEnhancing: 'تحسين الذكاء الاصطناعي...',
    
    // Conversations
    conversationsTitle: 'المحادثات',
    noConversations: 'لا توجد محادثات بعد',
    
    // Direct Message
    typePlaceholder: 'اكتب رسالة...',
    sendImage: 'إرسال صورة',
    
    // Profile
    profileTitle: 'الملف الشخصي',
    myPosts: 'منشوراتي',
    activeChats: 'المحادثات النشطة',
    settings: 'الإعدادات',
    language: 'اللغة',
    darkMode: 'الوضع الداكن',
    logout: 'تسجيل الخروج',
  },
  en: {
    // Auth
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    haveAccount: 'Have an account?',
    noAccount: 'Don\'t have an account?',
    emailVerification: 'Verification code sent to your email',
    
    // Splash
    privacyPolicy: 'Privacy Policy',
    
    // Home Feed
    home: 'Home',
    chatbot: 'AI Assistant',
    addPost: 'Add Post',
    conversations: 'Conversations',
    profile: 'Profile',
    lost: 'Lost',
    found: 'Found',
    message: 'Message',
    location: 'Location',
    timeAgo: 'ago',
    hours: 'hours',
    hour: 'hour',
    minutes: 'minutes',
    days: 'days',
    
    // Chatbot
    chatbotTitle: 'AI Assistant',
    chatbotPlaceholder: 'Describe the lost item...',
    send: 'Send',
    
    // Add Post
    addPostTitle: 'Add Post',
    lostItem: 'Lost Item',
    foundItem: 'Found Item',
    description: 'Description',
    descriptionPlaceholder: 'Write a description of the item...',
    locationPlaceholder: 'Enter location (optional)',
    addImage: 'Add Image',
    submit: 'Post',
    aiEnhancing: 'AI enhancing...',
    
    // Conversations
    conversationsTitle: 'Conversations',
    noConversations: 'No conversations yet',
    
    // Direct Message
    typePlaceholder: 'Type a message...',
    sendImage: 'Send Image',
    
    // Profile
    profileTitle: 'Profile',
    myPosts: 'My Posts',
    activeChats: 'Active Chats',
    settings: 'Settings',
    language: 'Language',
    darkMode: 'Dark Mode',
    logout: 'Logout',
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (language === 'ar') {
      root.setAttribute('dir', 'rtl');
      root.setAttribute('lang', 'ar');
    } else {
      root.setAttribute('dir', 'ltr');
      root.setAttribute('lang', 'en');
    }
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ar] || key;
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, setTheme, t, isAuthenticated, setIsAuthenticated }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}