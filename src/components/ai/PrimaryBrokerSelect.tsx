import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Signal } from "lucide-react";
import { usePrimaryBroker, useSetPrimaryBroker, useZerodhaStatus, useAngelStatus } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

export function PrimaryBrokerSelect() {
  const { data: primaryBroker, isLoading: configLoading } = usePrimaryBroker();
  const setPrimaryBroker = useSetPrimaryBroker();
  const { data: zerodhaStatus } = useZerodhaStatus();
  const { data: angelStatus } = useAngelStatus();

  const handleBrokerChange = (broker: 'zerodha' | 'angelone') => {
    setPrimaryBroker.mutate(broker);
  };

  const getBrokerStatus = (broker: 'zerodha' | 'angelone') => {
    if (broker === 'zerodha') {
      return zerodhaStatus?.connected ? 'CONNECTED' : 'DISCONNECTED';
    }
    return angelStatus?.connected ? 'CONNECTED' : 'DISCONNECTED';
  };

  const isConnected = (broker: 'zerodha' | 'angelone') => {
    return getBrokerStatus(broker) === 'CONNECTED';
  };

  if (configLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Signal className="h-5 w-5" />
            Primary Data Feed
          </CardTitle>
          <CardDescription>Select which broker provides market quotes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Signal className="h-5 w-5" />
          Primary Data Feed
        </CardTitle>
        <CardDescription>
          Select which broker provides market quotes. This does not disconnect other brokers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="primary-broker">Primary Broker</Label>
          <Select
            value={primaryBroker}
            onValueChange={handleBrokerChange}
            disabled={setPrimaryBroker.isPending}
          >
            <SelectTrigger id="primary-broker">
              <SelectValue placeholder="Select primary broker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zerodha" disabled={!isConnected('zerodha')}>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-blue-600 rounded" />
                  Zerodha
                  <Badge
                    variant={isConnected('zerodha') ? 'default' : 'secondary'}
                    className={cn(
                      "text-xs",
                      isConnected('zerodha') && "bg-bull hover:bg-bull/90"
                    )}
                  >
                    {getBrokerStatus('zerodha')}
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="angelone" disabled={!isConnected('angelone')}>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-red-600 rounded" />
                  Angel One
                  <Badge
                    variant={isConnected('angelone') ? 'default' : 'secondary'}
                    className={cn(
                      "text-xs",
                      isConnected('angelone') && "bg-bull hover:bg-bull/90"
                    )}
                  >
                    {getBrokerStatus('angelone')}
                  </Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {primaryBroker && (
          <div className="rounded-lg border p-3 bg-muted/50">
            <div className="flex items-center gap-2 text-sm">
              <Signal className="h-4 w-4 text-bull" />
              <span>
                Market quotes powered by{' '}
                <span className="font-semibold">
                  {primaryBroker === 'zerodha' ? 'Zerodha' : 'Angel One'}
                </span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}