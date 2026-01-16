import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore, USERS } from "@/lib/mockData";
import { formatKES, cn } from "@/lib/utils";
import { 
  ArrowUpRight, 
  ArrowUp,
  ArrowDown,
  Users, 
  FileText, 
  FileCheck,
  FileEdit,
  DollarSign, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Calendar,
  CalendarDays,
  ArrowUpDown,
  Plus,
  Ticket
} from "lucide-react";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  TooltipProps
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-border rounded-lg shadow-lg">
        <p className="font-medium text-foreground">{label}</p>
        {payload.map((entry, index) => (
          <p key={`tooltip-${index}`} style={{ color: entry.color }}>
            {entry.name}: {entry.name === 'Revenue' || entry.name === 'Target' ? formatKES(entry.value as number) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Error boundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-4">We're having trouble loading the dashboard data.</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading skeleton for stats cards
const StatCardSkeleton = () => (
  <Card className="border-none shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4 rounded-full" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-7 w-24 mb-2" />
      <Skeleton className="h-3 w-32" />
    </CardContent>
  </Card>
);

const MOCK_REVENUE_DATA = [
  { month: 'Jan', revenue: 450000, target: 400000 },
  { month: 'Feb', revenue: 520000, target: 420000 },
  { month: 'Mar', revenue: 480000, target: 440000 },
  { month: 'Apr', revenue: 610000, target: 460000 },
  { month: 'May', revenue: 550000, target: 480000 },
  { month: 'Jun', revenue: 670000, target: 500000 },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { tasks, claims, renewals, currentUser } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(subMonths(new Date(), 6)),
    to: endOfMonth(new Date())
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const canSeeRevenue = currentUser.role === 'BOSS' || currentUser.role === 'ACCOUNTANT';

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    // Here you would typically refetch data with the new date range
  };

  const stats = [
    ...(canSeeRevenue ? [{
      title: "Total Revenue (YTD)",
      value: formatKES(3280000),
      change: "+12.5%",
      icon: DollarSign,
      color: "text-primary",
    }] : []),
    {
      title: "Active Claims",
      value: claims.filter(c => c.status === 'PENDING' || c.status === 'APPROVED').length.toString(),
      change: "-2",
      icon: FileText,
      color: "text-blue-500",
    },
    {
      title: "Pending Tasks",
      value: tasks.filter(t => t.status !== 'DONE').length.toString(),
      change: "+4",
      icon: CheckCircle2,
      color: "text-orange-500",
    },
    {
      title: "Renewals Due",
      value: renewals.filter(r => r.status === 'UPCOMING' || r.status === 'OVERDUE').length.toString(),
      change: "+8",
      icon: Clock,
      color: "text-emerald-500",
    },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="flex gap-3">
              {canSeeRevenue && <Skeleton className="h-9 w-32" />}
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          
          <div className="grid gap-4 md:grid-cols-7">
            <div className="col-span-4">
              <Skeleton className="h-[400px] w-full rounded-md" />
            </div>
            <div className="col-span-3">
              <Skeleton className="h-[400px] w-full rounded-md" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <ErrorBoundary>
      <Layout>
      <div className="flex flex-col gap-8">
        <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-foreground">
              Welcome back, {currentUser.name.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening at Simia {format(dateRange.to, 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">
                {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="sr-only">Change date range</span>
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
              aria-label="Refresh data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {canSeeRevenue && (
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-3.5 w-3.5" />
                Download Report
              </Button>
            )}
            <Button 
              className="gap-2"
              onClick={() => setLocation('/policies/new')}
            >
              <Plus className="h-3.5 w-3.5" />
              New Policy
            </Button>
          </div>
        </div>

        <div className={`grid gap-4 md:grid-cols-2 ${canSeeRevenue ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="border-none shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              aria-label={`${stat.title}: ${stat.value}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={cn("p-2 rounded-md bg-muted/50", stat.color.replace('text', 'text-muted-foreground'))}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{stat.value}</div>
                <div className="flex items-center mt-2">
                  <div className={cn(
                    "flex items-center text-xs font-medium px-2 py-0.5 rounded-full",
                    stat.change.startsWith('+') 
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                  )}>
                    {stat.change.startsWith('+') ? (
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-0.5" />
                    )}
                    {stat.change.replace('+', '')}
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">vs last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          {canSeeRevenue ? (
            <Card className="col-span-4 border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Monthly revenue performance against targets</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mr-1.5"></div>
                    <span className="text-xs text-muted-foreground">Revenue</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/30 mr-1.5"></div>
                    <span className="text-xs text-muted-foreground">Target</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={MOCK_REVENUE_DATA}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke="hsl(var(--border))" 
                      />
                      <XAxis 
                        dataKey="month" 
                        stroke="hsl(var(--muted-foreground) / 0.5)" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground) / 0.5)"
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `K${value / 1000}k`}
                        width={40}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar 
                        dataKey="revenue" 
                        name="Revenue" 
                        fill="url(#colorRevenue)" 
                        radius={[4, 4, 0, 0]} 
                        maxBarSize={32}
                      />
                      <Bar 
                        dataKey="target" 
                        name="Target" 
                        fill="hsl(var(--muted-foreground) / 0.2)" 
                        radius={[4, 4, 0, 0]} 
                        maxBarSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="col-span-4 border-none shadow-sm">
              <CardHeader>
                <CardTitle>My Performance</CardTitle>
                <CardDescription>Tasks and Claims Overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Performance metrics chart will appear here
                </div>
              </CardContent>
            </Card>
          )}
         

          <Card className="col-span-3 border-none shadow-sm flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Activity</CardTitle>
                  <CardDescription>Recent actions by your team</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs text-muted-foreground"
                  onClick={() => setLocation('/activity')}
                >
                  View all
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-6">
                {USERS.slice(1, 5).map((user, i) => {
                  const activities = [
                    { action: 'Closed a deal with TechCorp', icon: FileCheck, color: 'text-emerald-500' },
                    { action: 'Updated claim #4421 status', icon: FileEdit, color: 'text-blue-500' },
                    { action: 'Scheduled meeting with Alice', icon: CalendarDays, color: 'text-purple-500' },
                    { action: 'Logged a new support ticket', icon: Ticket, color: 'text-amber-500' }
                  ][i];
                  
                  return (
                    <div key={user.id} className="group flex items-start gap-3 hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors">
                      <div className="relative">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="h-9 w-9 rounded-full border border-border object-cover" 
                          loading="lazy"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-background p-0.5 rounded-full">
                          <div className={`h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-blue-500' : i === 2 ? 'bg-purple-500' : 'bg-amber-500'}`}></div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">{user.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <activities.icon className={`h-3.5 w-3.5 ${activities.color}`} />
                          <p className="text-xs text-muted-foreground truncate">
                            {activities.action}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                        {i * 15 + 5}m ago
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2"
                onClick={() => navigate('/activity')}
              >
                View all activity
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      </Layout>
    </ErrorBoundary>
  );
}
