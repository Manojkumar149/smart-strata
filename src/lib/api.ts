// Enhanced API client for TradeAI backend with zod validation
import { z } from 'zod';
import { generateCorrelationId } from './time';

const API_BASE_URL = import.meta.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  schema?: z.ZodSchema;
}

// Zod schemas for API responses
export const BrokerStatusSchema = z.object({
  connected: z.boolean(),
  userId: z.string().optional(),
  clientCode: z.string().optional(),
  lastLoginTs: z.string().optional(),
});

export const RiskConfigSchema = z.object({
  primaryBroker: z.enum(['zerodha', 'angelone']),
  mode: z.enum(['PAPER', 'LIVE']),
  budget: z.number().min(0),
  allocations: z.object({
    zerodha: z.number().min(0),
    angelone: z.number().min(0),
  }),
  max_daily_loss: z.number().min(0),
  risk_per_trade_pct: z.number().min(0.1).max(2.0),
  sl_pct: z.number().min(0.4),
  tgt_pct: z.number().min(0.3),
});

export const RiskStatusSchema = z.object({
  risk_locked: z.boolean(),
  pnl_today: z.number(),
});

export const AutopilotStatusSchema = z.object({
  running: z.boolean(),
  mode: z.enum(['PAPER', 'LIVE']),
});

export const OpenAiStatusSchema = z.object({
  present: z.boolean(),
});

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.NEXT_PUBLIC_API_KEY || '',
    };
  }

  private async fetchJson<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const { method = 'GET', body, headers = {}, schema } = options;
    
    const correlationId = generateCorrelationId();

    const config: RequestInit = {
      method,
      headers: { 
        ...this.defaultHeaders, 
        ...headers,
        'x-correlation-id': correlationId,
        'x-timezone': 'Asia/Kolkata',
      },
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      // Validate response with zod schema if provided
      if (schema) {
        return schema.parse(data) as T;
      }
      
      return data as T;
    } catch (error) {
      console.error(`API Error for ${method} ${endpoint}:`, error);
      throw error;
    }
  }

  // Primary & Risk endpoints
  async getRiskConfig() {
    return this.fetchJson('/risk/config', { schema: RiskConfigSchema });
  }

  async saveRiskConfig(config: z.infer<typeof RiskConfigSchema>) {
    return this.fetchJson('/risk/config', {
      method: 'POST',
      body: config,
      schema: RiskConfigSchema,
    });
  }

  async getRiskStatus() {
    return this.fetchJson('/risk/config/status', { schema: RiskStatusSchema });
  }

  // OpenAI endpoints
  async saveOpenAiToken(apiKey: string) {
    return this.fetchJson('/secrets/openai/set', {
      method: 'POST',
      body: { api_key: apiKey },
    });
  }

  async testOpenAiToken() {
    return this.fetchJson('/secrets/openai/test', {
      method: 'POST',
    });
  }

  async getOpenAiStatus() {
    return this.fetchJson('/secrets/openai/status', { schema: OpenAiStatusSchema });
  }

  // Universe endpoints
  async getUniverse() {
    return this.fetchJson('/ai/universe');
  }

  async saveUniverse(symbols: string[]) {
    return this.fetchJson('/ai/universe', {
      method: 'POST',
      body: { symbols },
    });
  }

  // Autopilot endpoints
  async getAutopilotStatus() {
    return this.fetchJson('/ai/autopilot/status', { schema: AutopilotStatusSchema });
  }

  async startAutopilot(mode: 'PAPER' | 'LIVE') {
    return this.fetchJson('/ai/autopilot/start', {
      method: 'POST',
      body: { mode },
    });
  }

  async stopAutopilot() {
    return this.fetchJson('/ai/autopilot/stop', {
      method: 'POST',
    });
  }

  // Zerodha endpoints
  async zerodhaLogin() {
    return this.fetchJson('/auth/zerodha/login', {
      method: 'POST',
    });
  }

  async getZerodhaStatus() {
    return this.fetchJson('/auth/zerodha/status', { schema: BrokerStatusSchema });
  }

  async zerodhaLogout() {
    return this.fetchJson('/auth/zerodha/logout', {
      method: 'DELETE',
    });
  }

  // Angel One endpoints
  async angeloneLogin(credentials: {
    api_key: string;
    client_code: string;
    password: string;
    totp?: string;
  }) {
    return this.fetchJson('/auth/angelone/login', {
      method: 'POST',
      body: credentials,
    });
  }

  async angeloneFeedToken() {
    return this.fetchJson('/auth/angelone/feed-token', {
      method: 'POST',
    });
  }

  async getAngeloneStatus() {
    return this.fetchJson('/auth/angelone/status', { schema: BrokerStatusSchema });
  }

  async angeloneLogout() {
    return this.fetchJson('/auth/angelone/logout', {
      method: 'DELETE',
    });
  }

  // Market data endpoints
  async getQuote(instrumentId: number) {
    return this.fetchJson(`/market/quote?instrument_id=${instrumentId}`);
  }

  async getQuotes(symbols: string[]) {
    return this.fetchJson(`/market/quotes?symbols=${symbols.join(',')}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Type exports
export type BrokerStatus = z.infer<typeof BrokerStatusSchema>;
export type RiskConfig = z.infer<typeof RiskConfigSchema>;
export type RiskStatus = z.infer<typeof RiskStatusSchema>;
export type AutopilotStatus = z.infer<typeof AutopilotStatusSchema>;
export type OpenAiStatus = z.infer<typeof OpenAiStatusSchema>;