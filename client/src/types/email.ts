export type EmailFilter = 'all' | 'unread' | 'starred' | 'archived' | 'sent' | 'drafts' | 'trash';
export type EmailLabel = 'work' | 'personal' | 'important' | 'travel' | 'finance' | 'social';

export interface EmailAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Email {
  id: string;
  from: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isDraft?: boolean;
  isSent?: boolean;
  labels?: EmailLabel[];
  snippet: string;
  attachments?: EmailAttachment[];
  threadId?: string;
  inReplyTo?: string;
  references?: string[];
}

export interface EmailAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: (emailIds: string[]) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  isBulkAction?: boolean;
}
