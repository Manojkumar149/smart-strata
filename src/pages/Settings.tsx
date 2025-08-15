import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Settings as SettingsIcon, Shield, DollarSign, Zap, Power, Check, AlertTriangle } from "lucide-react";
import { useTradeStore } from "@/store/useTradeStore";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function Settings() {
  const { mode, brokers, budgets, updateBrokers, updateBudgets } = useTradeStore();
  const { toast } = useToast();
  
  // Broker form states
  const [zerodhaForm, setZerodhaForm] = useState({
    api_key: '',
    redirect_url: 'https://your-domain.com/auth/zerodha/callback'
  });
  
  const [angelForm, setAngelForm] = useState({
    api_key: '',
    client_code: '',
    password: '',
    totp: ''
  });
  
  // Budget form states
  const [budgetForm, setBudgetForm] = useState({
    zerodha: budgets[mode.toLowerCase() as keyof typeof budgets].zerodha,
    angelone: budgets[mode.toLowerCase() as keyof typeof budgets].angelone
  });
  
  const [showAutopilotWarning, setShowAutopilotWarning] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleZerodhaConnect = async () => {
    try {
      // Mock API call to connect Zerodha
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateBrokers({ 
        zerodha: { status: 'CONNECTED', userId: 'ZU1234' } 
      });
      toast({
        title: "Zerodha Connected",
        description: "Successfully connected to Zerodha Kite",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Zerodha",
        variant: "destructive"
      });
    }
  };

  const handleAngelLogin = async () => {
    try {
      // Mock API call to login to Angel One
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateBrokers({ 
        angelone: { status: 'CONNECTED', clientCode: angelForm.client_code } 
      });
      toast({
        title: "Angel One Connected",
        description: "Successfully logged into Angel One SmartAPI",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Failed to login to Angel One",
        variant: "destructive"
      });
    }
  };

  const handleBudgetSave = () => {
    updateBudgets(mode, {
      zerodha: budgetForm.zerodha,
      angelone: budgetForm.angelone
    });
    toast({
      title: "Budgets Updated",
      description: `${mode} mode budgets saved successfully`,
    });
  };

  const totalBudget = budgetForm.zerodha + budgetForm.angelone;
  const zerodhaPercent = totalBudget > 0 ? (budgetForm.zerodha / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="brokers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="brokers">Brokers</TabsTrigger>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
          <TabsTrigger value="risk">Risk & Limits</TabsTrigger>
        </TabsList>

        {/* Brokers Tab */}
        <TabsContent value="brokers" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Zerodha Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">Z</span>
                      </div>
                      Zerodha Kite
                    </CardTitle>
                    <CardDescription>
                      Connect via Kite Connect API for automated trading
                    </CardDescription>
                  </div>
                  <Badge
                    variant={brokers.zerodha.status === 'CONNECTED' ? 'default' : 'secondary'}
                    className={cn(
                      brokers.zerodha.status === 'CONNECTED' && "bg-bull hover:bg-bull/90"
                    )}
                  >
                    <Power className="h-3 w-3 mr-1" />
                    {brokers.zerodha.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {brokers.zerodha.status === 'DISCONNECTED' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="zerodha-api-key">API Key</Label>
                      <Input
                        id="zerodha-api-key"
                        value={zerodhaForm.api_key}
                        onChange={(e) => setZerodhaForm(prev => ({ ...prev, api_key: e.target.value }))}
                        placeholder="Enter your Kite Connect API key"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zerodha-redirect">Redirect URL</Label>
                      <Input
                        id="zerodha-redirect"
                        value={zerodhaForm.redirect_url}
                        onChange={(e) => setZerodhaForm(prev => ({ ...prev, redirect_url: e.target.value }))}
                        placeholder="https://your-domain.com/callback"
                      />
                    </div>
                    <Button 
                      onClick={handleZerodhaConnect} 
                      className="w-full"
                      disabled={!zerodhaForm.api_key}
                    >
                      Connect Zerodha
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-bull">
                      <Check className="h-4 w-4" />
                      <span className="text-sm">Connected as User {brokers.zerodha.userId}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => updateBrokers({ zerodha: { status: 'DISCONNECTED' } })}
                    >
                      Disconnect
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Angel One Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A</span>
                      </div>
                      Angel One SmartAPI
                    </CardTitle>
                    <CardDescription>
                      Login with credentials and TOTP for trading access
                    </CardDescription>
                  </div>
                  <Badge
                    variant={brokers.angelone.status === 'CONNECTED' ? 'default' : 'secondary'}
                    className={cn(
                      brokers.angelone.status === 'CONNECTED' && "bg-bull hover:bg-bull/90"
                    )}
                  >
                    <Power className="h-3 w-3 mr-1" />
                    {brokers.angelone.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {brokers.angelone.status === 'DISCONNECTED' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="angel-api-key">API Key</Label>
                        <Input
                          id="angel-api-key"
                          value={angelForm.api_key}
                          onChange={(e) => setAngelForm(prev => ({ ...prev, api_key: e.target.value }))}
                          placeholder="SmartAPI key"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="angel-client-code">Client Code</Label>
                        <Input
                          id="angel-client-code"
                          value={angelForm.client_code}
                          onChange={(e) => setAngelForm(prev => ({ ...prev, client_code: e.target.value }))}
                          placeholder="Client ID"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="angel-password">Password</Label>
                      <Input
                        id="angel-password"
                        type="password"
                        value={angelForm.password}
                        onChange={(e) => setAngelForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Trading password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="angel-totp">TOTP Code</Label>
                      <Input
                        id="angel-totp"
                        value={angelForm.totp}
                        onChange={(e) => setAngelForm(prev => ({ ...prev, totp: e.target.value }))}
                        placeholder="6-digit TOTP"
                        maxLength={6}
                      />
                    </div>
                    <Button 
                      onClick={handleAngelLogin} 
                      className="w-full"
                      disabled={!angelForm.api_key || !angelForm.client_code || !angelForm.password || !angelForm.totp}
                    >
                      Login to Angel One
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-bull">
                      <Check className="h-4 w-4" />
                      <span className="text-sm">Connected as {brokers.angelone.clientCode}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => updateBrokers({ angelone: { status: 'DISCONNECTED' } })}
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Allocations Tab */}
        <TabsContent value="allocations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget Allocation - {mode} Mode
              </CardTitle>
              <CardDescription>
                Set trading budgets per broker for {mode.toLowerCase()} trading
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="zerodha-budget">Zerodha Budget (₹)</Label>
                  <Input
                    id="zerodha-budget"
                    type="number"
                    value={budgetForm.zerodha}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, zerodha: Number(e.target.value) }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="angelone-budget">Angel One Budget (₹)</Label>
                  <Input
                    id="angelone-budget"
                    type="number"
                    value={budgetForm.angelone}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, angelone: Number(e.target.value) }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {totalBudget > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Total Budget</span>
                    <span className="font-semibold">₹{totalBudget.toLocaleString()}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Zerodha ({zerodhaPercent.toFixed(1)}%)</span>
                      <span>Angel One ({(100 - zerodhaPercent).toFixed(1)}%)</span>
                    </div>
                    <Progress value={zerodhaPercent} />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={handleBudgetSave} className="flex-1">
                  Save Allocations
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setBudgetForm({ zerodha: 0, angelone: 0 })}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk & Limits Tab */}
        <TabsContent value="risk" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Risk Limits
                </CardTitle>
                <CardDescription>
                  Daily risk and position limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Max Daily Loss (₹)</Label>
                  <Input type="number" placeholder="5000" />
                </div>
                <div className="space-y-2">
                  <Label>Max Open Positions</Label>
                  <Input type="number" placeholder="10" />
                </div>
                <div className="space-y-2">
                  <Label>Max Risk Per Trade (%)</Label>
                  <Input type="number" placeholder="2" />
                </div>
                <Button className="w-full">Update Limits</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  AI Autopilot Settings
                </CardTitle>
                <CardDescription>
                  Configure AI trading behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>AI Confidence Threshold (%)</Label>
                  <Input type="number" placeholder="75" />
                </div>
                <div className="space-y-2">
                  <Label>Max AI Positions</Label>
                  <Input type="number" placeholder="5" />
                </div>
                <div className="space-y-2">
                  <Label>AI Risk Per Trade (%)</Label>
                  <Input type="number" placeholder="1" />
                </div>
                
                <AlertDialog open={showAutopilotWarning} onOpenChange={setShowAutopilotWarning}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Test Live Autopilot
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Enable Live AI Autopilot?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>⚠️ This will enable AI to trade with real money automatically.</p>
                        <p>AI will make entry/exit decisions based on market conditions and your risk settings.</p>
                        <p className="font-semibold">Type "ENABLE LIVE AUTOPILOT" to confirm:</p>
                        <Input 
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder="Type confirmation text"
                        />
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setConfirmText('')}>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        disabled={confirmText !== 'ENABLE LIVE AUTOPILOT'}
                        className="bg-bear hover:bg-bear/90"
                      >
                        Enable Live Autopilot
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}