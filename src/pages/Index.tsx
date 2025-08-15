import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/pages/Dashboard";
import { Scanner } from "@/pages/Scanner";
import { AIStrategy } from "@/pages/AIStrategy";
import { OrdersPositions } from "@/pages/OrdersPositions";
import { useTradeStore } from "@/store/useTradeStore";
import { cn } from "@/lib/utils";

// Mock data for demo
const mockPositions = [
  {
    id: '1',
    symbol: 'RELIANCE',
    side: 'BUY' as const,
    qty: 10,
    entry_price: 2430.50,
    current_price: 2456.75,
    pnl: 262.50,
    pnl_percent: 1.08,
    sl: 2405.00,
    target: 2480.00
  },
  {
    id: '2',
    symbol: 'TCS',
    side: 'BUY' as const,
    qty: 5,
    entry_price: 3720.00,
    current_price: 3678.20,
    pnl: -209.00,
    pnl_percent: -1.12,
    sl: 3650.00,
    target: 3800.00
  }
];

const mockOrders = [
  {
    id: '1',
    symbol: 'HDFC',
    side: 'BUY' as const,
    qty: 8,
    price: 1590.00,
    type: 'LIMIT' as const,
    status: 'PENDING' as const,
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    symbol: 'INFY',
    side: 'SELL' as const,
    qty: 15,
    price: 1456.75,
    type: 'MARKET' as const,
    status: 'FILLED' as const,
    timestamp: new Date(Date.now() - 300000).toISOString()
  }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { mode, updatePositions, updateOrders, updatePortfolio, setBrokerStatus } = useTradeStore();

  // Initialize mock data
  useEffect(() => {
    updatePositions(mockPositions);
    updateOrders(mockOrders);
    updatePortfolio({
      totalPnL: 53.50,
      dayPnL: 53.50,
      availableMargin: 85430,
      usedMargin: 14570
    });
    setBrokerStatus('CONNECTED');
  }, [updatePositions, updateOrders, updatePortfolio, setBrokerStatus]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'scanner':
        return <Scanner />;
      case 'strategy':
        return <AIStrategy />;
      case 'orders':
        return <OrdersPositions />;
      case 'journal':
        return (
          <div className="text-center py-12 text-muted-foreground">
            <h3 className="text-lg font-semibold mb-2">Journal Coming Soon</h3>
            <p>Trading journal and analytics will be available here.</p>
          </div>
        );
      case 'backtest':
        return (
          <div className="text-center py-12 text-muted-foreground">
            <h3 className="text-lg font-semibold mb-2">Backtest Coming Soon</h3>
            <p>Strategy backtesting module will be available here.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12 text-muted-foreground">
            <h3 className="text-lg font-semibold mb-2">Settings Coming Soon</h3>
            <p>Risk settings and configuration will be available here.</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col",
      mode === 'PAPER' && "paper-mode"
    )}>
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
