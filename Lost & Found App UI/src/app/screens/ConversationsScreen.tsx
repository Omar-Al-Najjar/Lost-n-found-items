import { BottomNav } from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface Conversation {
  id: string;
  userName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  postType: 'lost' | 'found';
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    userName: 'أحمد محمد',
    lastMessage: 'شكراً جزيلاً، سأكون هناك خلال ساعة',
    timestamp: 'قبل 5 دقائق',
    unread: true,
    postType: 'lost',
  },
  {
    id: '2',
    userName: 'سارة علي',
    lastMessage: 'نعم، المفاتيح لا تزال معي',
    timestamp: 'قبل ساعة',
    unread: false,
    postType: 'found',
  },
  {
    id: '3',
    userName: 'خالد أحمد',
    lastMessage: 'هل يمكنك إرسال صورة للهاتف؟',
    timestamp: 'قبل 3 ساعات',
    unread: false,
    postType: 'lost',
  },
];

export function ConversationsScreen() {
  const { t, language } = useApp();
  const navigate = useNavigate();
  const ChevronIcon = language === 'ar' ? ChevronLeft : ChevronRight;

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
          <h1 className="text-xl font-semibold text-foreground">{t('conversationsTitle')}</h1>
        </div>
      </motion.header>

      {/* Conversations List */}
      <main className="max-w-md mx-auto">
        {mockConversations.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-20 px-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
            </motion.div>
            <p className="text-muted-foreground text-center">{t('noConversations')}</p>
          </motion.div>
        ) : (
          <div className="divide-y divide-border">
            {mockConversations.map((conv, index) => (
              <motion.button
                key={conv.id}
                onClick={() => navigate(`/dm/${conv.id}`)}
                className="w-full px-4 py-4 flex items-center gap-3 hover:bg-muted/30 transition-colors relative overflow-hidden group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Hover effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[#b8ed44]/5 to-transparent opacity-0 group-hover:opacity-100"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />

                {/* Avatar */}
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-md ${
                    conv.postType === 'lost'
                      ? 'bg-gradient-to-br from-[#E07A7A] to-[#ff9494]'
                      : 'bg-gradient-to-br from-[#9fbf2a] to-[#b8ed44] text-[#070706]'
                  }`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {conv.userName.charAt(0)}
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-start relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-foreground truncate">
                      {conv.userName}
                    </h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ms-2">
                      {conv.timestamp}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate ${
                      conv.unread ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {conv.lastMessage}
                  </p>
                </div>

                {/* Unread Badge & Arrow */}
                <div className="flex items-center gap-2 flex-shrink-0 relative z-10">
                  {conv.unread && (
                    <motion.div
                      className="w-2 h-2 rounded-full bg-[#9fbf2a] shadow-md"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  )}
                  <ChevronIcon className="w-5 h-5 text-muted-foreground group-hover:text-[#9fbf2a] transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
