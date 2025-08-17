import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Activity, Brain, Receipt, TrendingUp, TrendingDown, Clock, Bot } from "lucide-react";
import { useActivityStream, useOrdersStream } from "@/hooks/useApi";
import { formatIST, getCurrentIST } from "@/lib/time";
import { cn } from "@/lib/utils";

// Mock data for demonstration
const mockAiDecisions = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    symbol: 'RELIANCE',
    action: 'BUY',
    confidence: 87,
    entry: 2850.50,
    sl: 2825.75,
    target: 2885.25,
    reason: 'Bullish breakout above resistance with high volume',
    status: 'EXECUTED'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    symbol: 'BANKNIFTY',
    action: 'SELL',
    confidence: 73,
    entry: 47520.25,
    sl: 47580.50,
    target: 47420.75,
    reason: 'Bearish divergence on 15min chart',
    status: 'REJECTED'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    symbol: 'TCS',
    action: 'HOLD',
    confidence: 45,
    reason: 'Low confidence - waiting for clearer signal',
    status: 'HOLD'
  }
];

const mockOrders = [
  {
    id: 'ORD001',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    symbol: 'RELIANCE',
    side: 'BUY',
    qty: 10,
    price: 2850.50,
    type: 'MARKET',
    status: 'FILLED',
    broker: 'zerodha',
    aiGenerated: true
  },
  {
    id: 'ORD002',
    timestamp: new Date(Date.now() - 480000).toISOString(),
    symbol: 'INFY',
    side: 'SELL',
    qty: 25,
    price: 1720.25,
    type: 'LIMIT',
    status: 'CANCELLED',
    broker: 'angelone',
    aiGenerated: false
  }
];

const mockActivityStream = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    type: 'FILL',
    message: 'RELIANCE BUY 10 @ ₹2850.50 filled',
    severity: 'success'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 360000).toISOString(),
    type: 'SIGNAL',
    message: 'AI generated BUY signal for RELIANCE (87% confidence)',
    severity: 'info'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 540000).toISOString(),
    type: 'RISK',
    message: 'Daily loss limit warning: 65% used',
    severity: 'warning'
  }
];

export function AiActivityPanel() {
  const { data: activityStream } = useActivityStream();
  const { data: ordersStream } = useOrdersStream();

  const formatTime = (timestamp: string) => {
    return formatIST(new Date(timestamp), 'HH:mm:ss');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY':
        return <TrendingUp className="h-3 w-3 text-bull" />;
      case 'SELL':
        return <TrendingDown className="h-3 w-3 text-bear" />;
      default:
        return <Bot className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      EXECUTED: 'default',
      REJECTED: 'destructive',
      HOLD: 'secondary',
      FILLED: 'default',
      CANCELLED: 'destructive',
      PENDING: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'} className="text-xs">
        {status}
      </Badge>
    );
  };

  const getBrokerBadge = (broker: string) => {
    const colors = {
      zerodha: 'bg-blue-600',
      angelone: 'bg-red-600'
    } as const;

    return (
      <div className={cn("h-2 w-2 rounded-full", colors[broker as keyof typeof colors] || 'bg-gray-400')} />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          AI Activity Monitor
        </CardTitle>
        <CardDescription>
          Real-time feed of AI decisions, orders, and system events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stream" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stream">Live Stream</TabsTrigger>
            <TabsTrigger value="decisions">AI Decisions</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stream" className="space-y-2">
            <div className="max-h-80 overflow-y-auto space-y-2">
              {mockActivityStream.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={cn(
                    "h-2 w-2 rounded-full mt-2",
                    item.severity === 'success' && "bg-bull",
                    item.severity === 'warning' && "bg-amber-500",
                    item.severity === 'error' && "bg-bear",
                    item.severity === 'info' && "bg-blue-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{item.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTime(item.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="decisions" className="space-y-2">
            <div className="max-h-80 overflow-y-auto space-y-2">
              {mockAiDecisions.map((decision) => (
                <div key={decision.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getActionIcon(decision.action)}
                      <span className="font-medium">{decision.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {decision.action}
                      </Badge>
                      {decision.confidence && (
                        <Badge variant="secondary" className="text-xs">
                          {decision.confidence}% confidence
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(decision.status)}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(decision.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  {decision.entry && (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>Entry: {formatCurrency(decision.entry)}</div>
                      {decision.sl && <div>SL: {formatCurrency(decision.sl)}</div>}
                      {decision.target && <div>Target: {formatCurrency(decision.target)}</div>}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    {decision.reason}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="space-y-2">
            <div className="max-h-80 overflow-y-auto space-y-2">
              {mockOrders.map((order) => (
                <div key={order.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getBrokerBadge(order.broker)}
                      <span className="font-medium">{order.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {order.side} {order.qty}
                      </Badge>
                      {order.aiGenerated && (
                        <Badge variant="secondary" className="text-xs">
                          <Bot className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.status)}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(order.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>Price: {formatCurrency(order.price)}</div>
                    <div>Type: {order.type}</div>
                    <div>Broker: {order.broker}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last updated: {formatIST(getCurrentIST(), 'HH:mm:ss')} IST</span>
            <div className="ml-auto flex items-center gap-1">
              <div className="h-2 w-2 bg-bull rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}