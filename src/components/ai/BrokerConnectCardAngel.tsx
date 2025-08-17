import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Power, Check, Loader2, RefreshCw, Clock } from "lucide-react";
import { useAngelStatus, useAngeloneLogin, useAngeloneLogout } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import { z } from "zod";

const angelFormSchema = z.object({
  api_key: z.string().min(1, "API key is required"),
  client_code: z.string().min(1, "Client code is required"),
  password: z.string().min(1, "Password is required"),
  totp: z.string().length(6, "TOTP must be 6 digits").optional(),
});

export function BrokerConnectCardAngel() {
  const { data: status, isLoading } = useAngelStatus();
  const angeloneLogin = useAngeloneLogin();
  const angeloneLogout = useAngeloneLogout();

  const [form, setForm] = useState({
    api_key: '',
    client_code: '',
    password: '',
    totp: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async () => {
    try {
      const validated = angelFormSchema.parse(form);
      setErrors({});
      
      angeloneLogin.mutate(validated);
      
      // Clear sensitive data after submission
      setForm(prev => ({ ...prev, password: '', totp: '' }));
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

  const handleLogout = () => {
    angeloneLogout.mutate();
  };

  const formatLastLogin = (timestamp?: string) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'short',
      timeStyle: 'short',
    });
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="angel-api-key">API Key</Label>
                <Input
                  id="angel-api-key"
                  value={form.api_key}
                  onChange={(e) => setForm(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="SmartAPI key"
                  className={errors.api_key ? "border-bear" : ""}
                />
                {errors.api_key && (
                  <p className="text-xs text-bear">{errors.api_key}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="angel-client-code">Client Code</Label>
                <Input
                  id="angel-client-code"
                  value={form.client_code}
                  onChange={(e) => setForm(prev => ({ ...prev, client_code: e.target.value }))}
                  placeholder="Client ID"
                  className={errors.client_code ? "border-bear" : ""}
                />
                {errors.client_code && (
                  <p className="text-xs text-bear">{errors.client_code}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="angel-password">Password</Label>
              <Input
                id="angel-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Trading password"
                className={errors.password ? "border-bear" : ""}
              />
              {errors.password && (
                <p className="text-xs text-bear">{errors.password}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="angel-totp">TOTP Code</Label>
              <Input
                id="angel-totp"
                value={form.totp}
                onChange={(e) => setForm(prev => ({ ...prev, totp: e.target.value.replace(/\D/g, '') }))}
                placeholder="6-digit TOTP"
                maxLength={6}
                className={errors.totp ? "border-bear" : ""}
              />
              {errors.totp && (
                <p className="text-xs text-bear">{errors.totp}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter TOTP from your authenticator app
              </p>
            </div>
            
            <Button 
              onClick={handleLogin} 
              className="w-full"
              disabled={!form.api_key || !form.client_code || !form.password || angeloneLogin.isPending}
            >
              {angeloneLogin.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Login to Angel One
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-bull">
                <Check className="h-4 w-4" />
                <span className="text-sm">
                  Connected as {status?.clientCode || 'Unknown'}
                </span>
              </div>
              
              {status?.lastLoginTs && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">
                    Last login: {formatLastLogin(status.lastLoginTs)}
                  </span>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Session valid until early morning (as per broker policy)
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Feed
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    disabled={angeloneLogout.isPending}
                  >
                    {angeloneLogout.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Logout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Logout from Angel One?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will end your Angel One session and disable automated trading through this broker.
                      You'll need to login again with fresh credentials.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>
                      Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}