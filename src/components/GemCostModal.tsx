import React, { useState, useEffect } from 'react';
import { GemstoneItem, GemstoneType, CutShape, GemTreatment, ClarityGrade, InventoryStatus, CurrencyCode } from '../types/gem';
import { calculateTotalCost } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/currency';
import { GEM_MARKET_TRENDS } from '../data/marketTrends';
import { Gem, Calculator, Sparkles, X, Check, AlertCircle } from 'lucide-react';

interface GemCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gem: GemstoneItem) => void;
  initialGem?: GemstoneItem | null;
  currency: CurrencyCode;
}

const DEFAULT_VARIETIES: GemstoneType[] = [
  'Royal Blue Sapphire',
  'Cornflower Sapphire',
  'Padparadscha Sapphire',
  'Yellow Sapphire',
  'Star Sapphire',
  'Pigeon Blood Ruby',
  'Colombian Emerald',
  'Cobalt Spinel',
  'Alexandrite',
  'Cat\'s Eye Chrysoberyl',
  'Tsavorite Garnet',
  'Paraiba Tourmaline',
  'Aquamarine',
  'Other Variety',
];

const DEFAULT_SHAPES: CutShape[] = [
  'Cushion',
  'Oval',
  'Emerald Cut',
  'Round Brilliant',
  'Pear',
  'Sugarloaf Cabochon',
  'Radiant',
  'Trilliant',
  'Marquise',
];

export const GemCostModal: React.FC<GemCostModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGem,
  currency,
}) => {
  // Form State
  const [lotNumber, setLotNumber] = useState('');
  const [variety, setVariety] = useState<GemstoneType>('Royal Blue Sapphire');
  const [shape, setShape] = useState<CutShape>('Cushion');
  const [origin, setOrigin] = useState('Sri Lanka (Ratnapura)');
  const [treatment, setTreatment] = useState<GemTreatment>('Natural Unheated (No Treatment)');
  const [clarity, setClarity] = useState<ClarityGrade>('Eye Clean (VS)');
  const [colorDescription, setColorDescription] = useState('Vivid Royal Blue');
  const [dimensions, setDimensions] = useState('');
  const [roughWeightCts, setRoughWeightCts] = useState<string>('0');
  const [cutWeightCts, setCutWeightCts] = useState<string>('3.00');
  const [certLab, setCertLab] = useState('GIA / SSEF');
  const [certNumber, setCertNumber] = useState('');
  const [status, setStatus] = useState<InventoryStatus>('in_stock');
  const [targetSellingPrice, setTargetSellingPrice] = useState<string>('12000');
  const [actualSoldPrice, setActualSoldPrice] = useState<string>('0');
  const [buyerName, setBuyerName] = useState('');
  const [channel, setChannel] = useState('');
  const [dateAcquired, setDateAcquired] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // 9 Types of Costs State
  const [costRoughPurchase, setCostRoughPurchase] = useState<string>('6000');
  const [costLapidaryCutting, setCostLapidaryCutting] = useState<string>('300');
  const [costTreatmentHeating, setCostTreatmentHeating] = useState<string>('0');
  const [costCertificationLab, setCostCertificationLab] = useState<string>('500');
  const [costCustomsDutyTaxes, setCostCustomsDutyTaxes] = useState<string>('250');
  const [costBrokerageCommission, setCostBrokerageCommission] = useState<string>('400');
  const [costMountingJewelry, setCostMountingJewelry] = useState<string>('0');
  const [costVaultInsuranceLogistics, setCostVaultInsuranceLogistics] = useState<string>('180');
  const [costOtherIncidental, setCostOtherIncidental] = useState<string>('70');

  useEffect(() => {
    if (initialGem) {
      setLotNumber(initialGem.lotNumber);
      setVariety(initialGem.variety);
      setShape(initialGem.shape);
      setOrigin(initialGem.origin);
      setTreatment(initialGem.treatment);
      setClarity(initialGem.clarity);
      setColorDescription(initialGem.colorDescription);
      setDimensions(initialGem.dimensions);
      setRoughWeightCts(initialGem.roughWeightCts.toString());
      setCutWeightCts(initialGem.cutWeightCts.toString());
      setCertLab(initialGem.certLab);
      setCertNumber(initialGem.certNumber);
      setStatus(initialGem.status);
      setTargetSellingPrice(initialGem.targetSellingPrice.toString());
      setActualSoldPrice(initialGem.actualSoldPrice ? initialGem.actualSoldPrice.toString() : '0');
      setBuyerName(initialGem.buyerName || '');
      setChannel(initialGem.channel || '');
      setDateAcquired(initialGem.dateAcquired);
      setNotes(initialGem.notes || '');

      setCostRoughPurchase(initialGem.costs.roughPurchase.toString());
      setCostLapidaryCutting(initialGem.costs.lapidaryCutting.toString());
      setCostTreatmentHeating(initialGem.costs.treatmentHeating.toString());
      setCostCertificationLab(initialGem.costs.certificationLab.toString());
      setCostCustomsDutyTaxes(initialGem.costs.customsDutyTaxes.toString());
      setCostBrokerageCommission(initialGem.costs.brokerageCommission.toString());
      setCostMountingJewelry(initialGem.costs.mountingJewelry.toString());
      setCostVaultInsuranceLogistics(initialGem.costs.vaultInsuranceLogistics.toString());
      setCostOtherIncidental(initialGem.costs.otherIncidental.toString());
    } else {
      // New item default
      const randomLot = `GEM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      setLotNumber(randomLot);
      setCostRoughPurchase('5000');
      setCostLapidaryCutting('300');
      setCostTreatmentHeating('0');
      setCostCertificationLab('450');
      setCostCustomsDutyTaxes('200');
      setCostBrokerageCommission('350');
      setCostMountingJewelry('0');
      setCostVaultInsuranceLogistics('150');
      setCostOtherIncidental('50');
      setTargetSellingPrice('11500');
      setActualSoldPrice('0');
      setCutWeightCts('2.50');
      setRoughWeightCts('5.20');
      setStatus('in_stock');
    }
  }, [initialGem, isOpen]);

  if (!isOpen) return null;

  // Numeric parsing
  const parsedCosts = {
    roughPurchase: parseFloat(costRoughPurchase) || 0,
    lapidaryCutting: parseFloat(costLapidaryCutting) || 0,
    treatmentHeating: parseFloat(costTreatmentHeating) || 0,
    certificationLab: parseFloat(costCertificationLab) || 0,
    customsDutyTaxes: parseFloat(costCustomsDutyTaxes) || 0,
    brokerageCommission: parseFloat(costBrokerageCommission) || 0,
    mountingJewelry: parseFloat(costMountingJewelry) || 0,
    vaultInsuranceLogistics: parseFloat(costVaultInsuranceLogistics) || 0,
    otherIncidental: parseFloat(costOtherIncidental) || 0,
  };

  const totalCost = calculateTotalCost(parsedCosts);
  const cutCts = parseFloat(cutWeightCts) || 0;
  const roughCts = parseFloat(roughWeightCts) || 0;
  const yieldPct = roughCts > 0 && cutCts > 0 ? (cutCts / roughCts) * 100 : 0;
  const costPerCarat = cutCts > 0 ? totalCost / cutCts : 0;

  const targetPrice = parseFloat(targetSellingPrice) || 0;
  const actualPrice = parseFloat(actualSoldPrice) || 0;
  const effectivePrice = status === 'sold' && actualPrice > 0 ? actualPrice : targetPrice;

  const netProfitOrLoss = effectivePrice - totalCost;
  const profitMargin = effectivePrice > 0 ? (netProfitOrLoss / effectivePrice) * 100 : 0;
  const roiPercent = totalCost > 0 ? (netProfitOrLoss / totalCost) * 100 : 0;

  // Market benchmark
  const marketTrend = GEM_MARKET_TRENDS.find((t) => t.variety === variety);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const gemstoneToSave: GemstoneItem = {
      id: initialGem ? initialGem.id : `gem-${Date.now()}`,
      lotNumber: lotNumber.trim() || `GEM-${Date.now().toString().slice(-4)}`,
      variety,
      shape,
      origin: origin.trim(),
      treatment,
      clarity,
      colorDescription: colorDescription.trim(),
      dimensions: dimensions.trim(),
      roughWeightCts: roughCts,
      cutWeightCts: Math.max(0.01, cutCts),
      certLab: certLab.trim(),
      certNumber: certNumber.trim(),
      costs: parsedCosts,
      targetSellingPrice: targetPrice,
      actualSoldPrice: status === 'sold' ? actualPrice : 0,
      status,
      buyerName: buyerName.trim(),
      channel: channel.trim(),
      dateAcquired,
      notes: notes.trim(),
    };

    onSave(gemstoneToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Gem className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                {initialGem ? `Edit Cost Sheet: ${initialGem.lotNumber}` : 'New Gemstone Inventory Cost Sheet'}
              </h2>
              <p className="text-xs text-slate-400">
                Itemize all direct and indirect expenses, compute break-even cost and projected ROI.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets for New Gem */}
        {!initialGem && (
          <div className="px-6 py-2 bg-slate-950/90 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 text-[11px] whitespace-nowrap font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Quick Templates:
            </span>
            <button
              type="button"
              onClick={() => {
                setVariety('Royal Blue Sapphire');
                setOrigin('Sri Lanka (Ratnapura)');
                setShape('Cushion');
                setTreatment('Natural Unheated (No Treatment)');
                setClarity('Eye Clean (VS)');
                setColorDescription('Vivid Royal Blue');
                setCutWeightCts('3.50');
                setRoughWeightCts('7.80');
                setCostRoughPurchase('8500');
                setCostLapidaryCutting('350');
                setCostTreatmentHeating('0');
                setCostCertificationLab('650');
                setCostCustomsDutyTaxes('300');
                setCostBrokerageCommission('450');
                setCostVaultInsuranceLogistics('200');
                setCostOtherIncidental('80');
                setTargetSellingPrice('18500');
                setCertLab('SSEF / GIA');
              }}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors"
            >
              Ceylon Royal Blue 3.5ct
            </button>
            <button
              type="button"
              onClick={() => {
                setVariety('Padparadscha Sapphire');
                setOrigin('Sri Lanka (Elahera)');
                setShape('Oval');
                setTreatment('Natural Unheated (No Treatment)');
                setClarity('Loupe Clean (IF/VVS)');
                setColorDescription('Sunset Pinkish-Orange Lotus');
                setCutWeightCts('2.20');
                setRoughWeightCts('4.90');
                setCostRoughPurchase('7200');
                setCostLapidaryCutting('300');
                setCostTreatmentHeating('0');
                setCostCertificationLab('700');
                setCostCustomsDutyTaxes('260');
                setCostBrokerageCommission('380');
                setCostVaultInsuranceLogistics('160');
                setCostOtherIncidental('90');
                setTargetSellingPrice('16000');
                setCertLab('Gübelin');
              }}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors"
            >
              Ceylon Padparadscha 2.2ct
            </button>
            <button
              type="button"
              onClick={() => {
                setVariety('Pigeon Blood Ruby');
                setOrigin('Burma (Mogok Valley)');
                setShape('Cushion');
                setTreatment('Traditional Heat Only');
                setClarity('Eye Clean (VS)');
                setColorDescription('Vivid Pigeon Blood Red');
                setCutWeightCts('1.60');
                setRoughWeightCts('0');
                setCostRoughPurchase('6000');
                setCostLapidaryCutting('250');
                setCostTreatmentHeating('280');
                setCostCertificationLab('450');
                setCostCustomsDutyTaxes('220');
                setCostBrokerageCommission('320');
                setCostVaultInsuranceLogistics('150');
                setCostOtherIncidental('60');
                setTargetSellingPrice('12800');
                setCertLab('GRS');
              }}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors"
            >
              Burma Ruby 1.6ct
            </button>
            <button
              type="button"
              onClick={() => {
                setVariety('Colombian Emerald');
                setOrigin('Colombia (Muzo Mine)');
                setShape('Emerald Cut');
                setTreatment('Minor Oil (Emerald)');
                setClarity('Eye Clean (VS)');
                setColorDescription('Deep Muzo Green');
                setCutWeightCts('2.80');
                setRoughWeightCts('6.20');
                setCostRoughPurchase('9500');
                setCostLapidaryCutting('400');
                setCostTreatmentHeating('0');
                setCostCertificationLab('550');
                setCostCustomsDutyTaxes('380');
                setCostBrokerageCommission('500');
                setCostVaultInsuranceLogistics('210');
                setCostOtherIncidental('100');
                setTargetSellingPrice('21000');
                setCertLab('CDTEC');
              }}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors"
            >
              Muzo Emerald 2.8ct
            </button>
          </div>
        )}

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* SECTION 1: Gem Identification & Spec */}
          <div>
            <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">
              1. Gemstone Spec & Provenance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              
              <div>
                <label className="block text-slate-300 font-medium mb-1">Lot / Reference #</label>
                <input
                  type="text"
                  required
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Gemstone Variety</label>
                <select
                  value={variety}
                  onChange={(e) => setVariety(e.target.value as GemstoneType)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {DEFAULT_VARIETIES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Cut & Facet Shape</label>
                <select
                  value={shape}
                  onChange={(e) => setShape(e.target.value as CutShape)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {DEFAULT_SHAPES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Origin / Mining Region</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Sri Lanka (Ratnapura)"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Treatment Status</label>
                <select
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value as GemTreatment)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Natural Unheated (No Treatment)">Natural Unheated (No Treatment)</option>
                  <option value="Traditional Heat Only">Traditional Heat Only</option>
                  <option value="Minor Oil (Emerald)">Minor Oil (Emerald)</option>
                  <option value="Treated">Treated</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Clarity Grade</label>
                <select
                  value={clarity}
                  onChange={(e) => setClarity(e.target.value as ClarityGrade)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Loupe Clean (IF/VVS)">Loupe Clean (IF/VVS)</option>
                  <option value="Eye Clean (VS)">Eye Clean (VS)</option>
                  <option value="Slightly Included (SI)">Slightly Included (SI)</option>
                  <option value="Included">Included</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Finished Cut Weight (cts)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cutWeightCts}
                  onChange={(e) => setCutWeightCts(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-cyan-500/50 rounded-lg text-slate-100 font-mono font-bold focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Rough Weight (cts) <span className="text-slate-500">(0 if cut)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={roughWeightCts}
                  onChange={(e) => setRoughWeightCts(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
                {yieldPct > 0 && (
                  <span className="text-[10px] text-cyan-400 font-mono mt-0.5 block">
                    Yield: {yieldPct.toFixed(1)}% recovery
                  </span>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Color Description</label>
                <input
                  type="text"
                  value={colorDescription}
                  onChange={(e) => setColorDescription(e.target.value)}
                  placeholder="e.g. Vivid Royal Blue, Sunset Lotus"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Dimensions (mm)</label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 8.5 x 7.2 x 4.8 mm"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Testing Lab / Certificate</label>
                <input
                  type="text"
                  value={certLab}
                  onChange={(e) => setCertLab(e.target.value)}
                  placeholder="e.g. GIA, Gübelin, SSEF, NGJA"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Certificate #</label>
                <input
                  type="text"
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value)}
                  placeholder="e.g. GIA-22340182"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

            </div>
          </div>

          {/* SECTION 2: All 9 Types of Costs (The Core Costing Breakdown) */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                2. Itemized Gemstone Cost Breakdown (All Expense Types)
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Base Currency: <strong className="text-cyan-300 font-bold">USD ($)</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              
              {/* Cost 1: Rough / Base Purchase */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <label className="block font-medium text-slate-200 mb-1">
                  1. Rough / Base Purchase
                </label>
                <span className="text-[10px] text-slate-400 block mb-1.5">
                  Pit price, rough lot allocation or preformed raw buy
                </span>
                <input
                  type="number"
                  step="1"
                  value={costRoughPurchase}
                  onChange={(e) => setCostRoughPurchase(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Cost 2: Lapidary Faceting & Cutting */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <label className="block font-medium text-slate-200 mb-1">
                  2. Lapidary Faceting & Cutting
                </label>
                <span className="text-[10px] text-slate-400 block mb-1.5">
                  Preforming, master faceting, recutting & polishing
                </span>
                <input
                  type="number"
                  step="1"
                  value={costLapidaryCutting}
                  onChange={(e) => setCostLapidaryCutting(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Cost 3: Heating & Thermal Treatment */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <label className="block font-medium text-slate-200 mb-1">
                  3. Heating / Treatment Furnace
                </label>
                <span className="text-[10px] text-slate-400 block mb-1.5">
                  Thermal blowpipe, electric furnace, flux treatment (0 if unheated)
                </span>
                <input
                  type="number"
                  step="1"
                  value={costTreatmentHeating}
                  onChange={(e) => setCostTreatmentHeating(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Cost 4: Lab Testing & Certification */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <label className="block font-medium text-slate-200 mb-1">
                  4. Lab Testing & Cert Fee
                </label>
                <span className="text-[10px] text-slate-400 block mb-1.5">
                  GIA / Gübelin / SSEF / GRS / NGJA origin report
                </span>
                <input
                  type="number"
                  step="1"
                  value={costCertificationLab}
                  onChange={(e) => setCostCertificationLab(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Cost 5: Customs Duty & Taxes */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <label className="block font-medium text-slate-200 mb-1">
                  5. Customs Duties, Cess & Taxes
                </label>
                <span className="text-[10px] text-slate-400 block mb-1.5">
                  Export gem cess, government mining royalty, import duties
                </span>
                <input
                  type="number"
                  step="1"
                  value={costCustomsDutyTaxes}
                  onChange={(e) => setCostCustomsDutyTaxes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Cost 6: Brokerage Commission */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <label className="block font-medium text-slate-200 mb-1">
                  6. Brokerage / Dalal Commission
                </label>
                <span className="text-[10px] text-slate-400 block mb-1.5">
                  Pit broker %, auction house commission, finder fee
                </span>
                <input
                  type="number"
                  step="1"
                  value={costBrokerageCommission}
                  onChange={(e) => setCostBrokerageCommission(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Cost 7: Mounting & Jewelry Setting */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <label className="block font-medium text-slate-200 mb-1">
                  7. Jewelry Mounting & Diamonds
                </label>
                <span className="text-[10px] text-slate-400 block mb-1.5">
                  18k/Pt gold mount, accent side diamonds, bench setter
                </span>
                <input
                  type="number"
                  step="1"
                  value={costMountingJewelry}
                  onChange={(e) => setCostMountingJewelry(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Cost 8: Vault & Transit Logistics */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <label className="block font-medium text-slate-200 mb-1">
                  8. Vault, Courier & Insurance
                </label>
                <span className="text-[10px] text-slate-400 block mb-1.5">
                  Brinks / Malca-Amit transit, bonded storage vault
                </span>
                <input
                  type="number"
                  step="1"
                  value={costVaultInsuranceLogistics}
                  onChange={(e) => setCostVaultInsuranceLogistics(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Cost 9: Other Incidentals */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <label className="block font-medium text-slate-200 mb-1">
                  9. Photography & Misc Incidentals
                </label>
                <span className="text-[10px] text-slate-400 block mb-1.5">
                  Macro photography, appraisal report, gem box
                </span>
                <input
                  type="number"
                  step="1"
                  value={costOtherIncidental}
                  onChange={(e) => setCostOtherIncidental(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

            </div>
          </div>

          {/* SECTION 3: Sales Target, Realized Price & Status */}
          <div className="pt-2 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">
              3. Sales Pricing, Custody & Realization
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Asking Price ($)</label>
                <input
                  type="number"
                  step="1"
                  value={targetSellingPrice}
                  onChange={(e) => setTargetSellingPrice(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Inventory Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as InventoryStatus)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="in_stock">In Stock (Vault)</option>
                  <option value="on_memo">On Consignment (Memo)</option>
                  <option value="reserved">Reserved / Deposit Paid</option>
                  <option value="sold">Sold & Closed</option>
                </select>
              </div>

              {status === 'sold' && (
                <div>
                  <label className="block text-emerald-400 font-medium mb-1">Actual Sold Price ($)</label>
                  <input
                    type="number"
                    step="1"
                    value={actualSoldPrice}
                    onChange={(e) => setActualSoldPrice(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-emerald-500/80 rounded-lg text-emerald-300 font-mono font-bold focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">Buyer / Memo Partner</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Geneva Dealer, Private Salon"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Trade Channel</label>
                <input
                  type="text"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  placeholder="e.g. Hong Kong Fair, Direct Wholesale"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

            </div>

            <div className="mt-3">
              <label className="block text-slate-300 font-medium mb-1 text-xs">Internal Gem Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter cutting observation, crystal transparency, client inquiries, or special characteristics..."
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* LIVE ROI & PROFIT/LOSS PREVIEW PANEL */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 rounded-xl border border-cyan-500/30 font-mono-numbers">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-300">
              <span className="font-semibold flex items-center gap-1.5 text-cyan-300">
                <Calculator className="w-4 h-4" />
                Live Financial & Return Engine
              </span>
              <span className="text-[11px] text-slate-400">
                Break-even: {formatCurrency(costPerCarat, currency)}/ct
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Total Invested Cost</span>
                <span className="text-base font-bold text-slate-100">
                  {formatCurrency(totalCost, currency)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {formatCurrency(costPerCarat, currency)} / carat
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">
                  {status === 'sold' ? 'Realized Revenue' : 'Projected Ask'}
                </span>
                <span className="text-base font-bold text-slate-100">
                  {formatCurrency(effectivePrice, currency)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {cutCts > 0 ? formatCurrency(effectivePrice / cutCts, currency) : '$0'} / ct
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Profit or Loss</span>
                <span
                  className={`text-base font-bold ${
                    netProfitOrLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatCurrency(netProfitOrLoss, currency)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Margin: {formatPercent(profitMargin)}
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Return on Investment (ROI)</span>
                <span
                  className={`text-base font-bold ${
                    roiPercent >= 50
                      ? 'text-emerald-300'
                      : roiPercent >= 0
                      ? 'text-teal-400'
                      : 'text-rose-400'
                  }`}
                >
                  {formatPercent(roiPercent)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Capital Multiplier: {(effectivePrice / (totalCost || 1)).toFixed(2)}x
                </span>
              </div>

            </div>

            {/* Market Comparison Notification */}
            {marketTrend && (
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between">
                <span className="text-slate-400">
                  Wholesale Market Benchmark for {variety}:
                </span>
                <span className="font-mono text-cyan-300">
                  {formatCurrency(marketTrend.benchmarkPricePerCtUSD.min, currency)} – {formatCurrency(marketTrend.benchmarkPricePerCtUSD.max, currency)}/ct
                  {' '}(Median {formatCurrency(marketTrend.benchmarkPricePerCtUSD.median, currency)}/ct)
                </span>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{initialGem ? 'Update Gemstone Ledger' : 'Save to Inventory Matrix'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
