import React, { useState, useRef } from 'react';
import { GemstoneItem, CurrencyCode } from '../types/gem';
import { calculateGemMetrics, calculateTotalCost } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/currency';
import { getDefaultImageForVariety } from '../assets/gemImages';
import {
  Smartphone,
  Camera,
  Share2,
  Download,
  Gem,
  Award,
  TrendingUp,
  CheckCircle,
  Copy,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface MobileGemCardViewProps {
  gems: GemstoneItem[];
  currency: CurrencyCode;
  onEditGem: (gem: GemstoneItem) => void;
  onSelectGemForPhoto: (gem: GemstoneItem) => void;
}

export const MobileGemCardView: React.FC<MobileGemCardViewProps> = ({
  gems,
  currency,
  onEditGem,
  onSelectGemForPhoto,
}) => {
  const [selectedGemId, setSelectedGemId] = useState<string>(gems[0]?.id || '');
  const [isRecording, setIsRecording] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const selectedGem = gems.find((g) => g.id === selectedGemId) || gems[0];
  const metrics = selectedGem ? calculateGemMetrics(selectedGem) : null;
  const gemImg = selectedGem?.imageUrl || (selectedGem ? getDefaultImageForVariety(selectedGem.variety) : undefined);

  // Generate / Record clean phone chart image onto canvas and download
  const handleRecordPhoneChart = () => {
    if (!selectedGem || !metrics) return;
    setIsRecording(true);

    try {
      const canvas = document.createElement('canvas');
      const width = 720;
      const height = 1280; // Standard 9:16 phone screen
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Dark luxury background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0b132b');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Top Header
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText('GEMMATRIX', 48, 68);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText('GEMSTONE COSTING & VALUATION CERTIFICATE', 48, 96);

      // Card Container
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      roundRect(ctx, 40, 120, width - 80, height - 200, 24);
      ctx.fill();
      ctx.stroke();

      // Title & Lot
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px serif';
      ctx.fillText(selectedGem.variety, 64, 180);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`LOT #${selectedGem.lotNumber} · ${selectedGem.shape}`, 64, 215);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillText(`${selectedGem.origin} · ${selectedGem.treatment}`, 64, 245);

      // Divider
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(64, 270);
      ctx.lineTo(width - 64, 270);
      ctx.stroke();

      // Key Metrics Grid
      const yStart = 310;
      drawMetric(ctx, 'CUT WEIGHT', `${selectedGem.cutWeightCts.toFixed(2)} cts`, 64, yStart, '#38bdf8');
      drawMetric(ctx, 'TOTAL COST', formatCurrency(metrics.totalCost, currency), 260, yStart, '#e2e8f0');
      drawMetric(ctx, 'ASK PRICE', formatCurrency(metrics.effectiveRevenue, currency), 460, yStart, '#34d399');

      drawMetric(ctx, 'COST / CT', `${formatCurrency(metrics.costPerCt, currency)}/ct`, 64, yStart + 80, '#94a3b8');
      drawMetric(ctx, 'PROFIT / LOSS', formatCurrency(metrics.profitOrLoss, currency), 260, yStart + 80, '#34d399');
      drawMetric(ctx, 'NET ROI', formatPercent(metrics.roiPercent), 460, yStart + 80, '#38bdf8');

      // Cost Breakdown Section
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillText('ITEMIZED COST BREAKDOWN', 64, 520);

      const costs = [
        { label: '1. Rough / Base Purchase', val: selectedGem.costs.roughPurchase },
        { label: '2. Lapidary Faceting & Preform', val: selectedGem.costs.lapidaryCutting },
        { label: '3. Thermal Furnace Treatment', val: selectedGem.costs.treatmentHeating },
        { label: '4. Lab Testing & Certificate', val: selectedGem.costs.certificationLab },
        { label: '5. Customs Duties & Pit Taxes', val: selectedGem.costs.customsDutyTaxes },
        { label: '6. Brokerage & Dalal Fee', val: selectedGem.costs.brokerageCommission },
        { label: '7. Vault Transit & Security', val: selectedGem.costs.vaultInsuranceLogistics },
      ];

      costs.forEach((c, idx) => {
        const rowY = 560 + idx * 36;
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillText(c.label, 64, rowY);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(formatCurrency(c.val, currency), width - 64, rowY);
        ctx.textAlign = 'left';
      });

      // Status Badge
      ctx.fillStyle = selectedGem.status === 'sold' ? '#065f46' : '#082f49';
      roundRect(ctx, 64, 840, width - 128, 60, 16);
      ctx.fill();

      ctx.fillStyle = selectedGem.status === 'sold' ? '#34d399' : '#38bdf8';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        `STATUS: ${selectedGem.status.toUpperCase()} · ${selectedGem.certLab} #${selectedGem.certNumber || 'VERIFIED'}`,
        width / 2,
        877
      );
      ctx.textAlign = 'left';

      // Footer
      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(`Recorded on ${new Date().toLocaleDateString()} · GemMatrix Mobile System`, 64, 1140);

      // Download as PNG
      const link = document.createElement('a');
      link.download = `GemMatrix_${selectedGem.lotNumber}_PhoneChart.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Record canvas error:', err);
    } finally {
      setIsRecording(false);
    }
  };

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawMetric(
    ctx: CanvasRenderingContext2D,
    label: string,
    val: string,
    x: number,
    y: number,
    color: string
  ) {
    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(label, x, y);

    ctx.fillStyle = color;
    ctx.font = 'bold 20px monospace';
    ctx.fillText(val, x, y + 26);
  }

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              Clean Mobile Chart & Gem Snapshot Record
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Phone-optimized portrait view with gemstone photography. Save or record as a shareable phone card.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRecordPhoneChart}
              disabled={isRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold rounded-lg text-xs transition active:scale-95 shadow-md"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isRecording ? 'Generating Card...' : 'Save Clean Phone Chart'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split: Left Selector / Thumbnails, Right: The Phone Card Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 4 Cols: Gemstone Selector for Mobile */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Select Gemstone ({gems.length})
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {gems.map((gem) => {
              const m = calculateGemMetrics(gem);
              const img = gem.imageUrl || getDefaultImageForVariety(gem.variety);
              const isSelected = gem.id === selectedGemId;

              return (
                <div
                  key={gem.id}
                  onClick={() => setSelectedGemId(gem.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Photo Thumbnail */}
                  <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700/80 overflow-hidden shrink-0 relative flex items-center justify-center">
                    {img ? (
                      <img src={img} alt={gem.variety} className="w-full h-full object-cover" />
                    ) : (
                      <Gem className="w-5 h-5 text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-xs">
                    <div className="font-semibold text-slate-100 truncate">{gem.variety}</div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                      <span>{gem.lotNumber}</span>
                      <span>·</span>
                      <span>{gem.cutWeightCts.toFixed(2)}ct</span>
                    </div>
                  </div>

                  <div className="text-right font-mono-numbers shrink-0 text-xs">
                    <div className="font-bold text-slate-200">
                      {formatCurrency(m.totalCost, currency)}
                    </div>
                    <div
                      className={`text-[11px] font-bold ${
                        m.profitOrLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatPercent(m.roiPercent)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: The Clean Phone Card Preview (Mobile Sized Frame) */}
        <div className="lg:col-span-8 flex justify-center">
          
          {selectedGem && metrics ? (
            <div
              ref={cardRef}
              className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#020617] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden"
            >
              {/* Phone Status / Brand Bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2.5">
                <span className="font-mono text-cyan-400 tracking-wider font-bold">GEMMATRIX MOBILE</span>
                <span>LOT #{selectedGem.lotNumber}</span>
              </div>

              {/* Gemstone Picture & Badges */}
              <div className="relative w-full aspect-square max-h-56 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
                {gemImg ? (
                  <img
                    src={gemImg}
                    alt={selectedGem.variety}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                    <Gem className="w-10 h-10 text-cyan-500/40" />
                    <span className="text-xs">No picture added yet</span>
                  </div>
                )}

                {/* Picture Upload / Camera trigger */}
                <button
                  onClick={() => onSelectGemForPhoto(selectedGem)}
                  className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 bg-black/70 hover:bg-black/90 backdrop-blur-md text-white text-[11px] font-medium rounded-lg border border-slate-700 transition"
                  title="Upload or capture picture"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Change Photo</span>
                </button>

                {/* Status pill on photo */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[10px] font-mono uppercase tracking-wider text-slate-200 border border-slate-700">
                  {selectedGem.status}
                </div>
              </div>

              {/* Gem Specs Header */}
              <div>
                <h3 className="text-xl font-bold font-display text-slate-100">{selectedGem.variety}</h3>
                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span className="text-slate-300 font-medium">{selectedGem.shape}</span>
                  <span>·</span>
                  <span>{selectedGem.origin}</span>
                  <span>·</span>
                  <span>{selectedGem.treatment}</span>
                </div>
              </div>

              {/* 3 Key Financial Numbers (Phone Grid) */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 font-mono-numbers text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Weight</span>
                  <span className="text-sm sm:text-base font-bold text-slate-100">
                    {selectedGem.cutWeightCts.toFixed(2)} <span className="text-[10px] text-slate-400">ct</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Total Cost</span>
                  <span className="text-sm sm:text-base font-bold text-slate-200">
                    {formatCurrency(metrics.totalCost, currency, true)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Return (ROI)</span>
                  <span
                    className={`text-sm sm:text-base font-bold ${
                      metrics.roiPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatPercent(metrics.roiPercent)}
                  </span>
                </div>
              </div>

              {/* Clean Cost Breakdown Bars */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300 font-semibold mb-1">
                  <span>Expense Breakdown</span>
                  <span className="font-mono text-cyan-400">
                    {formatCurrency(metrics.totalCost, currency)}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Rough Buy:</span>
                    <span>{formatCurrency(selectedGem.costs.roughPurchase, currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Lapidary Cutting:</span>
                    <span>{formatCurrency(selectedGem.costs.lapidaryCutting, currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Heat Treatment:</span>
                    <span>{formatCurrency(selectedGem.costs.treatmentHeating, currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Lab Cert ({selectedGem.certLab || 'Testing'}):</span>
                    <span>{formatCurrency(selectedGem.costs.certificationLab, currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Duty / Taxes / Cess:</span>
                    <span>{formatCurrency(selectedGem.costs.customsDutyTaxes, currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Brokerage / Logistics:</span>
                    <span>
                      {formatCurrency(
                        (selectedGem.costs.brokerageCommission || 0) +
                          (selectedGem.costs.vaultInsuranceLogistics || 0),
                        currency
                      )}
                    </span>
                  </div>
                </div>

                {/* Profit Bar */}
                <div className="pt-2 mt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Net Profit / Gain:</span>
                  <span
                    className={`font-mono font-bold ${
                      metrics.profitOrLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatCurrency(metrics.profitOrLoss, currency)}
                  </span>
                </div>
              </div>

              {/* Card Action Controls */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleRecordPhoneChart}
                  className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Clean Image</span>
                </button>
                <button
                  onClick={() => onEditGem(selectedGem)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition"
                >
                  Edit Sheet
                </button>
              </div>

            </div>
          ) : null}

        </div>

      </div>

    </div>
  );
};
