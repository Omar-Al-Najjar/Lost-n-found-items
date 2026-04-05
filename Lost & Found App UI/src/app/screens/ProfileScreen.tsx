import { BottomNav } from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { Moon, Sun, Globe, LogOut, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export function ProfileScreen() {
  const { t, theme, setTheme, language, setLanguage } = useApp();

  const userPosts = [
    {
      id: '1',
      type: 'lost',
      description: 'محفظة جلدية سوداء',
      date: 'قبل يومين',
    },
    {
      id: '2',
      type: 'found',
      description: 'مفاتيح سيارة',
      date: 'قبل أسبوع',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 bg-card border-b border-border shadow-sm backdrop-blur-lg bg-opacity-95"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-foreground">{t('profileTitle')}</h1>
        </div>
      </motion.header>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Profile Info */}
        <motion.div
          className="bg-card rounded-2xl p-6 border border-border text-center shadow-md relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Decorative background */}
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#b8ed44] opacity-5 blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0B1F3A] via-[#415a1a] to-[#b8ed44] mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg relative z-10"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            ع
          </motion.div>
          <h2 className="text-xl font-semibold text-foreground mb-1 relative z-10">عبدالله محمد</h2>
          <p className="text-muted-foreground relative z-10">abdullah@example.com</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            className="bg-card rounded-2xl p-4 border border-border text-center shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <motion.p
              className="text-2xl font-semibold bg-gradient-to-r from-[#9fbf2a] to-[#b8ed44] bg-clip-text text-transparent mb-1"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {userPosts.length}
            </motion.p>
            <p className="text-sm text-muted-foreground">{t('myPosts')}</p>
          </motion.div>
          <motion.div
            className="bg-card rounded-2xl p-4 border border-border text-center shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <motion.p
              className="text-2xl font-semibold bg-gradient-to-r from-[#9fbf2a] to-[#b8ed44] bg-clip-text text-transparent mb-1"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              3
            </motion.p>
            <p className="text-sm text-muted-foreground">{t('activeChats')}</p>
          </motion.div>
        </div>

        {/* Settings */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('settings')}
          </h3>

          {/* Theme Toggle */}
          <motion.div
            className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between shadow-sm"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-foreground" />
                ) : (
                  <Moon className="w-5 h-5 text-foreground" />
                )}
              </motion.div>
              <span className="text-foreground">{t('darkMode')}</span>
            </div>
            <motion.button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-gradient-to-r from-[#9fbf2a] to-[#b8ed44]' : 'bg-muted'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md ${
                  theme === 'dark' ? 'shadow-[#9fbf2a]/50' : ''
                }`}
                animate={{
                  x: theme === 'dark' ? (language === 'ar' ? -24 : 24) : (language === 'ar' ? -2 : 2),
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </motion.div>

          {/* Language Toggle */}
          <motion.div
            className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between shadow-sm"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-foreground" />
              <span className="text-foreground">{t('language')}</span>
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={() => setLanguage('ar')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  language === 'ar'
                    ? 'bg-gradient-to-r from-[#9fbf2a] to-[#b8ed44] text-[#070706] shadow-md'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                العربية
              </motion.button>
              <motion.button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  language === 'en'
                    ? 'bg-gradient-to-r from-[#9fbf2a] to-[#b8ed44] text-[#070706] shadow-md'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                English
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* My Posts */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-semibold text-foreground">{t('myPosts')}</h3>
          <div className="space-y-2">
            {userPosts.map((post, index) => (
              <motion.div
                key={post.id}
                className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.01, x: 5 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <motion.span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      post.type === 'lost'
                        ? 'bg-[#E07A7A]/10 text-[#E07A7A]'
                        : 'bg-[#b8ed44]/20 text-[#415a1a]'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {post.type === 'lost' ? t('lost') : t('found')}
                  </motion.span>
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                </div>
                <p className="text-foreground">{post.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Logout */}
        <motion.button
          className="w-full bg-destructive/10 text-destructive py-3 rounded-2xl font-medium hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2 border border-destructive/20 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5" />
          {t('logout')}
        </motion.button>
      </main>

      <BottomNav />
    </div>
  );
}
