import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Send, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: Date;
  image?: string;
}

export function DirectMessageScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'مرحباً، هل لا تزال المحفظة معك؟',
      sender: 'me',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      text: 'نعم، لا تزال معي. متى يمكنك المجيء لأخذها؟',
      sender: 'other',
      timestamp: new Date(Date.now() - 3000000),
    },
    {
      id: '3',
      text: 'يمكنني القدوم اليوم بعد الساعة 5 مساءً',
      sender: 'me',
      timestamp: new Date(Date.now() - 1800000),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ChevronIcon = language === 'ar' ? ChevronRight : ChevronLeft;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'me',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 bg-card border-b border-border shadow-sm backdrop-blur-lg bg-opacity-95"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <motion.button
            onClick={() => navigate('/conversations')}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronIcon className="w-5 h-5" />
          </motion.button>
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E07A7A] to-[#ff9494] text-white flex items-center justify-center font-semibold shadow-md"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              أ
            </motion.div>
            <div>
              <h2 className="font-semibold text-foreground">أحمد محمد</h2>
              <motion.p
                className="text-xs text-[#9fbf2a] flex items-center gap-1"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="w-2 h-2 rounded-full bg-[#9fbf2a]" />
                {language === 'ar' ? 'متصل الآن' : 'Online now'}
              </motion.p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto max-w-md mx-auto w-full px-4 py-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`flex flex-col ${
                  message.sender === 'me' ? 'items-end' : 'items-start'
                }`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Message Bubble */}
                <motion.div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl relative ${
                    message.sender === 'me'
                      ? 'bg-gradient-to-r from-[#9fbf2a] to-[#b8ed44] text-[#070706] rounded-tr-sm shadow-md'
                      : 'bg-card text-foreground border border-border rounded-tl-sm'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Shared"
                      className="rounded-xl mb-2 max-w-full"
                    />
                  )}
                  <p className="leading-relaxed break-words">{message.text}</p>
                </motion.div>
                
                {/* Timestamp */}
                <motion.span
                  className="text-xs text-muted-foreground mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  {formatTime(message.timestamp)}
                </motion.span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <motion.div
        className="sticky bottom-0 bg-background border-t border-border backdrop-blur-lg bg-opacity-95"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <motion.button
              className="p-2.5 rounded-xl bg-card text-muted-foreground hover:text-[#9fbf2a] border border-border transition-colors"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <ImageIcon className="w-5 h-5" />
            </motion.button>
            <div className="flex-1 flex items-center gap-2 bg-card rounded-2xl border border-border px-4 py-2 focus-within:ring-2 focus-within:ring-[#9fbf2a] transition-all">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('typePlaceholder')}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <motion.button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#9fbf2a] to-[#b8ed44] text-[#070706] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
