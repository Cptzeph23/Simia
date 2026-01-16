import React, { useState, useCallback, useMemo, useEffect } from "react";
import { format, parseISO, isBefore, isToday, isTomorrow, addDays, isAfter } from "date-fns";
import { Plus, Calendar, User, Search, Filter, X, MessageSquare, Paperclip, CheckCircle, MoreVertical, Clock, AlertCircle, Tag, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, LayoutGrid, List, Inbox } from "lucide-react";
import { useHotkeys } from 'react-hotkeys-hook';

// Components
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

// Hooks & Utils
import { useStore, USERS, TASK_PRIORITIES } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Types
import type { Task, TaskPriority, TaskStatus, User as UserType } from "@/lib/mockData";

// Constants
const COLUMNS = [
  { id: 'TODO', label: 'To Do', color: 'bg-gray-100', icon: <div className="h-2 w-2 rounded-full bg-gray-400" /> },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-50', icon: <div className="h-2 w-2 rounded-full bg-blue-400" /> },
  { id: 'REVIEW', label: 'Review', color: 'bg-purple-50', icon: <div className="h-2 w-2 rounded-full bg-purple-400" /> },
  { id: 'DONE', label: 'Done', color: 'bg-emerald-50', icon: <CheckCircle className="h-3 w-3 text-emerald-500" /> },
] as const;

// Priority Badge Component
const PriorityBadge = ({ priority, className = '' }: { priority: TaskPriority; className?: string }) => {
  const priorityConfig = TASK_PRIORITIES[priority];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium',
        {
          'border-red-200 text-red-700 bg-red-50': priority === 'HIGH',
          'border-orange-200 text-orange-700 bg-orange-50': priority === 'MEDIUM',
          'border-green-200 text-green-700 bg-green-50': priority === 'LOW',
        },
        className
      )}
    >
      {priorityConfig.icon}
      {priorityConfig.label}
    </Badge>
  );
};

// Date Badge Component
const DateBadge = ({ date, className = '' }: { date: string; className?: string }) => {
  const dueDate = parseISO(date);
  const today = new Date();
  
  const getDateStatus = () => {
    if (isBefore(dueDate, today) && !isToday(dueDate)) {
      return { text: `Overdue: ${format(dueDate, 'MMM d')}`, className: 'text-red-600 bg-red-50' };
    }
    if (isToday(dueDate)) {
      return { text: 'Today', className: 'text-blue-600 bg-blue-50' };
    }
    if (isTomorrow(dueDate)) {
      return { text: 'Tomorrow', className: 'text-amber-600 bg-amber-50' };
    }
    return { text: format(dueDate, 'MMM d'), className: 'text-muted-foreground' };
  };
  
  const { text, className: statusClassName } = getDateStatus();
  
  return (
    <div className={cn('inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md', statusClassName, className)}>
      <Calendar className="h-3 w-3" />
      <span>{text}</span>
    </div>
  );
};

// Task Card Component
const TaskCard = React.memo(({ 
  task, 
  onStatusChange,
  onTaskClick,
  isSelected = false
}: { 
  task: Task; 
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  isSelected?: boolean;
}) => {
  const assignee = USERS.find(u => u.id === task.assigneeId);
  const isOverdue = isBefore(parseISO(task.dueDate), new Date()) && !isToday(parseISO(task.dueDate));
  
  return (
    <Card 
      className={cn(
        'cursor-pointer hover:shadow-md transition-all duration-200 border shadow-sm',
        isSelected && 'ring-2 ring-primary/50',
        isOverdue && 'border-l-4 border-l-red-500',
      )}
      onClick={() => onTaskClick(task)}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <PriorityBadge priority={task.priority} />
          <div className="flex items-center gap-1">
            {task.labels?.map(label => (
              <span 
                key={label} 
                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        
        <h4 className="font-medium text-sm leading-tight line-clamp-2">{task.title}</h4>
        
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            {assignee ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={assignee.avatar} alt={assignee.name} />
                    <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Assigned to {assignee.name}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <User className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {task.commentsCount > 0 && (
              <div className="flex items-center gap-0.5 text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="text-xs">{task.commentsCount}</span>
              </div>
            )}
            
            <DateBadge date={task.dueDate} />
          </div>
        </div>
        
        <Select 
          value={task.status}
          onValueChange={(val: TaskStatus) => onStatusChange(task.id, val)}
          onClick={e => e.stopPropagation()}
        >
          <SelectTrigger className="h-8 text-xs mt-2 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COLUMNS.map(column => (
              <SelectItem key={column.id} value={column.id}>
                <div className="flex items-center gap-2">
                  {column.icon}
                  {column.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
});

// Task Detail View Component
const TaskDetailView = ({ 
  task, 
  onClose, 
  onStatusChange,
  onTaskUpdate
}: { 
  task: Task; 
  onClose: () => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskUpdate: (task: Task) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [comment, setComment] = useState('');
  const { currentUser } = useStore();
  const assignee = USERS.find(u => u.id === task.assigneeId);
  
  const handleSave = () => {
    onTaskUpdate(editedTask);
    setIsEditing(false);
  };
  
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const newComment = {
      id: `c${Date.now()}`,
      content: comment,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    
    setEditedTask(prev => ({
      ...prev,
      comments: [...(prev.comments || []), newComment]
    }));
    
    setComment('');
  };
  
  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {isEditing ? (
                <Input 
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
                  className="text-lg font-semibold"
                  autoFocus
                />
              ) : (
                <h3 className="text-xl font-semibold">{task.title}</h3>
              )}
              <Badge variant="outline" className="ml-2">
                {task.id}
              </Badge>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Select 
                value={editedTask.status}
                onValueChange={(val: TaskStatus) => {
                  setEditedTask(prev => ({...prev, status: val}));
                  onStatusChange(task.id, val);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLUMNS.map(column => (
                    <SelectItem key={column.id} value={column.id}>
                      <div className="flex items-center gap-2">
                        {column.icon}
                        {column.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="h-4 w-4" /> : <MoreVertical className="h-4 w-4" />}
              </Button>
              
              <Button variant="outline" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={editedTask.description || ''}
                    onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                    placeholder="Add a detailed description..."
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Assignee</Label>
                    <Select 
                      value={editedTask.assigneeId}
                      onValueChange={(val) => setEditedTask({...editedTask, assigneeId: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {USERS.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              {user.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input 
                      type="date" 
                      value={editedTask.dueDate.split('T')[0]}
                      onChange={(e) => setEditedTask({...editedTask, dueDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select 
                      value={editedTask.priority}
                      onValueChange={(val: TaskPriority) => setEditedTask({...editedTask, priority: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TASK_PRIORITIES).map(([value, { label, icon }]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              {icon}
                              {label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Labels</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Tag className="mr-2 h-4 w-4" />
                          {editedTask.labels?.length ? `${editedTask.labels.length} labels` : 'Add labels'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2">
                        <div className="space-y-2">
                          <div className="flex items-center px-2">
                            <Search className="h-4 w-4 text-muted-foreground mr-2" />
                            <Input 
                              placeholder="Filter labels..." 
                              className="h-8"
                              // Add filtering logic here
                            />
                          </div>
                          <div className="space-y-1">
                            {['Frontend', 'Backend', 'Design', 'Bug', 'Feature'].map(label => (
                              <div 
                                key={label}
                                className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                                onClick={() => {
                                  setEditedTask(prev => ({
                                    ...prev,
                                    labels: prev.labels?.includes(label)
                                      ? prev.labels.filter(l => l !== label)
                                      : [...(prev.labels || []), label]
                                  }));
                                }}
                              >
                                <span>{label}</span>
                                {editedTask.labels?.includes(label) && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={editedTask.description || ''}
                    onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                    placeholder="Add a detailed description..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose max-w-none">
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={assignee?.avatar} alt={assignee?.name} />
                      <AvatarFallback>{assignee?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{assignee?.name || 'Unassigned'}</p>
                      <p className="text-xs text-muted-foreground">Assigned to</p>
                    </div>
                  </div>
                  
                  <div className="h-6 w-px bg-border mx-2" />
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {format(parseISO(task.dueDate), 'MMMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">Due date</p>
                    </div>
                  </div>
                  
                  <div className="h-6 w-px bg-border mx-2" />
                  
                  <PriorityBadge priority={task.priority} />
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <div className="bg-muted/50 p-4 rounded-md">
                    {task.description ? (
                      <p className="whitespace-pre-line">{task.description}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No description provided</p>
                    )}
                  </div>
                </div>
                
                {task.labels && task.labels.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-2">Labels</h4>
                    <div className="flex flex-wrap gap-2">
                      {task.labels.map(label => (
                        <Badge key={label} variant="outline" className="px-2 py-0.5 text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-medium mb-3">Activity</h4>
                  
                  <form onSubmit={handleAddComment} className="mb-4">
                    <div className="flex gap-2">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea 
                          placeholder="Add a comment..." 
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button type="submit" disabled={!comment.trim()} size="sm">
                            Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                  
                  <div className="space-y-4">
                    {task.comments?.map(comment => {
                      const user = USERS.find(u => u.id === comment.userId);
                      return (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={user?.avatar} alt={user?.name} />
                            <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-muted/50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{user?.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(parseISO(comment.createdAt), 'MMM d, yyyy h:mm a')}
                                </span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:border-l border-border pl-6 space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Details</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Select 
                    value={task.status}
                    onValueChange={(val: TaskStatus) => {
                      onStatusChange(task.id, val);
                      setEditedTask(prev => ({...prev, status: val}));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLUMNS.map(column => (
                        <SelectItem key={column.id} value={column.id}>
                          <div className="flex items-center gap-2">
                            {column.icon}
                            {column.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Assignee</p>
                  <Select 
                    value={task.assigneeId}
                    onValueChange={(val) => setEditedTask(prev => ({...prev, assigneeId: val}))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USERS.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                  <Input 
                    type="date" 
                    value={task.dueDate.split('T')[0]}
                    onChange={(e) => setEditedTask(prev => ({
                      ...prev, 
                      dueDate: e.target.value
                    }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  <Select 
                    value={task.priority}
                    onValueChange={(val: TaskPriority) => setEditedTask(prev => ({
                      ...prev, 
                      priority: val
                    }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TASK_PRIORITIES).map(([value, { label, icon }]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            {icon}
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="text-sm">
                    {task.createdAt ? format(parseISO(task.createdAt), 'MMM d, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-3">Labels</h4>
              <div className="flex flex-wrap gap-2">
                {task.labels?.map(label => (
                  <Badge 
                    key={label} 
                    variant="outline" 
                    className="px-2 py-0.5 text-xs flex items-center gap-1"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    {label}
                  </Badge>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground"
                  onClick={() => {
                    setIsEditing(true);
                    // Scroll to labels section
                    document.getElementById('task-detail-content')?.scrollTo(0, 0);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Label
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Tasks Component
export default function Tasks() {
  // State
  const { tasks, addTask, updateTaskStatus, currentUser, updateTask } = useStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    assignee: '',
    priority: '',
    dueDate: ''
  });
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const { toast } = useToast();
  
  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search by title or description
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by assignee
      const matchesAssignee = !filters.assignee || task.assigneeId === filters.assignee;
      
      // Filter by priority
      const matchesPriority = !filters.priority || task.priority === filters.priority;
      
      // Filter by due date
      let matchesDueDate = true;
      if (filters.dueDate) {
        const taskDate = task.dueDate.split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        
        switch (filters.dueDate) {
          case 'today':
            matchesDueDate = taskDate === today;
            break;
          case 'tomorrow':
            const tomorrow = addDays(new Date(), 1).toISOString().split('T')[0];
            matchesDueDate = taskDate === tomorrow;
            break;
          case 'overdue':
            matchesDueDate = isBefore(parseISO(taskDate), new Date()) && 
                           !isToday(parseISO(taskDate));
            break;
          case 'thisWeek':
            const nextWeek = addDays(new Date(), 7).toISOString().split('T')[0];
            matchesDueDate = taskDate >= today && taskDate <= nextWeek;
            break;
        }
      }
      
      // For employees, only show their assigned tasks
      const isAssignedToCurrentUser = currentUser.role === 'EMPLOYEE' 
        ? task.assigneeId === currentUser.id 
        : true;
      
      return matchesSearch && matchesAssignee && matchesPriority && matchesDueDate && isAssignedToCurrentUser;
    });
  }, [tasks, searchQuery, filters, currentUser]);
  
  // Group tasks by status for board view
  const tasksByStatus = useMemo(() => {
    return COLUMNS.reduce((acc, column) => {
      acc[column.id] = filteredTasks.filter(task => task.status === column.id);
      return acc;
    }, {} as Record<string, typeof filteredTasks>);
  }, [filteredTasks]);
  
  // Handle creating a new task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newTask = {
      id: `t${Date.now()}`,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      assigneeId: formData.get('assignee') as string,
      priority: formData.get('priority') as TaskPriority,
      status: 'TODO' as const,
      dueDate: formData.get('dueDate') as string,
      createdAt: new Date().toISOString(),
      labels: [],
      comments: [],
      commentsCount: 0
    };
    
    addTask(newTask);
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Task Created",
      description: `"${newTask.title}" has been created successfully.`,
    });
  };
  
  // Handle status change
  const handleStatusChange = useCallback((taskId: string, status: TaskStatus) => {
    updateTaskStatus(taskId, status);
    
    // If the task is being marked as DONE, show a toast
    if (status === 'DONE') {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        toast({
          title: "Task Completed",
          description: `"${task.title}" has been marked as done.`,
          action: (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => updateTaskStatus(taskId, 'TODO')}
            >
              Undo
            </Button>
          ),
        });
      }
    }
  }, [updateTaskStatus, tasks, toast]);
  
  // Handle task update
  const handleTaskUpdate = useCallback((updatedTask: Task) => {
    updateTask(updatedTask);
    
    toast({
      title: "Task Updated",
      description: `"${updatedTask.title}" has been updated.`,
    });
  }, [updateTask, toast]);
  
  // Handle task click
  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);
  
  // Keyboard shortcuts
  useHotkeys('n', () => {
    if (currentUser.role === 'BOSS') {
      setIsCreateDialogOpen(true);
    }
  }, { enabled: currentUser.role === 'BOSS' }, [currentUser.role]);
  
  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilters({
      assignee: '',
      priority: '',
      dueDate: ''
    });
  }, []);
  
  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(Boolean) || searchQuery;
  
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-semibold">
              {currentUser.role === 'BOSS' ? 'Task Management' : 'My Tasks'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {currentUser.role === 'BOSS' 
                ? 'Manage and track team assignments' 
                : 'View and update your assigned tasks'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tasks..."
                className="pl-8 w-[180px] lg:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-4 space-y-4" align="end">
                <div className="space-y-2">
                  <Label htmlFor="filter-assignee">Assignee</Label>
                  <Select 
                    value={filters.assignee}
                    onValueChange={(val) => setFilters(prev => ({...prev, assignee: val}))}
                  >
                    <SelectTrigger id="filter-assignee">
                      <SelectValue placeholder="Filter by assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Assignees</SelectItem>
                      {USERS.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filter-priority">Priority</Label>
                  <Select 
                    value={filters.priority}
                    onValueChange={(val) => setFilters(prev => ({...prev, priority: val}))}
                  >
                    <SelectTrigger id="filter-priority">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Priorities</SelectItem>
                      {Object.entries(TASK_PRIORITIES).map(([value, { label, icon }]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            {icon}
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filter-due-date">Due Date</Label>
                  <Select 
                    value={filters.dueDate}
                    onValueChange={(val) => setFilters(prev => ({...prev, dueDate: val}))}
                  >
                    <SelectTrigger id="filter-due-date">
                      <SelectValue placeholder="Filter by due date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                      <SelectItem value="thisWeek">This Week</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={clearFilters}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </PopoverContent>
            </Popover>
            
            {currentUser.role === 'BOSS' && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:brightness-110">
                    <Plus className="mr-1 h-4 w-4" />
                    <span className="hidden sm:inline">New Task</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Task Title <span className="text-destructive">*</span></Label>
                      <Input 
                        id="title" 
                        name="title" 
                        required 
                        placeholder="e.g. Review Quarterly Report" 
                        autoFocus
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        name="description" 
                        placeholder="Add a detailed description..." 
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="assignee">Assignee <span className="text-destructive">*</span></Label>
                        <Select name="assignee" defaultValue={USERS[1].id} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                          <SelectContent>
                            {USERS.filter(u => u.role === 'EMPLOYEE').map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  {user.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select name="priority" defaultValue="MEDIUM">
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TASK_PRIORITIES).map(([value, { label, icon }]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex items-center gap-2">
                                  {icon}
                                  {label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date <span className="text-destructive">*</span></Label>
                        <Input 
                          id="dueDate" 
                          name="dueDate" 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Labels</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              <Tag className="mr-2 h-4 w-4" />
                              Add labels
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2">
                            <div className="space-y-1">
                              {['Frontend', 'Backend', 'Design', 'Bug', 'Feature'].map(label => (
                                <div 
                                  key={label}
                                  className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                                >
                                  <span>{label}</span>
                                  <Check className="h-4 w-4 text-primary opacity-0" />
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="submit" className="w-full sm:w-auto">
                        Create Task
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            
            <div className="hidden sm:flex items-center border rounded-md bg-muted/50 p-1">
              <Button
                variant={viewMode === 'board' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setViewMode('board')}
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                Board
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setViewMode('list')}
              >
                <List className="h-3.5 w-3.5 mr-1.5" />
                List
              </Button>
            </div>
          </div>
        </div>
        
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Filters:</span>
            
            {searchQuery && (
              <Badge variant="secondary" className="px-2 py-1 text-xs">
                Search: "{searchQuery}"
                <button 
                  onClick={() => setSearchQuery('')}
                  className="ml-1.5 rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.assignee && (
              <Badge variant="secondary" className="px-2 py-1 text-xs">
                Assignee: {USERS.find(u => u.id === filters.assignee)?.name}
                <button 
                  onClick={() => setFilters(prev => ({...prev, assignee: ''}))}
                  className="ml-1.5 rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.priority && (
              <Badge variant="secondary" className="px-2 py-1 text-xs">
                Priority: {TASK_PRIORITIES[filters.priority as TaskPriority]?.label}
                <button 
                  onClick={() => setFilters(prev => ({...prev, priority: ''}))}
                  className="ml-1.5 rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.dueDate && (
              <Badge variant="secondary" className="px-2 py-1 text-xs">
                Due: {filters.dueDate === 'today' ? 'Today' : 
                      filters.dueDate === 'tomorrow' ? 'Tomorrow' :
                      filters.dueDate === 'thisWeek' ? 'This Week' : 'Overdue'}
                <button 
                  onClick={() => setFilters(prev => ({...prev, dueDate: ''}))}
                  className="ml-1.5 rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs text-muted-foreground"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          </div>
        )}
        
        {/* Empty State */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/20">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No tasks found</h3>
            <p className="text-sm text-muted-foreground max-w-md px-4">
              {hasActiveFilters 
                ? 'No tasks match your current filters. Try adjusting your search or filters.'
                : currentUser.role === 'BOSS'
                  ? 'Get started by creating a new task.'
                  : 'You don\'t have any tasks assigned to you yet.'}
            </p>
            {currentUser.role === 'BOSS' && !hasActiveFilters && (
              <Button 
                className="mt-4"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Task
              </Button>
            )}
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={clearFilters}
              >
                <X className="mr-2 h-4 w-4" /> Clear Filters
              </Button>
            )}
          </div>
        ) : viewMode === 'board' ? (
          /* Board View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-220px)] overflow-y-auto">
            {COLUMNS.map(column => {
              const columnTasks = tasksByStatus[column.id] || [];
              const isDoneColumn = column.id === 'DONE';
              
              return (
                <div 
                  key={column.id} 
                  className={`flex flex-col rounded-lg ${column.color} p-3 h-full`}
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      {column.icon}
                      <h3 className="font-medium text-sm">{column.label}</h3>
                    </div>
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {columnTasks.length}
                    </Badge>
                  </div>
                  
                  <ScrollArea className="flex-1 -mx-1 px-1">
                    <div className="space-y-3 pb-2">
                      {columnTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="h-12 w-12 rounded-full bg-white/50 flex items-center justify-center mb-2">
                            <Inbox className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-xs text-muted-foreground">No tasks here</p>
                        </div>
                      ) : (
                        columnTasks.map(task => (
                          <TaskCard 
                            key={task.id}
                            task={task}
                            onStatusChange={handleStatusChange}
                            onTaskClick={handleTaskClick}
                            isSelected={selectedTask?.id === task.id}
                          />
                        ))
                      )}
                      
                      {!isDoneColumn && currentUser.role === 'BOSS' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setIsCreateDialogOpen(true);
                            // Set default status for new task in this column
                            // This would be handled in the form
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Task
                        </Button>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 border-b p-2">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground">
                <div className="col-span-5 px-3">Task</div>
                <div className="col-span-2">Assignee</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-2">Priority</div>
                <div className="col-span-1">Status</div>
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="divide-y">
                {filteredTasks.map(task => {
                  const assignee = USERS.find(u => u.id === task.assigneeId);
                  const isOverdue = isBefore(parseISO(task.dueDate), new Date()) && 
                                  !isToday(parseISO(task.dueDate)) && 
                                  task.status !== 'DONE';
                  
                  return (
                    <div 
                      key={task.id} 
                      className="group hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center p-3">
                        <div className="col-span-5 flex items-center gap-3">
                          <Checkbox 
                            checked={task.status === 'DONE'}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) => {
                              handleStatusChange(task.id, checked ? 'DONE' : 'TODO');
                            }}
                            className="h-4 w-4 rounded"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          {assignee ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unassigned</span>
                          )}
                        </div>
                        
                        <div className="col-span-2">
                          <div className="flex items-center gap-1">
                            <Calendar className={`h-3.5 w-3.5 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`} />
                            <span className={cn(
                              'text-sm',
                              isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
                            )}>
                              {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                              {isOverdue && ' • Overdue'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          <PriorityBadge priority={task.priority} />
                        </div>
                        
                        <div className="col-span-1">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'text-xs capitalize',
                              {
                                'bg-blue-50 border-blue-200 text-blue-700': task.status === 'IN_PROGRESS',
                                'bg-purple-50 border-purple-200 text-purple-700': task.status === 'REVIEW',
                                'bg-emerald-50 border-emerald-200 text-emerald-700': task.status === 'DONE',
                              }
                            )}
                          >
                            {task.status.replace('_', ' ').toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            
            <div className="border-t bg-muted/20 p-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </p>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous</span>
                </Button>
                <div className="text-sm text-muted-foreground">
                  Page 1 of 1
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Task Detail View */}
      {selectedTask && (
        <TaskDetailView 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)}
          onStatusChange={handleStatusChange}
          onTaskUpdate={handleTaskUpdate}
        />
      )}
    </Layout>
  );
}
