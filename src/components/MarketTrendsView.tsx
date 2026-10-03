import React, { useState } from 'react';
import { GemstoneItem, CurrencyCode } from '../types/gem';
import { GEM_MARKET_TRENDS } from '../data/marketTrends';
import { calculateGemMetrics } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/currency';
import { Sparkles, TrendingUp, Compass, ArrowUpRight, ShieldAlert, CheckCircle, Info } from 'lucide-react';

interface MarketTrendsViewProps {
  gems: GemstoneItem[];
  currency: CurrencyCode;
  onSelectGem: (gem: GemstoneItem) => void;
}

export const MarketTrendsView: React.FC<MarketTrendsViewProps> = ({ gems, currency, onSelectGem }) => {
  const [selectedVariety, setSelectedVariety] = useState<string>(GEM_MARKET_TRENDS[0].variety);

  const activeTrend = GEM_MARKET_TRENDS.find((t) => t.variety === selectedVariety) || GEM_MARKET_TRENDS[0];

  // Find all user gems belonging to this variety
  const userGemsInVariety = gems.filter((g) => g.variety === selectedVariety);

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              International Gemstone Market Trends & Benchmark Pricing
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Grounded wholesale market data across Colombo, Bangkok, Geneva, and Hong Kong trading hubs for strategic pricing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Select Variety:</span>
            <select
              value={selectedVariety}
              onChange={(e) => setSelectedVariety(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              {GEM_MARKET_TRENDS.map((t) => (
                <option key={t.variety} value={t.variety}>
                  {t.variety} (+{t.yearlyGrowthPercent}% YoY)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Benchmark Metric Cards for Selected Variety */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Wholesale Median Benchmark</span>
          <span className="text-2xl font-bold font-mono-numbers text-cyan-300">
            {formatCurrency(activeTrend.benchmarkPricePerCtUSD.median, currency)}
            <span className="text-xs font-normal text-slate-400">/ct</span>
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            Range: {formatCurrency(activeTrend.benchmarkPricePerCtUSD.min, currency)} – {formatCurrency(activeTrend.benchmarkPricePerCtUSD.max, currency)}
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Annual Appreciation Rate</span>
          <span className="text-2xl font-bold font-mono-numbers text-emerald-400">
            +{activeTrend.yearlyGrowthPercent}%
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            YoY compound value trajectory
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Global Trade Demand</span>
          <span className="text-2xl font-bold text-slate-100">
            {activeTrend.marketDemand}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            Auction & salon liquidity rating
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Your Portfolio Holdings</span>
          <span className="text-2xl font-bold font-mono-numbers text-purple-300">
            {userGemsInVariety.length} <span className="text-xs font-normal text-slate-400">stones</span>
          </span>
          <span className="text-[11px] text-slate-400 block mt-1 font-mono-numbers">
            {userGemsInVariety.reduce((acc, g) => acc + g.cutWeightCts, 0).toFixed(2)} total cts
          </span>
        </div>

      </div>

      {/* 5-Year Trajectory Chart & Trade Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Historical Trajectory Visual Chart */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              5-Year Wholesale Price Index ($/ct)
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              2022 - 2026 Trajectory
            </span>
          </div>

          {/* SVG Price Chart */}
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2 items-end h-48 pt-6 pb-2 px-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
              {activeTrend.priceHistory.map((pt, idx) => {
                const maxPrice = Math.max(...activeTrend.priceHistory.map((p) => p.avgPricePerCt));
                const heightPct = (pt.avgPricePerCt / maxPrice) * 100;

                return (
                  <div key={pt.year} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-[11px] font-mono-numbers text-cyan-300 font-semibold mb-1 group-hover:scale-110 transition-transform">
                      {formatCurrency(pt.avgPricePerCt, currency, true)}
                    </span>
                    <div
                      className="w-full max-w-[48px] bg-gradient-to-t from-cyan-900/80 via-cyan-600/80 to-cyan-400 rounded-t-md transition-all duration-300 group-hover:opacity-90"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-xs font-mono text-slate-400 mt-2 font-medium">
                      {pt.year}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Market Intelligence Brief: </span>
                {activeTrend.marketNotes}
              </div>
            </div>
          </div>

        </div>

        {/* Right 1 Col: User Gemstones Valuation vs Benchmark */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800 mb-3">
              <Compass className="w-4 h-4 text-purple-400" />
              Your Stones vs Market
            </h3>

            {userGemsInVariety.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                You do not currently have any <span className="text-slate-200">{selectedVariety}</span> in inventory.
              </div>
            ) : (
              <div className="space-y-3">
                {userGemsInVariety.map((gem) => {
                  const metrics = calculateGemMetrics(gem);
                  const isCostFavorable = metrics.costPerCt <= activeTrend.benchmarkPricePerCtUSD.median;
                  const askPerCt = metrics.cutWeight > 0 ? gem.targetSellingPrice / metrics.cutWeight : 0;

                  return (
                    <div
                      key={gem.id}
                      onClick={() => onSelectGem(gem)}
                      className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all text-xs"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-slate-200">{gem.lotNumber}</span>
                        <span className="font-mono-numbers text-slate-300">{gem.cutWeightCts.toFixed(2)} ct</span>
                      </div>
                      
                      <div className="space-y-1 font-mono-numbers text-[11px]">
                        <div className="flex justify-between text-slate-400">
                          <span>Your Cost / ct:</span>
                          <span className={isCostFavorable ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                            {formatCurrency(metrics.costPerCt, currency)}/ct
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Your Asking / ct:</span>
                          <span className="text-cyan-300 font-semibold">
                            {formatCurrency(askPerCt, currency)}/ct
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-sans">Strategic Stance:</span>
                        {isCostFavorable ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Favorable Margin Headroom
                          </span>
                        ) : (
                          <span className="text-amber-400 font-medium flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> High Cost vs Wholesale
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Wholesale benchmarks are calibrated for clean, eye-clean fine gem grades with recognized lab certification.
          </div>
        </div>

      </div>

    </div>
  );
};
