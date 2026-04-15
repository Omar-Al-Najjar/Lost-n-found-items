import { Language } from '../types';

type AssistantChatCopy = {
  subtitle: string;
  typingLabel: string;
  sendLabel: string;
  welcomeMessage: string;
};

const assistantCopy: Record<Language, AssistantChatCopy> = {
  en: {
    subtitle: 'Share the item details and the assistant will respond with a quick local suggestion.',
    typingLabel: 'Assistant is typing...',
    sendLabel: 'Send message',
    welcomeMessage: "Hello! Tell me what you lost and I'll suggest the closest local match.",
  },
  ar: {
    subtitle: 'اكتب تفاصيل العنصر وسيرد المساعد باقتراح سريع ومبدئي.',
    typingLabel: 'المساعد يكتب الآن...',
    sendLabel: 'إرسال الرسالة',
    welcomeMessage: 'مرحبًا! اكتب لي ما الذي فقدته وسأقترح أقرب مطابقة محلية بشكل سريع.',
  },
};

const replyBuckets: Record<Language, Record<string, string[]>> = {
  en: {
    wallet: [
      'A similar wallet was reported near the university gate. Check the cards, color, and where it was last seen.',
      'There is a nearby wallet report. If you remember the color or brand, I can narrow the match further.',
    ],
    phone: [
      'I found a possible phone match in a campus building report. Mention the case color and lock screen if you can.',
      'There may be a phone report that fits. Try sending the brand, cover color, or last known place for a closer match.',
    ],
    keys: [
      'A keys report was posted not far from your area. If you know the keychain shape, that helps narrow it quickly.',
      'I found a possible key match. Share whether it has a tag, car brand, or distinctive ring.',
    ],
    bag: [
      'A similar bag was reported recently. The color, size, and where it was seen will help confirm the match.',
      'There is a nearby bag report that may fit. Tell me the type and any visible detail like zippers or straps.',
    ],
    document: [
      'I found a report that may match personal documents. If you mention the folder, holder color, or location, I can refine it.',
      'There is a possible document match nearby. Add the place and whether it was in an envelope or wallet.',
    ],
    generic: [
      'That sounds close to an existing local report. Add the location, color, and time to improve the suggestion.',
      'I can help narrow this down. Tell me where you last saw it and one unique detail that stands out.',
      'There may be a nearby match. Try adding the category, color, and any visible mark so the suggestion becomes more precise.',
    ],
  },
  ar: {
    wallet: [
      'يوجد بلاغ قريب عن محفظة مشابهة قرب بوابة الجامعة. إذا تذكرّت اللون أو المحتويات أستطيع تضييق المطابقة.',
      'وجدت احتمالًا قريبًا لمحفظة مشابهة. اذكر اللون أو العلامة أو مكان الفقد الأخير لنتأكد أكثر.',
    ],
    phone: [
      'هناك بلاغ محتمل عن هاتف مشابه داخل أحد مباني الجامعة. اذكر نوع الجهاز أو لون الغطاء لتكون المطابقة أدق.',
      'وجدت احتمالًا مناسبًا لهاتف قريب من وصفك. إذا أرسلت لون الكفر أو الخلفية أو آخر موقع سيساعد ذلك أكثر.',
    ],
    keys: [
      'يوجد بلاغ قريب عن مفاتيح مشابهة. إذا كان معها ميدالية أو مفتاح سيارة فهذه التفاصيل ستسرّع المطابقة.',
      'وجدت مطابقة أولية لمفاتيح قريبة من وصفك. أخبرني إن كان معها حلقة مميزة أو اسم سيارة.',
    ],
    bag: [
      'هناك بلاغ قريب عن حقيبة مشابهة. اذكر اللون والحجم أو أي سحاب أو حزام مميز لتأكيد المطابقة.',
      'وجدت احتمالًا مناسبًا لحقيبة مشابهة. إذا ذكرت المكان وآخر وقت رأيتها فيه سيكون الاقتراح أدق.',
    ],
    document: [
      'يوجد بلاغ محتمل عن أوراق أو مستندات مشابهة. اذكر نوع الحافظة أو اللون أو الموقع لتضييق النتائج.',
      'وجدت مطابقة أولية لمستندات مشابهة. إذا كانت داخل مغلف أو حافظة فاذكر ذلك لأقرب نتيجة.',
    ],
    generic: [
      'الوصف قريب من بلاغ محلي موجود. أضف الموقع واللون وآخر وقت شاهدته فيه لتحسين الاقتراح.',
      'أستطيع مساعدتك بشكل أدق إذا ذكرت المكان وأبرز علامة مميزة في العنصر.',
      'يوجد احتمال لمطابقة قريبة. جرّب إضافة الفئة واللون وأي تفصيلة واضحة ليصبح الاقتراح أفضل.',
    ],
  },
};

const keywordGroups = {
  wallet: ['wallet', 'card', 'cards', 'محفظة', 'بطاقة', 'بطاقات'],
  phone: ['phone', 'iphone', 'mobile', 'samsung', 'هاتف', 'جوال', 'ايفون', 'سامسونج'],
  keys: ['key', 'keys', 'car key', 'مفتاح', 'مفاتيح', 'سيارة'],
  bag: ['bag', 'backpack', 'purse', 'شنطة', 'حقيبة', 'حقيبه', 'شنطه'],
  document: ['document', 'documents', 'passport', 'id', 'هوية', 'جواز', 'مستند', 'أوراق', 'اوراق'],
} as const;

export function getAssistantChatCopy(language: Language) {
  return assistantCopy[language];
}

export function getAssistantMockReply(language: Language, message: string, replyCount: number) {
  const normalizedMessage = message.toLowerCase();
  const groups = keywordGroups as Record<string, readonly string[]>;

  const matchedKey =
    Object.keys(groups).find((key) => groups[key].some((keyword) => normalizedMessage.includes(keyword))) ?? 'generic';

  const options = replyBuckets[language][matchedKey] ?? replyBuckets[language].generic;
  return options[replyCount % options.length];
}
