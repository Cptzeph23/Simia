import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useStore } from "@/lib/mockData";
import { formatKES, cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw, FileCheck, Send, AlertCircle, Search, Filter, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

const statusOptions = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'AWAITING_PAYMENT', label: 'Awaiting Payment' },
  { value: 'COMPLETED', label: 'Completed' },
];

const sortOptions = [
  { value: 'dueDate-asc', label: 'Due Date (Oldest First)' },
  { value: 'dueDate-desc', label: 'Due Date (Newest First)' },
  { value: 'premium-asc', label: 'Premium (Low to High)' },
  { value: 'premium-desc', label: 'Premium (High to Low)' },
];

interface Renewal {
  id: string;
  policyNumber: string;
  clientName: string;
  type: string;
  premium: number;
  dueDate: string;
  status: string;
  [key: string]: any;
}

export default function Renewals() {
  const { renewals, updateRenewalStatus, currentUser, addInvoice } = useStore();
  const { toast } = useToast();
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'OVERDUE' | 'PROCESSING' | 'AWAITING_PAYMENT'>('ALL');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort renewals
  const filteredRenewals = useMemo(() => {
    return renewals
      .filter(renewal => {
        const matchesSearch = 
          renewal.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          renewal.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          renewal.type.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Get status filter from either the dropdown or the active tab
        let statusToFilter = statusFilter;
        if (statusFilter === 'ALL' && activeTab !== 'all') {
          statusToFilter = activeTab.toUpperCase().replace('-', '_');
        }
        
        const matchesStatus = 
          statusToFilter === 'ALL' || 
          renewal.status === statusToFilter ||
          (activeTab === 'overdue' && renewal.status === 'OVERDUE') ||
          (activeTab === 'upcoming' && renewal.status === 'UPCOMING') ||
          (activeTab === 'processing' && renewal.status === 'PROCESSING') ||
          (activeTab === 'awaiting' && renewal.status === 'AWAITING_PAYMENT');
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const [sortField, sortOrder] = sortBy.split('-');
        const order = sortOrder === 'asc' ? 1 : -1;
        
        if (sortField === 'dueDate') {
          return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * order;
        }
        
        if (sortField === 'premium') {
          return (a.premium - b.premium) * order;
        }
        
        return 0;
      });
  }, [renewals, searchTerm, statusFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredRenewals.length / ITEMS_PER_PAGE);
  const paginatedRenewals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRenewals.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRenewals, currentPage]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: renewals.length,
      upcoming: renewals.filter(r => r.status === 'UPCOMING').length,
      overdue: renewals.filter(r => r.status === 'OVERDUE').length,
      processing: renewals.filter(r => r.status === 'PROCESSING').length,
      awaitingPayment: renewals.filter(r => r.status === 'AWAITING_PAYMENT').length,
      // Updated to use 'PAID' instead of 'COMPLETED' to match the type
      completed: renewals.filter(r => r.status === 'PAID').length,
    };
  }, [renewals]);

  const handleProcessRenewal = (id: string) => {
    setIsLoading(true);
    updateRenewalStatus(id, 'PROCESSING');
    toast({
      title: "Renewal Processing Started",
      description: "The renewal has been marked for processing.",
    });
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleSubmitForApproval = (id: string) => {
    setIsLoading(true);
    updateRenewalStatus(id, 'AWAITING_PAYMENT');
    toast({
      title: "Submitted for Approval",
      description: "Renewal sent to accountant for invoicing.",
    });
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleApproveAndInvoice = (renewal: Renewal) => {
    setIsLoading(true);
    
    // 1. Update status
    updateRenewalStatus(renewal.id, 'AWAITING_PAYMENT');
    
    // 2. Create Invoice
    addInvoice({
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
      clientName: renewal.clientName,
      amount: renewal.premium,
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      type: renewal.type,
      transactionType: 'INCOME'
    });

    toast({
      title: "Renewal Approved & Invoiced",
      description: `Invoice generated for ${renewal.clientName}.`,
    });
    
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleViewDetails = (renewal: Renewal) => {
    setSelectedRenewal(renewal);
    setIsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
    
    // Update status filter based on tab
    if (tab === 'all') {
      setStatusFilter('ALL');
    } else {
      // Convert tab name to status format (e.g., 'awaiting' -> 'AWAITING_PAYMENT')
      const statusMap: Record<string, 'UPCOMING' | 'OVERDUE' | 'PROCESSING' | 'AWAITING_PAYMENT'> = {
        'upcoming': 'UPCOMING',
        'overdue': 'OVERDUE',
        'processing': 'PROCESSING',
        'awaiting': 'AWAITING_PAYMENT'
      };
      setStatusFilter(statusMap[tab as keyof typeof statusMap] || 'ALL');
    }
  };

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
        <div>
          <h1 className="text-3xl font-serif font-semibold">Policy Renewals</h1>
          <p className="text-muted-foreground mt-1">Manage upcoming and overdue policy renewals</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Renewals" 
            value={stats.total} 
            icon={<FileCheck className="h-4 w-4" />} 
          />
          <StatCard 
            title="Upcoming" 
            value={stats.upcoming} 
            variant="blue"
            icon={<AlertCircle className="h-4 w-4" />} 
          />
          <StatCard 
            title="Overdue" 
            value={stats.overdue} 
            variant="red"
            icon={<AlertCircle className="h-4 w-4" />} 
          />
          <StatCard 
            title="Processing" 
            value={stats.processing} 
            variant="amber"
            icon={<RefreshCcw className="h-4 w-4 animate-spin" />} 
          />
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
            <div>
              <CardTitle>Renewal Queue</CardTitle>
              <CardDescription className="mt-1">
                {currentUser.role === 'ACCOUNTANT' 
                  ? 'Approve processed renewals and generate invoices' 
                  : 'Process upcoming renewals for client approval'}
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search renewals..."
                  className="w-full pl-8 md:w-[200px] lg:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <span className="text-muted-foreground">Sort: </span>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="px-6"
        >
          <TabsList>
            <TabsTrigger value="all">All Renewals</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            {currentUser.role === 'ACCOUNTANT' && (
              <TabsTrigger value="awaiting">Awaiting Payment</TabsTrigger>
            )}
          </TabsList>
        </Tabs>
        
        <CardContent className="p-0">
          <div className="rounded-md border
            {paginatedRenewals.length === 0 ? 'flex items-center justify-center h-64' : ''}
          ">
            {paginatedRenewals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Policy Number</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRenewals.map((renewal) => (
                    <TableRow 
                      key={renewal.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDetails(renewal)}
                    >
                      <TableCell className="font-medium">{renewal.policyNumber}</TableCell>
                      <TableCell className="font-medium">{renewal.clientName}</TableCell>
                      <TableCell className="capitalize">{renewal.type.toLowerCase()}</TableCell>
                      <TableCell className="font-medium">{formatKES(renewal.premium)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {new Date(renewal.dueDate).toLocaleDateString()}
                          {renewal.status === 'OVERDUE' && (
                            <span className="ml-2 text-xs text-red-500">Overdue</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'whitespace-nowrap',
                            renewal.status === 'UPCOMING' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                            renewal.status === 'OVERDUE' ? 'border-red-200 text-red-700 bg-red-50' :
                            renewal.status === 'PROCESSING' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                            renewal.status === 'AWAITING_PAYMENT' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                            'border-emerald-200 text-emerald-700 bg-emerald-50'
                          )}
                        >
                          {renewal.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(renewal);
                            }}
                          >
                            View
                          </Button>
                          
                          {currentUser.role === 'EMPLOYEE' && (
                            <>
                              {renewal.status === 'UPCOMING' || renewal.status === 'OVERDUE' ? (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProcessRenewal(renewal.id);
                                  }}
                                >
                                  <RefreshCcw className="mr-2 h-3 w-3" /> Process
                                </Button>
                              ) : renewal.status === 'PROCESSING' ? (
                                <Button 
                                  size="sm" 
                                  className="bg-emerald-600 hover:bg-emerald-700" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubmitForApproval(renewal.id);
                                  }}
                                >
                                  <Send className="mr-2 h-3 w-3" /> Submit
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">Pending Finance</span>
                              )}
                            </>
                          )}

                          {(currentUser.role === 'ACCOUNTANT' || currentUser.role === 'BOSS') && (
                            <>
                              {renewal.status === 'AWAITING_PAYMENT' ? (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  disabled
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FileCheck className="mr-2 h-3 w-3" /> Invoiced
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  className="bg-primary text-primary-foreground hover:brightness-110"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApproveAndInvoice(renewal);
                                  }}
                                >
                                  <FileCheck className="mr-2 h-3 w-3" /> Approve
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No renewals found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm || statusFilter !== 'ALL' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No renewals available at the moment.'}
                </p>
                {(searchTerm || statusFilter !== 'ALL') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('ALL');
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredRenewals.length)}
                </span>{' '}
                of <span className="font-medium">{filteredRenewals.length}</span> renewals
              </div>
              
              <Pagination className="mt-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show first page, last page, current page, and pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNum);
                          }}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Renewal Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {selectedRenewal && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Renewal Details</DialogTitle>
              <DialogDescription>
                Policy: {selectedRenewal.policyNumber} • {selectedRenewal.clientName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Policy Type</p>
                  <p className="font-medium capitalize">{selectedRenewal.type.toLowerCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Premium</p>
                  <p className="font-medium">{formatKES(selectedRenewal.premium)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {new Date(selectedRenewal.dueDate).toLocaleDateString()}
                    {selectedRenewal.status === 'OVERDUE' && (
                      <span className="ml-2 text-xs text-red-500">Overdue</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'mt-1',
                      selectedRenewal.status === 'UPCOMING' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                      selectedRenewal.status === 'OVERDUE' ? 'border-red-200 text-red-700 bg-red-50' :
                      selectedRenewal.status === 'PROCESSING' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                      selectedRenewal.status === 'AWAITING_PAYMENT' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                      'border-emerald-200 text-emerald-700 bg-emerald-50'
                    )}
                  >
                    {selectedRenewal.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {currentUser.role === 'EMPLOYEE' && (
                    <>
                      {(selectedRenewal.status === 'UPCOMING' || selectedRenewal.status === 'OVERDUE') && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            handleProcessRenewal(selectedRenewal.id);
                            setIsModalOpen(false);
                          }}
                        >
                          <RefreshCcw className="mr-2 h-4 w-4" /> Process Renewal
                        </Button>
                      )}
                      
                      {selectedRenewal.status === 'PROCESSING' && (
                        <Button 
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => {
                            handleSubmitForApproval(selectedRenewal.id);
                            setIsModalOpen(false);
                          }}
                        >
                          <Send className="mr-2 h-4 w-4" /> Submit for Approval
                        </Button>
                      )}
                    </>
                  )}
                  
                  {(currentUser.role === 'ACCOUNTANT' || currentUser.role === 'BOSS') && (
                    <>
                      {selectedRenewal.status === 'AWAITING_PAYMENT' ? (
                        <Button variant="outline" disabled>
                          <FileCheck className="mr-2 h-4 w-4" /> Invoiced
                        </Button>
                      ) : (
                        <Button 
                          className="bg-primary text-primary-foreground hover:brightness-110"
                          onClick={() => {
                            handleApproveAndInvoice(selectedRenewal);
                            setIsModalOpen(false);
                          }}
                        >
                          <FileCheck className="mr-2 h-4 w-4" /> Approve & Generate Invoice
                        </Button>
                      )}
                    </>
                  )}
                  
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </Layout>
  );
}

// StatCard Component
function StatCard({ title, value, icon, variant = 'default' }: { 
  title: string; 
  value: number; 
  icon: React.ReactNode;
  variant?: 'default' | 'blue' | 'red' | 'amber' | 'green';
}) {
  const variantClasses = {
    default: 'bg-muted text-foreground',
    blue: 'bg-blue-50 text-blue-700',
    red: 'bg-red-50 text-red-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${variantClasses[variant]}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
