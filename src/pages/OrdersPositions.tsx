import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useTradeStore } from "@/store/useTradeStore";
import { Receipt, Target, X, Edit, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function OrdersPositions() {
  const { orders, positions, isRiskLocked } = useTradeStore();
  const [editingSL, setEditingSL] = useState<string | null>(null);
  const [editingTarget, setEditingTarget] = useState<string | null>(null);

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'FILLED': return 'bg-bull text-white';
      case 'PENDING': return 'bg-warning text-black';
      case 'CANCELLED': return 'bg-neutral text-white';
      case 'REJECTED': return 'bg-bear text-white';
      default: return '';
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
  const formatTime = (timestamp: string) => new Date(timestamp).toLocaleTimeString();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Orders & Positions
        </h2>

        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="positions" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Positions ({positions.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Orders ({orders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Open Positions
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{positions.length} Open</Badge>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      disabled={isRiskLocked || positions.length === 0}
                    >
                      Exit All
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {positions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No open positions</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full trading-table">
                      <thead>
                        <tr>
                          <th className="text-left p-3">Symbol</th>
                          <th className="text-center p-3">Side</th>
                          <th className="text-right p-3">Qty</th>
                          <th className="text-right p-3">Entry</th>
                          <th className="text-right p-3">LTP</th>
                          <th className="text-right p-3">P&L</th>
                          <th className="text-right p-3">SL</th>
                          <th className="text-right p-3">Target</th>
                          <th className="text-center p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map((position) => (
                          <tr key={position.id} className="hover:bg-accent/50 transition-fast">
                            <td className="p-3 font-medium">{position.symbol}</td>
                            <td className="p-3 text-center">
                              <Badge 
                                variant="outline"
                                className={cn(
                                  position.side === 'BUY' ? "text-bull border-bull/30" : "text-bear border-bear/30"
                                )}
                              >
                                {position.side}
                              </Badge>
                            </td>
                            <td className="p-3 text-right font-mono">{position.qty}</td>
                            <td className="p-3 text-right font-mono">{formatCurrency(position.entry_price)}</td>
                            <td className="p-3 text-right font-mono">{formatCurrency(position.current_price)}</td>
                            <td className="p-3 text-right">
                              <div className={cn(
                                "font-semibold",
                                position.pnl >= 0 ? "text-bull" : "text-bear"
                              )}>
                                {formatCurrency(position.pnl)}
                              </div>
                              <div className={cn(
                                "text-xs",
                                position.pnl_percent >= 0 ? "text-bull" : "text-bear"
                              )}>
                                ({position.pnl_percent >= 0 ? '+' : ''}{position.pnl_percent.toFixed(2)}%)
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              {editingSL === position.id ? (
                                <Input
                                  type="number"
                                  defaultValue={position.sl?.toString()}
                                  className="w-20 h-8 text-xs"
                                  onBlur={() => setEditingSL(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') setEditingSL(null);
                                  }}
                                />
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="font-mono text-sm">
                                    {position.sl ? formatCurrency(position.sl) : '-'}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setEditingSL(position.id)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {editingTarget === position.id ? (
                                <Input
                                  type="number"
                                  defaultValue={position.target?.toString()}
                                  className="w-20 h-8 text-xs"
                                  onBlur={() => setEditingTarget(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') setEditingTarget(null);
                                  }}
                                />
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="font-mono text-sm">
                                    {position.target ? formatCurrency(position.target) : '-'}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setEditingTarget(position.id)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  disabled={isRiskLocked}
                                >
                                  50%
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  disabled={isRiskLocked}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Order History
                  <Badge variant="outline">{orders.filter(o => o.status === 'PENDING').length} Pending</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No orders placed yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full trading-table">
                      <thead>
                        <tr>
                          <th className="text-left p-3">Time</th>
                          <th className="text-left p-3">Symbol</th>
                          <th className="text-center p-3">Side</th>
                          <th className="text-center p-3">Type</th>
                          <th className="text-right p-3">Qty</th>
                          <th className="text-right p-3">Price</th>
                          <th className="text-center p-3">Status</th>
                          <th className="text-center p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-accent/50 transition-fast">
                            <td className="p-3 font-mono text-sm">{formatTime(order.timestamp)}</td>
                            <td className="p-3 font-medium">{order.symbol}</td>
                            <td className="p-3 text-center">
                              <Badge 
                                variant="outline"
                                className={cn(
                                  order.side === 'BUY' ? "text-bull border-bull/30" : "text-bear border-bear/30"
                                )}
                              >
                                {order.side === 'BUY' ? (
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                )}
                                {order.side}
                              </Badge>
                            </td>
                            <td className="p-3 text-center">
                              <Badge variant="secondary" className="text-xs">
                                {order.type}
                              </Badge>
                            </td>
                            <td className="p-3 text-right font-mono">{order.qty}</td>
                            <td className="p-3 text-right font-mono">{formatCurrency(order.price)}</td>
                            <td className="p-3 text-center">
                              <Badge className={getOrderStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-center">
                              {order.status === 'PENDING' && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  disabled={isRiskLocked}
                                >
                                  Cancel
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}