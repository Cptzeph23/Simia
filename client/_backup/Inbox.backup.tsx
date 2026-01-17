import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useDebounce } from 'use-debounce';
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { 
  Mail, Check, Star, Archive, Trash2, RefreshCw, Search, 
  Filter, Inbox as InboxIcon, MailWarning, Star as StarFilled, 
  ArrowRight, X, Tag, MoreVertical, ChevronLeft, ChevronRight, 
  MailOpen, Clock, Reply, ReplyAll, Forward, FileText, Paperclip 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Lazy load heavy components
const EmailEditor = lazy(() => import('@/components/email/EmailEditor'));
const EmailPreview = lazy(() => import('@/components/email/EmailPreview'));

// Types
type EmailFilter = 'all' | 'unread' | 'starred' | 'archived' | 'sent' | 'drafts' | 'trash';
type EmailLabel = 'work' | 'personal' | 'important' | 'travel' | 'finance' | 'social';

interface Email {
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
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  threadId?: string;
  inReplyTo?: string;
  references?: string[];
}

interface EmailAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: (emailIds: string[]) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  isBulkAction?: boolean;
}

// Constants
const EMAIL_LABELS: { [key in EmailLabel]: { label: string; color: string } } = {
  work: { label: 'Work', color: 'bg-blue-500' },
  personal: { label: 'Personal', color: 'bg-green-500' },
  important: { label: 'Important', color: 'bg-red-500' },
  travel: { label: 'Travel', color: 'bg-yellow-500' },
  finance: { label: 'Finance', color: 'bg-purple-500' },
  social: { label: 'Social', color: 'bg-pink-500' },
};

const EMAIL_ACTIONS: EmailAction[] = [
  {
    id: 'read',
    label: 'Mark as Read',
    icon: <MailOpen className="h-4 w-4" />,
    onClick: (ids) => console.log('Mark as read:', ids),
    variant: 'ghost',
    isBulkAction: true
  },
  {
    id: 'unread',
    label: 'Mark as Unread',
    icon: <Mail className="h-4 w-4" />,
    onClick: (ids) => console.log('Mark as unread:', ids),
    variant: 'ghost',
    isBulkAction: true
  },
  {
    id: 'star',
    label: 'Star',
    icon: <Star className="h-4 w-4" />,
    onClick: (ids) => console.log('Star:', ids),
    variant: 'ghost'
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: <Archive className="h-4 w-4" />,
    onClick: (ids) => console.log('Archive:', ids),
    variant: 'ghost',
    isBulkAction: true
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: (ids) => console.log('Delete:', ids),
    variant: 'ghost',
    isBulkAction: true
  },
  {
    id: 'label',
    label: 'Add Label',
    icon: <Tag className="h-4 w-4" />,
    onClick: (ids) => console.log('Add label to:', ids),
    variant: 'ghost',
    isBulkAction: true
  }
];

// Utility functions
const formatDate = (dateString: string): string => {
  try {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Email List Item Component
const EmailListItem = React.memo(({ 
  email, 
  isSelected, 
  onSelect, 
  onClick,
  onStar,
  className = ''
}: { 
  email: Email; 
  isSelected: boolean; 
  onSelect: (id: string, checked: boolean) => void;
  onClick: (id: string) => void;
  onStar: (id: string, isStarred: boolean) => void;
  className?: string;
}) => {
  const hasAttachments = email.attachments && email.attachments.length > 0;
  
  return (
    <div 
      className={cn(
        "group relative flex items-start p-3 hover:bg-muted/30 transition-colors cursor-pointer border-b border-border/50",
        !email.isRead && "bg-muted/10",
        isSelected && "bg-primary/5",
        className
      )}
      onClick={() => onClick(email.id)}
    >
      <div className="flex items-center mr-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(email.id, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStar(email.id, !email.isStarred);
              }}
              className="mr-2 text-muted-foreground hover:text-amber-500 transition-colors"
            >
              {email.isStarred ? (
                <StarFilled className="h-4 w-4 text-amber-500 fill-current" />
              ) : (
                <Star className="h-4 w-4 opacity-0 group-hover:opacity-100" />
              )}
            </button>
            <p className={cn(
              "text-sm font-medium truncate",
              !email.isRead && "font-semibold"
            )}>
              {email.from.split('<')[0].trim()}
            </p>
          </div>
          <div className="flex items-center text-xs text-muted-foreground ml-2 whitespace-nowrap">
            {formatDate(email.date)}
          </div>
        </div>
        
        <div className="mt-1">
          <div className="flex items-center">
            <h4 className={cn(
              "text-sm truncate pr-2",
              !email.isRead ? "font-medium" : "text-muted-foreground"
            )}>
              {email.subject || "(No subject)"}
            </h4>
            {hasAttachments && (
              <Paperclip className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-1">
            {email.snippet || email.body.substring(0, 100)}{email.body.length > 100 ? '...' : ''}
          </p>
        </div>
        
        {email.labels && email.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {email.labels.slice(0, 2).map((label) => (
              <Badge 
                key={label} 
                variant="outline"
                className={cn(
                  "text-xs font-normal",
                  EMAIL_LABELS[label]?.color && `bg-${EMAIL_LABELS[label].color.split('-')[1]}-100 text-${EMAIL_LABELS[label].color.split('-')[1]}-800 border-${EMAIL_LABELS[label].color.split('-')[1]}-200`
                )}
              >
                {EMAIL_LABELS[label]?.label || label}
              </Badge>
            ))}
            {email.labels.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{email.labels.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

EmailListItem.displayName = 'EmailListItem';

// Email List Component
const EmailList = ({
  emails,
  selectedEmails,
  onSelectEmail,
  onSelectOne,
  onStarEmail,
  isLoading,
  emptyMessage = "No emails found"
}: {
  emails: Email[];
  selectedEmails: string[];
  onSelectEmail: (id: string) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onStarEmail: (id: string, isStarred: boolean) => void;
  isLoading: boolean;
  emptyMessage?: string;
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Mail className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No emails found</h3>
        <p className="text-sm text-muted-foreground mt-1">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {emails.map((email) => (
        <EmailListItem
          key={email.id}
          email={email}
          isSelected={selectedEmails.includes(email.id)}
          onSelect={onSelectOne}
          onClick={onSelectEmail}
          onStar={onStarEmail}
        />
      ))}
    </div>
  );
};

// Main Inbox Component
export default function Inbox() {
  const { emails, markEmailRead, addTask, currentUser } = useStore();
  const { toast } = useToast();
  
  // State
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [filter, setFilter] = useState<EmailFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Check mobile view on mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Email actions
  const markEmailStarred = useCallback((id: string, isStarred: boolean) => {
    console.log(`Email ${id} ${isStarred ? 'starred' : 'unstarred'}`);
    // In a real app, this would update the email in the store
    // markEmailStarred(id, isStarred);
  }, []);

  const archiveEmail = useCallback((id: string) => {
    console.log(`Email ${id} archived`);
    // In a real app, this would update the email in the store
    // archiveEmail(id);
  }, []);

  const deleteEmail = useCallback((id: string) => {
    console.log(`Email ${id} deleted`);
    // In a real app, this would update the email in the store
    // deleteEmail(id);
  }, []);

  // Filter and sort emails
  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      // Skip archived emails unless we're in the archived view
      if (filter !== 'archived' && email.isArchived) return false;
      
      // Filter by search query
      const matchesSearch = !debouncedSearch || 
        email.subject.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        email.from.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        email.body.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (email.labels?.some(label => 
          EMAIL_LABELS[label as EmailLabel]?.label.toLowerCase().includes(debouncedSearch.toLowerCase())
        )) || false;
      
      // Apply current filter
      const matchesFilter = 
        filter === 'all' ||
        (filter === 'unread' && !email.isRead) ||
        (filter === 'starred' && email.isStarred) ||
        (filter === 'archived' && email.isArchived) ||
        (filter === 'sent' && email.isSent) ||
        (filter === 'drafts' && email.isDraft) ||
        (filter === 'trash' && email.isArchived);
      
      return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [emails, debouncedSearch, filter]);

  // Get the currently selected email
  const currentEmail = useMemo(() => 
    emails.find(e => e.id === selectedEmail),
    [emails, selectedEmail]
  );

  // Handle email selection
  const handleSelectEmail = useCallback((id: string) => {
    setSelectedEmail(id);
    markEmailRead(id);
    
    if (isMobileView) {
      setShowSidebar(false);
    }
  }, [isMobileView, markEmailRead]);

  // Handle email selection (for checkboxes)
  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedEmails(prev => 
      checked 
        ? [...prev, id] 
        : prev.filter(emailId => emailId !== id)
    );
  }, []);

  // Handle select all/none
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedEmails(filteredEmails.map(email => email.id));
    } else {
      setSelectedEmails([]);
    }
  }, [filteredEmails]);

  // Handle email actions
  const handleEmailAction = useCallback((action: EmailAction) => {
    const targetEmails = selectedEmails.length > 0 ? selectedEmails : 
      (selectedEmail ? [selectedEmail] : []);
    
    if (targetEmails.length === 0) return;
    
    action.onClick(targetEmails);
    
    // Reset selection after action
    if (action.isBulkAction) {
      setSelectedEmails([]);
    }
  }, [selectedEmails, selectedEmail]);

  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      const matchesSearch = !debouncedSearch || 
        email.subject.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        email.from.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        email.body.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
        (filter === 'unread' && !email.isRead) ||
        (filter === 'starred' && email.isStarred) ||
        (filter === 'archived' && email.isArchived);
      
      return matchesSearch && matchesFilter && !email.isArchived;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [emails, debouncedSearch, filter]);

  const currentEmail = useMemo(() => 
    emails.find(e => e.id === selectedEmail),
    [emails, selectedEmail]
  );

  const handleOpenEmail = useCallback((id: string) => {
    setSelectedEmail(id);
    markEmailRead(id);
    if (window.innerWidth < 768) {
      // In mobile view, scroll to top when opening email
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [markEmailRead]);

  const handleConvertToTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmail) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    addTask({
      id: `t-${Date.now()}`,
      title: formData.get('title') as string || currentEmail.subject,
      description: (formData.get('description') as string) || `${currentEmail.body}\n\nSource: Email from ${currentEmail.from}`,
      assigneeId: currentUser.id,
      status: 'TODO',
      priority: (formData.get('priority') as any) || 'MEDIUM',
      dueDate: formData.get('dueDate') as string || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    setIsTaskDialogOpen(false);
    toast({
      title: "Task Created",
      description: "The email has been converted into a task.",
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Inbox refreshed",
        description: `Found ${emails.length} emails.`,
      });
    }, 1000);
  };

  const handleToggleSelect = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map(email => email.id));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return '';
      
      // Handle both string timestamps and ISO strings
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        // Try parsing as ISO string if direct date construction fails
        const isoDate = new Date(dateString);
        if (isNaN(isoDate.getTime())) {
          return ''; // Return empty string for invalid dates
        }
        return format(isoDate, 'MMM d');
      }
      
      if (isToday(date)) {
        return format(date, 'h:mm a');
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM d');
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return ''; // Return empty string on error
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-serif font-semibold">Inbox</h1>
          <p className="text-sm text-muted-foreground">Manage your emails and convert them to tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button size="sm" disabled={selectedEmails.length === 0} variant="outline" className="gap-2">
            <Archive className="h-4 w-4" />
            <span className="hidden sm:inline">Archive</span>
          </Button>
          <Button size="sm" disabled={selectedEmails.length === 0} variant="outline" className="gap-2">
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)]">
        {/* Left sidebar with email list */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <Tabs 
              defaultValue={filter} 
              onValueChange={(value) => setFilter(value as EmailFilter)}
              className="flex-1 flex flex-col"
            >
              <div className="p-2">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-1 lg:space-y-1">
                  <TabsTrigger value="all" className="justify-start w-full">
                    <InboxIcon className="h-4 w-4 mr-2" />
                    <span>All Inbox</span>
                    <span className="ml-auto bg-muted-foreground/10 text-xs rounded-full px-2 py-0.5">
                      {emails.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="justify-start w-full">
                    <MailWarning className="h-4 w-4 mr-2" />
                    <span>Unread</span>
                    <span className="ml-auto bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5">
                      {emails.filter(e => !e.isRead).length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="starred" className="justify-start w-full">
                    <Star className="h-4 w-4 mr-2" />
                    <span>Starred</span>
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="justify-start w-full">
                    <Archive className="h-4 w-4 mr-2" />
                    <span>Archived</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="p-3 border-t border-b bg-muted/5">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search emails..." 
                      className="pl-10 bg-background w-full" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ScrollArea className="h-full">
                      {filteredEmails.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                          <Mail className="h-10 w-10 mb-4 opacity-30" />
                          <p>No emails found</p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {filteredEmails.map(email => (
                            <div 
                              key={email.id}
                              className={`group relative flex items-start p-4 hover:bg-muted/30 transition-colors ${
                                selectedEmail === email.id ? 'bg-muted/30' : ''
                              } ${!email.isRead ? 'bg-primary/5' : ''} cursor-pointer`}
                              onClick={() => handleOpenEmail(email.id)}
                            >
                              <div className="flex-shrink-0 mr-3 pt-1">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${email.from}`} />
                                  <AvatarFallback>{getInitials(email.from)}</AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <h4 className={`text-sm truncate ${!email.isRead ? 'font-semibold' : 'font-medium'}`}>
                                    {email.from}
                                  </h4>
                                  <div className="flex items-center gap-2 ml-2">
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                      {formatDate(email.date)}
                                    </span>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markEmailStarred(email.id, !email.isStarred);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-amber-500 transition-opacity focus:opacity-100 focus:outline-none"
                                      aria-label={email.isStarred ? 'Remove star' : 'Add star'}
                                    >
                                      {email.isStarred ? (
                                        <StarFilled className="h-4 w-4 text-amber-500 fill-current" />
                                      ) : (
                                        <Star className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                                <h5 className={`text-sm truncate ${!email.isRead ? 'font-semibold' : 'text-muted-foreground'}`}>
                                  {email.subject}
                                </h5>
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {email.snippet || email.body.substring(0, 100)}{email.body.length > 100 ? '...' : ''}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  )}
                </div>
              </div>
            </Tabs>
          </Card>
        </div>

        {/* Email viewer */}
        <div className="w-full lg:w-2/3">
          <Card className="h-full flex flex-col">
            {currentEmail ? (
              <>
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentEmail.from}`} />
                      <AvatarFallback>{getInitials(currentEmail.from)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{currentEmail.from}</p>
                      <p className="text-xs text-muted-foreground">to me</p>
                    </div>
                  </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => markEmailStarred(currentEmail.id, !currentEmail.isStarred)}
                  >
                    {currentEmail.isStarred ? (
                      <StarFilled className="h-4 w-4 text-amber-500 fill-current" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </Button>
                  <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Check className="h-4 w-4" /> Convert to Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Task from Email</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleConvertToTask} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Task Title</Label>
                          <Input 
                            name="title" 
                            defaultValue={currentEmail.subject} 
                            required 
                            className="font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea 
                            name="description" 
                            defaultValue={`${currentEmail.body}\n\nSource: Email from ${currentEmail.from}`} 
                            className="min-h-[120px] font-mono text-sm" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select name="priority" defaultValue="MEDIUM">
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input 
                              name="dueDate" 
                              type="date" 
                              min={new Date().toISOString().split('T')[0]}
                              defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                              required 
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsTaskDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" className="gap-2">
                            <Check className="h-4 w-4" /> Create Task
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold mb-4">{currentEmail.subject}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <span>{currentEmail.from}</span>
                    <span>•</span>
                    <span>{
                      (() => {
                        try {
                          if (!currentEmail?.date) return 'Invalid date';
                          const date = new Date(currentEmail.date);
                          return isNaN(date.getTime()) 
                            ? 'Invalid date' 
                            : format(date, 'MMM d, yyyy h:mm a');
                        } catch (error) {
                          console.error('Error formatting email date:', error);
                          return 'Invalid date';
                        }
                      })()
                    }</span>
                    <span>•</span>
                    <button className="text-primary hover:underline">Reply</button>
                    <span>•</span>
                    <button className="text-primary hover:underline">Forward</button>
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  {currentEmail.body.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
              <Mail className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-center">
                {filter === 'all' 
                  ? 'Select an email to read' 
                  : filter === 'unread' 
                    ? 'No unread emails' 
                    : filter === 'starred' 
                      ? 'No starred emails' 
                      : 'No archived emails'}
              </p>
              {filter !== 'all' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setFilter('all')}
                >
                  View all emails
                </Button>
              )}
            </div>
          )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
