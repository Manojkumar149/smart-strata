import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TradingMode = 'PAPER' | 'LIVE';
export type BrokerStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

interface Position {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  qty: number;
  entry_price: number;
  current_price: number;
  pnl: number;
  pnl_percent: number;
  sl?: number;
  target?: number;
}

interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  qty: number;
  price: number;
  type: 'MARKET' | 'LIMIT' | 'SL' | 'SLM';
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  timestamp: string;
}

interface Quote {
  symbol: string;
  ltp: number;
  bid: number;
  ask: number;
  change: number;
  change_percent: number;
  volume: number;
  age_ms: number;
}

interface TradeStore {
  // Mode & Status
  mode: TradingMode;
  brokerStatus: BrokerStatus;
  isRiskLocked: boolean;
  
  // Trading Data
  positions: Position[];
  orders: Order[];
  quotes: Map<string, Quote>;
  
  // Portfolio
  totalPnL: number;
  dayPnL: number;
  availableMargin: number;
  usedMargin: number;
  
  // Watchlist
  watchlist: string[];
  
  // Actions
  setMode: (mode: TradingMode) => void;
  setBrokerStatus: (status: BrokerStatus) => void;
  setRiskLocked: (locked: boolean) => void;
  updatePositions: (positions: Position[]) => void;
  updateOrders: (orders: Order[]) => void;
  updateQuote: (symbol: string, quote: Quote) => void;
  updatePortfolio: (data: { totalPnL: number; dayPnL: number; availableMargin: number; usedMargin: number }) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
}

export const useTradeStore = create<TradeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      mode: 'PAPER',
      brokerStatus: 'DISCONNECTED',
      isRiskLocked: false,
      positions: [],
      orders: [],
      quotes: new Map(),
      totalPnL: 0,
      dayPnL: 0,
      availableMargin: 100000,
      usedMargin: 0,
      watchlist: ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS', 'INFY'],
      
      // Actions
      setMode: (mode) => set({ mode }),
      setBrokerStatus: (status) => set({ brokerStatus: status }),
      setRiskLocked: (locked) => set({ isRiskLocked: locked }),
      updatePositions: (positions) => set({ positions }),
      updateOrders: (orders) => set({ orders }),
      updateQuote: (symbol, quote) => {
        const quotes = new Map(get().quotes);
        quotes.set(symbol, quote);
        set({ quotes });
      },
      updatePortfolio: (data) => set(data),
      addToWatchlist: (symbol) => {
        const watchlist = [...get().watchlist];
        if (!watchlist.includes(symbol)) {
          watchlist.push(symbol);
          set({ watchlist });
        }
      },
      removeFromWatchlist: (symbol) => {
        const watchlist = get().watchlist.filter(s => s !== symbol);
        set({ watchlist });
      },
    }),
    {
      name: 'trade-store',
      partialize: (state) => ({
        mode: state.mode,
        watchlist: state.watchlist,
      }),
    }
  )
);