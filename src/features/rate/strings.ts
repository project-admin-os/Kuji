import type { Localized } from '@/shared/i18n';

const en = {
  title: 'Rate us',
  comingSoon: 'The review form is coming soon.',
  close: 'Close',
};

const ar: typeof en = {
  title: 'قيّم تجربتك',
  comingSoon: 'نموذج التقييم سيكون متاحًا قريبًا.',
  close: 'إغلاق',
};

export const strings: Localized<typeof en> = { en, ar };
