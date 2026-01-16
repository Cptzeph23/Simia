import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useStore } from "@/lib/mockData";
import { formatKES, cn, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { FileText, Download, Filter, Search, ArrowUpDown, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const ITEMS_PER_PAGE = 5;

export default function Claims() {
  const [, setLocation] = useLocation();
  const { claims, renewals } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentRenewalPage, setCurrentRenewalPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [activeTab, setActiveTab] = useState("claims");
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort claims
  const filteredClaims = useMemo(() => {
    let result = [...claims];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(claim => 
        claim.policyNumber.toLowerCase().includes(term) ||
        claim.policyHolder.toLowerCase().includes(term) ||
        claim.type.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(claim => claim.status === statusFilter);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [claims, searchTerm, statusFilter, sortConfig]);
  
  // Filter and sort renewals
  const filteredRenewals = useMemo(() => {
    let result = [...renewals];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(renewal => 
        renewal.policyNumber.toLowerCase().includes(term) ||
        renewal.clientName.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(renewal => renewal.status === statusFilter);
    }
    
    return result;
  }, [renewals, searchTerm, statusFilter]);
  
  // Pagination for claims
  const totalPages = Math.ceil(filteredClaims.length / ITEMS_PER_PAGE);
  const paginatedClaims = filteredClaims.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  // Pagination for renewals
  const totalRenewalPages = Math.ceil(filteredRenewals.length / ITEMS_PER_PAGE);
  const paginatedRenewals = filteredRenewals.slice(
    (currentRenewalPage - 1) * ITEMS_PER_PAGE,
    currentRenewalPage * ITEMS_PER_PAGE
  );
  
  // Handle sort request
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Status color utility function
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { text: 'text-emerald-700', background: 'bg-emerald-50', border: 'border-emerald-200' };
      case 'PENDING':
        return { text: 'text-amber-700', background: 'bg-amber-50', border: 'border-amber-200' };
      case 'PAID':
        return { text: 'text-blue-700', background: 'bg-blue-50', border: 'border-blue-200' };
      case 'REJECTED':
        return { text: 'text-red-700', background: 'bg-red-50', border: 'border-red-200' };
      case 'UPCOMING':
        return { text: 'text-blue-700', background: 'bg-blue-50', border: 'border-blue-200' };
      case 'OVERDUE':
        return { text: 'text-red-700', background: 'bg-red-50', border: 'border-red-200' };
      case 'PROCESSING':
        return { text: 'text-amber-700', background: 'bg-amber-50', border: 'border-amber-200' };
      case 'AWAITING_PAYMENT':
        return { text: 'text-purple-700', background: 'bg-purple-50', border: 'border-purple-200' };
      default:
        return { text: 'text-gray-700', background: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  // Get status summary for chart
  const claimsStatusData = useMemo(() => {
    const statusCounts = claims.reduce<Record<string, number>>((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: getStatusColor(name).background.replace('bg-', '').split('-')[0]
    }));
  }, [claims]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  const handleClaimClick = (claimId: string) => {
    setLocation(`/claims/${claimId}`);
  };
  
  const handleExport = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const data = activeTab === 'claims' ? filteredClaims : filteredRenewals;
      const headers = activeTab === 'claims' 
        ? ['Policy Number', 'Policy Holder', 'Type', 'Amount', 'Date', 'Status']
        : ['Policy Number', 'Client Name', 'Premium', 'Due Date', 'Status'];
      
      // Convert data to CSV
      const csvContent = [
        headers.join(','),
        ...data.map(item => 
          activeTab === 'claims'
            ? `"${item.policyNumber}","${item.policyHolder}","${item.type}","${formatKES(item.amount)}","${item.date}","${item.status}"`
            : `"${item.policyNumber}","${item.clientName}","${formatKES(item.premium)}","${item.dueDate}","${item.status}"`
        )
      ].join('\n');
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-semibold">Claims & Renewals</h1>
            <p className="text-muted-foreground mt-1">Process claims and manage policy renewals</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" /> Export
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claims.length}</div>
              <p className="text-xs text-muted-foreground">
                {filteredClaims.length} match current filters
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
              <FileText className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {claims.filter(c => c.status === 'PENDING').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Needs attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {renewals.filter(r => r.status === 'UPCOMING').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Due in next 30 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Renewals</CardTitle>
              <FileText className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {renewals.filter(r => r.status === 'OVERDUE').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires immediate action
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Claims Status Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Claims Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={claimsStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {claimsStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} claims`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="h-full flex items-center justify-center">
                <div className="space-y-4">
                  {claimsStatusData.map((item, index) => (
                    <div key={item.name} className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">
                        {item.name}: <span className="font-medium">{item.value}</span> claims
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs 
        defaultValue="claims" 
        className="space-y-6 mt-6"
        onValueChange={setActiveTab}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
            <TabsTrigger value="claims">Active Claims</TabsTrigger>
            <TabsTrigger value="renewals">Upcoming Renewals</TabsTrigger>
          </TabsList>
          
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={`Search ${activeTab === 'claims' ? 'claims...' : 'renewals...'}`}
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (activeTab === 'claims') setCurrentPage(1);
                  else setCurrentRenewalPage(1);
                }}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                if (activeTab === 'claims') setCurrentPage(1);
                else setCurrentRenewalPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {activeTab === 'claims' ? (
                  <>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="RENEWED">Renewed</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="claims">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Recent Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => requestSort('policyNumber')}
                    >
                      <div className="flex items-center">
                        Policy Number
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => requestSort('policyHolder')}
                    >
                      <div className="flex items-center">
                        Policy Holder
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => requestSort('type')}
                    >
                      <div className="flex items-center">
                        Type
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => requestSort('amount')}
                    >
                      <div className="flex items-center">
                        Amount
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => requestSort('date')}
                    >
                      <div className="flex items-center">
                        Date Submitted
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedClaims.length > 0 ? (
                    paginatedClaims.map((claim) => {
                      const statusColors = getStatusColor(claim.status);
                      return (
                        <TableRow 
                          key={claim.id} 
                          className="cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => handleClaimClick(claim.id)}
                        >
                          <TableCell className="font-medium">{claim.policyNumber}</TableCell>
                          <TableCell>{claim.policyHolder}</TableCell>
                          <TableCell className="capitalize">{claim.type.toLowerCase()}</TableCell>
                          <TableCell className="font-medium">{formatKES(claim.amount)}</TableCell>
                          <TableCell>{formatDate(claim.date)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                statusColors.border,
                                statusColors.text,
                                statusColors.background,
                                'min-w-[80px] justify-center'
                              )}
                            >
                              {claim.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClaimClick(claim.id);
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'No claims match your search criteria.' 
                          : 'No claims found.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renewals">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Policy Renewals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => requestSort('policyNumber')}
                    >
                      <div className="flex items-center">
                        Policy Number
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => requestSort('clientName')}
                    >
                      <div className="flex items-center">
                        Client Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => requestSort('premium')}
                    >
                      <div className="flex items-center">
                        Premium Amount
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => requestSort('dueDate')}
                    >
                      <div className="flex items-center">
                        Due Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRenewals.length > 0 ? (
                    paginatedRenewals.map((renewal) => {
                      const statusColors = getStatusColor(renewal.status);
                      return (
                        <TableRow 
                          key={renewal.id}
                          className="hover:bg-accent/50 transition-colors"
                        >
                          <TableCell className="font-medium">{renewal.policyNumber}</TableCell>
                          <TableCell>{renewal.clientName}</TableCell>
                          <TableCell className="font-medium">{formatKES(renewal.premium)}</TableCell>
                          <TableCell>{formatDate(renewal.dueDate)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                statusColors.border,
                                statusColors.text,
                                statusColors.background,
                                'min-w-[100px] justify-center'
                              )}
                            >
                              {renewal.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                // Handle send reminder
                                console.log('Sending reminder for renewal:', renewal.id);
                              }}
                            >
                              Send Reminder
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'No renewals match your search criteria.' 
                          : 'No renewals found.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">
                  {activeTab === 'claims' 
                    ? `${Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredClaims.length)}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredClaims.length)}` 
                    : `${Math.min((currentRenewalPage - 1) * ITEMS_PER_PAGE + 1, filteredRenewals.length)}-${Math.min(currentRenewalPage * ITEMS_PER_PAGE, filteredRenewals.length)}`}
                </span> of <span className="font-medium">
                  {activeTab === 'claims' ? filteredClaims.length : filteredRenewals.length}
                </span> {activeTab === 'claims' ? 'claims' : 'renewals'}
              </div>
              <Pagination className="m-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => activeTab === 'claims' 
                        ? setCurrentPage(p => Math.max(1, p - 1))
                        : setCurrentRenewalPage(p => Math.max(1, p - 1))
                      }
                      className={activeTab === 'claims' 
                        ? (currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer')
                        : (currentRenewalPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer')
                      }
                    />
                  </PaginationItem>
                  {Array.from({ 
                    length: activeTab === 'claims' ? totalPages : totalRenewalPages 
                  }).map((_, i) => {
                    const page = i + 1;
                    const isActive = activeTab === 'claims' 
                      ? page === currentPage 
                      : page === currentRenewalPage;
                    
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          isActive={isActive}
                          onClick={() => {
                            if (activeTab === 'claims') {
                              setCurrentPage(page);
                            } else {
                              setCurrentRenewalPage(page);
                            }
                          }}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => activeTab === 'claims'
                        ? setCurrentPage(p => Math.min(totalPages, p + 1))
                        : setCurrentRenewalPage(p => Math.min(totalRenewalPages, p + 1))
                      }
                      className={activeTab === 'claims' 
                        ? (currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer')
                        : (currentRenewalPage >= totalRenewalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer')
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
