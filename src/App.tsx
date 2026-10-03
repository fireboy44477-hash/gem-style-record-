import React, { useState, useEffect } from 'react';
import { GemstoneItem, CurrencyCode, InventoryStatus, GemCostBreakdown } from './types/gem';
import { INITIAL_GEM_INVENTORY } from './data/sampleGems';
import { calculateGemMetrics, calculateTotalCost } from './utils/calculations';
import { TopNav } from './components/TopNav';
import { SummaryMetrics } from './components/SummaryMetrics';
import { GemCostTable } from './components/GemCostTable';
import { CostBreakdownChart } from './components/CostBreakdownChart';
import { ProfitRoiChart } from './components/ProfitRoiChart';
import { MarketTrendsView } from './components/MarketTrendsView';
import { RoiDecisionMatrix } from './components/RoiDecisionMatrix';
import { GemCostModal } from './components/GemCostModal';

const STORAGE_KEY = 'gemmatrix_inventory_v1';
const CURRENCY_KEY = 'gemmatrix_currency_pref';

export default function App() {
  // Load gems from localStorage or fallback to initial gems
  const [gems, setGems] = useState<GemstoneItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_GEM_INVENTORY;
  });

  // Currency
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    try {
      const savedCur = localStorage.getItem(CURRENCY_KEY) as CurrencyCode;
      if (savedCur) return savedCur;
    } catch {
      // ignore
    }
    return 'USD';
  });

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'table' | 'costs' | 'profit_roi' | 'market_trends' | 'decision'>('table');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGem, setEditingGem] = useState<GemstoneItem | null>(null);

  // Toast / notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Persist gems to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gems));
    } catch (e) {
      console.error('Failed to save inventory to storage', e);
    }
  }, [gems]);

  // Persist currency
  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_KEY, currency);
    } catch {
      // ignore
    }
  }, [currency]);

  // Handlers
  const handleSaveGem = (gemToSave: GemstoneItem) => {
    setGems((prev) => {
      const index = prev.findIndex((g) => g.id === gemToSave.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = gemToSave;
        return updated;
      } else {
        return [gemToSave, ...prev];
      }
    });
    showToast(`Saved gemstone ${gemToSave.lotNumber} (${gemToSave.variety})`);
  };

  const handleDeleteGem = (id: string) => {
    setGems((prev) => prev.filter((g) => g.id !== id));
    showToast('Gemstone removed from ledger');
  };

  const handleUpdateGemStatus = (
    id: string,
    newStatus: InventoryStatus,
    soldPrice?: number,
    buyerName?: string
  ) => {
    setGems((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        return {
          ...g,
          status: newStatus,
          actualSoldPrice: soldPrice !== undefined ? soldPrice : g.actualSoldPrice,
          buyerName: buyerName !== undefined ? buyerName : g.buyerName,
          dateSold: newStatus === 'sold' ? (g.dateSold || new Date().toISOString().split('T')[0]) : undefined,
        };
      })
    );
    showToast(`Status updated to ${newStatus}`);
  };

  const handleQuickUpdateCost = (id: string, costKey: keyof GemCostBreakdown, value: number) => {
    setGems((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        return {
          ...g,
          costs: {
            ...g.costs,
            [costKey]: value,
          },
        };
      })
    );
  };

  const handleQuickUpdatePrice = (id: string, targetPrice: number) => {
    setGems((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        return {
          ...g,
          targetSellingPrice: targetPrice,
        };
      })
    );
    showToast('Target asking price updated');
  };

  const handleResetData = () => {
    if (confirm('Reset inventory ledger back to default seed gemstones? Your custom edits will be replaced.')) {
      setGems(INITIAL_GEM_INVENTORY);
      showToast('Inventory reset to sample gems catalog');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Lot Number',
      'Variety',
      'Shape',
      'Origin',
      'Treatment',
      'Clarity',
      'Rough Weight (ct)',
      'Cut Weight (ct)',
      'Yield %',
      'Cert Lab',
      'Cert Number',
      'Rough Purchase ($)',
      'Lapidary Cutting ($)',
      'Heat Treatment ($)',
      'Lab Cert Fee ($)',
      'Customs Duty & Tax ($)',
      'Brokerage Fee ($)',
      'Jewelry Mount ($)',
      'Vault & Shipping ($)',
      'Other Incidentals ($)',
      'Total Cost ($)',
      'Cost Per Carat ($/ct)',
      'Target Asking Price ($)',
      'Actual Sold Price ($)',
      'Net Profit/Loss ($)',
      'ROI %',
      'Status',
      'Buyer',
      'Channel',
      'Date Acquired',
      'Date Sold',
    ];

    const rows = gems.map((g) => {
      const metrics = calculateGemMetrics(g);
      return [
        `"${g.lotNumber}"`,
        `"${g.variety}"`,
        `"${g.shape}"`,
        `"${g.origin}"`,
        `"${g.treatment}"`,
        `"${g.clarity}"`,
        g.roughWeightCts,
        g.cutWeightCts,
        metrics.yieldPercent.toFixed(1),
        `"${g.certLab}"`,
        `"${g.certNumber}"`,
        g.costs.roughPurchase,
        g.costs.lapidaryCutting,
        g.costs.treatmentHeating,
        g.costs.certificationLab,
        g.costs.customsDutyTaxes,
        g.costs.brokerageCommission,
        g.costs.mountingJewelry,
        g.costs.vaultInsuranceLogistics,
        g.costs.otherIncidental,
        metrics.totalCost,
        metrics.costPerCt.toFixed(2),
        g.targetSellingPrice,
        g.actualSoldPrice || 0,
        metrics.profitOrLoss.toFixed(2),
        metrics.roiPercent.toFixed(1),
        `"${g.status}"`,
        `"${g.buyerName || ''}"`,
        `"${g.channel || ''}"`,
        `"${g.dateAcquired}"`,
        `"${g.dateSold || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GemMatrix_Inventory_Costing_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported inventory ledger to CSV');
  };

  const handleOpenEdit = (gem: GemstoneItem) => {
    setEditingGem(gem);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingGem(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      
      {/* 3-Zone Top Bar */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        onOpenNewGemModal={handleOpenNew}
        onResetData={handleResetData}
        onExportCSV={handleExportCSV}
        totalGemsCount={gems.length}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Executive Portfolio KPIs */}
        <SummaryMetrics gems={gems} currency={currency} />

        {/* Dynamic Tab Views */}
        {activeTab === 'table' && (
          <GemCostTable
            gems={gems}
            currency={currency}
            onEditGem={handleOpenEdit}
            onDeleteGem={handleDeleteGem}
            onUpdateGemStatus={handleUpdateGemStatus}
            onQuickUpdateCost={handleQuickUpdateCost}
            onQuickUpdatePrice={handleQuickUpdatePrice}
          />
        )}

        {activeTab === 'costs' && (
          <CostBreakdownChart gems={gems} currency={currency} />
        )}

        {activeTab === 'profit_roi' && (
          <ProfitRoiChart
            gems={gems}
            currency={currency}
            onSelectGem={handleOpenEdit}
          />
        )}

        {activeTab === 'market_trends' && (
          <MarketTrendsView
            gems={gems}
            currency={currency}
            onSelectGem={handleOpenEdit}
          />
        )}

        {activeTab === 'decision' && (
          <RoiDecisionMatrix
            gems={gems}
            currency={currency}
            onSelectGem={handleOpenEdit}
            onUpdateGemPrice={handleQuickUpdatePrice}
          />
        )}

      </main>

      {/* Cost Sheet Edit / Add Modal */}
      <GemCostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveGem}
        initialGem={editingGem}
        currency={currency}
      />

      {/* Floating Action Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/40 text-slate-100 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 backdrop-blur-md animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Subtle Professional Footer */}
      <footer className="border-t border-slate-900 bg-[#090d14] py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GemMatrix · Gemstone Costing & Financial Intelligence System</span>
          <span className="font-mono text-[11px] text-slate-400">
            Multi-Currency: USD · LKR · EUR · GBP · THB · HKD
          </span>
        </div>
      </footer>

    </div>
  );
}
