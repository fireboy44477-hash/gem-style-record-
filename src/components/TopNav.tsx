import React from 'react';
import { CurrencyCode } from '../types/gem';
import { CURRENCY_RATES } from '../utils/currency';
import { Gem, Plus, Download, RotateCcw, TrendingUp, BarChart3, TableProperties, Sparkles } from 'lucide-react';

interface TopNavProps {
  activeTab: 'table' | 'costs' | 'profit_roi' | 'market_trends' | 'decision';
  setActiveTab: (tab: 'table' | 'costs' | 'profit_roi' | 'market_trends' | 'decision') => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  onOpenNewGemModal: () => void;
  onResetData: () => void;
  onExportCSV: () => void;
  totalGemsCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onOpenNewGemModal,
  onResetData,
  onExportCSV,
  totalGemsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0b0f17]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single text element wordmark with domain character */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <Gem className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display text-lg tracking-wider font-semibold text-slate-100 flex items-center gap-2">
                GEMMATRIX
              </span>
              <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                Inventory & Costing Intelligence
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (single-line, clean tabs) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'table'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Cost Matrix ({totalGemsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('costs')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'costs'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Cost Allocation</span>
            </button>

            <button
              onClick={() => setActiveTab('profit_roi')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'profit_roi'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>P&L / ROI Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('market_trends')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'market_trends'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Market Trends</span>
            </button>

            <button
              onClick={() => setActiveTab('decision')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'decision'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>Decision Matrix</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions & Currency Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
              <span className="text-xs text-slate-400 mr-1.5 font-mono">Cur:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent text-xs font-mono font-medium text-slate-200 focus:outline-none cursor-pointer"
                title="Select trading currency"
              >
                {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((code) => (
                  <option key={code} value={code} className="bg-slate-900 text-slate-200">
                    {code} ({CURRENCY_RATES[code].symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Export CSV */}
            <button
              onClick={onExportCSV}
              title="Export Inventory Ledger to CSV"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors hidden sm:flex items-center justify-center border border-slate-800"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Reset to sample data */}
            <button
              onClick={onResetData}
              title="Reset Sample Gemstone Data"
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors hidden sm:flex items-center justify-center border border-slate-800"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Primary Action Button: Add Gemstone */}
            <button
              onClick={onOpenNewGemModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Gemstone</span>
            </button>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-800/60 gap-1.5 no-scrollbar">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'table' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Cost Matrix
          </button>
          <button
            onClick={() => setActiveTab('costs')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'costs' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Cost Allocation
          </button>
          <button
            onClick={() => setActiveTab('profit_roi')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'profit_roi' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            P&L / ROI
          </button>
          <button
            onClick={() => setActiveTab('market_trends')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'market_trends' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Market Trends
          </button>
          <button
            onClick={() => setActiveTab('decision')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'decision' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Decision Matrix
          </button>
        </div>
      </div>
    </header>
  );
};
