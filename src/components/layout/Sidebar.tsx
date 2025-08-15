import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Search, 
  Brain, 
  Receipt, 
  BookOpen, 
  TrendingUp, 
  Settings 
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'scanner', label: 'Scanner', icon: Search },
  { id: 'strategy', label: 'AI Strategy', icon: Brain },
  { id: 'orders', label: 'Orders & Positions', icon: Receipt },
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'backtest', label: 'Backtest', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-full flex flex-col">
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 text-sm",
                activeTab === item.id 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Version Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/60">
          TradeAI v2.0
          <br />
          {new Date().toLocaleDateString('en-IN', { 
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      </div>
    </aside>
  );
}