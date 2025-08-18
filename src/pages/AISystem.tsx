import React from 'react';
import { useTradeStore } from '@/store/useTradeStore';
import { BrokerConnectCardZerodha } from '@/components/ai/BrokerConnectCardZerodha';
import { BrokerConnectCardAngel } from '@/components/ai/BrokerConnectCardAngel';
import { RiskAllocationsCard } from '@/components/ai/RiskAllocationsCard';
import { OpenAiTokenCard } from '@/components/ai/OpenAiTokenCard';
import { UniverseCard } from '@/components/ai/UniverseCard';
import { AutopilotControls } from '@/components/ai/AutopilotControls';
import { AiActivityPanel } from '@/components/ai/AiActivityPanel';
import { Badge } from '@/components/ui/badge';

export default function AISystem() {
  const { mode, autopilot } = useTradeStore();
  const isAutopilotOn = autopilot[mode.toLowerCase() as 'paper' | 'live'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* PAPER/LIVE Watermark */}
      <div className="fixed top-20 right-4 z-50 pointer-events-none">
        <div className={`
          text-4xl font-bold opacity-20 select-none
          ${mode === 'PAPER' ? 'text-muted-foreground' : 'text-bear'}
        `}>
          {mode}
        </div>
      </div>

      {/* Header with AI Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Trading System</h1>
          <p className="text-muted-foreground">
            Configure AI autopilot, broker connections, and risk parameters
          </p>
        </div>
        
        {/* AI Status Indicator */}
        <div className="flex items-center gap-2">
          <Badge 
            variant={isAutopilotOn ? "default" : "secondary"}
            className={isAutopilotOn ? "bg-bull hover:bg-bull/90" : ""}
          >
            {isAutopilotOn ? "AI ON" : "AI OFF"}
          </Badge>
        </div>
      </div>

      {/* AI Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broker Connections */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Broker Connections</h2>
          <BrokerConnectCardZerodha />
          <BrokerConnectCardAngel />
        </div>

        {/* AI Configuration */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">AI Configuration</h2>
          <OpenAiTokenCard />
          <UniverseCard />
        </div>
      </div>

      {/* Risk & Budget Management */}
      <div className="grid grid-cols-1 gap-6">
        <RiskAllocationsCard />
      </div>

      {/* Autopilot Controls */}
      <div className="grid grid-cols-1 gap-6">
        <AutopilotControls />
      </div>

      {/* AI Activity Panel */}
      <div className="grid grid-cols-1 gap-6">
        <AiActivityPanel />
      </div>
    </div>
  );
}