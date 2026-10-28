import type { Localized } from "@/shared/i18n";

const en = {
  title: "Settings",
  description: "Manage your language and sign-in details.",
  saving: "Saving…",
  retry: "Try again",
  showPassword: "Show password",
  hidePassword: "Hide password",
  cancel: "Cancel",

  languageTitle: "Language",
  languageHint: "Choose the dashboard language. It's saved to your account.",
  languageGroup: "Dashboard language",
  languageSaved: "Saved.",
  languageFailed: "Couldn't save your language, so it was switched back.",

  usernameTitle: "Username",
  usernameHint: "This is the name you sign in with.",
  newUsernameLabel: "New username",
  usernameRules:
    "3 to 50 characters: lowercase letters, numbers, dots, underscores and hyphens.",
  usernameIssues: {
    tooShort: "Use at least 3 characters.",
    tooLong: "Use 50 characters or fewer.",
    chars: "Use only lowercase letters, numbers, dots, underscores and hyphens.",
  },
  saveUsername: "Save username",
  usernameConfirmTitle: "Change your username?",
  usernameConfirmBody: "You'll sign in as {name} from now on.",
  usernameConfirmAction: "Yes, change it",
  usernameSaved: "Username updated.",

  passwordTitle: "Password",
  passwordHint: "Choose a new password. Your other devices will be signed out.",
  newPasswordLabel: "New password",
  confirmPasswordLabel: "Confirm new password",
  rulesGroup: "Password requirements",
  rules: {
    length: "Between 10 and 72 bytes ({count} now)",
    notUsername: "Different from your username",
  },
  ruleMet: "Met",
  ruleNotMet: "Not met",
  bytesNote: "Most symbols count as 1 byte. Arabic letters and emoji use more.",
  mismatch: "The passwords don't match.",
  savePassword: "Save password",
  passwordConfirmTitle: "Change your password?",
  passwordConfirmBody:
    "Your other devices will be signed out. This device stays signed in.",
  passwordConfirmAction: "Yes, change it",
  passwordSaved: "Password changed. Your other devices were signed out.",

  errors: {
    invalid_username: "That username isn't valid.",
    unchanged: "That's already your username.",
    username_taken: "That username is taken. Try another one.",
    weak_password: "That password doesn't meet the requirements.",
    same_password: "The new password must be different from the current one.",
    generic: "Couldn't save. Check your connection and try again.",
  },
};

const ar: typeof en = {
  title: "الإعدادات",
  description: "إدارة اللغة وبيانات تسجيل الدخول.",
  saving: "جارٍ الحفظ…",
  retry: "حاول مرة أخرى",
  showPassword: "إظهار كلمة المرور",
  hidePassword: "إخفاء كلمة المرور",
  cancel: "إلغاء",

  languageTitle: "اللغة",
  languageHint: "اختر لغة لوحة التحكم. يتم حفظها في حسابك.",
  languageGroup: "لغة لوحة التحكم",
  languageSaved: "تم الحفظ.",
  languageFailed: "تعذّر حفظ اللغة، لذلك تمت إعادتها كما كانت.",

  usernameTitle: "اسم المستخدم",
  usernameHint: "هو الاسم الذي تسجّل به الدخول.",
  newUsernameLabel: "اسم المستخدم الجديد",
  usernameRules:
    "من 3 إلى 50 حرفاً: حروف إنجليزية صغيرة وأرقام ونقطة وشرطة سفلية وشرطة.",
  usernameIssues: {
    tooShort: "استخدم 3 أحرف على الأقل.",
    tooLong: "الحد الأقصى 50 حرفاً.",
    chars: "استخدم حروفاً إنجليزية صغيرة وأرقاماً والرموز . _ - فقط.",
  },
  saveUsername: "حفظ اسم المستخدم",
  usernameConfirmTitle: "تغيير اسم المستخدم؟",
  usernameConfirmBody: "ستسجّل الدخول باسم {name} من الآن فصاعداً.",
  usernameConfirmAction: "نعم، غيّره",
  usernameSaved: "تم تحديث اسم المستخدم.",

  passwordTitle: "كلمة المرور",
  passwordHint: "اختر كلمة مرور جديدة. سيتم تسجيل الخروج من أجهزتك الأخرى.",
  newPasswordLabel: "كلمة المرور الجديدة",
  confirmPasswordLabel: "تأكيد كلمة المرور الجديدة",
  rulesGroup: "شروط كلمة المرور",
  rules: {
    length: "من 10 إلى 72 بايت (الحالي {count})",
    notUsername: "تختلف عن اسم المستخدم",
  },
  ruleMet: "مستوفى",
  ruleNotMet: "غير مستوفى",
  bytesNote: "معظم الرموز تُحسب بايتاً واحداً، أما الحروف العربية والإيموجي فتحتاج أكثر.",
  mismatch: "كلمتا المرور غير متطابقتين.",
  savePassword: "حفظ كلمة المرور",
  passwordConfirmTitle: "تغيير كلمة المرور؟",
  passwordConfirmBody:
    "سيتم تسجيل الخروج من أجهزتك الأخرى، وسيبقى هذا الجهاز مسجّلاً.",
  passwordConfirmAction: "نعم، غيّرها",
  passwordSaved: "تم تغيير كلمة المرور. تم تسجيل الخروج من أجهزتك الأخرى.",

  errors: {
    invalid_username: "اسم المستخدم غير صالح.",
    unchanged: "هذا هو اسم المستخدم الحالي بالفعل.",
    username_taken: "اسم المستخدم هذا مستخدم بالفعل. جرّب اسماً آخر.",
    weak_password: "كلمة المرور لا تستوفي الشروط.",
    same_password: "يجب أن تختلف كلمة المرور الجديدة عن الحالية.",
    generic: "تعذّر الحفظ. تحقق من الاتصال وحاول مرة أخرى.",
  },
};

export const strings: Localized<typeof en> = { en, ar };
