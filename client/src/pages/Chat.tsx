import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { USERS, useStore } from "@/lib/mockData";
import { Send, Phone, Video, Smile, Paperclip, CheckCheck, Check, Clock, MoreHorizontal } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Message {
  id: number;
  senderId: string;
  text: string;
  time: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  reactions?: { [key: string]: string[] }; // emoji -> user ids
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

const formatMessageTime = (timeString: string) => {
  const date = new Date(`2000-01-01 ${timeString}`);
  return format(date, 'h:mm a');
};

const formatMessageDate = (date: Date) => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
};

export default function Chat() {
  const { currentUser } = useStore();
  const [selectedUser, setSelectedUser] = useState(USERS[1]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      senderId: USERS[1].id, 
      text: "Hey, did you see the new claim from Acme Corp?", 
      time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'read'
    },
    { 
      id: 2, 
      senderId: currentUser.id, 
      text: "Yes, I'm reviewing it now. Looks like a standard auto claim.", 
      time: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      status: 'read'
    },
    { 
      id: 3, 
      senderId: USERS[1].id, 
      text: "Great, let me know if you need any docs.", 
      time: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      status: 'read'
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Group messages by date
  const messagesByDate = messages.reduce<Record<string, Message[]>>((acc, message) => {
    const date = new Date(message.time);
    const dateKey = format(date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(message);
    return acc;
  }, {});

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (!isScrolled) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    const element = document.querySelector('.messages-container');
    if (element) {
      const { scrollTop, scrollHeight, clientHeight } = element;
      setIsScrolled(scrollTop + clientHeight < scrollHeight - 50);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = newMessage.trim();
    if (!messageText) return;
    
    const tempId = Date.now();
    const newMsg: Message = {
      id: tempId,
      senderId: currentUser.id,
      text: messageText,
      time: new Date().toISOString(),
      status: 'sending',
      reactions: {}
    };
    
    // Optimistically add the message
    setMessages(prev => [...prev, newMsg]);
    setNewMessage("");
    
    // Simulate sending
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, status: 'delivered' as const }
          : msg
      ));
      
      // Simulate message read after a delay
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, status: 'read' as const }
            : msg
        ));
      }, 1000);
    }, 500);
    
    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      // Simulate reply after a delay
      setTimeout(() => {
        const reply: Message = {
          id: Date.now(),
          senderId: selectedUser.id,
          text: `Reply to: ${messageText}`,
          time: new Date().toISOString(),
          status: 'read',
          reactions: {}
        };
        setMessages(prev => [...prev, reply]);
      }, 1000 + Math.random() * 2000);
    }, 1000 + Math.random() * 2000);
  };

  const addReaction = (messageId: number, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;
      
      const reactions = { ...msg.reactions };
      if (!reactions[emoji]) {
        reactions[emoji] = [currentUser.id];
      } else if (!reactions[emoji].includes(currentUser.id)) {
        reactions[emoji] = [...reactions[emoji], currentUser.id];
      } else {
        // Remove reaction if user already reacted
        if (reactions[emoji].length === 1) {
          delete reactions[emoji];
        } else {
          reactions[emoji] = reactions[emoji].filter(id => id !== currentUser.id);
        }
      }
      
      return { ...msg, reactions };
    }));
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row rounded-xl border bg-card overflow-hidden shadow-sm">
        {/* Sidebar */}
        <div className="w-full md:w-80 border-b md:border-r bg-muted/10 flex-shrink-0">
          <div className="p-4 border-b">
            <Input 
              placeholder="Search conversations..." 
              className="bg-background" 
            />
          </div>
          <div className="h-[calc(100%-65px)] overflow-y-auto">
            {USERS.filter(u => u.id !== currentUser.id).map(user => (
              <div 
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors ${
                  selectedUser.id === user.id ? 'bg-muted/30' : ''
                }`}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium truncate">{user.name}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(messages[messages.length - 1]?.time || new Date()), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.role === 'BOSS' ? 'Director' : 'Employee'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-card">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background"></span>
              </div>
              <div>
                <h3 className="font-medium">{selectedUser.name}</h3>
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                  {isTyping ? 'typing...' : 'Online'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Voice Call</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Video className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Video Call</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div 
            className="flex-1 overflow-y-auto p-4 space-y-6 bg-muted/5 messages-container"
            onScroll={handleScroll}
          >
            {Object.entries(messagesByDate).map(([date, dateMessages]) => (
              <div key={date} className="space-y-4">
                <div className="relative flex justify-center">
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {formatMessageDate(new Date(date))}
                  </span>
                </div>
                {dateMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  const messageTime = new Date(msg.time);
                  const showTime = true; // Always show time for now
                  
                  return (
                    <div key={msg.id} className="group relative">
                      <div 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
                      >
                        <div className="max-w-[85%] md:max-w-[70%] relative">
                          <div 
                            className={cn(
                              'rounded-2xl px-4 py-2 relative',
                              isMe 
                                ? 'bg-primary text-primary-foreground rounded-br-sm' 
                                : 'bg-muted text-foreground rounded-bl-sm',
                              'hover:shadow-sm transition-shadow'
                            )}
                          >
                            <p className="text-sm break-words">{msg.text}</p>
                            
                            <div className={`flex items-center justify-end gap-1.5 mt-1 text-xs ${
                              isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {showTime && (
                                <span className="text-[10px]">
                                  {formatMessageTime(format(messageTime, 'HH:mm'))}
                                </span>
                              )}
                              {isMe && (
                                <span className="flex-shrink-0">
                                  {msg.status === 'sending' && <Clock className="h-3 w-3" />}
                                  {msg.status === 'delivered' && <Check className="h-3 w-3" />}
                                  {msg.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-400" />}
                                </span>
                              )}
                            </div>
                            
                            {/* Message reactions */}
                            {msg.reactions && Object.entries(msg.reactions).length > 0 && (
                              <div className="absolute -bottom-2 right-0 flex bg-background/80 backdrop-blur-sm rounded-full px-1.5 py-0.5 border shadow-sm">
                                {Object.entries(msg.reactions).map(([emoji, users]) => (
                                  <Tooltip key={emoji}>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                          'h-6 w-6 p-0.5 rounded-full hover:bg-muted/50',
                                          users.includes(currentUser.id) ? 'bg-primary/10' : ''
                                        )}
                                        onClick={() => addReaction(msg.id, emoji)}
                                      >
                                        <span className="text-xs">{emoji}</span>
                                        {users.length > 1 && (
                                          <span className="text-[10px] absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full h-4 w-4 flex items-center justify-center">
                                            {users.length}
                                          </span>
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      {users.map(id => {
                                        const user = [...USERS, currentUser].find(u => u.id === id);
                                        return user?.name || 'Unknown';
                                      }).join(', ')}
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Message actions */}
                          <div className={cn(
                            'absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity',
                            isMe ? '-left-8 right-auto' : ''
                          )}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isMe ? 'end' : 'start'}>
                                <DropdownMenuItem 
                                  onClick={() => navigator.clipboard.writeText(msg.text)}
                                >
                                  Copy text
                                </DropdownMenuItem>
                                <DropdownMenuItem>Forward</DropdownMenuItem>
                                {isMe && <DropdownMenuItem>Edit</DropdownMenuItem>}
                                {isMe && <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
            
            {/* Scroll to bottom button */}
            {isScrolled && (
              <button
                onClick={scrollToBottom}
                className="fixed bottom-24 right-8 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors z-10"
                aria-label="Scroll to bottom"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 15 6 6 6-6"/>
                  <path d="M12 3v18"/>
                </svg>
              </button>
            )}
          </div>

          <div className="p-4 border-t bg-card relative">
            {showEmojiPicker && (
              <div className="absolute bottom-16 left-4 bg-popover border rounded-lg shadow-lg p-2 z-10">
                <div className="grid grid-cols-6 gap-1">
                  {REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      className="text-2xl p-1 hover:bg-muted rounded-md transition-colors"
                      onClick={() => {
                        setNewMessage(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSend} className="flex gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-5 w-5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input 
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  // Simulate typing indicator
                  if (e.target.value && !isTyping) {
                    setIsTyping(true);
                    setTimeout(() => setIsTyping(false), 2000);
                  }
                }}
                onFocus={() => setShowEmojiPicker(false)}
                placeholder="Type a message..." 
                className="flex-1 border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!newMessage.trim()}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
