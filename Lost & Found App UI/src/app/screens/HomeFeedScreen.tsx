import { BottomNav } from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

interface Post {
  id: string;
  type: 'lost' | 'found';
  description: string;
  location?: string;
  timeAgo: string;
  userName: string;
}

const mockPosts: Post[] = [
  {
    id: '1',
    type: 'lost',
    description: 'محفظة جلدية سوداء تحتوي على بطاقات شخصية بالقرب من الجامعة',
    location: 'جامعة الملك سعود',
    timeAgo: '2',
    userName: 'أحمد محمد',
  },
  {
    id: '2',
    type: 'found',
    description: 'مفاتيح سيارة تويوتا مع ميدالية على شكل نجمة',
    location: 'مركز التسوق',
    timeAgo: '5',
    userName: 'سارة علي',
  },
  {
    id: '3',
    type: 'lost',
    description: 'هاتف آيفون 14 برو باللون الأزرق مع غطاء شفاف',
    location: 'حديقة الملك فهد',
    timeAgo: '1',
    userName: 'خالد أحمد',
  },
  {
    id: '4',
    type: 'found',
    description: 'حقيبة ظهر رمادية تحتوي على كتب دراسية',
    location: 'المكتبة العامة',
    timeAgo: '8',
    userName: 'نورة محمد',
  },
  {
    id: '5',
    type: 'lost',
    description: 'ساعة يد ذهبية ماركة رولكس هدية من والدي',
    location: 'المطعم الفرنسي',
    timeAgo: '12',
    userName: 'عبدالله سعيد',
  },
];

// Helper to highlight keywords
const highlightKeywords = (text: string) => {
  const keywords = ['محفظة', 'مفاتيح', 'هاتف', 'آيفون', 'حقيبة', 'ساعة', 'wallet', 'keys', 'phone', 'bag', 'watch'];
  let highlightedText = text;
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    highlightedText = highlightedText.replace(
      regex,
      '<span class="text-[#9fbf2a] font-semibold">$1</span>'
    );
  });
  
  return highlightedText;
};

export function HomeFeedScreen() {
  const { t, language } = useApp();
  const navigate = useNavigate();

  const handleMessage = (postId: string) => {
    navigate(`/dm/${postId}`);
  };

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
          <motion.h1
            className="text-2xl font-semibold bg-gradient-to-r from-foreground to-[#9fbf2a] bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Lost & Found
          </motion.h1>
        </div>
      </motion.header>

      {/* Feed */}
      <main className="max-w-md mx-auto px-4 py-4 space-y-3">
        {mockPosts.map((post, index) => (
          <motion.article
            key={post.id}
            className="bg-card rounded-2xl p-4 shadow-sm border border-border hover:shadow-lg transition-all relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            {/* Subtle gradient overlay */}
            <motion.div
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
              style={{
                background: post.type === 'lost'
                  ? 'radial-gradient(circle at top right, rgba(224, 122, 122, 0.05), transparent)'
                  : 'radial-gradient(circle at top right, rgba(184, 237, 68, 0.05), transparent)'
              }}
            />

            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <motion.span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  post.type === 'lost'
                    ? 'bg-[#E07A7A]/10 text-[#E07A7A]'
                    : 'bg-[#b8ed44]/20 text-[#415a1a]'
                }`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.span
                  className={`w-2 h-2 rounded-full ${
                    post.type === 'lost' ? 'bg-[#E07A7A]' : 'bg-[#9fbf2a]'
                  } mr-2`}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                {post.type === 'lost' ? t('lost') : t('found')}
              </motion.span>
            </div>

            {/* Description with keyword highlighting */}
            <motion.p
              className="text-foreground mb-3 leading-relaxed relative z-10"
              dangerouslySetInnerHTML={{ __html: highlightKeywords(post.description) }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            />

            {/* Location & Time */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3 relative z-10">
              {post.location && (
                <motion.div
                  className="flex items-center gap-1"
                  whileHover={{ x: 2 }}
                >
                  <MapPin className="w-4 h-4" />
                  <span>{post.location}</span>
                </motion.div>
              )}
              <motion.div
                className="flex items-center gap-1"
                whileHover={{ x: 2 }}
              >
                <Clock className="w-4 h-4" />
                <span>
                  {language === 'ar'
                    ? `${t('timeAgo')} ${post.timeAgo} ${t('hours')}`
                    : `${post.timeAgo} ${t('hours')} ${t('timeAgo')}`}
                </span>
              </motion.div>
            </div>

            {/* Action Button */}
            <motion.button
              onClick={() => handleMessage(post.id)}
              className="w-full bg-gradient-to-r from-[#9fbf2a] to-[#b8ed44] text-[#070706] py-2.5 rounded-xl font-medium relative overflow-hidden shadow-md group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
              <span className="relative z-10">{t('message')}</span>
            </motion.button>
          </motion.article>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
