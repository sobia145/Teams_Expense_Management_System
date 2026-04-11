export const APP_NAME = 'Team Expense Management System';

export const NAV_LINKS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Groups', path: '/groups' },
  { label: 'Expenses', path: '/expenses' },
  { label: 'Budgets', path: '/budgets' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Settlement', path: '/settlement' },
  { label: 'History', path: '/history' },
  { label: 'Users', path: '/admin/users' }
];

export const BUDGET_CATEGORIES = ['Travel', 'Food', 'Stay', 'Activities', 'Other'];

export const STATUS_COLORS = {
  PENDING: 'var(--warning-600)',
  APPROVED: 'var(--success-600)',
  DISPUTED: 'var(--danger-600)',
  OBJECTED: 'var(--danger-600)',
  PAID: 'var(--brand-700)'
};
