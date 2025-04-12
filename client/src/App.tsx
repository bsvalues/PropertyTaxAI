import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import LandRecords from "@/pages/land-records";
import Improvements from "@/pages/improvements";
import Fields from "@/pages/fields";
import Imports from "@/pages/imports";
import NaturalLanguage from "@/pages/natural-language";
import AIAssistantPage from "@/pages/AIAssistantPage";
import { PropertyStoryDemo } from "@/pages/PropertyStoryDemo";
import PropertyStoryPage from "@/pages/PropertyStoryPage";
import DataImportPage from "@/pages/DataImportPage";
import AgentSystemPage from "@/pages/AgentSystemPage";
import VoiceSearchDemoPage from "@/pages/VoiceSearchDemoPage";
import PropertyLineagePage from "@/pages/PropertyLineagePage";
import { DataLineageDashboardPage } from "@/pages/DataLineageDashboardPage";
import AppLayout from "@/layout/app-layout";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </Route>
      
      <Route path="/land-records">
        <AppLayout>
          <LandRecords />
        </AppLayout>
      </Route>

      <Route path="/improvements">
        <AppLayout>
          <Improvements />
        </AppLayout>
      </Route>

      <Route path="/fields">
        <AppLayout>
          <Fields />
        </AppLayout>
      </Route>

      <Route path="/imports">
        <AppLayout>
          <Imports />
        </AppLayout>
      </Route>

      <Route path="/natural-language">
        <AppLayout>
          <NaturalLanguage />
        </AppLayout>
      </Route>

      <Route path="/ai-assistant">
        <AppLayout>
          <AIAssistantPage />
        </AppLayout>
      </Route>

      <Route path="/property-story-demo">
        <AppLayout>
          <PropertyStoryDemo />
        </AppLayout>
      </Route>

      <Route path="/data-import">
        <AppLayout>
          <DataImportPage />
        </AppLayout>
      </Route>

      <Route path="/property-stories">
        <AppLayout>
          <PropertyStoryPage />
        </AppLayout>
      </Route>

      <Route path="/agent-system">
        <AppLayout>
          <AgentSystemPage />
        </AppLayout>
      </Route>

      <Route path="/voice-search">
        <AppLayout>
          <VoiceSearchDemoPage />
        </AppLayout>
      </Route>

      <Route path="/data-lineage">
        <AppLayout>
          <DataLineageDashboardPage />
        </AppLayout>
      </Route>

      <Route path="/property/:propertyId/lineage">
        <AppLayout>
          <PropertyLineagePage />
        </AppLayout>
      </Route>

      {/* Add more routes as needed */}
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
