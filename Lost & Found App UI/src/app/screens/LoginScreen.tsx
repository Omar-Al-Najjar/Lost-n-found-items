import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { Mail, Lock, Moon, Sun, Eye, EyeOff } from 'lucide-react';

export function LoginScreen() {
  const navigate = useNavigate();
  const { t, theme, setTheme, setIsAuthenticated } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsAuthenticated(true);
      navigate('/feed');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-20 right-10 w-32 h-32 rounded-full bg-[#b8ed44] opacity-20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-32 left-10 w-40 h-40 rounded-full bg-[#9fbf2a] opacity-20 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.25, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Theme Toggle */}
      <motion.button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="absolute top-6 right-6 p-3 rounded-full bg-card text-foreground shadow-lg border border-border"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95, rotate: 180 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </motion.button>

      {/* Content */}
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <motion.div
            className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-[#0B1F3A] to-[#9fbf2a] flex items-center justify-center shadow-2xl mb-4"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-white text-4xl font-bold">L&F</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Lost & Found</h1>
          <p className="text-muted-foreground">{t('login')}</p>
        </motion.div>

        {/* Form */}
        <motion.div
          className="bg-card rounded-3xl p-8 shadow-2xl border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="space-y-5">
            {/* Email Input */}
            <motion.div
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <label className="block text-foreground mb-2">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <motion.input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-input border border-border rounded-2xl pl-12 pr-4 py-3.5 text-foreground outline-none focus:ring-2 focus:ring-[#9fbf2a] transition-all"
                  placeholder="example@email.com"
                  whileFocus={{ boxShadow: "0 0 0 4px rgba(184, 237, 68, 0.1)" }}
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <label className="block text-foreground mb-2">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <motion.input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-input border border-border rounded-2xl pl-12 pr-12 py-3.5 text-foreground outline-none focus:ring-2 focus:ring-[#9fbf2a] transition-all"
                  placeholder="••••••••"
                  whileFocus={{ boxShadow: "0 0 0 4px rgba(184, 237, 68, 0.1)" }}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Forgot Password */}
            <motion.button
              className="text-sm text-[#9fbf2a] hover:text-[#b8ed44] transition-colors"
              whileHover={{ x: 5 }}
            >
              {t('forgotPassword')}
            </motion.button>

            {/* Login Button */}
            <motion.button
              onClick={handleLogin}
              disabled={!email || !password || isLoading}
              className="w-full bg-gradient-to-r from-[#9fbf2a] to-[#b8ed44] text-[#070706] py-4 rounded-2xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
                style={{ opacity: 0.2 }}
              />
              <span className="relative z-10">
                {isLoading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    ⟳
                  </motion.span>
                ) : (
                  t('login')
                )}
              </span>
            </motion.button>

            {/* Signup Link */}
            <div className="text-center">
              <span className="text-muted-foreground">{t('noAccount')} </span>
              <motion.button
                onClick={() => navigate('/signup')}
                className="text-[#9fbf2a] hover:text-[#b8ed44] font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('signup')}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
