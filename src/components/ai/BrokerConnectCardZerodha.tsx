import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ExternalLink, Power, Check, Loader2 } from "lucide-react";
import { useZerodhaStatus, useZerodhaLogin, useZerodhaLogout } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import { z } from "zod";

const zerodhaFormSchema = z.object({
  api_key: z.string().min(1, "API key is required"),
  redirect_url: z.string().url("Must be a valid URL").optional(),
});

export function BrokerConnectCardZerodha() {
  const { data: status, isLoading } = useZerodhaStatus();
  const zerodhaLogin = useZerodhaLogin();
  const zerodhaLogout = useZerodhaLogout();

  const [form, setForm] = useState({
    api_key: '',
    redirect_url: 'https://your-domain.com/auth/zerodha/callback'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleConnect = async () => {
    try {
      const validated = zerodhaFormSchema.parse(form);
      setErrors({});
      
      // In a real implementation, you'd send the API key to backend first
      // For now, we'll just initiate the login flow
      zerodhaLogin.mutate();
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

  const handleDisconnect = () => {
    zerodhaLogout.mutate();
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

  const isConnected = status?.connected || false;

  return (
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
            variant={isConnected ? 'default' : 'secondary'}
            className={cn(
              isConnected && "bg-bull hover:bg-bull/90"
            )}
          >
            <Power className="h-3 w-3 mr-1" />
            {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="zerodha-api-key">API Key</Label>
              <Input
                id="zerodha-api-key"
                value={form.api_key}
                onChange={(e) => setForm(prev => ({ ...prev, api_key: e.target.value }))}
                placeholder="Enter your Kite Connect API key"
                className={errors.api_key ? "border-bear" : ""}
              />
              {errors.api_key && (
                <p className="text-xs text-bear">{errors.api_key}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zerodha-redirect">Redirect URL</Label>
              <Input
                id="zerodha-redirect"
                value={form.redirect_url}
                onChange={(e) => setForm(prev => ({ ...prev, redirect_url: e.target.value }))}
                placeholder="https://your-domain.com/callback"
                className={errors.redirect_url ? "border-bear" : ""}
              />
              {errors.redirect_url && (
                <p className="text-xs text-bear">{errors.redirect_url}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Login happens via redirect to Kite Connect
              </p>
            </div>
            
            <Button 
              onClick={handleConnect} 
              className="w-full"
              disabled={!form.api_key || zerodhaLogin.isPending}
            >
              {zerodhaLogin.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect Zerodha
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-bull">
              <Check className="h-4 w-4" />
              <span className="text-sm">
                Connected as User {status?.userId || 'Unknown'}
              </span>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={zerodhaLogout.isPending}
                >
                  {zerodhaLogout.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Disconnect
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disconnect Zerodha?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will log you out from Zerodha and disable automated trading through this broker.
                    You can reconnect anytime.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDisconnect}>
                    Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}