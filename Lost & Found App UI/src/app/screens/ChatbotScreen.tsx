import { useState, useRef, useEffect } from 'react';
import { BottomNav } from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  matches?: string[];
}

export function ChatbotScreen() {
  const { t, language } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: language === 'ar'
        ? 'مرحباً! أنا هنا لمساعدتك في العثور على الأشياء المفقودة. صف لي ما الذي فقدته؟'
        : 'Hello! I\'m here to help you find lost items. What did you lose?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const highlightKeywords = (text: string) => {
    const keywords = ['محفظة', 'مفاتيح', 'هاتف', 'wallet', 'keys', 'phone', 'found', 'عثر'];
    let highlightedText = text;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        '<span class="px-1.5 py-0.5 rounded bg-[#b8ed44]/30 text-[#415a1a] font-semibold">$1</span>'
      );
    });
    
    return highlightedText;
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: language === 'ar'
          ? 'وجدت 2 عنصر مطابق! شخص ما عثر على محفظة جلدية في الحرم الجامعي. هل تريد التواصل معه؟'
          : 'Found 2 matching items! Someone found a leather wallet on campus. Would you like to contact them?',
        sender: 'bot',
        timestamp: new Date(),
        matches: ['محفظة', 'wallet'],
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 bg-card border-b border-border shadow-sm backdrop-blur-lg bg-opacity-95"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <motion.div
            className="p-2 rounded-full bg-gradient-to-br from-[#9fbf2a] to-[#b8ed44]"
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Bot className="w-5 h-5 text-[#070706]" />
          </motion.div>
          <h1 className="text-xl font-semibold text-foreground">{t('chatbotTitle')}</h1>
        </div>
      </motion.header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto max-w-md mx-auto w-full px-4 py-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Avatar */}
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'bot'
                      ? 'bg-gradient-to-br from-[#9fbf2a] to-[#b8ed44]'
                      : 'bg-primary text-primary-foreground'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                >
                  {message.sender === 'bot' ? (
                    <Bot className="w-5 h-5 text-[#070706]" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </motion.div>

                {/* Message Bubble */}
                <motion.div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl relative ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-card text-foreground border border-border rounded-tl-sm'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {message.sender === 'bot' && message.matches && (
                    <motion.div
                      className="absolute -top-1 -right-1"
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-[#b8ed44]" />
                    </motion.div>
                  )}
                  <p
                    className="leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: highlightKeywords(message.text) }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              className="flex items-start gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9fbf2a] to-[#b8ed44] flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-[#070706]" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#9fbf2a]"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <motion.div
        className="sticky bottom-16 bg-background border-t border-border"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-2 bg-card rounded-2xl border border-border px-4 py-2 focus-within:ring-2 focus-within:ring-[#9fbf2a] transition-all">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('chatbotPlaceholder')}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            <motion.button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-[#9fbf2a] to-[#b8ed44] text-[#070706] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
}
