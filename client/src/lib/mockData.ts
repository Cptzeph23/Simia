import { create } from 'zustand';

export type Role = 'BOSS' | 'EMPLOYEE' | 'ACCOUNTANT';

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string;
}

export type PolicyType = 'Auto' | 'Home' | 'Health' | 'Life' | 'WIBA' | 'Bid Bond' | 'Fire' | 'Burglary';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export const TASK_PRIORITIES = {
  LOW: {
    label: 'Low',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    iconName: 'circle',
    iconColor: 'text-gray-400',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    iconName: 'circle',
    iconColor: 'text-blue-400',
  },
  HIGH: {
    label: 'High',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    iconName: 'circle',
    iconColor: 'text-amber-400',
  },
  URGENT: {
    label: 'Urgent',
    color: 'bg-red-50 text-red-700 border-red-200',
    iconName: 'alert-circle',
    iconColor: 'text-red-500',
  },
} as const;

export interface Claim {
  id: string;
  policyHolder: string;
  policyNumber: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  date: string;
  type: PolicyType;
}

export interface Renewal {
  id: string;
  clientName: string;
  policyNumber: string;
  premium: number;
  dueDate: string;
  status: 'UPCOMING' | 'PROCESSING' | 'AWAITING_PAYMENT' | 'PAID' | 'OVERDUE';
  type: PolicyType;
}

export interface Client {
  id: string;
  name: string;
  kraPin?: string;
  idNumber?: string;
  phone: string;
  email: string;
  location: string;
  policies: string[]; // Policy IDs
}

export interface ClientRef {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  client?: ClientRef;  // Optional client reference
  description?: string; // Optional description
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  type: PolicyType | string;
  transactionType: 'INCOME' | 'EXPENSE';
  paymentMethod?: string;
  reference?: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'UPCOMING' | 'PAID';
  transactionType: 'EXPENSE';
}

export interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  labels?: string[];
}

// Mock Data
export const USERS: User[] = [
  { id: '1', name: 'David Bossman', role: 'BOSS', avatar: 'https://i.pravatar.cc/150?u=1', email: 'boss@simia.com' },
  { id: '2', name: 'Sarah Agent', role: 'EMPLOYEE', avatar: 'https://i.pravatar.cc/150?u=2', email: 'sarah@simia.com' },
  { id: '3', name: 'Mike Broker', role: 'EMPLOYEE', avatar: 'https://i.pravatar.cc/150?u=3', email: 'mike@simia.com' },
  { id: '4', name: 'Jessica Claims', role: 'EMPLOYEE', avatar: 'https://i.pravatar.cc/150?u=4', email: 'jess@simia.com' },
  { id: '5', name: 'Tom Sales', role: 'EMPLOYEE', avatar: 'https://i.pravatar.cc/150?u=5', email: 'tom@simia.com' },
  { id: '6', name: 'Emily Support', role: 'EMPLOYEE', avatar: 'https://i.pravatar.cc/150?u=6', email: 'emily@simia.com' },
  { id: '7', name: 'Alex Tech', role: 'EMPLOYEE', avatar: 'https://i.pravatar.cc/150?u=7', email: 'alex@simia.com' },
  { id: '8', name: 'John Ledger', role: 'ACCOUNTANT', avatar: 'https://i.pravatar.cc/150?u=8', email: 'john@simia.com' },
];

const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Review Q3 Sales Report', description: 'Analyze the performance of the sales team.', assigneeId: '2', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: '2024-11-30' },
  { id: 't2', title: 'Process Claim #4421', description: 'Verify documents for the car accident claim.', assigneeId: '4', status: 'TODO', priority: 'MEDIUM', dueDate: '2024-12-01' },
  { id: 't3', title: 'Client Meeting with TechCorp', description: 'Discuss renewal options for their group health plan.', assigneeId: '3', status: 'DONE', priority: 'HIGH', dueDate: '2024-11-28' },
  { id: 't4', title: 'Update Website Content', description: 'Add new testimonials to the homepage.', assigneeId: '7', status: 'TODO', priority: 'LOW', dueDate: '2024-12-05' },
  { id: 't5', title: 'Prepare WIBA Quote', description: 'Prepare WIBA quote for Construction Co Ltd.', assigneeId: '2', status: 'TODO', priority: 'HIGH', dueDate: '2024-12-02' },
];

const INITIAL_CLAIMS: Claim[] = [
  { id: 'c1', policyHolder: 'John Doe', policyNumber: 'POL-9982', amount: 45000, status: 'PENDING', date: '2024-11-25', type: 'Auto' },
  { id: 'c2', policyHolder: 'Jane Smith', policyNumber: 'POL-1122', amount: 120000, status: 'APPROVED', date: '2024-11-20', type: 'Health' },
  { id: 'c3', policyHolder: 'Acme Corp', policyNumber: 'POL-5543', amount: 850000, status: 'PAID', date: '2024-11-15', type: 'WIBA' },
  { id: 'c4', policyHolder: 'BuildIt Ltd', policyNumber: 'POL-3399', amount: 2500000, status: 'PENDING', date: '2024-11-28', type: 'Bid Bond' },
];

const INITIAL_RENEWALS: Renewal[] = [
  { id: 'r1', clientName: 'Alice Johnson', policyNumber: 'POL-7765', premium: 25000, dueDate: '2024-12-01', status: 'UPCOMING', type: 'Auto' },
  { id: 'r2', clientName: 'Bob Brown', policyNumber: 'POL-3321', premium: 15000, dueDate: '2024-11-28', status: 'OVERDUE', type: 'Home' },
  { id: 'r3', clientName: 'Charlie White', policyNumber: 'POL-9900', premium: 45000, dueDate: '2024-12-10', status: 'UPCOMING', type: 'Health' },
];

const INITIAL_INVOICES: Invoice[] = [
  { id: 'inv1', invoiceNumber: 'INV-001', clientName: 'TechSolutions Ltd', amount: 150000, date: '2024-11-25', status: 'PAID', type: 'WIBA', transactionType: 'INCOME' },
  { id: 'inv2', invoiceNumber: 'INV-002', clientName: 'Green Energy Corp', amount: 45000, date: '2024-11-28', status: 'PENDING', type: 'Auto', transactionType: 'INCOME' },
  { id: 'inv3', invoiceNumber: 'INV-003', clientName: 'City Construction', amount: 12000, date: '2024-11-29', status: 'PENDING', type: 'Bid Bond', transactionType: 'INCOME' },
];

const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp1', category: 'Rent', description: 'Office Rent - December', amount: 150000, date: '2024-12-01', status: 'UPCOMING', transactionType: 'EXPENSE' },
  { id: 'exp2', category: 'Utilities', description: 'Electricity Bill', amount: 8500, date: '2024-11-30', status: 'PAID', transactionType: 'EXPENSE' },
  { id: 'exp3', category: 'Software', description: 'CRM License', amount: 12000, date: '2024-12-05', status: 'UPCOMING', transactionType: 'EXPENSE' },
];

const INITIAL_EMAILS: Email[] = [
  { 
    id: 'e1', 
    from: 'client@techcorp.com', 
    subject: 'Request for Proposal - Group Health', 
    snippet: 'Hi Sarah, we are looking to renew...', 
    body: 'Hi Sarah, we are looking to renew our group health policy for next year. Can we schedule a meeting?', 
    date: new Date().toISOString(), 
    isRead: false, 
    isStarred: true, 
    isArchived: false 
  },
  { 
    id: 'e2', 
    from: 'info@construction.co.ke', 
    subject: 'WIBA Quote Needed Urgent', 
    snippet: 'We have a new project starting...', 
    body: 'We have a new project starting next week and need a WIBA quote for 50 employees.', 
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    isRead: false, 
    isStarred: false, 
    isArchived: false 
  },
  { 
    id: 'e3', 
    from: 'david@simia.com', 
    subject: 'Staff Meeting', 
    snippet: 'Please attend the staff meeting...', 
    body: 'Please attend the staff meeting tomorrow at 9 AM.', 
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    isRead: true, 
    isStarred: false, 
    isArchived: true 
  },
];

interface StoreState {
  currentUser: User;
  tasks: Task[];
  claims: Claim[];
  renewals: Renewal[];
  users: User[];
  invoices: Invoice[];
  expenses: Expense[];
  clients: Client[];
  emails: Email[];
  setCurrentUser: (user: User) => void;
  addTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  addClient: (client: Client) => void;
  updateRenewalStatus: (renewalId: string, status: Renewal['status']) => void;
  addInvoice: (invoice: Invoice) => void;
  addExpense: (expense: Expense) => void;
  markEmailRead: (emailId: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  currentUser: USERS[0], // Default to Boss
  tasks: INITIAL_TASKS,
  claims: INITIAL_CLAIMS,
  renewals: INITIAL_RENEWALS,
  users: USERS,
  invoices: INITIAL_INVOICES,
  expenses: INITIAL_EXPENSES,
  clients: [],
  emails: INITIAL_EMAILS,
  setCurrentUser: (user) => set({ currentUser: user }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTaskStatus: (taskId, status) => set((state) => ({
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t)
  })),
  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
  updateRenewalStatus: (renewalId, status) => set((state) => ({
    renewals: state.renewals.map(r => r.id === renewalId ? { ...r, status } : r)
  })),
  addInvoice: (invoice) => set((state) => ({ invoices: [invoice, ...state.invoices] })),
  addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
  markEmailRead: (emailId) => set((state) => ({
    emails: state.emails.map(e => e.id === emailId ? { ...e, isRead: true } : e)
  })),
}));
