// API client for TradeAI backend
// This would connect to your FastAPI backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_API_KEY || '',
    };
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const { method = 'GET', body, headers = {} } = options;

    const config: RequestInit = {
      method,
      headers: { ...this.defaultHeaders, ...headers },
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Market data endpoints
  async getQuote(instrumentId: number) {
    return this.request(`/market/quote?instrument_id=${instrumentId}`);
  }

  async getQuotes(symbols: string[]) {
    return this.request(`/market/quotes?symbols=${symbols.join(',')}`);
  }

  // AI decision endpoint
  async getAIDecision(payload: any) {
    return this.request('/ai/decision', {
      method: 'POST',
      body: payload,
    });
  }

  // Trading endpoints
  async enterTrade(payload: any) {
    return this.request('/trade/enter', {
      method: 'POST',
      body: payload,
    });
  }

  async exitPosition(positionId: string, percentage: number = 100) {
    return this.request('/trade/exit', {
      method: 'POST',
      body: { position_id: positionId, percentage },
    });
  }

  // Orders and positions
  async getOrders() {
    return this.request('/orders');
  }

  async getPositions() {
    return this.request('/positions');
  }

  async cancelOrder(orderId: string) {
    return this.request(`/orders/${orderId}/cancel`, {
      method: 'POST',
    });
  }

  // Portfolio and risk
  async getPortfolio() {
    return this.request('/portfolio');
  }

  async getRiskConfig() {
    return this.request('/risk/config');
  }

  async updateRiskConfig(config: any) {
    return this.request('/risk/config', {
      method: 'POST',
      body: config,
    });
  }

  // Journal and analytics
  async getJournal(filters: any = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/journal?${params}`);
  }

  async exportJournal(filters: any = {}) {
    return this.request('/journal/export', {
      method: 'POST',
      body: filters,
    });
  }

  // Backtest
  async runBacktest(config: any) {
    return this.request('/backtest/run', {
      method: 'POST',
      body: config,
    });
  }

  async getBacktestResults(runId: string) {
    return this.request(`/backtest/runs/${runId}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// React Query hooks would go here
export const useQuotes = (symbols: string[]) => {
  // Implementation with React Query
};

export const usePositions = () => {
  // Implementation with React Query
};

export const useOrders = () => {
  // Implementation with React Query
};

export const useAIDecision = () => {
  // Implementation with React Query
};