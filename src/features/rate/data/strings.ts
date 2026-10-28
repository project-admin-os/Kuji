import type { Localized } from "@/shared/i18n";

const en = {
  sheetTitle: "How was it?",
  reviewTitle: "Loved it!",
  reviewHint: "Share your experience",
  noteTitle: "I have a suggestion",
  noteHint: "Help us improve",
  noteLabel: "How can we make it better?",
  nameLabel: "Name (optional)",
  contactLabel: "Phone or email (optional)",
  tooShort: "Please tell us a bit more.",
  send: "Send Feedback",
  sending: "Sending…",
  error: "Something went wrong. Please try again.",
  thanks: "Thank you! We truly value your thoughts.",
  close: "Close",
};

const ar: typeof en = {
  sheetTitle: "كيف كانت تجربتك؟",
  reviewTitle: "كل شيء كان رائعاً!",
  reviewHint: "شارك تجربتك مع الآخرين",
  noteTitle: "لدي بعض الملاحظات",
  noteHint: "ساعدنا لنقدم لك الأفضل",
  noteLabel: "كيف يمكننا التحسن؟",
  nameLabel: "الاسم (اختياري)",
  contactLabel: "الهاتف أو البريد (اختياري)",
  tooShort: "من فضلك اكتب تفاصيل أكثر قليلاً.",
  send: "إرسال الملاحظات",
  sending: "جارٍ الإرسال…",
  error: "حدث خطأ ما. حاول مرة أخرى.",
  thanks: "شكرًا لك! نحن نقدر ملاحظاتك جداً.",
  close: "إغلاق",
};

export const strings: Localized<typeof en> = { en, ar };
