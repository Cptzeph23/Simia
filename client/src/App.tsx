import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useStore } from "./lib/mockData";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Claims from "@/pages/Claims";
import Renewals from "@/pages/Renewals";
import Chat from "@/pages/Chat";
import Team from "@/pages/Team";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import Accounting from "@/pages/Accounting";
import Inbox from "@/pages/Inbox";

function Router() {
  const [location, setLocation] = useLocation();
  const { currentUser } = useStore();

  useEffect(() => {
    // Simple auth check for prototype
    if (!currentUser && location !== "/login") {
      setLocation("/login");
    }
  }, [currentUser, location, setLocation]);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/claims" component={Claims} />
      <Route path="/renewals" component={Renewals} /> 
      <Route path="/chat" component={Chat} />
      <Route path="/team" component={Team} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/accounting" component={Accounting} />
      <Route path="/inbox" component={Inbox} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
