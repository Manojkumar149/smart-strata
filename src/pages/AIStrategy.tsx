import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useTradeStore } from "@/store/useTradeStore";
import { Brain, Zap, Target, Shield, TrendingUp, AlertCircle, CheckCircle, Bot, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIDecision {
  action: 'BUY' | 'SELL' | 'HOLD' | 'EXIT';
  symbol: string;
  side?: 'BUY' | 'SELL';
  entry?: number;
  sl?: number;
  target?: number;
  confidence: number;
  qtyHint?: number;
  reason: string;
  timestamp: string;
}

export function AIStrategy() {
  const { mode, isRiskLocked, autopilot } = useTradeStore();
  const isAutopilotActive = autopilot[mode.toLowerCase() as keyof typeof autopilot];
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [capital, setCapital] = useState('10000');
  const [riskPerTrade, setRiskPerTrade] = useState('2');
  const [slPercent, setSlPercent] = useState('1');
  const [targetPercent, setTargetPercent] = useState('1.5');
  const [useAI, setUseAI] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDecision, setAiDecision] = useState<AIDecision | null>(null);

  const symbols = ['RELIANCE', 'TCS', 'HDFC', 'INFY', 'WIPRO', 'ITC', 'BAJFINANCE', 'KOTAKBANK'];

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockDecision: AIDecision = {
      action: 'BUY',
      symbol: selectedSymbol,
      side: 'BUY',
      entry: 2456.75,
      sl: 2432.18,
      target: 2493.64,
      confidence: 76,
      qtyHint: Math.floor(parseFloat(capital) / 2456.75),
      reason: "Strong bullish momentum detected. RSI at 65 showing strength but not overbought. Volume spike of 1.8x indicates institutional interest. Support at ₹2420 holds firm, resistance at ₹2480 likely to break. Recommended entry near current levels with tight SL.",
      timestamp: new Date().toISOString()
    };
    
    setAiDecision(mockDecision);
    setIsAnalyzing(false);
  };

  const handleExecuteTrade = () => {
    if (!aiDecision) return;
    // This would call the trading API
    console.log('Executing trade:', aiDecision);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-bull';
    if (confidence >= 50) return 'text-warning';
    return 'text-bear';
  };

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 70) return 'default';
    if (confidence >= 50) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Trading Strategy
          {isAutopilotActive && (
            <Badge variant="default" className="bg-bull hover:bg-bull/90 ml-2">
              <Bot className="h-3 w-3 mr-1" />
              Autopilot Active
            </Badge>
          )}
        </h2>
      </div>

      {isAutopilotActive && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            AI Autopilot is managing entries and exits automatically in {mode} mode. Manual controls are limited to emergency overrides.
          </AlertDescription>
        </Alert>
      )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strategy Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Strategy Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="symbol">Symbol</Label>
                  <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {symbols.map(symbol => (
                        <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="capital">Capital (₹)</Label>
                  <Input
                    id="capital"
                    value={capital}
                    onChange={(e) => setCapital(e.target.value)}
                    placeholder="10000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="risk">Risk per Trade (%)</Label>
                  <Input
                    id="risk"
                    value={riskPerTrade}
                    onChange={(e) => setRiskPerTrade(e.target.value)}
                    placeholder="2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sl">Stop Loss (%)</Label>
                  <Input
                    id="sl"
                    value={slPercent}
                    onChange={(e) => setSlPercent(e.target.value)}
                    placeholder="1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="target">Target (%)</Label>
                  <Input
                    id="target"
                    value={targetPercent}
                    onChange={(e) => setTargetPercent(e.target.value)}
                    placeholder="1.5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Use AI Decision Engine</span>
                </div>
                <Switch checked={useAI} onCheckedChange={setUseAI} />
              </div>

              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-xs text-muted-foreground">
                  Mode: {mode} | Risk Lock: {isRiskLocked ? 'ON' : 'OFF'}
                </span>
              </div>

              <Button 
                onClick={handleAIAnalysis}
                disabled={!useAI || isAnalyzing || isRiskLocked || isAutopilotActive}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : isAutopilotActive ? (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Managed by Autopilot
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Get AI Recommendation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* AI Decision Output */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Decision
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!aiDecision ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configure parameters and click "Get AI Recommendation" to analyze the market</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Action Badge */}
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-lg px-4 py-2",
                        aiDecision.action === 'BUY' && "bg-bull-bg border-bull text-bull",
                        aiDecision.action === 'SELL' && "bg-bear-bg border-bear text-bear",
                        aiDecision.action === 'HOLD' && "bg-neutral/10 border-neutral text-neutral"
                      )}
                    >
                      {aiDecision.action} {aiDecision.symbol}
                    </Badge>
                    
                    <Badge 
                      variant={getConfidenceBadgeVariant(aiDecision.confidence)}
                      className="text-sm"
                    >
                      {aiDecision.confidence}% Confidence
                    </Badge>
                  </div>

                  {/* Trade Details */}
                  {(aiDecision.action === 'BUY' || aiDecision.action === 'SELL') && (
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
                      <div>
                        <div className="text-xs text-muted-foreground">Entry Price</div>
                        <div className="font-bold">₹{aiDecision.entry?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Quantity</div>
                        <div className="font-bold">{aiDecision.qtyHint} shares</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Stop Loss</div>
                        <div className="font-bold text-bear">₹{aiDecision.sl?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Target</div>
                        <div className="font-bold text-bull">₹{aiDecision.target?.toFixed(2)}</div>
                      </div>
                    </div>
                  )}

                  {/* AI Reasoning */}
                  <div>
                    <Label className="text-sm font-medium">AI Analysis</Label>
                    <Textarea
                      value={aiDecision.reason}
                      readOnly
                      className="mt-2 min-h-[100px] resize-none"
                    />
                  </div>

                  {/* Execute Button */}
                  {(aiDecision.action === 'BUY' || aiDecision.action === 'SELL') && (
                    <Button 
                      onClick={handleExecuteTrade}
                      disabled={isRiskLocked || isAutopilotActive}
                      className={cn(
                        "w-full",
                        aiDecision.action === 'BUY' && "bg-bull hover:bg-bull/90",
                        aiDecision.action === 'SELL' && "bg-bear hover:bg-bear/90"
                      )}
                      size="lg"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isAutopilotActive ? "Auto-Managed" : `Execute ${aiDecision.action} Order`}
                    </Button>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Analysis generated at {new Date(aiDecision.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Risk Warning */}
        {mode === 'LIVE' && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <div className="font-semibold">Live Trading Mode</div>
                  <div className="text-sm">
                    AI recommendations will execute real trades. Ensure you understand the risks before proceeding.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}