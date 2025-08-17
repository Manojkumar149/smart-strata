// TanStack Query hooks for API integration
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type RiskConfig, type BrokerStatus, type RiskStatus, type AutopilotStatus, type OpenAiStatus } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Primary & Status hooks
export const usePrimaryBroker = () => {
  return useQuery({
    queryKey: ['risk-config'],
    queryFn: () => apiClient.getRiskConfig(),
    select: (data: RiskConfig) => data.primaryBroker,
  });
};

export const useSetPrimaryBroker = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (broker: 'zerodha' | 'angelone') => {
      // Get current config and update only primary broker
      const currentConfig = queryClient.getQueryData<RiskConfig>(['risk-config']);
      if (!currentConfig) throw new Error('Risk config not found');
      
      return apiClient.saveRiskConfig({
        ...currentConfig,
        primaryBroker: broker,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-config'] });
      toast({
        title: 'Primary broker updated',
        description: 'Quote feed will now use the selected broker',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update primary broker',
        variant: 'destructive',
      });
    },
  });
};

export const useZerodhaStatus = () => {
  return useQuery({
    queryKey: ['zerodha-status'],
    queryFn: () => apiClient.getZerodhaStatus(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useAngelStatus = () => {
  return useQuery({
    queryKey: ['angelone-status'],
    queryFn: () => apiClient.getAngeloneStatus(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// OpenAI hooks
export const useSaveOpenAiToken = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (apiKey: string) => apiClient.saveOpenAiToken(apiKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openai-status'] });
      toast({
        title: 'OpenAI token saved',
        description: 'AI features are now available',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save OpenAI token',
        variant: 'destructive',
      });
    },
  });
};

export const useTestOpenAiToken = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => apiClient.testOpenAiToken(),
    onSuccess: () => {
      toast({
        title: 'OpenAI test successful',
        description: 'Token is valid and working',
      });
    },
    onError: () => {
      toast({
        title: 'OpenAI test failed',
        description: 'Token is invalid or API is unavailable',
        variant: 'destructive',
      });
    },
  });
};

export const useOpenAiStatus = () => {
  return useQuery({
    queryKey: ['openai-status'],
    queryFn: () => apiClient.getOpenAiStatus(),
  });
};

// Risk & Allocations hooks
export const useRiskConfig = () => {
  return useQuery({
    queryKey: ['risk-config'],
    queryFn: () => apiClient.getRiskConfig(),
  });
};

export const useSaveRiskConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (config: RiskConfig) => apiClient.saveRiskConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-config'] });
      queryClient.invalidateQueries({ queryKey: ['risk-status'] });
      toast({
        title: 'Risk configuration saved',
        description: 'Settings have been updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save risk configuration',
        variant: 'destructive',
      });
    },
  });
};

export const useRiskStatus = () => {
  return useQuery({
    queryKey: ['risk-status'],
    queryFn: () => apiClient.getRiskStatus(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};

// Universe hooks
export const useUniverse = () => {
  return useQuery({
    queryKey: ['universe'],
    queryFn: () => apiClient.getUniverse(),
  });
};

export const useSaveUniverse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (symbols: string[]) => apiClient.saveUniverse(symbols),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universe'] });
      toast({
        title: 'Universe updated',
        description: 'Symbol list has been saved',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save universe',
        variant: 'destructive',
      });
    },
  });
};

// Autopilot hooks
export const useAutopilotStatus = () => {
  return useQuery({
    queryKey: ['autopilot-status'],
    queryFn: () => apiClient.getAutopilotStatus(),
    refetchInterval: 5000, // Refresh every 5 seconds when autopilot is running
  });
};

export const useAutopilotStart = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (mode: 'PAPER' | 'LIVE') => apiClient.startAutopilot(mode),
    onSuccess: (_, mode) => {
      queryClient.invalidateQueries({ queryKey: ['autopilot-status'] });
      toast({
        title: `${mode} Autopilot started`,
        description: 'AI is now managing your trades',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to start autopilot',
        variant: 'destructive',
      });
    },
  });
};

export const useAutopilotStop = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => apiClient.stopAutopilot(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopilot-status'] });
      toast({
        title: 'Autopilot stopped',
        description: 'You are now in manual control',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to stop autopilot',
        variant: 'destructive',
      });
    },
  });
};

// Broker Login hooks
export const useZerodhaLogin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => apiClient.zerodhaLogin(),
    onSuccess: (data: any) => {
      if (data.login_url) {
        window.open(data.login_url, '_blank');
        toast({
          title: 'Zerodha login initiated',
          description: 'Complete the login in the popup window',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to initiate Zerodha login',
        variant: 'destructive',
      });
    },
  });
};

export const useZerodhaLogout = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => apiClient.zerodhaLogout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zerodha-status'] });
      toast({
        title: 'Zerodha disconnected',
        description: 'Successfully logged out from Zerodha',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to logout from Zerodha',
        variant: 'destructive',
      });
    },
  });
};

export const useAngeloneLogin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (credentials: {
      api_key: string;
      client_code: string;
      password: string;
      totp?: string;
    }) => apiClient.angeloneLogin(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['angelone-status'] });
      toast({
        title: 'Angel One connected',
        description: 'Successfully logged into Angel One',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to login to Angel One',
        variant: 'destructive',
      });
    },
  });
};

export const useAngeloneLogout = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => apiClient.angeloneLogout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['angelone-status'] });
      toast({
        title: 'Angel One disconnected',
        description: 'Successfully logged out from Angel One',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to logout from Angel One',
        variant: 'destructive',
      });
    },
  });
};

// Activity Streams hooks (placeholder for WebSocket integration)
export const useActivityStream = () => {
  return useQuery({
    queryKey: ['activity-stream'],
    queryFn: () => Promise.resolve([]), // Placeholder
    enabled: false, // Disable until WebSocket is implemented
  });
};

export const useOrdersStream = () => {
  return useQuery({
    queryKey: ['orders-stream'],
    queryFn: () => Promise.resolve([]), // Placeholder
    enabled: false, // Disable until WebSocket is implemented
  });
};