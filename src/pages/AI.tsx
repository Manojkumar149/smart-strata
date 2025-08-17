import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrimaryBrokerSelect } from "@/components/ai/PrimaryBrokerSelect";
import { BrokerConnectCardZerodha } from "@/components/ai/BrokerConnectCardZerodha";
import { BrokerConnectCardAngel } from "@/components/ai/BrokerConnectCardAngel";
import { OpenAiTokenCard } from "@/components/ai/OpenAiTokenCard";
import { RiskAllocationsCard } from "@/components/ai/RiskAllocationsCard";
import { UniverseCard } from "@/components/ai/UniverseCard";
import { AutopilotControls } from "@/components/ai/AutopilotControls";
import { AiActivityPanel } from "@/components/ai/AiActivityPanel";
import { useRiskStatus } from "@/hooks/useApi";
import { useTradeStore } from "@/store/useTradeStore";
import { getMarketStatus } from "@/lib/time";
import { AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Create a query client for the AI page
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

function AIPageContent() {
  const { mode } = useTradeStore();
  const { data: riskStatus } = useRiskStatus();
  const marketStatus = getMarketStatus();

  const isRiskLocked = riskStatus?.risk_locked || false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Trading System</h1>
          <p className="text-muted-foreground">
            Configure and monitor your AI-powered trading assistant
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Current Mode</div>
          <div className={cn(
            "text-lg font-bold",
            mode === 'LIVE' ? "text-bull" : "text-paper-overlay"
          )}>
            {mode}
          </div>
        </div>
      </div>

      {/* Risk Lock Banner */}
      {isRiskLocked && (
        <div className="rounded-lg border border-bear bg-bear/10 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-bear" />
            <div>
              <h3 className="font-semibold text-bear">Risk Lock Active</h3>
              <p className="text-sm text-bear/80">
                Daily loss limit reached. New entries are blocked. Only exits are allowed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Market Status Banner */}
      {!marketStatus.entryAllowed && marketStatus.isOpen && (
        <div className="rounded-lg border border-amber-500 bg-amber-50 dark:bg-amber-900/20 p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">Entry Window Closed</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                No new entries allowed after 3:10 PM IST. Square-off at 3:15 PM IST.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* Data Feed Selection */}
          <PrimaryBrokerSelect />

          {/* Broker Connections */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Broker Connections</h2>
            <div className="space-y-4">
              <BrokerConnectCardZerodha />
              <BrokerConnectCardAngel />
            </div>
          </div>

          {/* AI Configuration */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">AI Configuration</h2>
            <OpenAiTokenCard />
            <UniverseCard />
          </div>
        </div>

        {/* Right Column - Controls & Activity */}
        <div className="space-y-6">
          {/* Risk & Allocations */}
          <RiskAllocationsCard />

          {/* Autopilot Controls */}
          <AutopilotControls />

          {/* Activity Monitor */}
          <AiActivityPanel />
        </div>
      </div>

      {/* Footer Info */}
      <div className="rounded-lg border p-4 bg-muted/50">
        <div className="text-sm space-y-2">
          <div className="font-medium">System Guidelines</div>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• AI operates within your risk parameters and broker allocations</li>
            <li>• All trades are logged and can be overridden manually</li>
            <li>• Paper mode uses live quotes with simulated execution</li>
            <li>• Live mode requires explicit confirmation for safety</li>
            <li>• System automatically stops all activity at market close (3:30 PM IST)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function AI() {
  return (
    <QueryClientProvider client={queryClient}>
      <AIPageContent />
    </QueryClientProvider>
  );
}