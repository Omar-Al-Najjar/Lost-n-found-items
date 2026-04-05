import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';

export function SplashScreen() {
  const navigate = useNavigate();
  const { t, theme, setTheme, isAuthenticated } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(isAuthenticated ? '/feed' : '/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-[#9fbf2a]/10 flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Animated Background Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#b8ed44] opacity-10 blur-3xl"
        animate={{
          scale: [1, 1.5, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-[#9fbf2a] opacity-10 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Theme toggle */}
      <motion.button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="absolute top-6 right-6 p-3 rounded-full bg-card text-foreground shadow-lg border border-border"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.95 }}
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </motion.button>

      {/* Logo */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{
            duration: 0.8,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
        >
          <motion.div
            className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#0B1F3A] via-[#415a1a] to-[#b8ed44] flex items-center justify-center shadow-2xl relative"
            animate={{
              boxShadow: [
                "0 25px 50px -12px rgba(184, 237, 68, 0.25)",
                "0 25px 50px -12px rgba(159, 191, 42, 0.5)",
                "0 25px 50px -12px rgba(184, 237, 68, 0.25)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="text-[#F5F1E8] text-5xl font-bold"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              L&F
            </motion.div>

            {/* Decorative rings */}
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-[#b8ed44]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-[#9fbf2a]"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* App Name */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-foreground text-center mb-2">
          Lost & Found
        </h1>
        <motion.div
          className="h-1 bg-gradient-to-r from-transparent via-[#b8ed44] to-transparent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 1.2, duration: 0.8 }}
        />
      </motion.div>

      {/* Privacy Policy */}
      <motion.div
        className="pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <motion.button
          className="text-muted-foreground hover:text-[#9fbf2a] transition-colors underline"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('privacyPolicy')}
        </motion.button>
      </motion.div>

      {/* Loading Indicator */}
      <motion.div
        className="absolute bottom-12 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-[#9fbf2a]"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
