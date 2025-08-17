import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Power, Settings, TrendingUp, TrendingDown, Bot, Zap } from "lucide-react";
import { useTradeStore } from "@/store/useTradeStore";
import { cn } from "@/lib/utils";

export function Header() {
  const { 
    mode, 
    brokerStatus, 
    isRiskLocked, 
    dayPnL, 
    totalPnL, 
    autopilot,
    brokers,
    setMode, 
    setAutopilot 
  } = useTradeStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between relative">
      {/* Paper Trading Watermark */}
      {mode === 'PAPER' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-6xl font-black text-paper-overlay/10 rotate-[-25deg] select-none">
            PAPER
          </span>
        </div>
      )}

      <div className="flex items-center gap-6 z-10">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">TradeAI</h1>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mode:</span>
          <div className="flex rounded-lg border border-border p-1">
            <Button
              variant={mode === 'PAPER' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('PAPER')}
              className={cn(
                "text-xs px-3 py-1 h-auto",
                mode === 'PAPER' && "bg-paper-overlay text-black font-semibold"
              )}
            >
              PAPER
            </Button>
            <Button
              variant={mode === 'LIVE' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('LIVE')}
              className={cn(
                "text-xs px-3 py-1 h-auto",
                mode === 'LIVE' && "bg-bull text-white font-semibold"
              )}
            >
              LIVE
            </Button>
          </div>
        </div>

        {/* AI Autopilot Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">AI Autopilot:</span>
            <Switch
              checked={autopilot[mode.toLowerCase() as keyof typeof autopilot]}
              onCheckedChange={(checked) => setAutopilot(mode, checked)}
              className="data-[state=checked]:bg-bull"
            />
            {autopilot[mode.toLowerCase() as keyof typeof autopilot] && (
              <Badge variant="default" className="bg-bull hover:bg-bull/90 text-white">
                <Zap className="h-3 w-3 mr-1" />
                AI ON
              </Badge>
            )}
          </div>
        </div>

        {/* Primary Broker Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Primary:</span>
            <Badge
              variant="outline"
              className="text-xs border-bull text-bull"
            >
              Zerodha
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 z-10">
        {/* Risk Alert */}
        {isRiskLocked && (
          <div className="flex items-center gap-2 text-bear">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">RISK LOCKED</span>
          </div>
        )}

        {/* P&L Display */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Day P&L</div>
            <div className={cn(
              "text-sm font-semibold flex items-center gap-1",
              dayPnL >= 0 ? "text-bull" : "text-bear"
            )}>
              {dayPnL >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {formatCurrency(dayPnL)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Total P&L</div>
            <div className={cn(
              "text-sm font-semibold flex items-center gap-1",
              totalPnL >= 0 ? "text-bull" : "text-bear"
            )}>
              {totalPnL >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {formatCurrency(totalPnL)}
            </div>
          </div>
        </div>

        {/* Exit All Button */}
        <Button
          variant="destructive"
          size="sm"
          className="bg-bear hover:bg-bear/90 font-semibold"
          disabled={isRiskLocked}
        >
          EXIT ALL
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}