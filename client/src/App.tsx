import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import OperatingSystemPage from "./pages/OperatingSystemPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <OperatingSystemPage routeId="landing" />} />
      <Route path="/dashboard" component={() => <OperatingSystemPage routeId="dashboard" />} />
      <Route path="/new-analysis" component={() => <OperatingSystemPage routeId="new-analysis" />} />
      <Route path="/workspace" component={() => <OperatingSystemPage routeId="workspace" />} />
      <Route path="/earth" component={() => <OperatingSystemPage routeId="earth" />} />
      <Route path="/satellites" component={() => <OperatingSystemPage routeId="satellites" />} />
      <Route path="/monitor" component={() => <OperatingSystemPage routeId="monitor" />} />
      <Route path="/analyses" component={() => <OperatingSystemPage routeId="analyses" />} />
      <Route path="/datasets" component={() => <OperatingSystemPage routeId="datasets" />} />
      <Route path="/models" component={() => <OperatingSystemPage routeId="models" />} />
      <Route path="/workflow" component={() => <OperatingSystemPage routeId="workflow" />} />
      <Route path="/evidence" component={() => <OperatingSystemPage routeId="evidence" />} />
      <Route path="/spectral" component={() => <OperatingSystemPage routeId="spectral" />} />
      <Route path="/fusion" component={() => <OperatingSystemPage routeId="fusion" />} />
      <Route path="/time-machine" component={() => <OperatingSystemPage routeId="time-machine" />} />
      <Route path="/missions" component={() => <OperatingSystemPage routeId="missions" />} />
      <Route path="/benchmarks" component={() => <OperatingSystemPage routeId="benchmarks" />} />
      <Route path="/reports" component={() => <OperatingSystemPage routeId="reports" />} />
      <Route path="/alerts" component={() => <OperatingSystemPage routeId="alerts" />} />
      <Route path="/observatory" component={() => <OperatingSystemPage routeId="observatory" />} />
      <Route path="/learn" component={() => <OperatingSystemPage routeId="learn" />} />
      <Route path="/settings" component={() => <OperatingSystemPage routeId="settings" />} />
      <Route path="/help" component={() => <OperatingSystemPage routeId="help" />} />
      <Route path="/judge" component={() => <OperatingSystemPage routeId="judge" />} />
      <Route path="/replay" component={() => <OperatingSystemPage routeId="replay" />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster theme="dark" position="top-right" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
