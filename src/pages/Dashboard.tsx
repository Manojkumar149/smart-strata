import { KpiCard } from "@/components/trading/KpiCard";
import { QuoteTicker } from "@/components/trading/QuoteTicker";
import { PnLChart } from "@/components/trading/PnLChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTradeStore } from "@/store/useTradeStore";
import { TrendingUp, DollarSign, Target, ShieldCheck, Activity } from "lucide-react";

export function Dashboard() {
  const { positions, orders, dayPnL, totalPnL, availableMargin, usedMargin } = useTradeStore();

  // Mock market data
  const marketData = [
    { symbol: 'NIFTY', ltp: 19850.75, change: 125.30, changePercent: 0.63, volume: 45230000 },
    { symbol: 'BANKNIFTY', ltp: 45680.25, change: -87.45, changePercent: -0.19, volume: 12450000 },
    { symbol: 'SENSEX', ltp: 65432.10, change: 234.56, changePercent: 0.36, volume: 23450000 },
  ];

  const winRate = positions.length > 0 
    ? (positions.filter(p => p.pnl > 0).length / positions.length) * 100 
    : 0;

  const activeOrders = orders.filter(o => o.status === 'PENDING').length;
  const openPositions = positions.length;

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Market Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {marketData.map((quote) => (
            <QuoteTicker
              key={quote.symbol}
              symbol={quote.symbol}
              ltp={quote.ltp}
              change={quote.change}
              changePercent={quote.changePercent}
              volume={quote.volume}
            />
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Portfolio Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Day P&L"
            value={`₹${dayPnL.toLocaleString()}`}
            change={dayPnL >= 0 ? 2.5 : -1.2}
            variant={dayPnL >= 0 ? 'bull' : 'bear'}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <KpiCard
            title="Total P&L"
            value={`₹${totalPnL.toLocaleString()}`}
            change={totalPnL >= 0 ? 15.8 : -5.2}
            variant={totalPnL >= 0 ? 'bull' : 'bear'}
            icon={<Target className="h-4 w-4" />}
          />
          <KpiCard
            title="Available Margin"
            value={`₹${availableMargin.toLocaleString()}`}
            subtitle={`Used: ₹${usedMargin.toLocaleString()}`}
            icon={<ShieldCheck className="h-4 w-4" />}
          />
          <KpiCard
            title="Win Rate"
            value={`${winRate.toFixed(1)}%`}
            subtitle={`${openPositions} open positions`}
            change={winRate}
            variant={winRate >= 50 ? 'bull' : 'bear'}
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* P&L Chart */}
      <PnLChart />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Recent Orders
              <Badge variant="outline">{activeOrders} Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No orders placed yet
              </div>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2 rounded border">
                    <div>
                      <div className="font-medium text-sm">{order.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.side} {order.qty} @ ₹{order.price}
                      </div>
                    </div>
                    <Badge 
                      variant={order.status === 'FILLED' ? 'default' : 'outline'}
                      className={
                        order.status === 'FILLED' ? 'bg-bull text-white' :
                        order.status === 'REJECTED' ? 'bg-bear text-white' : ''
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open Positions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Open Positions
              <Badge variant="outline">{openPositions} Open</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {positions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No open positions
              </div>
            ) : (
              <div className="space-y-2">
                {positions.map((position) => (
                  <div key={position.id} className="flex items-center justify-between p-2 rounded border">
                    <div>
                      <div className="font-medium text-sm">{position.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {position.side} {position.qty} @ ₹{position.entry_price}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${position.pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
                        ₹{position.pnl.toFixed(2)}
                      </div>
                      <div className={`text-xs ${position.pnl_percent >= 0 ? 'text-bull' : 'text-bear'}`}>
                        ({position.pnl_percent >= 0 ? '+' : ''}{position.pnl_percent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}