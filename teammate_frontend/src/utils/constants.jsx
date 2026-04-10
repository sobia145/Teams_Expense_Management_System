export const APP_NAME = 'Team Expense Management System';

export const NAV_LINKS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Groups', path: '/groups' },
  { label: 'Expenses', path: '/expenses' },
  { label: 'Budgets', path: '/budgets' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Settlement', path: '/settlement' },
  { label: 'History', path: '/history' },
  { label: 'Users', path: '/users' }
];

export const BUDGET_CATEGORIES = ['Travel', 'Food', 'Stay', 'Activities', 'Other'];

export const STATUS_COLORS = {
  PENDING: 'var(--warning-600)',
  APPROVED: 'var(--success-600)',
  DISPUTED: 'var(--danger-600)',
  OBJECTED: 'var(--danger-600)',
  PAID: 'var(--brand-700)'
};

export const mockUser = {
  id: 1,
  name: 'Keshav Anand',
  email: 'keshav@example.com',
  role: 'Group Admin'
};

export const mockGroups = [
  {
    id: 1,
    name: 'Goa 2026 Trip',
    members: ['Keshav', 'Akhil', 'Sneha', 'Riya'],
    totalSpent: 73400,
    pendingApprovals: 2,
    tripLocked: false
  },
  {
    id: 2,
    name: 'Final Year Project Team',
    members: ['Keshav', 'Manoj', 'Ishita'],
    totalSpent: 12800,
    pendingApprovals: 1,
    tripLocked: false
  }
];

export const mockExpenses = [
  {
    id: 1,
    groupId: 1,
    title: 'Resort Booking Advance',
    amount: 25000,
    payer: 'Keshav',
    category: 'Stay',
    status: 'APPROVED',
    createdAt: '2026-04-02T10:30:00',
    objectionWindowHours: 24
  },
  {
    id: 2,
    groupId: 1,
    title: 'Airport Cab',
    amount: 3200,
    payer: 'Akhil',
    category: 'Travel',
    status: 'PENDING',
    createdAt: '2026-04-04T08:10:00',
    objectionWindowHours: 24
  },
  {
    id: 3,
    groupId: 2,
    title: 'Prototype Materials',
    amount: 4300,
    payer: 'Ishita',
    category: 'Other',
    status: 'OBJECTED',
    objectionReason: 'Need the purchase bill and vendor quote before approval.',
    objectionRaisedAt: '2026-04-03T15:00:00',
    createdAt: '2026-04-03T14:20:00',
    objectionWindowHours: 24
  }
];

export const mockBudgets = [
  { id: 1, groupId: 1, category: 'Travel', limit: 20000, spent: 17800 },
  { id: 2, groupId: 1, category: 'Food', limit: 15000, spent: 16500 },
  { id: 3, groupId: 1, category: 'Stay', limit: 35000, spent: 25000 },
  { id: 4, groupId: 2, category: 'Other', limit: 7000, spent: 4300 }
];

export const mockNotifications = [
  {
    id: 1,
    type: 'approval',
    title: 'Expense needs your review',
    message: 'Airport Cab was submitted in Goa 2026 Trip.',
    createdAt: '2026-04-04T09:00:00',
    read: false
  },
  {
    id: 2,
    type: 'budget',
    title: 'Budget threshold exceeded',
    message: 'Food category crossed 100% in Goa 2026 Trip.',
    createdAt: '2026-04-04T11:40:00',
    read: false
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Payment reminder',
    message: 'You have one pending settlement payment.',
    createdAt: '2026-04-04T16:10:00',
    read: true
  }
];

export const mockHistory = [
  {
    id: 1,
    event: 'Expense Submitted',
    actor: 'Akhil',
    details: 'Airport Cab submitted for Rs. 3200 in Goa 2026 Trip.',
    time: '2026-04-04T08:10:00'
  },
  {
    id: 2,
    event: 'Budget Alert Triggered',
    actor: 'System',
    details: 'Food budget exceeded for Goa 2026 Trip.',
    time: '2026-04-04T11:40:00'
  },
  {
    id: 3,
    event: 'Expense Objection Raised',
    actor: 'Keshav',
    details: 'Objection raised for Prototype Materials in Project Team group.',
    time: '2026-04-03T15:00:00'
  }
];

export const mockSettlements = [
  {
    id: 1,
    teamName: 'Goa 2026 Trip',
    expenseId: 1,
    expenseTitle: 'Resort Booking Advance',
    from: 'Riya',
    to: 'Keshav',
    amount: 8400,
    status: 'PENDING'
  },
  {
    id: 2,
    teamName: 'Goa 2026 Trip',
    expenseId: 1,
    expenseTitle: 'Resort Booking Advance',
    from: 'Akhil',
    to: 'Keshav',
    amount: 5200,
    status: 'PENDING'
  },
  {
    id: 3,
    teamName: 'Final Year Project Team',
    expenseId: 3,
    expenseTitle: 'Prototype Materials',
    from: 'Manoj',
    to: 'Ishita',
    amount: 2150,
    status: 'PAID'
  }
];
