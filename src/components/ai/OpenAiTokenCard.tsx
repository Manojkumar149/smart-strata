import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Brain, Check, X, Loader2, TestTube } from "lucide-react";
import { useOpenAiStatus, useSaveOpenAiToken, useTestOpenAiToken } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import { z } from "zod";

const tokenSchema = z.object({
  api_key: z.string().min(1, "API key is required").startsWith("sk-", "Must be a valid OpenAI API key"),
});

export function OpenAiTokenCard() {
  const { data: status, isLoading } = useOpenAiStatus();
  const saveToken = useSaveOpenAiToken();
  const testToken = useTestOpenAiToken();

  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      const validated = tokenSchema.parse({ api_key: apiKey });
      setError('');
      
      saveToken.mutate(validated.api_key);
      setApiKey(''); // Clear after saving
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
    }
  };

  const handleTest = () => {
    testToken.mutate();
  };

  const isTokenPresent = status?.present || false;

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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              OpenAI Integration
            </CardTitle>
            <CardDescription>
              Configure OpenAI API for AI-powered trading decisions
            </CardDescription>
          </div>
          <Badge
            variant={isTokenPresent ? 'default' : 'secondary'}
            className={cn(
              isTokenPresent && "bg-bull hover:bg-bull/90"
            )}
          >
            {isTokenPresent ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                CONFIGURED
              </>
            ) : (
              <>
                <X className="h-3 w-3 mr-1" />
                NOT CONFIGURED
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isTokenPresent && (
          <>
            <div className="space-y-2">
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <div className="relative">
                <Input
                  id="openai-key"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className={error ? "border-bear pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {error && (
                <p className="text-xs text-bear">{error}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Your API key is encrypted and stored securely. Never shared or logged.
              </p>
            </div>
            
            <Button 
              onClick={handleSave} 
              className="w-full"
              disabled={!apiKey || saveToken.isPending}
            >
              {saveToken.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save API Key
            </Button>
          </>
        )}

        {isTokenPresent && (
          <div className="space-y-3">
            <div className="rounded-lg border p-3 bg-muted/50">
              <div className="flex items-center gap-2 text-bull mb-2">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">OpenAI API Configured</span>
              </div>
              <p className="text-xs text-muted-foreground">
                AI trading decisions are now available. Your API key is securely stored.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleTest}
                disabled={testToken.isPending}
                className="flex-1"
              >
                {testToken.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <TestTube className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // In a real app, this would call an endpoint to remove the token
                  console.log('Remove token functionality would go here');
                }}
                className="flex-1"
              >
                Remove Key
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}