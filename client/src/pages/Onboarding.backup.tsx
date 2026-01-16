import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CheckCircle, Upload, ArrowRight, UserPlus, FileText, Search, Users, PlusCircle } from "lucide-react";
import { useStore, PolicyType } from "@/lib/mockData";

// Client List Component
function ClientList({ clients, onSelectClient }: { clients: any[]; onSelectClient?: (client: any) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Clients</CardTitle>
            <CardDescription>View and manage all clients</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>ID Number</TableHead>
              <TableHead>Policies</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onSelectClient?.(client)}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">{client.phone}</div>
                    <div className="text-xs text-muted-foreground">{client.email}</div>
                  </TableCell>
                  <TableCell>{client.idNumber || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {client.policies?.length > 0 ? (
                        <Badge variant="outline" className="text-xs">
                          {client.policies.length} {client.policies.length === 1 ? 'Policy' : 'Policies'}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">No policies</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      onSelectClient?.(client);
                    }}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {searchTerm ? 'No clients found' : 'No clients available'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function Onboarding() {
  const { addClient, clients } = useStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('new');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    kraPin: '',
    idNumber: '',
    phone: '',
    email: '',
    location: '',
    policyType: 'Auto' as PolicyType,
    coverageAmount: '',
    startDate: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addClient({
      id: `c-${Date.now()}`,
      name: `${formData.firstName} ${formData.lastName}`,
      kraPin: formData.kraPin,
      idNumber: formData.idNumber,
      phone: formData.phone,
      email: formData.email,
      location: formData.location,
      policies: [`pol-${Date.now()}`]
    });

    toast({
      title: "Client Onboarded Successfully",
      description: `New ${formData.policyType} policy created for ${formData.firstName} ${formData.lastName}.`,
    });

    // Reset form and go back to step 1 (or redirect)
    setStep(1);
    setFormData({
      firstName: '',
      lastName: '',
      kraPin: '',
      idNumber: '',
      phone: '',
      email: '',
      location: '',
      policyType: 'Auto',
      coverageAmount: '',
      startDate: '',
    });
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-semibold">
            {activeTab === 'new' ? 'New Client Onboarding' : 'Client Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {activeTab === 'new' 
              ? 'Register a new client and issue policy' 
              : 'View and manage all clients'}
          </p>
        </div>
        {activeTab === 'view' && (
          <Button onClick={() => setActiveTab('new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Client
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="new">
            <UserPlus className="mr-2 h-4 w-4" />
            New Client
          </TabsTrigger>
          <TabsTrigger value="view">
            <Users className="mr-2 h-4 w-4" />
            View Clients ({clients.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="mt-4">
          <ClientList 
            clients={clients} 
            onSelectClient={(client) => {
              // You can implement view/edit functionality here
              console.log('Selected client:', client);
            }} 
          />
        </TabsContent>

        <TabsContent value="new" className="mt-4">
          <div className="flex gap-8">
        {/* Stepper Sidebar */}
        <div className="w-64 hidden md:block">
          <div className="sticky top-8 space-y-8">
            <div className="relative pl-8 border-l-2 border-muted">
              {[
                { num: 1, title: 'Client Details', desc: 'Personal information' },
                { num: 2, title: 'Policy Selection', desc: 'Coverage details' },
                { num: 3, title: 'Documents', desc: 'KYC & Uploads' },
                { num: 4, title: 'Review', desc: 'Confirm & Submit' }
              ].map((item) => (
                <div key={item.num} className="mb-8 last:mb-0 relative">
                  <div className={`absolute -left-[33px] top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                    step > item.num ? 'bg-primary border-primary text-primary-foreground' : 
                    step === item.num ? 'bg-background border-primary text-primary' : 'bg-muted border-transparent text-muted-foreground'
                  }`}>
                    {step > item.num ? <CheckCircle className="h-5 w-5" /> : item.num}
                  </div>
                  <h3 className={`font-medium ${step === item.num ? 'text-foreground' : 'text-muted-foreground'}`}>{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1 max-w-2xl">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <Card className="border-none shadow-md animate-in fade-in slide-in-from-right-4 duration-300">
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                  <CardDescription>Enter the client's personal details for KYC.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="idNumber">ID / Passport Number</Label>
                      <Input id="idNumber" name="idNumber" value={formData.idNumber} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kraPin">KRA PIN</Label>
                      <Input id="kraPin" name="kraPin" value={formData.kraPin} onChange={handleInputChange} placeholder="A000..." required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+254..." required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Physical Location / Address</Label>
                    <Input id="location" name="location" value={formData.location} onChange={handleInputChange} required />
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="border-none shadow-md animate-in fade-in slide-in-from-right-4 duration-300">
                <CardHeader>
                  <CardTitle>Policy Details</CardTitle>
                  <CardDescription>Select the insurance product and coverage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="policyType">Policy Type</Label>
                    <Select name="policyType" value={formData.policyType} onValueChange={(val) => handleSelectChange('policyType', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Policy Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Auto">Motor Private / Commercial</SelectItem>
                        <SelectItem value="Health">Medical / Health</SelectItem>
                        <SelectItem value="Life">Life Insurance</SelectItem>
                        <SelectItem value="Home">Home & Contents</SelectItem>
                        <SelectItem value="WIBA">WIBA (Work Injury Benefits)</SelectItem>
                        <SelectItem value="Bid Bond">Bid Bond</SelectItem>
                        <SelectItem value="Fire">Fire & Perils</SelectItem>
                        <SelectItem value="Burglary">Burglary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coverageAmount">Sum Insured / Bond Value (KES)</Label>
                    <Input id="coverageAmount" name="coverageAmount" type="number" value={formData.coverageAmount} onChange={handleInputChange} placeholder="e.g. 1,500,000" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Policy Start Date</Label>
                    <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} required />
                  </div>

                  {formData.policyType === 'WIBA' && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                      <h4 className="font-semibold mb-1">WIBA Requirements</h4>
                      <p>Please ensure you have the list of employees and their annual earnings ready for upload in the next step.</p>
                    </div>
                  )}

                   {formData.policyType === 'Bid Bond' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                      <h4 className="font-semibold mb-1">Bid Bond Requirements</h4>
                      <p>Ensure tender number and procuring entity details are verified.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card className="border-none shadow-md animate-in fade-in slide-in-from-right-4 duration-300">
                <CardHeader>
                  <CardTitle>Document Upload</CardTitle>
                  <CardDescription>Upload necessary KYC and policy documents.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <div className="text-sm font-medium">Upload ID / Passport Copy</div>
                        <div className="text-xs text-muted-foreground">Drag and drop or click to browse</div>
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <div className="text-sm font-medium">Upload KRA PIN Certificate</div>
                        <div className="text-xs text-muted-foreground">Drag and drop or click to browse</div>
                      </div>
                    </div>
                    
                    {(formData.policyType === 'Auto') && (
                       <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                       <div className="flex flex-col items-center gap-2">
                         <Upload className="h-8 w-8 text-muted-foreground" />
                         <div className="text-sm font-medium">Upload Logbook</div>
                         <div className="text-xs text-muted-foreground">Drag and drop or click to browse</div>
                       </div>
                     </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

        {step === 4 && (
  <Card className="border-none shadow-md animate-in fade-in slide-in-from-right-4 duration-300">
    <CardHeader>
      <CardTitle>Review & Submit</CardTitle>
      <CardDescription>
        Please verify all details before creating the policy.
      </CardDescription>
    </CardHeader>

    <CardContent className="space-y-6">
      <div className="bg-muted/30 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block">Client Name</span>
            <span className="font-medium">
              {formData.firstName} {formData.lastName}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block">ID Number</span>
            <span className="font-medium">{formData.idNumber}</span>
          </div>

          <div>
            <span className="text-muted-foreground block">Policy Type</span>
            <span className="font-medium">{formData.policyType}</span>
          </div>

          <div>
            <span className="text-muted-foreground block">Start Date</span>
            <span className="font-medium">{formData.startDate}</span>
          </div>

          <div>
            <span className="text-muted-foreground block">Coverage Amount</span>
            <span className="font-medium">
              {formData.coverageAmount
                ? `KES ${parseInt(formData.coverageAmount).toLocaleString()}`
                : "N/A"}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block">Contact</span>
            <span className="font-medium">{formData.phone}</span>
            <div className="text-sm text-muted-foreground">
              {formData.email}
            </div>
          </div>

          <div>
            <span className="text-muted-foreground block">Location</span>
            <span className="font-medium">{formData.location}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span>
          By submitting, a draft policy will be generated for approval.
        </span>
      </div>
    </CardContent>
  </Card>
)}


            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={handleBack} disabled={step === 1}>
                Back
              </Button>
              
              {step < 4 ? (
                <Button type="button" onClick={handleNext}>
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Complete Onboarding <UserPlus className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </TabsContent>
  </Tabs>
</Layout>
  );
}

