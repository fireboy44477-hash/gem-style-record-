import { GemstoneItem, CurrencyCode } from '../types/gem';
import { calculateGemMetrics } from '../utils/calculations';

export interface GoogleSheetExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  rowsWritten: number;
}

export const SHEETS_COLUMNS = [
  'Lot #',
  'Variety',
  'Shape',
  'Origin',
  'Treatment',
  'Clarity',
  'Rough (cts)',
  'Cut (cts)',
  'Yield %',
  'Rough Buy ($)',
  'Lapidary ($)',
  'Heat/Treat ($)',
  'Lab Cert ($)',
  'Customs/Cess ($)',
  'Broker Dalal ($)',
  'Jewelry Mount ($)',
  'Vault Transit ($)',
  'Misc Other ($)',
  'Total Cost ($)',
  'Cost/ct ($)',
  'Target Ask ($)',
  'Sold Price ($)',
  'Net Profit ($)',
  'ROI %',
  'Status',
  'Buyer / Memo',
  'Cert Lab & #',
  'Acquired Date',
];

export function buildGemSheetRows(gems: GemstoneItem[]): (string | number)[][] {
  return gems.map((g) => {
    const metrics = calculateGemMetrics(g);
    return [
      g.lotNumber,
      g.variety,
      g.shape,
      g.origin,
      g.treatment,
      g.clarity,
      g.roughWeightCts || 0,
      g.cutWeightCts || 0,
      Number(metrics.yieldPercent.toFixed(1)),
      g.costs.roughPurchase || 0,
      g.costs.lapidaryCutting || 0,
      g.costs.treatmentHeating || 0,
      g.costs.certificationLab || 0,
      g.costs.customsDutyTaxes || 0,
      g.costs.brokerageCommission || 0,
      g.costs.mountingJewelry || 0,
      g.costs.vaultInsuranceLogistics || 0,
      g.costs.otherIncidental || 0,
      metrics.totalCost,
      Number(metrics.costPerCt.toFixed(2)),
      g.targetSellingPrice || 0,
      g.status === 'sold' ? (g.actualSoldPrice || 0) : 0,
      Number(metrics.profitOrLoss.toFixed(2)),
      Number(metrics.roiPercent.toFixed(1)),
      g.status.toUpperCase(),
      g.buyerName || '',
      `${g.certLab} ${g.certNumber}`.trim(),
      g.dateAcquired || '',
    ];
  });
}

/**
 * Creates a brand new Google Spreadsheet in the authenticated user's Google Drive
 * and populates it with the complete inventory & cost matrix.
 */
export async function createAndExportToGoogleSheet(
  accessToken: string,
  gems: GemstoneItem[],
  customTitle?: string
): Promise<GoogleSheetExportResult> {
  const title = customTitle || `GemMatrix Inventory Ledger (${new Date().toLocaleDateString()})`;

  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Gemstone Cost Matrix',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Google Sheets API Error (${createRes.status}): ${errText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare Data Values
  const dataRows = buildGemSheetRows(gems);
  const values = [SHEETS_COLUMNS, ...dataRows];

  // 3. Write Values
  const writeRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Gemstone Cost Matrix'!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: "'Gemstone Cost Matrix'!A1",
        majorDimension: 'ROWS',
        values,
      }),
    }
  );

  if (!writeRes.ok) {
    const errText = await writeRes.text();
    throw new Error(`Failed to write gemstone data to sheet: ${errText}`);
  }

  // 4. Style Header Row with Professional Dark Blue styling
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetData.sheets[0].properties.sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.05, green: 0.09, blue: 0.16 }, // Deep dark navy
                  textFormat: {
                    foregroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
                    bold: true,
                    fontSize: 10,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
        ],
      }),
    });
  } catch (styleErr) {
    console.warn('Styling header was skipped:', styleErr);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
    rowsWritten: dataRows.length,
  };
}

/**
 * Updates an existing Google Sheet with current gemstone data
 */
export async function updateExistingGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  gems: GemstoneItem[]
): Promise<{ rowsUpdated: number }> {
  // First get sheet tab name
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!metaRes.ok) {
    throw new Error('Spreadsheet not found or access denied');
  }
  const meta = await metaRes.json();
  const firstSheetTitle = meta.sheets?.[0]?.properties?.title || 'Sheet1';

  const dataRows = buildGemSheetRows(gems);
  const values = [SHEETS_COLUMNS, ...dataRows];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${firstSheetTitle}'!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `'${firstSheetTitle}'!A1`,
        majorDimension: 'ROWS',
        values,
      }),
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error(`Failed to update sheet: ${errText}`);
  }

  return { rowsUpdated: dataRows.length };
}

/**
 * Imports gemstones from an existing Google Sheet
 */
export async function importGemsFromGoogleSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<GemstoneItem[]> {
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!metaRes.ok) {
    throw new Error('Could not access Google Sheet. Check Spreadsheet ID and permissions.');
  }
  const meta = await metaRes.json();
  const firstSheetTitle = meta.sheets?.[0]?.properties?.title || 'Sheet1';

  const readRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${firstSheetTitle}'!A1:Z500`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!readRes.ok) {
    throw new Error('Failed to read rows from Google Sheet');
  }

  const data = await readRes.json();
  const rows: any[][] = data.values || [];
  if (rows.length <= 1) {
    return [];
  }

  // Parse rows (ignoring header)
  const importedGems: GemstoneItem[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2 || !row[0]) continue;

    const lotNumber = String(row[0] || '').trim();
    const variety = (row[1] || 'Royal Blue Sapphire') as any;
    const shape = (row[2] || 'Cushion') as any;
    const origin = String(row[3] || 'Sri Lanka');
    const treatment = (row[4] || 'Natural Unheated (No Treatment)') as any;
    const clarity = (row[5] || 'Eye Clean (VS)') as any;
    const roughWeightCts = parseFloat(row[6]) || 0;
    const cutWeightCts = parseFloat(row[7]) || 1.0;

    const roughPurchase = parseFloat(row[9]) || 0;
    const lapidaryCutting = parseFloat(row[10]) || 0;
    const treatmentHeating = parseFloat(row[11]) || 0;
    const certificationLab = parseFloat(row[12]) || 0;
    const customsDutyTaxes = parseFloat(row[13]) || 0;
    const brokerageCommission = parseFloat(row[14]) || 0;
    const mountingJewelry = parseFloat(row[15]) || 0;
    const vaultInsuranceLogistics = parseFloat(row[16]) || 0;
    const otherIncidental = parseFloat(row[17]) || 0;

    const targetSellingPrice = parseFloat(row[20]) || 0;
    const actualSoldPrice = parseFloat(row[21]) || 0;
    const statusRaw = String(row[24] || 'IN_STOCK').toLowerCase();
    const status = (statusRaw.includes('sold')
      ? 'sold'
      : statusRaw.includes('memo')
      ? 'on_memo'
      : statusRaw.includes('reserve')
      ? 'reserved'
      : 'in_stock') as any;

    const buyerName = String(row[25] || '');
    const certString = String(row[26] || '');
    const [certLab, ...certParts] = certString.split(' ');
    const certNumber = certParts.join(' ');
    const dateAcquired = String(row[27] || new Date().toISOString().split('T')[0]);

    importedGems.push({
      id: `gem-imported-${Date.now()}-${i}`,
      lotNumber: lotNumber || `LOT-${i}`,
      variety,
      shape,
      origin,
      treatment,
      clarity,
      colorDescription: '',
      dimensions: '',
      roughWeightCts,
      cutWeightCts: Math.max(0.01, cutWeightCts),
      certLab: certLab || 'GIA',
      certNumber: certNumber || '',
      costs: {
        roughPurchase,
        lapidaryCutting,
        treatmentHeating,
        certificationLab,
        customsDutyTaxes,
        brokerageCommission,
        mountingJewelry,
        vaultInsuranceLogistics,
        otherIncidental,
      },
      targetSellingPrice,
      actualSoldPrice,
      status,
      buyerName,
      dateAcquired,
    });
  }

  return importedGems;
}
