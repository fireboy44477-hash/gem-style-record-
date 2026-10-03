import React, { useState } from 'react';
import { GemstoneItem, CurrencyCode } from '../types/gem';
import { calculateGemMetrics } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/currency';
import { TrendingUp, Award, Clock, DollarSign, ArrowUpRight, BarChart } from 'lucide-react';

interface ProfitRoiChartProps {
  gems: GemstoneItem[];
  currency: CurrencyCode;
  onSelectGem: (gem: GemstoneItem) => void;
}

export const ProfitRoiChart: React.FC<ProfitRoiChartProps> = ({ gems, currency, onSelectGem }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'sold' | 'in_stock'>('all');

  const filteredGems = gems.filter((g) => {
    if (filterMode === 'sold') return g.status === 'sold';
    if (filterMode === 'in_stock') return g.status !== 'sold';
    return true;
  });

  // Calculate metrics for all items
  const gemMetricsList = filteredGems.map((gem) => ({
    gem,
    metrics: calculateGemMetrics(gem),
  }));

  // Sort by Profit descending
  const sortedByProfit = [...gemMetricsList].sort((a, b) => b.metrics.profitOrLoss - a.metrics.profitOrLoss);

  // Highest ROI gem
  const bestRoiItem = [...gemMetricsList].sort((a, b) => b.metrics.roiPercent - a.metrics.roiPercent)[0];

  // Most profitable gem in absolute dollar value
  const topProfitItem = sortedByProfit[0];

  // Sold gems stats
  const soldList = gems.filter((g) => g.status === 'sold');
  const avgSoldDays = soldList.length > 0
    ? soldList.reduce((acc, g) => acc + calculateGemMetrics(g).daysHeld, 0) / soldList.length
    : 0;

  const maxAbsProfit = Math.max(
    ...gemMetricsList.map((item) => Math.abs(item.metrics.profitOrLoss)),
    1000
  );

  return (
    <div className="space-y-6">
      
      {/* Top Highlights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Top ROI Champion */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium">Top ROI Performer</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          {bestRoiItem ? (
            <div>
              <div className="text-xl font-bold font-mono-numbers text-cyan-300">
                {formatPercent(bestRoiItem.metrics.roiPercent)}
              </div>
              <div className="text-xs text-slate-300 mt-1 font-medium truncate">
                {bestRoiItem.gem.variety} ({bestRoiItem.gem.lotNumber})
              </div>
              <div className="text-[11px] text-slate-400 font-mono-numbers mt-0.5">
                Profit: {formatCurrency(bestRoiItem.metrics.profitOrLoss, currency)}
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-500">No data</span>
          )}
        </div>

        {/* Highest Absolute Profit */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium">Highest Net Profit Lot</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          {topProfitItem ? (
            <div>
              <div className="text-xl font-bold font-mono-numbers text-emerald-400">
                {formatCurrency(topProfitItem.metrics.profitOrLoss, currency)}
              </div>
              <div className="text-xs text-slate-300 mt-1 font-medium truncate">
                {topProfitItem.gem.variety} ({topProfitItem.gem.lotNumber})
              </div>
              <div className="text-[11px] text-slate-400 font-mono-numbers mt-0.5">
                Yield: {formatPercent(topProfitItem.metrics.roiPercent)} ROI
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-500">No data</span>
          )}
        </div>

        {/* Average Inventory Turn Days */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium">Avg Sales Velocity</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono-numbers text-purple-300">
              {Math.round(avgSoldDays)} <span className="text-sm font-normal text-slate-400">days</span>
            </div>
            <div className="text-xs text-slate-300 mt-1">
              From pit rough to customer settlement
            </div>
            <div className="text-[11px] text-slate-400 font-mono-numbers mt-0.5">
              {soldList.length} completed transactions
            </div>
          </div>
        </div>

      </div>

      {/* Main Comparative Visual Chart: Profit / Loss per Gemstone */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-emerald-400" />
              Profit & Loss Comparison by Gemstone
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Net dollar gain or loss compared against total capital cost invested per stone.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterMode === 'all'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Gems ({gems.length})
            </button>
            <button
              onClick={() => setFilterMode('sold')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterMode === 'sold'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sold Only ({soldList.length})
            </button>
            <button
              onClick={() => setFilterMode('in_stock')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterMode === 'in_stock'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unsold / Projected ({gems.length - soldList.length})
            </button>
          </div>
        </div>

        {/* Visual Horizontal Profit / Loss Chart Bars */}
        <div className="mt-5 space-y-3">
          {sortedByProfit.map(({ gem, metrics }) => {
            const isProfit = metrics.profitOrLoss >= 0;
            const barPct = (Math.abs(metrics.profitOrLoss) / maxAbsProfit) * 100;

            return (
              <div
                key={gem.id}
                onClick={() => onSelectGem(gem)}
                className="p-3 bg-slate-950/70 hover:bg-slate-800/40 border border-slate-800/80 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {gem.variety}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      ({gem.lotNumber} · {gem.cutWeightCts.toFixed(2)}ct)
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-sans uppercase font-medium ${
                        gem.status === 'sold'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                          : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/50'
                      }`}
                    >
                      {gem.status === 'sold' ? 'Sold' : 'Active'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono-numbers">
                    <span className="text-slate-400 text-[11px]">
                      Cost: {formatCurrency(metrics.totalCost, currency)}
                    </span>
                    <span
                      className={`font-bold ${
                        isProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatCurrency(metrics.profitOrLoss, currency)}
                    </span>
                    <span className="text-cyan-300 font-bold text-xs">
                      ({formatPercent(metrics.roiPercent)} ROI)
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>

                {/* Dual Progress Comparison Bar: Cost vs Revenue */}
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex items-center p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isProfit
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-rose-500 to-amber-500'
                    }`}
                    style={{ width: `${Math.max(5, barPct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
