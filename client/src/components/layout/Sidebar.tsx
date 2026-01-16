import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, CheckSquare, FileText, RefreshCcw, MessageSquare, Users, Settings, LogOut, UserPlus, Calculator, Inbox } from "lucide-react";
import { useStore } from "@/lib/mockData";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { setCurrentUser, currentUser } = useStore();

  const handleLogout = () => {
    setCurrentUser(null as any); 
    setLocation("/login");
  };

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard", roles: ['BOSS', 'EMPLOYEE', 'ACCOUNTANT'] },
    { href: "/inbox", icon: Inbox, label: "Inbox", roles: ['BOSS', 'EMPLOYEE'] },
    { href: "/tasks", icon: CheckSquare, label: "Tasks", roles: ['BOSS', 'EMPLOYEE', 'ACCOUNTANT'] },
    { href: "/onboarding", icon: UserPlus, label: "Onboarding", roles: ['BOSS', 'EMPLOYEE'] },
    { href: "/claims", icon: FileText, label: "Claims", roles: ['BOSS', 'EMPLOYEE'] },
    { href: "/renewals", icon: RefreshCcw, label: "Renewals", roles: ['BOSS', 'EMPLOYEE', 'ACCOUNTANT'] },
    { href: "/accounting", icon: Calculator, label: "Accounting", roles: ['BOSS', 'ACCOUNTANT'] },
    { href: "/chat", icon: MessageSquare, label: "Chat", roles: ['BOSS', 'EMPLOYEE', 'ACCOUNTANT'] },
    { href: "/team", icon: Users, label: "Team", roles: ['BOSS', 'EMPLOYEE', 'ACCOUNTANT'] },
  ];

  const visibleNavItems = navItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <div className="h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center justify-center border-b border-sidebar-border/10">
        <img src="/logo.png" alt="Simia Logo" className="h-16 w-auto" />
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 group",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-md" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}>
                <item.icon className={cn("h-5 w-5", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-primary")} />
                <span>{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-border/10 space-y-2">
        <div className="px-3 py-2 text-xs text-sidebar-foreground/50 uppercase tracking-wider font-semibold">
          {currentUser?.role}
        </div>
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
          <Settings className="h-4 w-4" />
          <span className="text-sm">Settings</span>
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
