import type { Localized } from "@/shared/i18n";

export interface MenuStrings {
  brand: string;
  back: string;
  menu: string;
  intro: string;
  search: string;
  searchPlaceholder: string;
  close: string;
  signatures: string;
  pairings: string;
  categories: string;
  newLabel: string;
  soldOut: string;
  addToOrder: string;
  added: string;
  size: string;
  options: string;
  noOptions: string;
  orderTitle: string;
  emptyOrder: string;
  clearOrder: string;
  total: string;
  totalUnavailable: string;
  priceOnRequest: string;
  remove: string;
  increase: string;
  decrease: string;
  quantity: string;
  reviewOrder: string;
  orderNote: string;
  searchNoResults: string;
  loading: string;
  retry: string;
  refreshFailed: string;
  starterMenu: string;
  menuBeingPrepared: string;
  promoDismiss: string;
  openOffer: string;
  selected: string;
  updated: string;
}

export const strings: Localized<MenuStrings> = {
  en: {
    brand: "Kuji",
    back: "Back to home",
    menu: "Menu",
    intro: "Small moments, made memorable.",
    search: "Search menu",
    searchPlaceholder: "Search drinks and food",
    close: "Close",
    signatures: "Signature drinks",
    pairings: "Made for each other",
    categories: "Explore the menu",
    newLabel: "New",
    soldOut: "Sold out",
    addToOrder: "Add to order",
    added: "Added to your order",
    size: "Choose a size",
    options: "Make it yours",
    noOptions: "No extras available for this item.",
    orderTitle: "Your order",
    emptyOrder: "Your order is empty. Add something you love.",
    clearOrder: "Clear order",
    total: "Estimated total",
    totalUnavailable: "Total appears when all item prices are set",
    priceOnRequest: "Price on request",
    remove: "Remove",
    increase: "Increase quantity",
    decrease: "Decrease quantity",
    quantity: "Quantity",
    reviewOrder: "Review order",
    orderNote: "Note for the team (optional)",
    searchNoResults: "No matching items. Try another search.",
    loading: "Refreshing menu…",
    retry: "Try again",
    refreshFailed: "Could not refresh the menu. Showing the last available version.",
    starterMenu: "This menu is being prepared.",
    menuBeingPrepared: "Our menu is on its way. Please check back soon.",
    promoDismiss: "Dismiss promotion",
    openOffer: "View pairing",
    selected: "Selected",
    updated: "Updated",
  },
  ar: {
    brand: "كوجي",
    back: "العودة للرئيسية",
    menu: "القائمة",
    intro: "لحظات صغيرة تستحق أن تُذكر.",
    search: "البحث في القائمة",
    searchPlaceholder: "ابحث عن المشروبات والطعام",
    close: "إغلاق",
    signatures: "مشروباتنا المميزة",
    pairings: "اختيارات تكمل بعضها",
    categories: "استكشف القائمة",
    newLabel: "جديد",
    soldOut: "نفد مؤقتاً",
    addToOrder: "أضف إلى طلبك",
    added: "تمت الإضافة إلى طلبك",
    size: "اختر الحجم",
    options: "خصص طلبك",
    noOptions: "لا توجد إضافات لهذا المنتج.",
    orderTitle: "طلبك",
    emptyOrder: "طلبك فارغ. أضف ما تحب.",
    clearOrder: "إفراغ الطلب",
    total: "الإجمالي التقديري",
    totalUnavailable: "سيظهر الإجمالي بعد إضافة أسعار جميع المنتجات",
    priceOnRequest: "السعر عند الطلب",
    remove: "حذف",
    increase: "زيادة الكمية",
    decrease: "تقليل الكمية",
    quantity: "الكمية",
    reviewOrder: "مراجعة الطلب",
    orderNote: "ملاحظة للفريق (اختياري)",
    searchNoResults: "لا توجد نتائج مطابقة. جرّب بحثاً آخر.",
    loading: "يتم تحديث القائمة…",
    retry: "حاول مرة أخرى",
    refreshFailed: "تعذر تحديث القائمة. نعرض آخر نسخة متاحة.",
    starterMenu: "يتم تجهيز هذه القائمة.",
    menuBeingPrepared: "قائمتنا قيد التجهيز. يرجى العودة قريباً.",
    promoDismiss: "إغلاق العرض",
    openOffer: "عرض الاختيار",
    selected: "محدد",
    updated: "تم التحديث",
  },
};
