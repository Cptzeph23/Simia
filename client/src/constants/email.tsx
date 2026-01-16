import React from 'react';
import { EmailAction } from '@/types/email';
import { Mail, Star, Archive, Trash2, MailOpen, Tag } from 'lucide-react';

export const ITEMS_PER_PAGE = 50;

export const EMAIL_LABELS = {
  work: { label: 'Work', color: 'bg-blue-500' },
  personal: { label: 'Personal', color: 'bg-green-500' },
  important: { label: 'Important', color: 'bg-red-500' },
  travel: { label: 'Travel', color: 'bg-yellow-500' },
  finance: { label: 'Finance', color: 'bg-purple-500' },
  social: { label: 'Social', color: 'bg-pink-500' },
} as const;

// Helper function to create email actions
const createEmailAction = (
  id: string,
  label: string,
  icon: React.ReactNode,
  onClick: (ids: string[]) => void,
  variant: EmailAction['variant'] = 'ghost',
  isBulkAction: boolean = true
): EmailAction => ({
  id,
  label,
  icon,
  onClick,
  variant,
  isBulkAction
});

export const EMAIL_ACTIONS: EmailAction[] = [
  createEmailAction(
    'read',
    'Mark as Read',
    <MailOpen className="h-4 w-4" />,
    (ids) => console.log('Mark as read:', ids)
  ),
  createEmailAction(
    'unread',
    'Mark as Unread',
    <Mail className="h-4 w-4" />,
    (ids) => console.log('Mark as unread:', ids)
  ),
  createEmailAction(
    'star',
    'Star',
    <Star className="h-4 w-4" />,
    (ids) => console.log('Star emails:', ids)
  ),
  createEmailAction(
    'archive',
    'Archive',
    <Archive className="h-4 w-4" />,
    (ids) => console.log('Archive emails:', ids)
  ),
  createEmailAction(
    'delete',
    'Delete',
    <Trash2 className="h-4 w-4" />,
    (ids) => console.log('Delete emails:', ids),
    'destructive'
  ),
  createEmailAction(
    'label',
    'Label',
    <Tag className="h-4 w-4" />,
    (ids) => console.log('Label emails:', ids)
  )
];

export const EMAIL_FILTERS = [
  { id: 'inbox', label: 'Inbox', icon: 'inbox' },
  { id: 'starred', label: 'Starred', icon: 'star' },
  { id: 'sent', label: 'Sent', icon: 'send' },
  { id: 'drafts', label: 'Drafts', icon: 'file-text' },
  { id: 'trash', label: 'Trash', icon: 'trash' },
  { id: 'archived', label: 'Archived', icon: 'archive' },
];

export const EMAIL_SORT_OPTIONS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'subject-asc', label: 'Subject (A-Z)' },
  { id: 'subject-desc', label: 'Subject (Z-A)' },
];
