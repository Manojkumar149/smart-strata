import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, X, Loader2 } from "lucide-react";
import { useUniverse, useSaveUniverse } from "@/hooks/useApi";

const defaultSymbols = ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'HDFC', 'ICICIBANK', 'KOTAKBANK', 'SBIN'];

export function UniverseCard() {
  const { data: universe, isLoading } = useUniverse();
  const saveUniverse = useSaveUniverse();

  const [symbols, setSymbols] = useState<string[]>([]);
  const [newSymbol, setNewSymbol] = useState('');

  useEffect(() => {
    if (universe?.symbols) {
      setSymbols(universe.symbols);
    } else {
      setSymbols(defaultSymbols);
    }
  }, [universe]);

  const handleAddSymbol = () => {
    const symbol = newSymbol.trim().toUpperCase();
    if (symbol && !symbols.includes(symbol)) {
      setSymbols(prev => [...prev, symbol]);
      setNewSymbol('');
    }
  };

  const handleRemoveSymbol = (symbolToRemove: string) => {
    setSymbols(prev => prev.filter(s => s !== symbolToRemove));
  };

  const handleSave = () => {
    saveUniverse.mutate(symbols);
  };

  const handleReset = () => {
    setSymbols(defaultSymbols);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSymbol();
    }
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
          <Globe className="h-5 w-5" />
          Trading Universe
        </CardTitle>
        <CardDescription>
          Define the symbols that AI will monitor and trade. Keep it focused for better performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="add-symbol">Add Symbol</Label>
          <div className="flex gap-2">
            <Input
              id="add-symbol"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="e.g., AAPL, GOOGL"
              className="flex-1"
            />
            <Button 
              onClick={handleAddSymbol}
              disabled={!newSymbol.trim() || symbols.includes(newSymbol.trim().toUpperCase())}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Current Universe ({symbols.length} symbols)</Label>
          <div className="max-h-48 overflow-y-auto border rounded-lg p-3">
            <div className="flex flex-wrap gap-2">
              {symbols.map((symbol) => (
                <Badge
                  key={symbol}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {symbol}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-bear hover:text-white"
                    onClick={() => handleRemoveSymbol(symbol)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {symbols.length === 0 && (
                <p className="text-sm text-muted-foreground">No symbols added yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-3 bg-muted/50">
          <div className="text-sm font-medium mb-2">Guidelines</div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use standard ticker symbols (e.g., RELIANCE, NIFTY)</li>
            <li>• 10-20 symbols recommended for optimal performance</li>
            <li>• Include liquid instruments for better execution</li>
            <li>• AI will monitor all symbols for opportunities</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleSave} 
            className="flex-1"
            disabled={saveUniverse.isPending || symbols.length === 0}
          >
            {saveUniverse.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Universe
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={saveUniverse.isPending}
          >
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}