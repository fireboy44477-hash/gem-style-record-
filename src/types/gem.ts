export type GemstoneType =
  | 'Royal Blue Sapphire'
  | 'Cornflower Sapphire'
  | 'Padparadscha Sapphire'
  | 'Yellow Sapphire'
  | 'Star Sapphire'
  | 'Pigeon Blood Ruby'
  | 'Colombian Emerald'
  | 'Cobalt Spinel'
  | 'Alexandrite'
  | 'Cat\'s Eye Chrysoberyl'
  | 'Tsavorite Garnet'
  | 'Paraiba Tourmaline'
  | 'Aquamarine'
  | 'Other Variety';

export type CutShape =
  | 'Cushion'
  | 'Oval'
  | 'Emerald Cut'
  | 'Round Brilliant'
  | 'Pear'
  | 'Sugarloaf Cabochon'
  | 'Radiant'
  | 'Trilliant'
  | 'Marquise';

export type GemTreatment =
  | 'Natural Unheated (No Treatment)'
  | 'Traditional Heat Only'
  | 'Minor Oil (Emerald)'
  | 'Treated';

export type ClarityGrade =
  | 'Loupe Clean (IF/VVS)'
  | 'Eye Clean (VS)'
  | 'Slightly Included (SI)'
  | 'Included';

export type InventoryStatus = 'in_stock' | 'on_memo' | 'reserved' | 'sold';

export interface GemCostBreakdown {
  roughPurchase: number;          // Initial rough stone or preformed piece purchase price
  lapidaryCutting: number;        // Lapidary faceting, preforming, calibration & polishing
  treatmentHeating: number;       // High-temp thermal furnace or traditional heat treatment fee
  certificationLab: number;       // Testing laboratory (GIA, Gübelin, SSEF, GRS, NGJA) fee
  customsDutyTaxes: number;       // Export/import duties, gem authority cess, pit royalties
  brokerageCommission: number;    // Gem broker fee / pit dalal commission / finder fee
  mountingJewelry: number;        // Gold/platinum mounting, melee accent diamonds (if set)
  vaultInsuranceLogistics: number;// Courier (Brinks/Malca-Amit), transit insurance, vault handling
  otherIncidental: number;        // Photography, display box, micro-polishing, appraisal
}

export interface GemstoneItem {
  id: string;
  lotNumber: string;
  variety: GemstoneType;
  customVarietyName?: string;
  shape: CutShape;
  origin: string;                 // e.g. "Sri Lanka (Ratnapura)", "Madagascar", "Burma (Mogok)"
  treatment: GemTreatment;
  clarity: ClarityGrade;
  colorDescription: string;       // e.g. "Vivid Royal Blue", "Sunset Pinkish-Orange"
  dimensions: string;             // e.g. "9.4 x 7.8 x 5.2 mm"
  
  roughWeightCts: number;         // Carat weight before cutting (0 if bought already cut)
  cutWeightCts: number;           // Finished cut carat weight
  
  certLab: string;                // e.g. "GIA", "GRS", "SSEF", "NGJA", "In-House"
  certNumber: string;             // Certificate ID number
  
  costs: GemCostBreakdown;
  
  targetSellingPrice: number;     // Asking/Catalog Price (in USD base)
  actualSoldPrice: number;        // Sold Price if closed (in USD base)
  
  status: InventoryStatus;
  buyerName?: string;             // Client, jeweler, or auction buyer
  channel?: string;               // "Wholesale Bangkok", "Private Collector", "Showroom", "Memo"
  
  dateAcquired: string;           // YYYY-MM-DD
  dateSold?: string;              // YYYY-MM-DD
  notes?: string;
  imageUrl?: string;              // Base64 or URL picture of the gemstone
}

export type CurrencyCode = 'USD' | 'LKR' | 'EUR' | 'GBP' | 'THB' | 'HKD';

export interface CurrencyRate {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateAgainstUSD: number;         // 1 USD = X Currency
}

export interface GemMarketTrend {
  variety: GemstoneType;
  benchmarkPricePerCtUSD: {
    min: number;
    median: number;
    max: number;
  };
  yearlyGrowthPercent: number;    // e.g. +14.5%
  marketDemand: 'Very High' | 'High' | 'Steady' | 'Niche / Luxury';
  priceHistory: { year: number; avgPricePerCt: number }[];
  marketNotes: string;
}
