import React, { useState } from 'react';
import { GemstoneItem, CurrencyCode } from '../types/gem';
import { calculateGemMetrics } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/currency';
import { Target, Zap, Clock, Scissors, Sliders, ArrowRight, ShieldAlert } from 'lucide-react';

interface RoiDecisionMatrixProps {
  gems: GemstoneItem[];
  currency: CurrencyCode;
  onSelectGem: (gem: GemstoneItem) => void;
  onUpdateGemPrice: (id: string, newTargetPrice: number) => void;
}

export const RoiDecisionMatrix: React.FC<RoiDecisionMatrixProps> = ({
  gems,
  currency,
  onSelectGem,
  onUpdateGemPrice,
}) => {
  const [desiredRoiPct, setDesiredRoiPct] = useState<number>(50);

  // Active inventory (unsold)
  const activeGems = gems.filter((g) => g.status !== 'sold');

  // Age buckets
  const agingBuckets = {
    fresh: [] as GemstoneItem[],       // < 45 days
    maturing: [] as GemstoneItem[],    // 45 - 90 days
    aging: [] as GemstoneItem[],       // 91 - 180 days
    stale: [] as GemstoneItem[],       // > 180 days
  };

  activeGems.forEach((gem) => {
    const metrics = calculateGemMetrics(gem);
    if (metrics.daysHeld < 45) agingBuckets.fresh.push(gem);
    else if (metrics.daysHeld <= 90) agingBuckets.maturing.push(gem);
    else if (metrics.daysHeld <= 180) agingBuckets.aging.push(gem);
    else agingBuckets.stale.push(gem);
  });

  // Yield analysis for stones bought rough
  const roughGems = gems.filter((g) => g.roughWeightCts > 0);

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: Target ROI Price Optimizer */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Target ROI Price Optimizer
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate required asking prices to secure your minimum desired Return on Investment.
            </p>
          </div>

          {/* Interactive ROI Slider */}
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-300 font-medium">Desired ROI:</span>
            <input
              type="range"
              min="15"
              max="150"
              step="5"
              value={desiredRoiPct}
              onChange={(e) => setDesiredRoiPct(parseInt(e.target.value))}
              className="w-28 accent-cyan-400 cursor-pointer"
            />
            <span className="text-sm font-bold font-mono text-cyan-300 w-12 text-right">
              {desiredRoiPct}%
            </span>
          </div>
        </div>

        {/* Dynamic Matrix Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f172a] text-slate-300 border-b border-slate-800 uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-2.5 px-3">Gem Lot / Variety</th>
                <th className="py-2.5 px-3 text-right">Cut (ct)</th>
                <th className="py-2.5 px-3 text-right">Total Cost</th>
                <th className="py-2.5 px-3 text-right">Current Ask</th>
                <th className="py-2.5 px-3 text-right text-cyan-300">
                  Target Price for {desiredRoiPct}% ROI
                </th>
                <th className="py-2.5 px-3 text-right text-cyan-300">Target $/ct</th>
                <th className="py-2.5 px-3 text-right">Delta to Target</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
              {activeGems.map((gem) => {
                const metrics = calculateGemMetrics(gem);
                const optimalTargetPrice = metrics.totalCost * (1 + desiredRoiPct / 100);
                const optimalPerCt = gem.cutWeightCts > 0 ? optimalTargetPrice / gem.cutWeightCts : 0;
                const delta = optimalTargetPrice - gem.targetSellingPrice;

                return (
                  <tr key={gem.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-sans font-semibold text-slate-100">{gem.variety}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{gem.lotNumber}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200">
                      {gem.cutWeightCts.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {formatCurrency(metrics.totalCost, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {formatCurrency(gem.targetSellingPrice, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-cyan-300">
                      {formatCurrency(optimalTargetPrice, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-cyan-400 font-medium">
                      {formatCurrency(optimalPerCt, currency)}/ct
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={delta > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                        {delta > 0 ? `+${formatCurrency(delta, currency)} needed` : 'Exceeds target'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      <button
                        onClick={() => onUpdateGemPrice(gem.id, Math.round(optimalTargetPrice))}
                        className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/80 text-cyan-300 rounded text-[11px] font-medium transition-colors"
                      >
                        Apply Price
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Inventory Holding Age & Liquidity Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Aging & Working Capital Alert */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Holding Age & Vault Turn Velocity
            </h3>
            <span className="text-xs text-slate-400">
              {activeGems.length} active lots
            </span>
          </div>

          <div className="space-y-3">
            
            {/* Fresh <45 days */}
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-emerald-400 block">Fresh Acquisitions (&lt;45 days)</span>
                <span className="text-[11px] text-slate-400">Prime marketing cycle, active inquiries</span>
              </div>
              <span className="text-base font-bold font-mono text-emerald-400">
                {agingBuckets.fresh.length} lots
              </span>
            </div>

            {/* Maturing 45-90 days */}
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-cyan-400 block">Maturing Inventory (45-90 days)</span>
                <span className="text-[11px] text-slate-400">Consider consignment memo to key jewelers</span>
              </div>
              <span className="text-base font-bold font-mono text-cyan-300">
                {agingBuckets.maturing.length} lots
              </span>
            </div>

            {/* Aging 91-180 days */}
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-amber-400 block">Extended Vault Holding (91-180 days)</span>
                <span className="text-[11px] text-slate-400">Recommend trade fair showcase or targeted discount</span>
              </div>
              <span className="text-base font-bold font-mono text-amber-400">
                {agingBuckets.aging.length} lots
              </span>
            </div>

            {/* Stale >180 days */}
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-rose-400 block">Capital Lock Alert (&gt;180 days)</span>
                <span className="text-[11px] text-slate-400">High carrying cost; evaluate wholesale liquidation</span>
              </div>
              <span className="text-base font-bold font-mono text-rose-400">
                {agingBuckets.stale.length} lots
              </span>
            </div>

          </div>
        </div>

        {/* Rough to Cut Faceting Yield Efficiency */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-emerald-400" />
              Lapidary Weight Recovery Yield
            </h3>
            <span className="text-xs text-slate-400">
              {roughGems.length} rough faceting records
            </span>
          </div>

          {roughGems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No rough-to-cut data recorded yet. Enter rough weight when adding gems to track yield efficiency.
            </div>
          ) : (
            <div className="space-y-3">
              {roughGems.map((gem) => {
                const metrics = calculateGemMetrics(gem);
                const yieldPct = metrics.yieldPercent;
                const isHighYield = yieldPct >= 40;

                return (
                  <div
                    key={gem.id}
                    onClick={() => onSelectGem(gem)}
                    className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs hover:border-cyan-500/40 cursor-pointer transition-all"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-200">
                        {gem.variety} ({gem.lotNumber})
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          isHighYield ? 'text-emerald-400' : 'text-cyan-300'
                        }`}
                      >
                        {yieldPct.toFixed(1)}% Yield
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] font-mono-numbers text-slate-400">
                      <span>Rough: {gem.roughWeightCts.toFixed(2)} cts</span>
                      <span>Cut: {gem.cutWeightCts.toFixed(2)} cts</span>
                      <span>Lost: {(gem.roughWeightCts - gem.cutWeightCts).toFixed(2)} cts</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-2 border border-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          isHighYield ? 'bg-emerald-400' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${Math.min(100, yieldPct * 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
