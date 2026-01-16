import { useLocation } from "wouter";
import { useStore, USERS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User, ArrowRight, Calculator } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { setCurrentUser } = useStore();

  const handleLogin = (role: 'BOSS' | 'EMPLOYEE' | 'ACCOUNTANT') => {
    const user = USERS.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <img src="/logo.png" alt="Simia Logo" className="h-24 w-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold text-foreground">Simia Insurance</h1>
          <p className="text-muted-foreground">Workflow Management System</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Please sign in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="employee">Employee</TabsTrigger>
                <TabsTrigger value="accountant">Accountant</TabsTrigger>
              </TabsList>

              <TabsContent value="admin" className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                    <Shield className="h-4 w-4" />
                    <span>Admin Credentials</span>
                  </div>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p><span className="font-medium text-foreground">Email:</span> boss@simia.com</p>
                    <p><span className="font-medium text-foreground">Password:</span> admin123</p>
                  </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleLogin('BOSS'); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-admin">Email</Label>
                    <Input id="email-admin" defaultValue="boss@simia.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-admin">Password</Label>
                    <Input id="password-admin" type="password" defaultValue="admin123" />
                  </div>
                  <Button type="submit" className="w-full gap-2 group">
                    Login as Admin
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="employee" className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400 font-semibold">
                    <User className="h-4 w-4" />
                    <span>Employee Credentials</span>
                  </div>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p><span className="font-medium text-foreground">Email:</span> sarah@simia.com</p>
                    <p><span className="font-medium text-foreground">Password:</span> user123</p>
                  </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleLogin('EMPLOYEE'); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-user">Email</Label>
                    <Input id="email-user" defaultValue="sarah@simia.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-user">Password</Label>
                    <Input id="password-user" type="password" defaultValue="user123" />
                  </div>
                  <Button type="submit" className="w-full gap-2 group" variant="secondary">
                    Login as Employee
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="accountant" className="space-y-4">
                 <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <Calculator className="h-4 w-4" />
                    <span>Accountant Credentials</span>
                  </div>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p><span className="font-medium text-foreground">Email:</span> john@simia.com</p>
                    <p><span className="font-medium text-foreground">Password:</span> acc123</p>
                  </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleLogin('ACCOUNTANT'); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-acc">Email</Label>
                    <Input id="email-acc" defaultValue="john@simia.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-acc">Password</Label>
                    <Input id="password-acc" type="password" defaultValue="acc123" />
                  </div>
                  <Button type="submit" className="w-full gap-2 group" variant="outline">
                    Login as Accountant
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
