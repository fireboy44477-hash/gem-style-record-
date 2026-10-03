import { GemCostBreakdown, GemstoneItem } from '../types/gem';

/**
 * Sum all 9 distinct cost categories of a gemstone
 */
export function calculateTotalCost(costs: GemCostBreakdown): number {
  if (!costs) return 0;
  return (
    (costs.roughPurchase || 0) +
    (costs.lapidaryCutting || 0) +
    (costs.treatmentHeating || 0) +
    (costs.certificationLab || 0) +
    (costs.customsDutyTaxes || 0) +
    (costs.brokerageCommission || 0) +
    (costs.mountingJewelry || 0) +
    (costs.vaultInsuranceLogistics || 0) +
    (costs.otherIncidental || 0)
  );
}

/**
 * Cost per carat based on finished cut weight
 */
export function calculateCostPerCarat(totalCost: number, cutWeightCts: number): number {
  if (!cutWeightCts || cutWeightCts <= 0) return 0;
  return totalCost / cutWeightCts;
}

/**
 * Calculates financial metrics for a single gemstone
 */
export function calculateGemMetrics(gem: GemstoneItem) {
  const totalCost = calculateTotalCost(gem.costs);
  const cutWeight = gem.cutWeightCts || 0;
  const costPerCt = cutWeight > 0 ? totalCost / cutWeight : 0;
  
  const isSold = gem.status === 'sold' && (gem.actualSoldPrice || 0) > 0;
  const effectiveRevenue = isSold ? (gem.actualSoldPrice || 0) : (gem.targetSellingPrice || 0);
  
  const profitOrLoss = effectiveRevenue - totalCost;
  const profitMarginPercent = effectiveRevenue > 0 ? (profitOrLoss / effectiveRevenue) * 100 : 0;
  const roiPercent = totalCost > 0 ? (profitOrLoss / totalCost) * 100 : 0;
  
  const targetProfitOrLoss = (gem.targetSellingPrice || 0) - totalCost;
  const targetRoiPercent = totalCost > 0 ? (targetProfitOrLoss / totalCost) * 100 : 0;

  const yieldPercent = (gem.roughWeightCts && gem.roughWeightCts > 0 && cutWeight > 0)
    ? (cutWeight / gem.roughWeightCts) * 100
    : 0;

  // Days held
  const acqDate = gem.dateAcquired ? new Date(gem.dateAcquired).getTime() : Date.now();
  const endDate = isSold && gem.dateSold ? new Date(gem.dateSold).getTime() : Date.now();
  const diffDays = Math.max(1, Math.round((endDate - acqDate) / (1000 * 60 * 60 * 24)));

  return {
    totalCost,
    cutWeight,
    costPerCt,
    effectiveRevenue,
    isSold,
    profitOrLoss,
    profitMarginPercent,
    roiPercent,
    targetProfitOrLoss,
    targetRoiPercent,
    breakEvenPerCt: costPerCt,
    yieldPercent,
    daysHeld: diffDays,
  };
}

/**
 * Aggregates all gems in portfolio for master executive metrics
 */
export function calculatePortfolioSummary(gems: GemstoneItem[]) {
  let totalCost = 0;
  let totalTargetValue = 0;
  let totalRealizedRevenue = 0;
  let totalRealizedCost = 0;
  let totalRealizedProfit = 0;
  let totalProjectedProfit = 0;
  let totalCutCarats = 0;
  
  let inStockCount = 0;
  let soldCount = 0;
  let memoCount = 0;
  let reservedCount = 0;

  gems.forEach((gem) => {
    const metrics = calculateGemMetrics(gem);
    totalCost += metrics.totalCost;
    totalTargetValue += (gem.targetSellingPrice || 0);
    totalCutCarats += (gem.cutWeightCts || 0);

    if (gem.status === 'sold') {
      soldCount++;
      const soldRev = gem.actualSoldPrice || gem.targetSellingPrice || 0;
      totalRealizedRevenue += soldRev;
      totalRealizedCost += metrics.totalCost;
      totalRealizedProfit += (soldRev - metrics.totalCost);
    } else {
      if (gem.status === 'in_stock') inStockCount++;
      else if (gem.status === 'on_memo') memoCount++;
      else if (gem.status === 'reserved') reservedCount++;
      
      totalProjectedProfit += metrics.targetProfitOrLoss;
    }
  });

  const overallRoiPercent = totalCost > 0 
    ? ((totalRealizedProfit + totalProjectedProfit) / totalCost) * 100 
    : 0;

  const realizedRoiPercent = totalRealizedCost > 0
    ? (totalRealizedProfit / totalRealizedCost) * 100
    : 0;

  const avgCostPerCt = totalCutCarats > 0 ? totalCost / totalCutCarats : 0;

  return {
    totalGemsCount: gems.length,
    inStockCount,
    soldCount,
    memoCount,
    reservedCount,
    totalCost,
    totalTargetValue,
    totalRealizedRevenue,
    totalRealizedProfit,
    totalProjectedProfit,
    overallRoiPercent,
    realizedRoiPercent,
    totalCutCarats,
    avgCostPerCt,
  };
}
