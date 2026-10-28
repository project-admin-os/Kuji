import type { Localized } from "@/shared/i18n";

const en = {
  brandName: "Kuji",
  adminBadge: "Admin",

  loginTitle: "Sign in",
  loginHint: "Manage reviews, the menu and settings.",
  usernameLabel: "Username",
  passwordLabel: "Password",
  showPassword: "Show password",
  hidePassword: "Hide password",
  signIn: "Sign in",
  signingIn: "Signing in…",
  errorCredentials: "Incorrect username or password.",
  errorInvalid: "Please check what you entered and try again.",
  errorBlocked: "Signing in isn't allowed from this address.",
  errorNetwork: "Can't reach the server. Check your connection and try again.",
  errorServer: "Something went wrong on our side. Please try again.",
  rateLimited: "Too many attempts. Try again in {time}.",
  sessionExpired: "Your session expired. Please sign in again.",
  logoutIncomplete:
    "You're signed out here, but we couldn't reach the server to confirm. Your session there will end on its own.",

  checking: "Checking your session…",
  unavailable: "Can't reach the server.",
  retry: "Try again",

  navLabel: "Admin sections",
  logout: "Log out",
  loggingOut: "Logging out…",
  tabs: {
    reviews: "Reviews",
    menu: "Menu",
    settings: "Settings",
  },
  tabHints: {
    reviews: "Customer feedback will appear here.",
    menu: "Menu editing will be available here.",
    settings: "Account settings will be available here.",
  },
  comingSoon: "Coming soon",
  notFoundTitle: "Page not found",
  notFoundHint: "This page doesn't exist in the admin area.",
  notFoundAction: "Go to Reviews",
};

const ar: typeof en = {
  brandName: "Kuji",
  adminBadge: "لوحة التحكم",

  loginTitle: "تسجيل الدخول",
  loginHint: "إدارة التقييمات والقائمة والإعدادات.",
  usernameLabel: "اسم المستخدم",
  passwordLabel: "كلمة المرور",
  showPassword: "إظهار كلمة المرور",
  hidePassword: "إخفاء كلمة المرور",
  signIn: "تسجيل الدخول",
  signingIn: "جارٍ تسجيل الدخول…",
  errorCredentials: "اسم المستخدم أو كلمة المرور غير صحيحة.",
  errorInvalid: "من فضلك راجع ما أدخلته وحاول مرة أخرى.",
  errorBlocked: "لا يمكن تسجيل الدخول من هذا العنوان.",
  errorNetwork: "تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.",
  errorServer: "حدث خطأ من جانبنا. حاول مرة أخرى.",
  rateLimited: "محاولات كثيرة. حاول مرة أخرى بعد {time}.",
  sessionExpired: "انتهت جلستك. سجّل الدخول مرة أخرى.",
  logoutIncomplete:
    "تم تسجيل خروجك هنا، لكن تعذّر الاتصال بالخادم للتأكيد. ستنتهي الجلسة هناك تلقائياً.",

  checking: "جارٍ التحقق من الجلسة…",
  unavailable: "تعذّر الاتصال بالخادم.",
  retry: "حاول مرة أخرى",

  navLabel: "أقسام لوحة التحكم",
  logout: "تسجيل الخروج",
  loggingOut: "جارٍ تسجيل الخروج…",
  tabs: {
    reviews: "التقييمات",
    menu: "القائمة",
    settings: "الإعدادات",
  },
  tabHints: {
    reviews: "ستظهر ملاحظات العملاء هنا.",
    menu: "ستتمكن من تعديل القائمة من هنا.",
    settings: "ستجد إعدادات الحساب هنا.",
  },
  comingSoon: "قريباً",
  notFoundTitle: "الصفحة غير موجودة",
  notFoundHint: "هذه الصفحة غير موجودة في لوحة التحكم.",
  notFoundAction: "الذهاب إلى التقييمات",
};

export const strings: Localized<typeof en> = { en, ar };
