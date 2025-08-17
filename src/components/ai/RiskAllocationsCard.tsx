import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Loader2, TrendingDown, TrendingUp, Shield } from "lucide-react";
import { useRiskConfig, useSaveRiskConfig } from "@/hooks/useApi";
import { useTradeStore } from "@/store/useTradeStore";
import { cn } from "@/lib/utils";
import { z } from "zod";

const allocationSchema = z.object({
  budget: z.number().min(0, "Budget must be positive"),
  zerodha: z.number().min(0, "Zerodha allocation must be positive"),
  angelone: z.number().min(0, "Angel One allocation must be positive"),
  max_daily_loss: z.number().min(0, "Max daily loss must be positive"),
  risk_per_trade_pct: z.number().min(0.1, "Min 0.1%").max(2.0, "Max 2.0%"),
  sl_pct: z.number().min(0.4, "Min 0.4%"),
  tgt_pct: z.number().min(0.3, "Min 0.3%"),
}).refine(data => data.zerodha + data.angelone <= data.budget, {
  message: "Total allocations cannot exceed budget",
  path: ["allocations"],
});

export function RiskAllocationsCard() {
  const { mode } = useTradeStore();
  const { data: riskConfig, isLoading } = useRiskConfig();
  const saveConfig = useSaveRiskConfig();

  const [form, setForm] = useState({
    budget: 0,
    zerodha: 0,
    angelone: 0,
    max_daily_loss: 0,
    risk_per_trade_pct: 1.0,
    sl_pct: 0.8,
    tgt_pct: 1.2,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form when config loads or mode changes
  useEffect(() => {
    if (riskConfig) {
      setForm({
        budget: riskConfig.budget,
        zerodha: riskConfig.allocations.zerodha,
        angelone: riskConfig.allocations.angelone,
        max_daily_loss: riskConfig.max_daily_loss,
        risk_per_trade_pct: riskConfig.risk_per_trade_pct,
        sl_pct: riskConfig.sl_pct,
        tgt_pct: riskConfig.tgt_pct,
      });
    }
  }, [riskConfig, mode]);

  const handleSave = async () => {
    try {
      const validated = allocationSchema.parse(form);
      setErrors({});
      
      if (!riskConfig) return;
      
      const updatedConfig = {
        ...riskConfig,
        mode,
        budget: validated.budget,
        allocations: {
          zerodha: validated.zerodha,
          angelone: validated.angelone,
        },
        max_daily_loss: validated.max_daily_loss,
        risk_per_trade_pct: validated.risk_per_trade_pct,
        sl_pct: validated.sl_pct,
        tgt_pct: validated.tgt_pct,
      };
      
      saveConfig.mutate(updatedConfig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const handleReset = () => {
    if (riskConfig) {
      setForm({
        budget: riskConfig.budget,
        zerodha: riskConfig.allocations.zerodha,
        angelone: riskConfig.allocations.angelone,
        max_daily_loss: riskConfig.max_daily_loss,
        risk_per_trade_pct: riskConfig.risk_per_trade_pct,
        sl_pct: riskConfig.sl_pct,
        tgt_pct: riskConfig.tgt_pct,
      });
    }
    setErrors({});
  };

  const totalAllocated = form.zerodha + form.angelone;
  const zerodhaPercent = form.budget > 0 ? (form.zerodha / form.budget) * 100 : 0;
  const angelPercent = form.budget > 0 ? (form.angelone / form.budget) * 100 : 0;
  const unallocated = form.budget - totalAllocated;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
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
          <DollarSign className="h-5 w-5" />
          Risk & Allocations - {mode} Mode
        </CardTitle>
        <CardDescription>
          Configure trading budgets and risk parameters for {mode.toLowerCase()} trading
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="allocations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="allocations">Budget & Allocations</TabsTrigger>
            <TabsTrigger value="risk">Risk Parameters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="allocations" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="total-budget">Total Budget (₹)</Label>
                <Input
                  id="total-budget"
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  placeholder="0"
                  min="0"
                  className={errors.budget ? "border-bear" : ""}
                />
                {errors.budget && (
                  <p className="text-xs text-bear">{errors.budget}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zerodha-allocation">Zerodha Allocation (₹)</Label>
                  <Input
                    id="zerodha-allocation"
                    type="number"
                    value={form.zerodha}
                    onChange={(e) => setForm(prev => ({ ...prev, zerodha: Number(e.target.value) }))}
                    placeholder="0"
                    min="0"
                    className={errors.zerodha ? "border-bear" : ""}
                  />
                  {errors.zerodha && (
                    <p className="text-xs text-bear">{errors.zerodha}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="angelone-allocation">Angel One Allocation (₹)</Label>
                  <Input
                    id="angelone-allocation"
                    type="number"
                    value={form.angelone}
                    onChange={(e) => setForm(prev => ({ ...prev, angelone: Number(e.target.value) }))}
                    placeholder="0"
                    min="0"
                    className={errors.angelone ? "border-bear" : ""}
                  />
                  {errors.angelone && (
                    <p className="text-xs text-bear">{errors.angelone}</p>
                  )}
                </div>
              </div>

              {errors.allocations && (
                <p className="text-xs text-bear">{errors.allocations}</p>
              )}

              {form.budget > 0 && (
                <div className="space-y-3 rounded-lg border p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Allocation Summary</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(totalAllocated)} / {formatCurrency(form.budget)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Zerodha ({zerodhaPercent.toFixed(1)}%)</span>
                      <span>Angel One ({angelPercent.toFixed(1)}%)</span>
                    </div>
                    <Progress value={(totalAllocated / form.budget) * 100} />
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    {unallocated >= 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-bull" />
                        <span className="text-bull">
                          Unallocated: {formatCurrency(unallocated)}
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 text-bear" />
                        <span className="text-bear">
                          Over-allocated: {formatCurrency(Math.abs(unallocated))}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="risk" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-daily-loss">Max Daily Loss (₹)</Label>
                <Input
                  id="max-daily-loss"
                  type="number"
                  value={form.max_daily_loss}
                  onChange={(e) => setForm(prev => ({ ...prev, max_daily_loss: Number(e.target.value) }))}
                  placeholder="5000"
                  min="0"
                  className={errors.max_daily_loss ? "border-bear" : ""}
                />
                {errors.max_daily_loss && (
                  <p className="text-xs text-bear">{errors.max_daily_loss}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk-per-trade">Risk Per Trade (%)</Label>
                <Input
                  id="risk-per-trade"
                  type="number"
                  step="0.1"
                  value={form.risk_per_trade_pct}
                  onChange={(e) => setForm(prev => ({ ...prev, risk_per_trade_pct: Number(e.target.value) }))}
                  placeholder="1.0"
                  min="0.1"
                  max="2.0"
                  className={errors.risk_per_trade_pct ? "border-bear" : ""}
                />
                {errors.risk_per_trade_pct && (
                  <p className="text-xs text-bear">{errors.risk_per_trade_pct}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sl-pct">Stop Loss (%)</Label>
                  <Input
                    id="sl-pct"
                    type="number"
                    step="0.1"
                    value={form.sl_pct}
                    onChange={(e) => setForm(prev => ({ ...prev, sl_pct: Number(e.target.value) }))}
                    placeholder="0.8"
                    min="0.4"
                    className={errors.sl_pct ? "border-bear" : ""}
                  />
                  {errors.sl_pct && (
                    <p className="text-xs text-bear">{errors.sl_pct}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tgt-pct">Target (%)</Label>
                  <Input
                    id="tgt-pct"
                    type="number"
                    step="0.1"
                    value={form.tgt_pct}
                    onChange={(e) => setForm(prev => ({ ...prev, tgt_pct: Number(e.target.value) }))}
                    placeholder="1.2"
                    min="0.3"
                    className={errors.tgt_pct ? "border-bear" : ""}
                  />
                  {errors.tgt_pct && (
                    <p className="text-xs text-bear">{errors.tgt_pct}</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border p-3 bg-muted/50">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Shield className="h-4 w-4 text-bull" />
                  <span className="font-medium">Risk Guidelines</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Risk per trade: 0.1% - 2.0% of capital</li>
                  <li>• Stop loss: Minimum 0.4% from entry</li>
                  <li>• Target: Minimum 0.3% from entry</li>
                  <li>• Daily loss limit prevents overtrading</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-6">
          <Button 
            onClick={handleSave} 
            className="flex-1"
            disabled={saveConfig.isPending}
          >
            {saveConfig.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Configuration
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={saveConfig.isPending}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}