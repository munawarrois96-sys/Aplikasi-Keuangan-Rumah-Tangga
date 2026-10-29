import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  PiggyBank,
  CreditCard,
  Building,
  BellRing,
  HeartHandshake,
  Sparkles,
  FileSpreadsheet,
  Database
} from 'lucide-react';

export type TabKey =
  | 'dashboard'
  | 'cashflow'
  | 'budget'
  | 'savings'
  | 'debt'
  | 'networth'
  | 'bills'
  | 'collaboration'
  | 'sheets'
  | 'sql'
  | 'ai'
  | 'reports';

interface NavigationTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  alertCount?: number;
  hasGoogleConnected?: boolean;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  alertCount = 0,
  hasGoogleConnected = false,
}) => {
  const tabs: { key: TabKey; label: string; icon: React.FC<{ className?: string }>; badge?: number; isGreen?: boolean; isCloud?: boolean }[] = [
    { key: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { key: 'cashflow', label: 'Arus Kas', icon: ArrowLeftRight },
    { key: 'budget', label: 'Smart Budget', icon: PieChart },
    { key: 'savings', label: 'Tabungan & Target', icon: PiggyBank },
    { key: 'debt', label: 'Utang & Cicilan', icon: CreditCard },
    { key: 'networth', label: 'Neraca Kekayaan', icon: Building },
    { key: 'bills', label: 'Pengingat Tagihan', icon: BellRing, badge: alertCount },
    { key: 'collaboration', label: 'Kolaborasi Keluarga', icon: HeartHandshake },
    { key: 'sql', label: 'SQL Connect & Sync', icon: Database, isCloud: true },
    { key: 'sheets', label: 'Google Sheets', icon: FileSpreadsheet, isGreen: true },
    { key: 'ai', label: 'Asisten AI & Kebocoran', icon: Sparkles },
    { key: 'reports', label: 'Laporan & Analisis', icon: FileSpreadsheet },
  ];

  return (
    <div className="bg-white border-b border-sky-100 shadow-2xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 relative ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 shadow-xs border border-sky-200'
                    : 'text-slate-600 hover:text-sky-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? (tab.isGreen ? 'text-emerald-600' : 'text-sky-600') : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.isGreen && (
                  <span className={`w-2 h-2 rounded-full ${hasGoogleConnected ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-300'}`} title={hasGoogleConnected ? 'Google Sheets Terhubung' : 'Belum Terhubung'}></span>
                )}
                {tab.isCloud && (
                  <span className="w-2 h-2 rounded-full bg-sky-500 ring-2 ring-sky-200 animate-pulse" title="Database Cloud Terkoneksi & Tersinkron"></span>
                )}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                    {tab.badge}
                  </span>
                )}
                {tab.key === 'ai' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
