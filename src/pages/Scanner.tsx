import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTradeStore } from "@/store/useTradeStore";
import { Search, Plus, Minus, TrendingUp, TrendingDown, Volume2, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScanResult {
  symbol: string;
  ltp: number;
  change: number;
  changePercent: number;
  volume: number;
  volumeSpike: number;
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  signals: string[];
  rsi: number;
  support: number;
  resistance: number;
}

const mockScanResults: ScanResult[] = [
  {
    symbol: 'RELIANCE',
    ltp: 2456.75,
    change: 23.45,
    changePercent: 0.96,
    volume: 12450000,
    volumeSpike: 1.8,
    trend: 'BULLISH',
    signals: ['Breakout', 'Volume Spike'],
    rsi: 68.5,
    support: 2420,
    resistance: 2480
  },
  {
    symbol: 'TCS',
    ltp: 3678.20,
    change: -45.30,
    changePercent: -1.22,
    volume: 8930000,
    volumeSpike: 2.1,
    trend: 'BEARISH',
    signals: ['Support Break', 'High Volume'],
    rsi: 32.8,
    support: 3650,
    resistance: 3720
  },
  {
    symbol: 'HDFC',
    ltp: 1598.45,
    change: 12.80,
    changePercent: 0.81,
    volume: 15670000,
    volumeSpike: 1.4,
    trend: 'BULLISH',
    signals: ['MA Crossover'],
    rsi: 58.2,
    support: 1580,
    resistance: 1620
  },
];

export function Scanner() {
  const { watchlist, addToWatchlist, removeFromWatchlist, isRiskLocked } = useTradeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [trendFilter, setTrendFilter] = useState<string>('ALL');
  const [volumeFilter, setVolumeFilter] = useState<string>('ALL');

  const filteredResults = mockScanResults.filter(result => {
    const matchesSearch = result.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrend = trendFilter === 'ALL' || result.trend === trendFilter;
    const matchesVolume = volumeFilter === 'ALL' || 
      (volumeFilter === 'HIGH' && result.volumeSpike > 1.5) ||
      (volumeFilter === 'NORMAL' && result.volumeSpike <= 1.5);
    
    return matchesSearch && matchesTrend && matchesVolume;
  });

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'BULLISH': return 'text-bull';
      case 'BEARISH': return 'text-bear';
      default: return 'text-neutral';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'BULLISH': return <TrendingUp className="h-3 w-3" />;
      case 'BEARISH': return <TrendingDown className="h-3 w-3" />;
      default: return <Minus className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5" />
          Market Scanner
        </h2>
        
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search Symbol</label>
                <Input
                  placeholder="Search stocks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Trend</label>
                <Select value={trendFilter} onValueChange={setTrendFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Trends</SelectItem>
                    <SelectItem value="BULLISH">Bullish</SelectItem>
                    <SelectItem value="BEARISH">Bearish</SelectItem>
                    <SelectItem value="SIDEWAYS">Sideways</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Volume</label>
                <Select value={volumeFilter} onValueChange={setVolumeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Volume</SelectItem>
                    <SelectItem value="HIGH">High Volume</SelectItem>
                    <SelectItem value="NORMAL">Normal Volume</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Scan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Scan Results
              <Badge variant="outline">{filteredResults.length} stocks</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full trading-table">
                <thead>
                  <tr>
                    <th className="text-left p-3">Symbol</th>
                    <th className="text-right p-3">LTP</th>
                    <th className="text-right p-3">Change</th>
                    <th className="text-center p-3">Trend</th>
                    <th className="text-center p-3">Vol Spike</th>
                    <th className="text-center p-3">RSI</th>
                    <th className="text-left p-3">Signals</th>
                    <th className="text-center p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => (
                    <tr key={result.symbol} className="hover:bg-accent/50 transition-fast">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{result.symbol}</div>
                          <div className="text-xs text-muted-foreground">
                            S: ₹{result.support} | R: ₹{result.resistance}
                          </div>
                        </div>
                      </td>
                      <td className="text-right p-3 font-mono">₹{result.ltp.toFixed(2)}</td>
                      <td className="text-right p-3">
                        <div className={cn(
                          "font-medium",
                          result.change >= 0 ? "text-bull" : "text-bear"
                        )}>
                          {result.change >= 0 ? '+' : ''}₹{result.change.toFixed(2)}
                        </div>
                        <div className={cn(
                          "text-xs",
                          result.changePercent >= 0 ? "text-bull" : "text-bear"
                        )}>
                          ({result.changePercent >= 0 ? '+' : ''}{result.changePercent.toFixed(2)}%)
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <div className={cn("flex items-center justify-center gap-1", getTrendColor(result.trend))}>
                          {getTrendIcon(result.trend)}
                          <span className="text-xs font-medium">{result.trend}</span>
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <Badge 
                          variant={result.volumeSpike > 1.5 ? "default" : "outline"}
                          className={cn(
                            result.volumeSpike > 1.5 && "bg-warning text-warning-foreground"
                          )}
                        >
                          <Volume2 className="h-3 w-3 mr-1" />
                          {result.volumeSpike.toFixed(1)}x
                        </Badge>
                      </td>
                      <td className="text-center p-3">
                        <Badge 
                          variant="outline"
                          className={cn(
                            result.rsi > 70 ? "text-bear border-bear/30" :
                            result.rsi < 30 ? "text-bull border-bull/30" : ""
                          )}
                        >
                          {result.rsi.toFixed(0)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {result.signals.map((signal, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {signal}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isRiskLocked}
                            className="bg-bull-bg border-bull/30 text-bull hover:bg-bull hover:text-white"
                          >
                            Buy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isRiskLocked}
                            className="bg-bear-bg border-bear/30 text-bear hover:bg-bear hover:text-white"
                          >
                            Sell
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (watchlist.includes(result.symbol)) {
                                removeFromWatchlist(result.symbol);
                              } else {
                                addToWatchlist(result.symbol);
                              }
                            }}
                          >
                            {watchlist.includes(result.symbol) ? (
                              <Minus className="h-3 w-3" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}