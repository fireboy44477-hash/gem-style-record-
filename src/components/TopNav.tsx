import React from 'react';
import { CurrencyCode } from '../types/gem';
import { CURRENCY_RATES } from '../utils/currency';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Gem,
  Plus,
  Download,
  RotateCcw,
  TrendingUp,
  BarChart3,
  TableProperties,
  Sparkles,
  Smartphone,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';

interface TopNavProps {
  activeTab: 'table' | 'mobile_chart' | 'costs' | 'profit_roi' | 'market_trends' | 'decision';
  setActiveTab: (tab: 'table' | 'mobile_chart' | 'costs' | 'profit_roi' | 'market_trends' | 'decision') => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  onOpenNewGemModal: () => void;
  onOpenGoogleSheetsModal: () => void;
  onOpenReportModal: () => void;
  isGoogleConnected: boolean;
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
  onOpenGoogleSheetsModal,
  onOpenReportModal,
  isGoogleConnected,
  onResetData,
  onExportCSV,
  totalGemsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0b0f17]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single text element wordmark with domain character */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner shrink-0">
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
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'table'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Cost Matrix ({totalGemsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('mobile_chart')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'mobile_chart'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone Chart</span>
            </button>

            <button
              onClick={() => setActiveTab('costs')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
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
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'profit_roi'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>P&L / ROI</span>
            </button>

            <button
              onClick={() => setActiveTab('market_trends')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
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
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'decision'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>Decision Matrix</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions & Cloud Integrations */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Google Sheets Sync Button */}
            <button
              onClick={onOpenGoogleSheetsModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer whitespace-nowrap ${
                isGoogleConnected
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/60'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-emerald-500/40'
              }`}
              title="Google Sheets Cloud Sync"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Google Sheets</span>
              {isGoogleConnected && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {/* PWA In-App Install & Publish Button */}
            <PWAInstallButton />

            {/* Download Report Button */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer whitespace-nowrap"
              title="Download Printable PDF Audit Report"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Download Report</span>
            </button>

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
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors hidden xl:flex items-center justify-center border border-slate-800"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Reset to sample data */}
            <button
              onClick={onResetData}
              title="Reset Sample Gemstone Data"
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors hidden xl:flex items-center justify-center border border-slate-800"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Primary Action Button: Add Gemstone */}
            <button
              onClick={onOpenNewGemModal}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Gemstone</span>
              <span className="sm:hidden">Add</span>
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
            onClick={() => setActiveTab('mobile_chart')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'mobile_chart' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            📱 Phone Chart
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
