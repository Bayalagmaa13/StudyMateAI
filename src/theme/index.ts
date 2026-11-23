export const colors = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primarySoft: '#EEF0FF',
  bg: '#F6F7FB',
  card: '#FFFFFF',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  successSoft: '#D1FAE5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',
  white: '#FFFFFF',
};

export const subjectColors = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6'];

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };

export const priorityMeta = {
  low: { label: 'Бага', color: '#10B981', bg: '#D1FAE5' },
  medium: { label: 'Дунд', color: '#F59E0B', bg: '#FEF3C7' },
  high: { label: 'Өндөр', color: '#EF4444', bg: '#FEE2E2' },
} as const;
