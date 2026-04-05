import { Home, Bot, PlusCircle, MessageCircle, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useApp();

  const tabs = [
    { path: '/feed', icon: Home, label: t('home') },
    { path: '/chatbot', icon: Bot, label: t('chatbot') },
    { path: '/add', icon: PlusCircle, label: t('addPost') },
    { path: '/conversations', icon: MessageCircle, label: t('conversations') },
    { path: '/profile', icon: User, label: t('profile') },
  ];

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <nav className="flex justify-around items-center px-2 py-3 max-w-md mx-auto">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          const isAddButton = tab.path === '/add';
          
          return (
            <motion.button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-[#9fbf2a] to-[#b8ed44]"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              {/* Special styling for Add button */}
              {isAddButton ? (
                <motion.div
                  className={`p-2 rounded-full ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#9fbf2a] to-[#b8ed44]' 
                      : 'bg-muted'
                  }`}
                  whileHover={{ rotate: 90 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isActive ? 'text-[#070706]' : 'text-muted-foreground'
                    }`}
                    strokeWidth={2}
                  />
                </motion.div>
              ) : (
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? 'fill-primary' : ''
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              )}
              
              {/* Pop effect on press */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-[#b8ed44] opacity-20"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 0] }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </motion.div>
  );
}
