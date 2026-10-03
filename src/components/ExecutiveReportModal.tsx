import React, { useState } from 'react';
import { GemstoneItem, CurrencyCode } from '../types/gem';
import { calculateGemMetrics, calculatePortfolioSummary, calculateTotalCost } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/currency';
import { Printer, Download, X, FileText, Check, ShieldCheck, Gem } from 'lucide-react';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  gems: GemstoneItem[];
  currency: CurrencyCode;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  gems,
  currency,
}) => {
  const [reportTitle, setReportTitle] = useState('GemMatrix Inventory & Valuation Audit');
  const [companyName, setCompanyName] = useState('Gems & Pearl Lanka · International Lapidary & Trade');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_stock' | 'sold'>('all');
  const [includePhotos, setIncludePhotos] = useState(true);

  if (!isOpen) return null;

  const filteredGems = gems.filter((g) => {
    if (filterStatus === 'in_stock') return g.status !== 'sold';
    if (filterStatus === 'sold') return g.status === 'sold';
    return true;
  });

  const summary = calculatePortfolioSummary(filteredGems);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      
      {/* Outer Modal Container */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Controls Bar (Hidden during printing) */}
        <div className="px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Executive PDF Inventory Report</h2>
              <p className="text-[11px] text-slate-400">Printable valuation summary and audited financial ledger</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Inventory ({gems.length})</option>
              <option value="in_stock">In Stock / Vault Only</option>
              <option value="sold">Sold & Realized Only</option>
            </select>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold rounded-lg text-xs transition shadow-md cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-slate-900 font-sans print:p-0 print:overflow-visible print:bg-white print:text-black">
          
          {/* Printable Document Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">
                  OFFICIAL VALUATION & AUDIT REPORT
                </span>
                <h1 className="text-2xl font-bold font-serif text-slate-950 tracking-tight">
                  {reportTitle}
                </h1>
                <div className="text-xs text-slate-600 mt-1 font-medium">
                  {companyName}
                </div>
              </div>

              <div className="text-right font-mono text-xs text-slate-600 space-y-1">
                <div>Date: <strong className="text-slate-900">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></div>
                <div>Report Ref: <strong className="text-slate-900 font-mono">GM-REP-{Date.now().toString().slice(-6)}</strong></div>
                <div>Currency: <strong className="text-slate-900">{currency}</strong></div>
              </div>
            </div>
          </div>

          {/* Executive KPI Summary Grid (Printable) */}
          <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Total Invested Cost</span>
              <span className="text-lg font-bold font-mono text-slate-900">
                {formatCurrency(summary.totalCost, currency)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Avg: {formatCurrency(summary.avgCostPerCt, currency)}/ct
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Total Catalog Value</span>
              <span className="text-lg font-bold font-mono text-slate-900">
                {formatCurrency(summary.totalTargetValue, currency)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Asking & Sold
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Total Net Profit</span>
              <span className="text-lg font-bold font-mono text-emerald-700">
                {formatCurrency(summary.totalRealizedProfit + summary.totalProjectedProfit, currency)}
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5 font-bold">
                {formatPercent(summary.overallRoiPercent)} Avg ROI
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Total Weight</span>
              <span className="text-lg font-bold font-mono text-slate-900">
                {summary.totalCutCarats.toFixed(2)} cts
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {summary.totalGemsCount} total lots
              </span>
            </div>
          </div>

          {/* Detailed Gemstone Inventory Ledger Table */}
          <div className="mb-6 overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-300 pb-1">
              Gemstone Inventory & Cost Ledger ({filteredGems.length} Lots)
            </h3>

            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-800 uppercase font-semibold text-[10px]">
                  <th className="py-2 px-1">Lot #</th>
                  <th className="py-2 px-1">Gem Variety & Cut</th>
                  <th className="py-2 px-1">Origin</th>
                  <th className="py-2 px-1 text-right">Cut (ct)</th>
                  <th className="py-2 px-1 text-right">Rough Buy</th>
                  <th className="py-2 px-1 text-right">Lapidary/Fee</th>
                  <th className="py-2 px-1 text-right">Total Cost</th>
                  <th className="py-2 px-1 text-right">Cost/ct</th>
                  <th className="py-2 px-1 text-right">Selling Price</th>
                  <th className="py-2 px-1 text-right">Net Profit</th>
                  <th className="py-2 px-1 text-right">ROI %</th>
                  <th className="py-2 px-1 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[10px]">
                {filteredGems.map((gem) => {
                  const m = calculateGemMetrics(gem);
                  const otherCosts = 
                    (gem.costs.treatmentHeating || 0) +
                    (gem.costs.certificationLab || 0) +
                    (gem.costs.customsDutyTaxes || 0) +
                    (gem.costs.brokerageCommission || 0) +
                    (gem.costs.vaultInsuranceLogistics || 0);

                  return (
                    <tr key={gem.id} className="hover:bg-slate-50">
                      <td className="py-2 px-1 font-bold text-slate-900">{gem.lotNumber}</td>
                      <td className="py-2 px-1 font-sans">
                        <span className="font-semibold text-slate-900">{gem.variety}</span>
                        <span className="text-slate-500 block text-[9px]">{gem.shape} · {gem.treatment}</span>
                      </td>
                      <td className="py-2 px-1 font-sans text-slate-700">{gem.origin}</td>
                      <td className="py-2 px-1 text-right font-bold text-slate-900">{gem.cutWeightCts.toFixed(2)}</td>
                      <td className="py-2 px-1 text-right text-slate-700">{formatCurrency(gem.costs.roughPurchase, currency)}</td>
                      <td className="py-2 px-1 text-right text-slate-600">
                        {formatCurrency(gem.costs.lapidaryCutting + otherCosts, currency)}
                      </td>
                      <td className="py-2 px-1 text-right font-bold text-slate-900">{formatCurrency(m.totalCost, currency)}</td>
                      <td className="py-2 px-1 text-right text-slate-700">{formatCurrency(m.costPerCt, currency)}</td>
                      <td className="py-2 px-1 text-right font-medium text-slate-900">
                        {formatCurrency(m.effectiveRevenue, currency)}
                      </td>
                      <td className="py-2 px-1 text-right font-bold text-emerald-700">
                        {formatCurrency(m.profitOrLoss, currency)}
                      </td>
                      <td className="py-2 px-1 text-right font-bold text-slate-900">
                        {formatPercent(m.roiPercent)}
                      </td>
                      <td className="py-2 px-1 text-center font-sans text-[9px] uppercase font-semibold">
                        <span className={gem.status === 'sold' ? 'text-emerald-700' : 'text-cyan-800'}>
                          {gem.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 font-mono font-bold text-slate-900 text-[11px] bg-slate-50">
                  <td colSpan={3} className="py-2 px-1 font-sans uppercase">Inventory Totals:</td>
                  <td className="py-2 px-1 text-right">{summary.totalCutCarats.toFixed(2)} ct</td>
                  <td colSpan={2}></td>
                  <td className="py-2 px-1 text-right text-slate-950 font-bold">
                    {formatCurrency(summary.totalCost, currency)}
                  </td>
                  <td className="py-2 px-1 text-right">
                    {formatCurrency(summary.avgCostPerCt, currency)}/ct
                  </td>
                  <td className="py-2 px-1 text-right">
                    {formatCurrency(summary.totalTargetValue, currency)}
                  </td>
                  <td className="py-2 px-1 text-right text-emerald-800 font-bold">
                    {formatCurrency(summary.totalRealizedProfit + summary.totalProjectedProfit, currency)}
                  </td>
                  <td className="py-2 px-1 text-right">
                    {formatPercent(summary.overallRoiPercent)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signature & Gemological Audit Certification Lines */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-700">
            <div>
              <span className="font-semibold text-slate-900 block mb-1">Gemological Auditor / Vault Custodian</span>
              <div className="border-b border-slate-400 w-52 h-10 mb-1"></div>
              <span className="text-[10px] text-slate-500">Authorized Signature & Seal</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-slate-900 block mb-1">Managing Director / Partner</span>
              <div className="border-b border-slate-400 w-52 h-10 ml-auto mb-1"></div>
              <span className="text-[10px] text-slate-500">Approved for Settlement & Insurance</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
