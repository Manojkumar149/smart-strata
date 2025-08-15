import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react";

interface QuoteTickerProps {
  symbol: string;
  ltp: number;
  change: number;
  changePercent: number;
  volume?: number;
  isStale?: boolean;
  className?: string;
}

export function QuoteTicker({ 
  symbol, 
  ltp, 
  change, 
  changePercent, 
  volume,
  isStale = false,
  className 
}: QuoteTickerProps) {
  const isPositive = change >= 0;
  const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;
  const formatVolume = (vol: number) => {
    if (vol >= 10000000) return `${(vol / 10000000).toFixed(1)}Cr`;
    if (vol >= 100000) return `${(vol / 100000).toFixed(1)}L`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
    return vol.toString();
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border transition-smooth",
      isPositive ? "border-bull/20 bg-bull-bg" : "border-bear/20 bg-bear-bg",
      isStale && "opacity-60",
      className
    )}>
      <div className="flex items-center gap-3">
        <div>
          <div className="font-semibold text-sm">{symbol}</div>
          {volume && (
            <div className="text-xs text-muted-foreground">
              Vol: {formatVolume(volume)}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {isStale ? (
            <WifiOff className="h-3 w-3 text-bear" />
          ) : (
            <Wifi className="h-3 w-3 text-bull" />
          )}
        </div>
      </div>

      <div className="text-right">
        <div className="font-bold text-lg">{formatCurrency(ltp)}</div>
        <div className="flex items-center gap-1 justify-end">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-bull" />
          ) : (
            <TrendingDown className="h-3 w-3 text-bear" />
          )}
          <span className={cn(
            "text-sm font-medium",
            isPositive ? "text-bull" : "text-bear"
          )}>
            {change >= 0 ? '+' : ''}{formatCurrency(change)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
}