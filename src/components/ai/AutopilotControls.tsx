import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Bot, Play, Square, AlertTriangle, Loader2, Clock, Shield } from "lucide-react";
import { useAutopilotStatus, useAutopilotStart, useAutopilotStop, useRiskStatus, useOpenAiStatus, useZerodhaStatus, useAngelStatus } from "@/hooks/useApi";
import { useTradeStore } from "@/store/useTradeStore";
import { isEntryAllowed, getMarketStatus, formatIST, getCurrentIST } from "@/lib/time";
import { cn } from "@/lib/utils";

export function AutopilotControls() {
  const { mode } = useTradeStore();
  const { data: autopilotStatus, isLoading: autopilotLoading } = useAutopilotStatus();
  const { data: riskStatus } = useRiskStatus();
  const { data: openAiStatus } = useOpenAiStatus();
  const { data: zerodhaStatus } = useZerodhaStatus();
  const { data: angelStatus } = useAngelStatus();
  
  const startAutopilot = useAutopilotStart();
  const stopAutopilot = useAutopilotStop();

  const [confirmText, setConfirmText] = useState('');
  const [showLiveWarning, setShowLiveWarning] = useState(false);

  const isRunning = autopilotStatus?.running || false;
  const currentMode = autopilotStatus?.mode || 'PAPER';

  // Validation checks
  const marketStatus = getMarketStatus();
  const hasOpenAI = openAiStatus?.present || false;
  const hasZerodhaConnected = zerodhaStatus?.connected || false;
  const hasAngelConnected = angelStatus?.connected || false;
  const hasAnyBrokerConnected = hasZerodhaConnected || hasAngelConnected;
  const isRiskLocked = riskStatus?.risk_locked || false;
  const entryAllowed = marketStatus.entryAllowed;

  // Determine if start is disabled
  const canStart = hasOpenAI && hasAnyBrokerConnected && !isRiskLocked && entryAllowed && !isRunning;

  const getBlockedReasons = () => {
    const reasons = [];
    if (!hasOpenAI) reasons.push('OpenAI token missing');
    if (!hasAnyBrokerConnected) reasons.push('No broker connected');
    if (isRiskLocked) reasons.push('Risk locked');
    if (!entryAllowed) reasons.push('Entries not allowed after 3:10 PM IST');
    return reasons;
  };

  const handleStart = () => {
    if (mode === 'LIVE') {
      setShowLiveWarning(true);
    } else {
      startAutopilot.mutate(mode);
    }
  };

  const handleLiveConfirm = () => {
    if (confirmText === 'ENABLE LIVE AUTOPILOT') {
      startAutopilot.mutate('LIVE');
      setShowLiveWarning(false);
      setConfirmText('');
    }
  };

  const handleStop = () => {
    stopAutopilot.mutate();
  };

  if (autopilotLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Autopilot
        </CardTitle>
        <CardDescription>
          Let AI manage your trades automatically based on market conditions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge
              variant={isRunning ? 'default' : 'secondary'}
              className={cn(
                isRunning && "bg-bull hover:bg-bull/90"
              )}
            >
              {isRunning ? (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  RUNNING ({currentMode})
                </>
              ) : (
                <>
                  <Square className="h-3 w-3 mr-1" />
                  STOPPED
                </>
              )}
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {formatIST(getCurrentIST(), 'HH:mm:ss')} IST
          </div>
        </div>

        {/* Market Status */}
        <div className="rounded-lg border p-3 bg-muted/50">
          <div className="flex items-center gap-2 text-sm mb-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Market Status</span>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Market Open:</span>
              <span className={marketStatus.isOpen ? "text-bull" : "text-bear"}>
                {marketStatus.isOpen ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Entry Allowed:</span>
              <span className={marketStatus.entryAllowed ? "text-bull" : "text-bear"}>
                {marketStatus.entryAllowed ? 'Yes' : 'No'}
              </span>
            </div>
            {marketStatus.nextStateTime && (
              <div className="text-muted-foreground mt-1">
                {marketStatus.nextStateTime}
              </div>
            )}
          </div>
        </div>

        {/* Prerequisites */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Prerequisites</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              {hasOpenAI ? (
                <div className="h-2 w-2 bg-bull rounded-full" />
              ) : (
                <div className="h-2 w-2 bg-bear rounded-full" />
              )}
              <span>OpenAI API configured</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {hasAnyBrokerConnected ? (
                <div className="h-2 w-2 bg-bull rounded-full" />
              ) : (
                <div className="h-2 w-2 bg-bear rounded-full" />
              )}
              <span>
                Broker connected ({[
                  hasZerodhaConnected && 'Zerodha',
                  hasAngelConnected && 'Angel One'
                ].filter(Boolean).join(', ') || 'None'})
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {!isRiskLocked ? (
                <div className="h-2 w-2 bg-bull rounded-full" />
              ) : (
                <div className="h-2 w-2 bg-bear rounded-full" />
              )}
              <span>Risk limits okay</span>
            </div>
          </div>
        </div>

        {/* Blocked Reasons */}
        {!canStart && !isRunning && (
          <div className="rounded-lg border border-bear/20 p-3 bg-bear/5">
            <div className="flex items-center gap-2 text-bear text-sm mb-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Cannot Start Autopilot</span>
            </div>
            <ul className="text-xs text-bear space-y-1">
              {getBlockedReasons().map((reason, index) => (
                <li key={index}>• {reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              disabled={!canStart || startAutopilot.isPending}
              className="flex-1"
            >
              {startAutopilot.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Play className="h-4 w-4 mr-2" />
              Start Autopilot ({mode})
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              disabled={stopAutopilot.isPending}
              variant="destructive"
              className="flex-1"
            >
              {stopAutopilot.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Square className="h-4 w-4 mr-2" />
              Stop Autopilot
            </Button>
          )}
        </div>

        {/* Live Mode Warning Dialog */}
        <AlertDialog open={showLiveWarning} onOpenChange={setShowLiveWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-bear" />
                Enable Live AI Autopilot?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p className="text-bear font-medium">⚠️ This will enable AI to trade with REAL MONEY automatically.</p>
                <p>AI will make entry/exit decisions based on market conditions and your risk settings.</p>
                <p>Current mode: <strong>LIVE TRADING</strong></p>
                <div className="space-y-2">
                  <p className="font-semibold">Type "ENABLE LIVE AUTOPILOT" to confirm:</p>
                  <Input 
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type confirmation text"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmText('')}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                disabled={confirmText !== 'ENABLE LIVE AUTOPILOT'}
                className="bg-bear hover:bg-bear/90"
                onClick={handleLiveConfirm}
              >
                Enable Live Autopilot
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}