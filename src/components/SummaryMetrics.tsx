import React from 'react';
import { GemstoneItem, CurrencyCode } from '../types/gem';
import { calculatePortfolioSummary } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/currency';
import { Wallet, DollarSign, TrendingUp, Gem, ShieldCheck, Tag } from 'lucide-react';

interface SummaryMetricsProps {
  gems: GemstoneItem[];
  currency: CurrencyCode;
}

export const SummaryMetrics: React.FC<SummaryMetricsProps> = ({ gems, currency }) => {
  const summary = calculatePortfolioSummary(gems);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      {/* 1. Total Invested Capital (All Costs) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Total Invested Cost</span>
          <Wallet className="w-4 h-4 text-cyan-400 opacity-80" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono-numbers text-slate-100">
          {formatCurrency(summary.totalCost, currency)}
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
          <span>{summary.totalGemsCount} gemstone lots</span>
          <span className="font-mono-numbers text-slate-300">
            Avg: {formatCurrency(summary.avgCostPerCt, currency)}/ct
          </span>
        </div>
      </div>

      {/* 2. Realized Sold & Realized Profit */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Realized Closed Sales</span>
          <DollarSign className="w-4 h-4 text-emerald-400 opacity-80" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono-numbers text-emerald-400">
          {formatCurrency(summary.totalRealizedProfit, currency)}
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
          <span>{summary.soldCount} lots sold</span>
          <span className="font-mono-numbers text-emerald-400 font-semibold">
            {formatPercent(summary.realizedRoiPercent)} ROI
          </span>
        </div>
      </div>

      {/* 3. Projected / Total Profit & ROI */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Total Portfolio Gain</span>
          <TrendingUp className="w-4 h-4 text-teal-400 opacity-80" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono-numbers text-teal-300">
          {formatCurrency(summary.totalRealizedProfit + summary.totalProjectedProfit, currency)}
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
          <span>Combined Yield</span>
          <span className="font-mono-numbers text-teal-400 font-semibold">
            {formatPercent(summary.overallRoiPercent)} Avg ROI
          </span>
        </div>
      </div>

      {/* 4. Inventory Weight & Custody Status */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Active Custody & Carats</span>
          <Gem className="w-4 h-4 text-purple-400 opacity-80" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono-numbers text-slate-100">
          {summary.totalCutCarats.toFixed(2)} <span className="text-sm font-normal text-slate-400">cts</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
          <span className="text-cyan-400">{summary.inStockCount} In Stock</span>
          <span className="text-slate-600">·</span>
          <span className="text-amber-400">{summary.memoCount} On Memo</span>
          <span className="text-slate-600">·</span>
          <span className="text-purple-400">{summary.reservedCount} Reserved</span>
        </div>
      </div>

    </div>
  );
};
