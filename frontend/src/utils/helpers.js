import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDate = (date) => {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'dd MMM yyyy');
};

export const formatDateShort = (date) => format(new Date(date), 'dd MMM');

export const formatDateTime = (date) => format(new Date(date), 'dd MMM yyyy, hh:mm a');

export const formatRelative = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

export const getMonthName = (month) => {
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return names[month - 1];
};

export const getCurrentMonthYear = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

export const CATEGORY_COLORS = {
  'Food & Dining': '#f97316',
  'Transportation': '#3b82f6',
  'Shopping': '#a855f7',
  'Entertainment': '#ec4899',
  'Health & Medical': '#10b981',
  'Housing & Utilities': '#f59e0b',
  'Education': '#6366f1',
  'Travel': '#14b8a6',
  'Personal Care': '#f43f5e',
  'Investment': '#22c55e',
  'Income': '#10b981',
  'Other': '#6b7280',
};

export const CATEGORY_ICONS = {
  'Food & Dining': '🍽️',
  'Transportation': '🚗',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Health & Medical': '💊',
  'Housing & Utilities': '🏠',
  'Education': '📚',
  'Travel': '✈️',
  'Personal Care': '💄',
  'Investment': '📈',
  'Income': '💰',
  'Other': '📦',
};

export const GOAL_CATEGORIES = [
  'Emergency Fund', 'Travel', 'Education', 'Home', 'Vehicle', 'Retirement', 'Investment', 'Other'
];

export const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Health & Medical', 'Housing & Utilities', 'Education', 'Travel',
  'Personal Care', 'Investment', 'Other',
];

export const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
};

export const truncate = (str, n = 30) => str?.length > n ? str.slice(0, n) + '...' : str;

export const classNames = (...classes) => classes.filter(Boolean).join(' ');
