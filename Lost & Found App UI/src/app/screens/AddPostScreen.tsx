import { useState } from 'react';
import { BottomNav } from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Sparkles, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

export function AddPostScreen() {
  const { t, language } = useApp();
  const navigate = useNavigate();
  const [postType, setPostType] = useState<'lost' | 'found'>('lost');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleSubmit = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      setIsEnhancing(false);
      navigate('/feed');
    }, 1500);
  };

  const ChevronIcon = language === 'ar' ? ChevronRight : ChevronLeft;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 bg-card border-b border-border shadow-sm backdrop-blur-lg bg-opacity-95"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <motion.button
            onClick={() => navigate('/feed')}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronIcon className="w-5 h-5" />
          </motion.button>
          <h1 className="text-xl font-semibold text-foreground">{t('addPostTitle')}</h1>
        </div>
      </motion.header>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Type Toggle */}
        <motion.div
          className="bg-card rounded-2xl p-1.5 flex gap-1 border border-border shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.button
            onClick={() => setPostType('lost')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all relative overflow-hidden ${
              postType === 'lost'
                ? 'text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {postType === 'lost' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#E07A7A] to-[#ff9494]"
                layoutId="postTypeIndicator"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{t('lostItem')}</span>
          </motion.button>
          <motion.button
            onClick={() => setPostType('found')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all relative overflow-hidden ${
              postType === 'found'
                ? 'text-[#070706] shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {postType === 'found' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#9fbf2a] to-[#b8ed44]"
                layoutId="postTypeIndicator"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{t('foundItem')}</span>
          </motion.button>
        </motion.div>

        {/* Description */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="text-foreground font-medium flex items-center gap-2">
            {t('description')}
            <Sparkles className="w-4 h-4 text-[#9fbf2a]" />
          </label>
          <motion.textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('descriptionPlaceholder')}
            rows={6}
            className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[#9fbf2a] resize-none transition-all"
            whileFocus={{ scale: 1.01 }}
          />
        </motion.div>

        {/* Location */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="text-foreground font-medium flex items-center gap-2">
            {t('location')}
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </label>
          <motion.input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t('locationPlaceholder')}
            className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[#9fbf2a] transition-all"
            whileFocus={{ scale: 1.01 }}
          />
        </motion.div>

        {/* Image Upload (only for lost items) */}
        {postType === 'lost' && (
          <motion.button
            className="w-full bg-card border border-dashed border-border rounded-2xl py-6 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground hover:border-[#9fbf2a] transition-all relative overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <motion.div
              className="absolute inset-0 bg-[#b8ed44] opacity-0 group-hover:opacity-5 transition-opacity"
            />
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring" }}
            >
              <ImageIcon className="w-8 h-8" />
            </motion.div>
            <span>{t('addImage')}</span>
          </motion.button>
        )}

        {/* AI Enhancement Notice */}
        <motion.div
          className="bg-gradient-to-r from-[#9fbf2a]/10 to-[#b8ed44]/10 border border-[#9fbf2a]/30 rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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
            <Sparkles className="w-5 h-5 text-[#9fbf2a] flex-shrink-0 mt-0.5" />
          </motion.div>
          <p className="text-sm text-foreground leading-relaxed">
            {language === 'ar'
              ? 'سيقوم الذكاء الاصطناعي بتحسين وصفك تلقائياً لزيادة فرص العثور على العنصر'
              : 'AI will automatically enhance your description to increase chances of finding the item'}
          </p>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          onClick={handleSubmit}
          disabled={!description.trim() || isEnhancing}
          className="w-full bg-gradient-to-r from-[#9fbf2a] to-[#b8ed44] text-[#070706] py-4 rounded-2xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="absolute inset-0 bg-white opacity-0"
            animate={isEnhancing ? { opacity: [0, 0.3, 0] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
          {isEnhancing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              <span>{t('aiEnhancing')}</span>
            </>
          ) : (
            t('submit')
          )}
        </motion.button>
      </main>

      <BottomNav />
    </div>
  );
}
