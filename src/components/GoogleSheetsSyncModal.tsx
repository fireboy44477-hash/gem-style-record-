import React, { useState } from 'react';
import { GemstoneItem, CurrencyCode } from '../types/gem';
import { signInWithGoogle, logoutGoogle } from '../services/googleAuth';
import {
  createAndExportToGoogleSheet,
  updateExistingGoogleSheet,
  importGemsFromGoogleSheet,
  GoogleSheetExportResult,
} from '../services/googleSheets';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  gems: GemstoneItem[];
  currency: CurrencyCode;
  onImportGems: (imported: GemstoneItem[]) => void;
  currentUser: User | null;
  accessToken: string | null;
  onAuthSuccess: (user: User, token: string) => void;
  onLogout: () => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  gems,
  currency,
  onImportGems,
  currentUser,
  accessToken,
  onAuthSuccess,
  onLogout,
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [existingSheetId, setExistingSheetId] = useState('');
  const [customTitle, setCustomTitle] = useState(
    `GemMatrix - Inventory & Cost Ledger (${new Date().toLocaleDateString()})`
  );
  const [lastExportResult, setLastExportResult] = useState<GoogleSheetExportResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  if (!isOpen) return null;

  const handleLogin = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      const { user, accessToken: token } = await signInWithGoogle();
      onAuthSuccess(user, token);
      setStatusMessage({ type: 'success', text: `Signed in as ${user.email}` });
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Google sign-in was cancelled or failed.' });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleCreateNewSheet = async () => {
    if (!accessToken) {
      setStatusMessage({ type: 'error', text: 'Please sign in with Google first.' });
      return;
    }

    // Confirmation dialog as mandated by Workspace skill
    const confirmed = window.confirm(
      `Create a new Google Spreadsheet titled "${customTitle}" in your Google Drive with ${gems.length} gemstones?`
    );
    if (!confirmed) return;

    setIsExporting(true);
    setStatusMessage(null);
    try {
      const result = await createAndExportToGoogleSheet(accessToken, gems, customTitle);
      setLastExportResult(result);
      setExistingSheetId(result.spreadsheetId);
      setStatusMessage({
        type: 'success',
        text: `Successfully created Google Sheet with ${result.rowsWritten} gemstone lots!`,
      });
    } catch (err: any) {
      console.error('Export failed:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to export to Google Sheets.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateExisting = async () => {
    if (!accessToken) {
      setStatusMessage({ type: 'error', text: 'Please sign in with Google first.' });
      return;
    }
    const cleanId = extractSheetId(existingSheetId);
    if (!cleanId) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid Google Spreadsheet ID or URL.' });
      return;
    }

    const confirmed = window.confirm(
      `Update Google Sheet (${cleanId}) with ${gems.length} gemstones? This will overwrite the first tab.`
    );
    if (!confirmed) return;

    setIsExporting(true);
    setStatusMessage(null);
    try {
      const result = await updateExistingGoogleSheet(accessToken, cleanId, gems);
      setStatusMessage({
        type: 'success',
        text: `Updated Google Sheet with ${result.rowsUpdated} gemstone lots.`,
      });
    } catch (err: any) {
      console.error('Update failed:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to update Google Sheet.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!accessToken) {
      setStatusMessage({ type: 'error', text: 'Please sign in with Google first.' });
      return;
    }
    const cleanId = extractSheetId(existingSheetId);
    if (!cleanId) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid Google Spreadsheet ID or URL.' });
      return;
    }

    const confirmed = window.confirm(
      `Import gemstones from Google Sheet (${cleanId})? This will merge with your current inventory.`
    );
    if (!confirmed) return;

    setIsImporting(true);
    setStatusMessage(null);
    try {
      const imported = await importGemsFromGoogleSheet(accessToken, cleanId);
      if (imported.length === 0) {
        setStatusMessage({ type: 'error', text: 'No gemstone rows found in sheet.' });
      } else {
        onImportGems(imported);
        setStatusMessage({
          type: 'success',
          text: `Successfully imported ${imported.length} gemstones from Google Sheet!`,
        });
      }
    } catch (err: any) {
      console.error('Import failed:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to read Google Sheet.' });
    } finally {
      setIsImporting(false);
    }
  };

  function extractSheetId(input: string): string {
    const trimmed = input.trim();
    const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) return match[1];
    return trimmed;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Google Sheets Cloud Sync</h2>
              <p className="text-xs text-slate-400">
                Direct two-way synchronization with your Google Drive & Sheets account.
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

        {/* Auth Section */}
        {!currentUser || !accessToken ? (
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-300">
              Sign in with your Google account to create, read, and write gemstone spreadsheets directly to your Google Drive.
            </p>

            {/* Official Material Style Sign in with Google Button */}
            <button
              onClick={handleLogin}
              disabled={isSigningIn}
              className="inline-flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-lg text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          </div>
        ) : (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="avatar"
                  className="w-9 h-9 rounded-full border border-slate-700"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-cyan-900 text-cyan-300 flex items-center justify-center font-bold">
                  {currentUser.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <span>{currentUser.displayName || 'Google Account'}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-[11px] text-slate-400 font-mono">{currentUser.email}</div>
              </div>
            </div>
            <button
              onClick={async () => {
                await logoutGoogle();
                onLogout();
              }}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-800 transition"
              title="Sign out from Google"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Sync Controls (Available once signed in) */}
        {currentUser && accessToken && (
          <div className="space-y-4 text-xs">
            
            {/* Create New Sheet */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
              <span className="font-semibold text-slate-200 block">
                Option A: Export to New Google Sheet
              </span>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Spreadsheet Title:</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                />
              </div>

              <button
                onClick={handleCreateNewSheet}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Creating Spreadsheet in Drive...' : `Export ${gems.length} Gems to New Sheet`}</span>
              </button>
            </div>

            {/* Existing Sheet ID / URL */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
              <span className="font-semibold text-slate-200 block">
                Option B: Sync or Import with Existing Sheet
              </span>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Google Sheet URL or Spreadsheet ID:
                </label>
                <input
                  type="text"
                  placeholder="https://docs.google.com/spreadsheets/d/... or ID"
                  value={existingSheetId}
                  onChange={(e) => setExistingSheetId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleUpdateExisting}
                  disabled={isExporting || !existingSheetId}
                  className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition disabled:opacity-40 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Update Sheet</span>
                </button>
                <button
                  onClick={handleImport}
                  disabled={isImporting || !existingSheetId}
                  className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition disabled:opacity-40 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Import from Sheet</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                : 'bg-rose-950/60 border-rose-800/80 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
          </div>
        )}

        {/* Clickable Sheet Link if Created */}
        {lastExportResult && (
          <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl flex items-center justify-between text-xs">
            <span className="text-cyan-300 font-medium">Sheet is live in Google Drive:</span>
            <a
              href={lastExportResult.spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition"
            >
              <span>Open in Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
