import React, { useState } from 'react';
import { GemstoneItem, CurrencyCode, InventoryStatus, GemCostBreakdown } from '../types/gem';
import { calculateGemMetrics, calculateTotalCost } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/currency';
import { GEM_MARKET_TRENDS } from '../data/marketTrends';
import { 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Sparkles,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';

interface GemCostTableProps {
  gems: GemstoneItem[];
  currency: CurrencyCode;
  onEditGem: (gem: GemstoneItem) => void;
  onDeleteGem: (id: string) => void;
  onUpdateGemStatus: (id: string, newStatus: InventoryStatus, soldPrice?: number, buyerName?: string) => void;
  onQuickUpdateCost: (id: string, costKey: keyof GemCostBreakdown, value: number) => void;
  onQuickUpdatePrice: (id: string, targetPrice: number) => void;
}

export const GemCostTable: React.FC<GemCostTableProps> = ({
  gems,
  currency,
  onEditGem,
  onDeleteGem,
  onUpdateGemStatus,
  onQuickUpdateCost,
  onQuickUpdatePrice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InventoryStatus>('all');
  const [varietyFilter, setVarietyFilter] = useState<string>('all');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'lot' | 'carat' | 'cost' | 'profit' | 'roi'>('lot');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [soldModalGem, setSoldModalGem] = useState<GemstoneItem | null>(null);
  const [soldPriceInput, setSoldPriceInput] = useState<string>('');
  const [buyerInput, setBuyerInput] = useState<string>('');

  // Filtering
  const filteredGems = gems.filter((gem) => {
    const matchesSearch =
      gem.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gem.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gem.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gem.certNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (gem.buyerName && gem.buyerName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || gem.status === statusFilter;
    const matchesVariety = varietyFilter === 'all' || gem.variety === varietyFilter;

    return matchesSearch && matchesStatus && matchesVariety;
  });

  // Sorting
  const sortedGems = [...filteredGems].sort((a, b) => {
    const metricsA = calculateGemMetrics(a);
    const metricsB = calculateGemMetrics(b);

    let comp = 0;
    if (sortField === 'lot') comp = a.lotNumber.localeCompare(b.lotNumber);
    if (sortField === 'carat') comp = a.cutWeightCts - b.cutWeightCts;
    if (sortField === 'cost') comp = metricsA.totalCost - metricsB.totalCost;
    if (sortField === 'profit') comp = metricsA.profitOrLoss - metricsB.profitOrLoss;
    if (sortField === 'roi') comp = metricsA.roiPercent - metricsB.roiPercent;

    return sortAsc ? comp : -comp;
  });

  const handleSort = (field: 'lot' | 'carat' | 'cost' | 'profit' | 'roi') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleOpenSoldModal = (gem: GemstoneItem) => {
    setSoldModalGem(gem);
    setSoldPriceInput(gem.targetSellingPrice.toString());
    setBuyerInput(gem.buyerName || '');
  };

  const handleConfirmSold = () => {
    if (!soldModalGem) return;
    const price = parseFloat(soldPriceInput) || soldModalGem.targetSellingPrice;
    onUpdateGemStatus(soldModalGem.id, 'sold', price, buyerInput);
    setSoldModalGem(null);
  };

  // Distinct gem varieties in database
  const distinctVarieties = Array.from(new Set(gems.map((g) => g.variety)));

  return (
    <div className="space-y-4">
      
      {/* Control Bar: Search & Functional Filter Buttons */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-slate-800">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search lot #, variety, cert #, origin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950/60 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Variety Filter Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={varietyFilter}
            onChange={(e) => setVarietyFilter(e.target.value)}
            className="bg-slate-950/60 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Gem Varieties</option>
            {distinctVarieties.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          {/* Interactive Status Segmented Filter */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
            {(['all', 'in_stock', 'on_memo', 'reserved', 'sold'] as const).map((st) => {
              const labelMap: Record<string, string> = {
                all: 'All',
                in_stock: 'In Stock',
                on_memo: 'Memo',
                reserved: 'Reserved',
                sold: 'Sold',
              };
              const count = st === 'all' ? gems.length : gems.filter((g) => g.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {labelMap[st]} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Interactive Spreadsheet Chart */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        
        {/* Table header bar notice */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-200">Gemstone Cost & Financial Matrix</span>
            <span className="text-slate-600">·</span>
            <span>Showing {sortedGems.length} of {gems.length} lots</span>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-slate-400">
            Click any row to inspect all 9 cost categories or edit
          </span>
        </div>

        <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            {/* Table Head */}
            <thead className="bg-[#0f172a] text-slate-300 sticky top-0 z-20 border-b border-slate-800 shadow-sm text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-3 w-8"></th>
                <th className="py-3 px-3 cursor-pointer hover:text-cyan-400" onClick={() => handleSort('lot')}>
                  <div className="flex items-center gap-1">
                    <span>Lot / Gem Variety</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-cyan-400 text-right" onClick={() => handleSort('carat')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Cut (cts)</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Rough Buy</th>
                <th className="py-3 px-3 text-right">Lapidary</th>
                <th className="py-3 px-3 text-right">Heat/Lab/Duty</th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-cyan-400" onClick={() => handleSort('cost')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Cost</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Cost/ct</th>
                <th className="py-3 px-3 text-right">Selling Price</th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-cyan-400" onClick={() => handleSort('profit')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Profit / Loss</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-cyan-400" onClick={() => handleSort('roi')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>ROI %</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
              {sortedGems.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400 font-sans">
                    <p className="text-sm font-medium text-slate-300">No gemstones match the selected criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Adjust your search or filter settings.</p>
                  </td>
                </tr>
              ) : (
                sortedGems.map((gem) => {
                  const metrics = calculateGemMetrics(gem);
                  const isExpanded = expandedRowId === gem.id;
                  const isPositiveProfit = metrics.profitOrLoss >= 0;
                  
                  // Secondary combined costs for quick view
                  const heatLabDutySum = 
                    (gem.costs.treatmentHeating || 0) + 
                    (gem.costs.certificationLab || 0) + 
                    (gem.costs.customsDutyTaxes || 0) +
                    (gem.costs.brokerageCommission || 0) +
                    (gem.costs.vaultInsuranceLogistics || 0) +
                    (gem.costs.otherIncidental || 0) +
                    (gem.costs.mountingJewelry || 0);

                  // Market benchmark lookup
                  const trend = GEM_MARKET_TRENDS.find((t) => t.variety === gem.variety);
                  const isUnderMarketCost = trend && metrics.costPerCt < trend.benchmarkPricePerCtUSD.median;

                  return (
                    <React.Fragment key={gem.id}>
                      <tr 
                        className={`hover:bg-slate-800/40 transition-colors cursor-pointer group ${
                          isExpanded ? 'bg-slate-800/30' : ''
                        }`}
                        onClick={() => setExpandedRowId(isExpanded ? null : gem.id)}
                      >
                        {/* Expand toggle */}
                        <td className="py-3 px-3 text-center text-slate-500">
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 group-hover:text-slate-300" />
                          )}
                        </td>

                        {/* Lot & Variety */}
                        <td className="py-3 px-3">
                          <div className="font-sans font-semibold text-slate-100 flex items-center gap-1.5">
                            <span>{gem.variety}</span>
                            {isUnderMarketCost && (
                              <span 
                                title="Acquired below current international wholesale market median"
                                className="text-[10px] text-cyan-400 font-mono"
                              >
                                ★
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <span>{gem.lotNumber}</span>
                            <span className="text-slate-600">·</span>
                            <span>{gem.shape}</span>
                            <span className="text-slate-600">·</span>
                            <span className="truncate max-w-[110px]">{gem.origin}</span>
                          </div>
                        </td>

                        {/* Carats & Yield */}
                        <td className="py-3 px-3 text-right">
                          <div className="text-slate-200 font-semibold">
                            {gem.cutWeightCts.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">ct</span>
                          </div>
                          {gem.roughWeightCts > 0 && (
                            <div className="text-[10px] text-slate-400">
                              Yield: {metrics.yieldPercent.toFixed(1)}%
                            </div>
                          )}
                        </td>

                        {/* Cost 1: Rough Buy */}
                        <td className="py-3 px-3 text-right text-slate-300">
                          {formatCurrency(gem.costs.roughPurchase, currency)}
                        </td>

                        {/* Cost 2: Lapidary */}
                        <td className="py-3 px-3 text-right text-slate-400">
                          {formatCurrency(gem.costs.lapidaryCutting, currency)}
                        </td>

                        {/* Cost 3: Other costs aggregated */}
                        <td className="py-3 px-3 text-right text-slate-400">
                          {formatCurrency(heatLabDutySum, currency)}
                        </td>

                        {/* Total Cost */}
                        <td className="py-3 px-3 text-right font-bold text-slate-100">
                          {formatCurrency(metrics.totalCost, currency)}
                        </td>

                        {/* Cost / Carat */}
                        <td className="py-3 px-3 text-right text-slate-300">
                          {formatCurrency(metrics.costPerCt, currency)}
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-3 text-right text-slate-100 font-medium">
                          {gem.status === 'sold' && gem.actualSoldPrice > 0 ? (
                            <span className="text-emerald-400 font-bold">
                              {formatCurrency(gem.actualSoldPrice, currency)}
                            </span>
                          ) : (
                            formatCurrency(gem.targetSellingPrice, currency)
                          )}
                        </td>

                        {/* Profit / Loss */}
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`font-semibold ${
                              isPositiveProfit ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {formatCurrency(metrics.profitOrLoss, currency)}
                          </span>
                        </td>

                        {/* ROI % */}
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`font-bold ${
                              metrics.roiPercent >= 50
                                ? 'text-emerald-300'
                                : metrics.roiPercent >= 0
                                ? 'text-teal-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {formatPercent(metrics.roiPercent)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={gem.status}
                            onChange={(e) => {
                              const newSt = e.target.value as InventoryStatus;
                              if (newSt === 'sold') {
                                handleOpenSoldModal(gem);
                              } else {
                                onUpdateGemStatus(gem.id, newSt);
                              }
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-sans font-medium focus:outline-none border cursor-pointer ${
                              gem.status === 'sold'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                                : gem.status === 'on_memo'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-800/80'
                                : gem.status === 'reserved'
                                ? 'bg-purple-950/60 text-purple-300 border-purple-800/80'
                                : 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80'
                            }`}
                          >
                            <option value="in_stock" className="bg-slate-900 text-slate-200">In Stock</option>
                            <option value="on_memo" className="bg-slate-900 text-slate-200">On Memo</option>
                            <option value="reserved" className="bg-slate-900 text-slate-200">Reserved</option>
                            <option value="sold" className="bg-slate-900 text-slate-200">Sold</option>
                          </select>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onEditGem(gem)}
                              title="Edit complete cost sheet & gem specifications"
                              className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove ${gem.lotNumber} (${gem.variety}) from inventory?`)) {
                                  onDeleteGem(gem.id);
                                }
                              }}
                              title="Delete gemstone"
                              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row Detail: All 9 Types of Costs Breakdown */}
                      {isExpanded && (
                        <tr className="bg-slate-950/80 border-y border-slate-800/90 font-sans">
                          <td colSpan={13} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              
                              {/* Column 1: Detailed 9-Cost Component Waterfall */}
                              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                                <div className="font-semibold text-slate-200 mb-2 flex items-center justify-between">
                                  <span>Complete Cost Breakdown</span>
                                  <span className="font-mono text-cyan-400">
                                    {formatCurrency(metrics.totalCost, currency)}
                                  </span>
                                </div>
                                
                                <div className="space-y-1.5 font-mono text-[11px]">
                                  <div className="flex justify-between text-slate-300">
                                    <span>1. Rough / Base Acquisition</span>
                                    <span>{formatCurrency(gem.costs.roughPurchase, currency)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>2. Lapidary Faceting & Preform</span>
                                    <span>{formatCurrency(gem.costs.lapidaryCutting, currency)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>3. Thermal Heating / Furnace</span>
                                    <span>{formatCurrency(gem.costs.treatmentHeating, currency)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>4. Lab Certificate ({gem.certLab || 'Testing'})</span>
                                    <span>{formatCurrency(gem.costs.certificationLab, currency)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>5. Customs Duty / Cess / Taxes</span>
                                    <span>{formatCurrency(gem.costs.customsDutyTaxes, currency)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>6. Brokerage / Dalal Commission</span>
                                    <span>{formatCurrency(gem.costs.brokerageCommission, currency)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>7. Jewelry Setting & Mounting</span>
                                    <span>{formatCurrency(gem.costs.mountingJewelry, currency)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>8. Vault & Transit Logistics</span>
                                    <span>{formatCurrency(gem.costs.vaultInsuranceLogistics, currency)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>9. Miscellaneous / Incidentals</span>
                                    <span>{formatCurrency(gem.costs.otherIncidental, currency)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Column 2: Gemological Specifications */}
                              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                                <div className="font-semibold text-slate-200 mb-2">
                                  Gemological Specifications
                                </div>
                                <div className="space-y-1.5 text-[11px] text-slate-300">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Origin:</span>
                                    <span className="font-medium text-slate-200">{gem.origin}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Treatment:</span>
                                    <span className="font-medium text-slate-200">{gem.treatment}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Clarity:</span>
                                    <span className="font-medium text-slate-200">{gem.clarity}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Color Grade:</span>
                                    <span className="font-medium text-slate-200">{gem.colorDescription}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Dimensions:</span>
                                    <span className="font-mono text-slate-200">{gem.dimensions || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Certificate:</span>
                                    <span className="font-mono text-cyan-300">{gem.certLab} #{gem.certNumber}</span>
                                  </div>
                                  {gem.notes && (
                                    <div className="pt-1.5 border-t border-slate-800 text-slate-400 italic">
                                      "{gem.notes}"
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Column 3: Decision & Market Metrics */}
                              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
                                <div>
                                  <div className="font-semibold text-slate-200 mb-2">
                                    Financial Return & Market Position
                                  </div>
                                  
                                  <div className="space-y-2 text-[11px]">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Break-Even Price / ct:</span>
                                      <span className="font-mono text-slate-200">
                                        {formatCurrency(metrics.breakEvenPerCt, currency)}/ct
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Profit Margin:</span>
                                      <span className="font-mono text-emerald-400 font-semibold">
                                        {formatPercent(metrics.profitMarginPercent)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Return on Investment (ROI):</span>
                                      <span className="font-mono text-cyan-300 font-bold">
                                        {formatPercent(metrics.roiPercent)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Holding Duration:</span>
                                      <span className="font-mono text-slate-300">
                                        {metrics.daysHeld} days
                                      </span>
                                    </div>

                                    {trend && (
                                      <div className="mt-2 pt-2 border-t border-slate-800">
                                        <div className="text-[10px] text-slate-400 mb-1">
                                          Market Benchmark ({trend.variety}):
                                        </div>
                                        <div className="font-mono text-[11px] text-slate-200 flex justify-between">
                                          <span>Range: {formatCurrency(trend.benchmarkPricePerCtUSD.min, currency)} – {formatCurrency(trend.benchmarkPricePerCtUSD.max, currency)}/ct</span>
                                          <span className="text-emerald-400">+{trend.yearlyGrowthPercent}% YoY</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-3 flex justify-end gap-2">
                                  <button
                                    onClick={() => onEditGem(gem)}
                                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
                                  >
                                    Edit Full Cost Sheet
                                  </button>
                                  {gem.status !== 'sold' && (
                                    <button
                                      onClick={() => handleOpenSoldModal(gem)}
                                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-xs transition-colors"
                                    >
                                      Mark as Sold
                                    </button>
                                  )}
                                </div>

                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Aggregate Row */}
        <div className="bg-[#0f172a] px-4 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono-numbers">
          <div className="font-sans text-slate-300 font-semibold">
            Inventory Totals ({sortedGems.length} items):
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div>
              <span className="text-slate-500 mr-1.5 font-sans">Total Carats:</span>
              <span className="text-slate-200 font-bold">
                {sortedGems.reduce((acc, g) => acc + g.cutWeightCts, 0).toFixed(2)} cts
              </span>
            </div>
            <div>
              <span className="text-slate-500 mr-1.5 font-sans">Total Invested Cost:</span>
              <span className="text-cyan-300 font-bold">
                {formatCurrency(
                  sortedGems.reduce((acc, g) => acc + calculateTotalCost(g.costs), 0),
                  currency
                )}
              </span>
            </div>
            <div>
              <span className="text-slate-500 mr-1.5 font-sans">Net P&L:</span>
              <span className="text-emerald-400 font-bold">
                {formatCurrency(
                  sortedGems.reduce((acc, g) => acc + calculateGemMetrics(g).profitOrLoss, 0),
                  currency
                )}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Mark-as-Sold Modal */}
      {soldModalGem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Record Gemstone Sale
              </h3>
              <button
                onClick={() => setSoldModalGem(null)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-slate-100">{soldModalGem.variety} ({soldModalGem.lotNumber})</div>
              <div>Weight: {soldModalGem.cutWeightCts.toFixed(2)} cts · {soldModalGem.shape}</div>
              <div className="text-slate-400">
                Total Invested Cost: <span className="font-mono text-slate-200">{formatCurrency(calculateTotalCost(soldModalGem.costs), currency)}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Actual Realized Sale Price (USD):
                </label>
                <input
                  type="number"
                  value={soldPriceInput}
                  onChange={(e) => setSoldPriceInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Buyer / Client Name (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hong Kong Dealer, Private Salon"
                  value={buyerInput}
                  onChange={(e) => setBuyerInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Instant calculation preview */}
              {parseFloat(soldPriceInput) > 0 && (
                <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 font-mono text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Net Profit / Loss:</span>
                    <span className="text-emerald-400 font-bold">
                      {formatCurrency(parseFloat(soldPriceInput) - calculateTotalCost(soldModalGem.costs), currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Realized ROI:</span>
                    <span className="text-teal-400 font-bold">
                      {formatPercent(
                        ((parseFloat(soldPriceInput) - calculateTotalCost(soldModalGem.costs)) /
                          calculateTotalCost(soldModalGem.costs)) *
                          100
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSoldModalGem(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSold}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs"
              >
                Confirm Sale & Record P&L
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
