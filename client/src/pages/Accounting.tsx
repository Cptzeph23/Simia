import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useStore } from "@/lib/mockData";
import { formatKES, cn, formatDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, FileText, TrendingUp, TrendingDown, Download, PlusCircle, ArrowDownLeft, ArrowUpRight, 
  Search, Calendar, Filter, Loader2, FileDown, FileUp, FileSpreadsheet, FilePieChart, BarChart2,
  User, Building2, Mail, Phone, MapPin, ArrowRight, ChevronDown, Check
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Dummy client data
const DUMMY_CLIENTS = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'billing@acmecorp.com',
    phone: '+254 700 123456',
    address: '123 Enterprise Road, Westlands, Nairobi',
    taxNumber: 'P000123456K',
    contactPerson: 'John Doe',
    logo: '/logos/acme.png'
  },
  {
    id: '2',
    name: 'Nairobi Tech Solutions',
    email: 'accounts@nairitech.co.ke',
    phone: '+254 711 987654',
    address: '456 Tech Street, Kilimani, Nairobi',
    taxNumber: 'P000654321M',
    contactPerson: 'Jane Smith',
    logo: '/logos/nairitech.png'
  },
  {
    id: '3',
    name: 'Safari Adventures Ltd',
    email: 'finance@safariadventures.co.ke',
    phone: '+254 722 333444',
    address: '789 Tourism Lane, Karen, Nairobi',
    taxNumber: 'P000987654N',
    contactPerson: 'Robert Johnson',
    logo: '/logos/safari.png'
  },
  {
    id: '4',
    name: 'Greenfield Farms',
    email: 'accounts@greenfieldfarms.ke',
    phone: '+254 733 555666',
    address: '321 Agriculture Road, Naivasha',
    taxNumber: 'P000456789P',
    contactPerson: 'Mary Wanjiku',
    logo: '/logos/greenfield.png'
  },
  {
    id: '5',
    name: 'Coastal Resorts',
    email: 'billing@coastalresorts.co.ke',
    phone: '+254 744 777888',
    address: '101 Beachfront Drive, Mombasa',
    taxNumber: 'P000321654R',
    contactPerson: 'Ali Hassan',
    logo: '/logos/coastal.png'
  }
];

// Expense categories with subcategories
const EXPENSE_CATEGORIES = [
  { 
    category: 'Operations', 
    subcategories: ['Rent', 'Utilities', 'Office Supplies', 'Maintenance'] 
  },
  { 
    category: 'Personnel', 
    subcategories: ['Salaries', 'Benefits', 'Training', 'Recruitment'] 
  },
  { 
    category: 'Marketing', 
    subcategories: ['Digital Ads', 'Print', 'Events', 'Content Creation'] 
  },
  { 
    category: 'Technology', 
    subcategories: ['Software', 'Hardware', 'IT Services', 'Subscriptions'] 
  },
  { 
    category: 'Professional Services', 
    subcategories: ['Legal', 'Accounting', 'Consulting'] 
  },
  { 
    category: 'Travel', 
    subcategories: ['Transportation', 'Accommodation', 'Meals'] 
  },
  { 
    category: 'Other', 
    subcategories: ['Miscellaneous', 'Bank Charges'] 
  },
];

// Color palette for charts
const CHART_COLORS = [
  '#C5A059', // Primary gold
  '#1e293b', // Dark slate
  '#0ea5e9', // Sky blue
  '#22c55e', // Green
  '#f97316', // Orange
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#6366f1', // Indigo
];

// Invoice item type
type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

export default function Accounting() {
  const { invoices, expenses, addInvoice, addExpense } = useStore();
  const { toast } = useToast();
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isClientSelectOpen, setIsClientSelectOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(DUMMY_CLIENTS[0]);
  const [transactionType, setTransactionType] = useState<'INVOICE' | 'EXPENSE'>('INVOICE');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  // Invoice form state
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Consulting Services', quantity: 1, unitPrice: 10000, amount: 10000 },
    { id: '2', description: 'Software Development', quantity: 10, unitPrice: 5000, amount: 50000 },
  ]);
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), 30));
  const [notes, setNotes] = useState('Thank you for your business!');
  const [taxRate, setTaxRate] = useState(16); // 16% VAT in Kenya

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Process and filter transactions
  const processedData = useMemo(() => {
    const filteredInvoices = invoices.filter(inv => {
      const matchesSearch = 
        inv.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !dateRange?.from || !dateRange?.to || 
        (new Date(inv.date) >= dateRange.from && new Date(inv.date) <= dateRange.to);
      
      // Only include income transactions (invoices that are marked as PAID)
      const isIncome = inv.status === 'PAID';
      
      return matchesSearch && matchesDate && isIncome;
    });

    const filteredExpenses = expenses.filter(exp => {
      const matchesSearch = 
        exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        exp.category === selectedCategory ||
        EXPENSE_CATEGORIES
          .find(cat => cat.category === selectedCategory)?.subcategories
          .includes(exp.category);
      
      const matchesDate = !dateRange?.from || !dateRange?.to || 
        (new Date(exp.date) >= dateRange.from && new Date(exp.date) <= dateRange.to);
      
      // Only include expense transactions
      const isExpense = exp.transactionType === 'EXPENSE';
      
      return matchesSearch && matchesCategory && matchesDate && isExpense;
    });

    return { filteredInvoices, filteredExpenses };
  }, [invoices, expenses, searchTerm, selectedCategory, dateRange]);

  // Calculate financial metrics
  const { 
    totalIncome, 
    totalExpenses, 
    netProfit,
    expenseByCategory,
    monthlyTrends,
    topClients
  } = useMemo(() => {
    // Calculate total income from paid invoices
    const totalIncome = processedData.filteredInvoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.amount, 0);
      
    // Calculate total expenses
    const totalExpenses = processedData.filteredExpenses
      .filter(exp => exp.transactionType === 'EXPENSE')
      .reduce((sum, exp) => sum + exp.amount, 0);
      
    // Calculate net profit (income - expenses)
    const netProfit = totalIncome - totalExpenses;

    // Group expenses by category
    const expenseByCategory = EXPENSE_CATEGORIES.flatMap(cat => [
      ...cat.subcategories.map(sub => ({
        category: sub,
        amount: processedData.filteredExpenses
          .filter(e => e.category === sub)
          .reduce((sum, e) => sum + e.amount, 0)
      }))
    ]).filter(item => item.amount > 0);

    // Generate monthly trends data (simplified)
    const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      
      const monthInvoices = processedData.filteredInvoices.filter(
        inv => new Date(inv.date).getMonth() === date.getMonth() &&
               new Date(inv.date).getFullYear() === date.getFullYear()
      );
      
      const monthExpenses = processedData.filteredExpenses.filter(
        exp => new Date(exp.date).getMonth() === date.getMonth() &&
               new Date(exp.date).getFullYear() === date.getFullYear()
      );
      
      return {
        month: `${month} '${year.toString().slice(2)}`,
        income: monthInvoices.reduce((sum, inv) => sum + (inv.status === 'PAID' ? inv.amount : 0), 0),
        expenses: monthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      };
    });

    // Calculate top clients by revenue
    const clientRevenue: Record<string, { client: ClientRef; amount: number }> = {};
    
    processedData.filteredInvoices.forEach(inv => {
      // Only process invoices with a valid client name (fallback to clientName if client object is missing)
      const clientName = inv.client?.name || inv.clientName;
      if (inv.status === 'PAID' && clientName) {
        if (!clientRevenue[clientName]) {
          clientRevenue[clientName] = {
            client: inv.client || { id: inv.id, name: inv.clientName },
            amount: 0
          };
        }
        clientRevenue[clientName].amount += inv.amount || 0;
      }
    });
    
    const topClients = Object.values(clientRevenue)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    return { 
      totalIncome,
      totalExpenses,
      netProfit,
      expenseByCategory,
      monthlyTrends,
      topClients
    };
  }, [processedData]);

  // Summary section with the new financial metrics
  const summary = [
    { label: 'Total Income', value: formatKES(totalIncome) },
    { label: 'Total Expenses', value: formatKES(totalExpenses) },
    { 
      label: 'Net Profit/Loss', 
      value: `${formatKES(Math.abs(netProfit))} ${netProfit >= 0 ? 'Profit' : 'Loss'}`,
      className: netProfit >= 0 ? 'text-green-500' : 'text-red-500'
    },
  ];

  // Dashboard cards with the new financial metrics
  const dashboardCards = [
    {
      title: 'Total Income',
      value: formatKES(totalIncome),
      description: 'Paid invoices',
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      trend: 'up'
    },
    {
      title: 'Total Expenses',
      value: formatKES(totalExpenses),
      description: 'All expense transactions',
      icon: <TrendingDown className="h-4 w-4 text-red-500" />,
      trend: 'down'
    },
    {
      title: 'Net Profit',
      value: `${formatKES(Math.abs(netProfit))} ${netProfit >= 0 ? 'Profit' : 'Loss'}`,
      description: 'Income - Expenses',
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      trend: netProfit >= 0 ? 'up' : 'down',
      valueClass: netProfit >= 0 ? 'text-green-500' : 'text-red-500'
    },
  ];

  // Calculate total expenses for charts
  // Handle export functionality
  const handleExport = (type: 'csv' | 'pdf') => {
    toast({
      title: `Exporting ${type.toUpperCase()} report`,
      description: `Your ${type.toUpperCase()} export will begin shortly.`,
    });
    
    // Simulate export
    setTimeout(() => {
      toast({
        title: 'Export Complete',
        description: `Your ${type.toUpperCase()} report has been generated.`,
      });
    }, 1500);
  };

  const handleTransactionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const amount = Number(formData.get('amount'));
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;
    const category = formData.get('category') as string;
    const subcategory = formData.get('subcategory') as string;
    const clientName = formData.get('clientName') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const reference = formData.get('reference') as string;

    if (transactionType === 'INCOME') {
      if (!clientName || !amount) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      addInvoice({
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName: clientName,
        amount: amount,
        date: date,
        status: 'PAID',
        type: 'Auto',
        transactionType: 'INCOME',
        paymentMethod: paymentMethod || 'Cash',
        reference: reference || '',
        description: description
      });
    } else {
      if (!amount || !category) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      addExpense({
        id: `exp-${Date.now()}`,
        category: subcategory || category,
        description: description || `${category} Expense`,
        amount: amount,
        date: date,
        status: 'PAID',
        transactionType: 'EXPENSE',
        paymentMethod: paymentMethod || 'Cash',
        reference: reference || ''
      });
    }

    toast({
      title: "Transaction Recorded",
      description: `${transactionType} of ${formatKES(amount)} has been recorded.`,
    });
    
    // Reset form
    (e.target as HTMLFormElement).reset();
    setIsTransactionOpen(false);
  };
  
  // Get subcategories based on selected category
  const subcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const category = EXPENSE_CATEGORIES.find(cat => cat.category === selectedCategory);
    return category ? category.subcategories : [];
  }, [selectedCategory]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col space-y-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-semibold">Accounting & Finance</h1>
            <p className="text-muted-foreground mt-1">Financial overview, invoices, and expenses</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                      </>
                    ) : (
                      formatDate(dateRange.from)
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={2}
                />
                <div className="p-3 border-t flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setDateRange({
                        from: addDays(new Date(), -30),
                        to: new Date(),
                      });
                    }}
                  >
                    Last 30 days
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      setDateRange({
                        from: new Date(today.getFullYear(), today.getMonth(), 1),
                        to: today,
                      });
                    }}
                  >
                    This month
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDateRange(undefined)}
                  >
                    Clear
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Export Financial Data</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Export Format</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className="h-24 flex-col gap-2"
                        onClick={() => handleExport('csv')}
                      >
                        <FileSpreadsheet className="h-6 w-6" />
                        <span>CSV</span>
                        <span className="text-xs text-muted-foreground font-normal">Excel, Numbers, etc.</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-24 flex-col gap-2"
                        onClick={() => handleExport('pdf')}
                      >
                        <FileText className="h-6 w-6" />
                        <span>PDF</span>
                        <span className="text-xs text-muted-foreground font-normal">For printing</span>
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Data Range</h4>
                    <Select defaultValue="custom">
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom Range</SelectItem>
                        <SelectItem value="this-month">This Month</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="this-year">This Year</SelectItem>
                        <SelectItem value="last-year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Record Transaction</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Record New Transaction</DialogTitle>
                </DialogHeader>
                
                <div className="flex gap-2 mb-4 p-1 bg-muted rounded-lg">
                  <Button 
                    type="button" 
                    variant={transactionType === 'INCOME' ? 'default' : 'ghost'} 
                    onClick={() => setTransactionType('INCOME')}
                    className={`flex-1 ${transactionType === 'INCOME' ? 'shadow-sm' : ''}`}
                  >
                    <ArrowDownLeft className="mr-2 h-4 w-4" /> Income
                  </Button>
                  <Button 
                    type="button" 
                    variant={transactionType === 'EXPENSE' ? 'destructive' : 'ghost'} 
                    onClick={() => setTransactionType('EXPENSE')}
                    className={`flex-1 ${transactionType === 'EXPENSE' ? 'shadow-sm' : ''}`}
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" /> Expense
                  </Button>
                </div>

                <form onSubmit={handleTransactionSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount (KES) <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">KES</span>
                        <Input 
                          name="amount" 
                          type="number" 
                          required 
                          placeholder="0.00" 
                          className="pl-12"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Date <span className="text-red-500">*</span></Label>
                      <Input 
                        name="date" 
                        type="date" 
                        required 
                        defaultValue={new Date().toISOString().split('T')[0]} 
                      />
                    </div>
                  </div>

                  {transactionType === 'INCOME' ? (
                    <div className="space-y-2">
                      <Label>Client Name <span className="text-red-500">*</span></Label>
                      <Input name="clientName" required placeholder="Client Name" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Category <span className="text-red-500">*</span></Label>
                        <Select 
                          name="category" 
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {EXPENSE_CATEGORIES.map((category) => (
                              <SelectItem key={category.category} value={category.category}>
                                {category.category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {subcategories.length > 0 && (
                        <div className="space-y-2">
                          <Label>Subcategory</Label>
                          <Select name="subcategory">
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subcategory (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {subcategories.map((sub) => (
                                <SelectItem key={sub} value={sub}>
                                  {sub}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input 
                      name="description" 
                      placeholder={transactionType === 'INCOME' ? 'Service or product details...' : 'Expense details...'} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select name="paymentMethod" defaultValue="CASH">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="MPESA">M-Pesa</SelectItem>
                          <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                          <SelectItem value="CARD">Credit/Debit Card</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Reference #</Label>
                      <Input name="reference" placeholder="e.g. MPESA code, check #" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Record {transactionType.toLowerCase()}
                    </Button>
                  </div>
                </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Top Clients Card */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Top Clients</CardTitle>
              <CardDescription>Your highest paying clients this period</CardDescription>
            </CardHeader>
            <CardContent>
              {topClients.length > 0 ? (
                <div className="space-y-4">
                  {topClients.map(({ client, amount }) => (
                    <div key={client.id} className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.contactPerson}</p>
                      </div>
                      <div className="ml-auto font-medium">{formatKES(amount)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-medium">No client data</h3>
                  <p className="mb-4 mt-1 text-sm text-muted-foreground">
                    Client data will appear here when you create invoices.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dashboardCards.map((card, index) => (
              <Card key={index} className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                  {card.icon}
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold font-serif ${card.valueClass || ''}`}>{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            ))}
            
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{formatKES(totalExpenses)}</div>
                <p className="text-xs text-muted-foreground">
                  {totalExpenses > 0 ? `+${Math.round((totalExpenses / (totalExpenses - 500)) * 100 - 100)}% from last period` : 'No expenses'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold font-serif ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatKES(Math.abs(netProfit))} {netProfit < 0 ? '(Loss)' : ''}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalIncome > 0 ? `${Math.round((netProfit / totalIncome) * 100)}% margin` : 'No revenue'}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
                <CardDescription>Monthly trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => formatKES(Number(value))}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Expense Breakdown</CardTitle>
                    <CardDescription>By category</CardDescription>
                  </div>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.category} value={cat.category}>
                          {cat.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {expenseByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={expenseByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="amount"
                          label={({ category, percent }) => 
                            `${category} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {expenseByCategory.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={CHART_COLORS[index % CHART_COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => formatKES(Number(value))}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No expense data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>All income and expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...processedData.filteredInvoices, ...processedData.filteredExpenses]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((item) => ('invoiceNumber' in item ? (
                      <TableRow key={`inv-${item.id}`}>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Income
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          Invoice #{item.invoiceNumber}
                          <p className="text-sm text-muted-foreground">{item.clientName}</p>
                        </TableCell>
                        <TableCell>Insurance Premium</TableCell>
                        <TableCell className="text-right font-medium text-emerald-600">
                          +{formatKES(item.amount)}
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={`exp-${item.id}`}>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            Expense
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.description}
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          -{formatKES(item.amount)}
                        </TableCell>
                      </TableRow>
                    )))
                  }
                  
                  {processedData.filteredInvoices.length === 0 && processedData.filteredExpenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">10</span> of{' '}
                <span className="font-medium">
                  {processedData.filteredInvoices.length + processedData.filteredExpenses.length}
                </span>{' '}
                transactions
              </p>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Profit & Loss</CardTitle>
                <CardDescription>Income statement report</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-6">
                <FilePieChart className="h-12 w-12 text-muted-foreground" />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => handleExport('pdf')}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Expense Report</CardTitle>
                <CardDescription>Detailed expense breakdown</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-6">
                <FileUp className="h-12 w-12 text-muted-foreground" />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => handleExport('csv')}>
                  <Download className="mr-2 h-4 w-4" /> Download CSV
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Revenue Report</CardTitle>
                <CardDescription>Income and payment analysis</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-6">
                <BarChart2 className="h-12 w-12 text-muted-foreground" />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => handleExport('pdf')}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </Layout>
  );
}
