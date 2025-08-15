import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'percentage' | 'absolute';
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'bull' | 'bear' | 'neutral';
  className?: string;
}

export function KpiCard({ 
  title, 
  value, 
  change, 
  changeType = 'percentage',
  subtitle, 
  icon, 
  variant = 'default',
  className 
}: KpiCardProps) {
  const formatChange = (change: number) => {
    const prefix = change > 0 ? '+' : '';
    const suffix = changeType === 'percentage' ? '%' : '';
    return `${prefix}${change.toFixed(2)}${suffix}`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-bull';
    if (change < 0) return 'text-bear';
    return 'text-neutral';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  return (
    <Card className={cn(
      "transition-smooth hover:shadow-trading-md",
      variant === 'bull' && "border-bull/20 bg-bull-bg",
      variant === 'bear' && "border-bear/20 bg-bear-bg",
      className
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          {title}
          {icon}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          <div className={cn(
            "text-2xl font-bold",
            variant === 'bull' && "text-bull",
            variant === 'bear' && "text-bear"
          )}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          
          {(change !== undefined || subtitle) && (
            <div className="flex items-center justify-between">
              {subtitle && (
                <span className="text-xs text-muted-foreground">{subtitle}</span>
              )}
              {change !== undefined && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs border-0 bg-transparent px-0 gap-1",
                    getChangeColor(change)
                  )}
                >
                  {getChangeIcon(change)}
                  {formatChange(change)}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}