import React, { useState } from 'react';
import { GemstoneItem, CurrencyCode } from '../types/gem';
import { calculateGemMetrics, calculateTotalCost } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/currency';
import { Layers, PieChart, BarChart2, Gem } from 'lucide-react';

interface CostBreakdownChartProps {
  gems: GemstoneItem[];
  currency: CurrencyCode;
}

export const CostBreakdownChart: React.FC<CostBreakdownChartProps> = ({ gems, currency }) => {
  const [selectedGemId, setSelectedGemId] = useState<string>(gems[0]?.id || '');

  // Aggregate cost sums across the entire portfolio
  const aggregateCosts = gems.reduce(
    (acc, gem) => {
      acc.roughPurchase += gem.costs.roughPurchase || 0;
      acc.lapidaryCutting += gem.costs.lapidaryCutting || 0;
      acc.treatmentHeating += gem.costs.treatmentHeating || 0;
      acc.certificationLab += gem.costs.certificationLab || 0;
      acc.customsDutyTaxes += gem.costs.customsDutyTaxes || 0;
      acc.brokerageCommission += gem.costs.brokerageCommission || 0;
      acc.mountingJewelry += gem.costs.mountingJewelry || 0;
      acc.vaultInsuranceLogistics += gem.costs.vaultInsuranceLogistics || 0;
      acc.otherIncidental += gem.costs.otherIncidental || 0;
      return acc;
    },
    {
      roughPurchase: 0,
      lapidaryCutting: 0,
      treatmentHeating: 0,
      certificationLab: 0,
      customsDutyTaxes: 0,
      brokerageCommission: 0,
      mountingJewelry: 0,
      vaultInsuranceLogistics: 0,
      otherIncidental: 0,
    }
  );

  const totalPortfolioCost = Object.values(aggregateCosts).reduce((a, b) => a + b, 0);

  const costCategories = [
    { key: 'roughPurchase', label: 'Rough / Base Acquisition', amount: aggregateCosts.roughPurchase, color: '#38bdf8' },
    { key: 'lapidaryCutting', label: 'Lapidary Faceting & Preform', amount: aggregateCosts.lapidaryCutting, color: '#818cf8' },
    { key: 'treatmentHeating', label: 'Thermal Furnace Treatment', amount: aggregateCosts.treatmentHeating, color: '#f59e0b' },
    { key: 'certificationLab', label: 'Lab Certification (GIA/SSEF)', amount: aggregateCosts.certificationLab, color: '#34d399' },
    { key: 'customsDutyTaxes', label: 'Customs Duties, Cess & Royalties', amount: aggregateCosts.customsDutyTaxes, color: '#fb7185' },
    { key: 'brokerageCommission', label: 'Brokerage & Sourcing Commission', amount: aggregateCosts.brokerageCommission, color: '#c084fc' },
    { key: 'mountingJewelry', label: 'Jewelry Setting & Mounts', amount: aggregateCosts.mountingJewelry, color: '#fbbf24' },
    { key: 'vaultInsuranceLogistics', label: 'Vault, Courier & Insurance', amount: aggregateCosts.vaultInsuranceLogistics, color: '#2dd4bf' },
    { key: 'otherIncidental', label: 'Miscellaneous Incidentals', amount: aggregateCosts.otherIncidental, color: '#94a3b8' },
  ];

  // Specific Gemstone Selected
  const selectedGem = gems.find((g) => g.id === selectedGemId) || gems[0];
  const selectedMetrics = selectedGem ? calculateGemMetrics(selectedGem) : null;

  return (
    <div className="space-y-6">
      
      {/* Portfolio Cost Allocation Overview */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-cyan-400" />
              Capital Cost Distribution (All Inventory)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive breakdown of where capital is deployed across all 9 cost categories.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Capital Invested</span>
            <span className="text-xl font-bold font-mono-numbers text-cyan-300">
              {formatCurrency(totalPortfolioCost, currency)}
            </span>
          </div>
        </div>

        {/* Stacked Percentage Bar Chart */}
        <div className="mt-5">
          <div className="h-6 w-full rounded-lg overflow-hidden flex bg-slate-950 border border-slate-800">
            {costCategories.map((cat) => {
              const pct = totalPortfolioCost > 0 ? (cat.amount / totalPortfolioCost) * 100 : 0;
              if (pct <= 0) return null;
              return (
                <div
                  key={cat.key}
                  style={{ width: `${pct}%`, backgroundColor: cat.color }}
                  className="h-full relative group transition-all cursor-pointer hover:opacity-90"
                  title={`${cat.label}: ${formatCurrency(cat.amount, currency)} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* Legend Grid with values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
            {costCategories.map((cat) => {
              const pct = totalPortfolioCost > 0 ? (cat.amount / totalPortfolioCost) * 100 : 0;
              return (
                <div
                  key={cat.key}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-slate-300 font-medium truncate max-w-[150px] sm:max-w-[180px]">
                      {cat.label}
                    </span>
                  </div>
                  <div className="text-right font-mono-numbers">
                    <span className="text-slate-100 font-semibold block">
                      {formatCurrency(cat.amount, currency)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {pct.toFixed(1)}% of total
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Specific Gemstone Cost Waterfall & Value Engine */}
      {selectedGem && selectedMetrics && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
          
          {/* Selector Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                Cost Waterfall for Specific Gemstone
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Analyze step-by-step cost escalation from rough to polished sale for individual stones.
              </p>
            </div>

            {/* Select Gemstone Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Select Gem:</span>
              <select
                value={selectedGemId}
                onChange={(e) => setSelectedGemId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {gems.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.lotNumber} - {g.variety} ({g.cutWeightCts.toFixed(2)}ct)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Gem Summary Bar */}
          <div className="my-4 p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Lot Details</span>
              <span className="font-semibold text-slate-200">
                {selectedGem.variety} · {selectedGem.shape} ({selectedGem.origin})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Carats & Yield</span>
              <span className="font-mono-numbers text-slate-200 font-medium">
                {selectedGem.cutWeightCts.toFixed(2)} cts
                {selectedGem.roughWeightCts > 0 && ` (${selectedMetrics.yieldPercent.toFixed(1)}% recovery)`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Total Gem Cost</span>
              <span className="font-mono-numbers text-cyan-300 font-bold">
                {formatCurrency(selectedMetrics.totalCost, currency)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Cost / Carat</span>
              <span className="font-mono-numbers text-slate-200 font-semibold">
                {formatCurrency(selectedMetrics.costPerCt, currency)}/ct
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Net P&L</span>
              <span
                className={`font-mono-numbers font-bold ${
                  selectedMetrics.profitOrLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(selectedMetrics.profitOrLoss, currency)} ({formatPercent(selectedMetrics.roiPercent)} ROI)
              </span>
            </div>
          </div>

          {/* Visual Step-by-Step Waterfall Bars */}
          <div className="space-y-2 mt-4">
            {[
              { label: '1. Rough / Base Acquisition', value: selectedGem.costs.roughPurchase, color: 'bg-sky-500' },
              { label: '2. Lapidary Faceting & Preform', value: selectedGem.costs.lapidaryCutting, color: 'bg-indigo-500' },
              { label: '3. Thermal Heat Furnace', value: selectedGem.costs.treatmentHeating, color: 'bg-amber-500' },
              { label: '4. Lab Testing & Cert', value: selectedGem.costs.certificationLab, color: 'bg-emerald-500' },
              { label: '5. Customs Duties, Cess & Taxes', value: selectedGem.costs.customsDutyTaxes, color: 'bg-rose-500' },
              { label: '6. Brokerage & Dalal Fee', value: selectedGem.costs.brokerageCommission, color: 'bg-purple-500' },
              { label: '7. Jewelry Mount & Melee Diamonds', value: selectedGem.costs.mountingJewelry, color: 'bg-yellow-500' },
              { label: '8. Vault & Transit Logistics', value: selectedGem.costs.vaultInsuranceLogistics, color: 'bg-teal-500' },
              { label: '9. Miscellaneous Incidentals', value: selectedGem.costs.otherIncidental, color: 'bg-slate-500' },
            ].map((step, idx) => {
              const maxVal = Math.max(
                selectedMetrics.totalCost,
                selectedGem.targetSellingPrice,
                selectedGem.actualSoldPrice || 0
              );
              const pctOfTotal = selectedMetrics.totalCost > 0 ? (step.value / selectedMetrics.totalCost) * 100 : 0;
              const barWidth = maxVal > 0 ? (step.value / maxVal) * 100 : 0;

              return (
                <div key={idx} className="flex items-center text-xs group">
                  <div className="w-52 sm:w-64 text-slate-300 font-medium truncate pr-2">
                    {step.label}
                  </div>
                  <div className="flex-1 max-w-md bg-slate-950 h-5 rounded overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-sm ${step.color} transition-all duration-300`}
                      style={{ width: `${Math.max(barWidth, step.value > 0 ? 2 : 0)}%` }}
                    />
                  </div>
                  <div className="w-28 text-right font-mono-numbers text-slate-200 pl-3">
                    {formatCurrency(step.value, currency)}
                  </div>
                  <div className="w-16 text-right font-mono-numbers text-slate-400 text-[11px]">
                    {pctOfTotal > 0 ? `${pctOfTotal.toFixed(1)}%` : '0%'}
                  </div>
                </div>
              );
            })}

            {/* Total Cost Row */}
            <div className="flex items-center text-xs pt-3 mt-3 border-t border-slate-800 font-semibold">
              <div className="w-52 sm:w-64 text-slate-100">Total Invested Cost</div>
              <div className="flex-1 max-w-md bg-slate-950 h-6 rounded overflow-hidden p-0.5 border border-cyan-500/30">
                <div className="h-full bg-cyan-400 rounded-sm w-full" />
              </div>
              <div className="w-28 text-right font-mono-numbers text-cyan-300 font-bold pl-3">
                {formatCurrency(selectedMetrics.totalCost, currency)}
              </div>
              <div className="w-16 text-right font-mono-numbers text-cyan-400 text-[11px]">
                100%
              </div>
            </div>

            {/* Target / Sold Revenue Comparison Row */}
            <div className="flex items-center text-xs pt-2 font-semibold">
              <div className="w-52 sm:w-64 text-emerald-400">
                {selectedGem.status === 'sold' ? 'Realized Sale Price' : 'Target Asking Price'}
              </div>
              <div className="flex-1 max-w-md bg-slate-950 h-6 rounded overflow-hidden p-0.5 border border-emerald-500/30">
                <div
                  className="h-full bg-emerald-500 rounded-sm"
                  style={{
                    width: `${Math.min(
                      100,
                      selectedMetrics.totalCost > 0
                        ? (selectedMetrics.effectiveRevenue /
                            Math.max(selectedMetrics.totalCost, selectedMetrics.effectiveRevenue)) *
                            100
                        : 100
                    )}%`,
                  }}
                />
              </div>
              <div className="w-28 text-right font-mono-numbers text-emerald-400 font-bold pl-3">
                {formatCurrency(selectedMetrics.effectiveRevenue, currency)}
              </div>
              <div className="w-16 text-right font-mono-numbers text-emerald-400 text-[11px]">
                {formatPercent(selectedMetrics.roiPercent)}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
