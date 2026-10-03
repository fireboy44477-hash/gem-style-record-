import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Apple, CheckCircle, Info, ExternalLink, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showStoreGuide, setShowStoreGuide] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1.5">
        {/* If Installable via Chromium/Android */}
        {isInstallable && (
          <button
            onClick={install}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition whitespace-nowrap"
            title="Install GemMatrix as native app on your phone or desktop"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        )}

        {/* If on iOS Safari */}
        {isIOS && !isInstalled && (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition whitespace-nowrap"
            title="Install on iPhone / iPad"
          >
            <Apple className="w-3.5 h-3.5 text-slate-300" />
            <span>Install on iOS</span>
          </button>
        )}

        {/* Play Store & App Store Publish Guide Button */}
        <button
          onClick={() => setShowStoreGuide(true)}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-300 hover:text-cyan-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition whitespace-nowrap"
          title="Play Store & App Store Publishing Details"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Store Publishing</span>
        </button>
      </div>

      {/* iOS Safari Home Screen Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Apple className="w-5 h-5 text-cyan-400" />
                Install on iPhone or iPad
              </h3>
              <button onClick={() => setShowIOSGuide(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              To install <strong>GemMatrix</strong> directly onto your iOS home screen as a standalone full-screen app:
            </p>

            <ol className="text-xs text-slate-300 space-y-2.5 bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-sans">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800/80 text-cyan-300 flex items-center justify-center text-[11px] font-bold shrink-0">1</span>
                <span>Tap the <strong>Share</strong> button (box with upward arrow) at bottom of Safari.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800/80 text-cyan-300 flex items-center justify-center text-[11px] font-bold shrink-0">2</span>
                <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800/80 text-cyan-300 flex items-center justify-center text-[11px] font-bold shrink-0">3</span>
                <span>Tap <strong>Add</strong> in the top right corner. GemMatrix icon will appear on your phone!</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Play Store & Apple App Store Publishing Checklist Modal */}
      {showStoreGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Play Store & App Store Publishing</h3>
                  <p className="text-[11px] text-slate-400">PWA compliant, manifest & service worker ready</p>
                </div>
              </div>
              <button onClick={() => setShowStoreGuide(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <div>
                  <strong>PWA Manifest & Service Worker Verified:</strong> All required icons (192px, 512px, maskable), theme color, standalone viewport, and precaching are configured.
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-semibold text-slate-100 flex items-center gap-1.5 text-cyan-400">
                  <span>Option 1: Google Play Store (Android TWA / APK / AAB)</span>
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Use <strong>PWABuilder.com</strong> (by Microsoft) or <strong>Bubblewrap CLI</strong> (by Google Chrome team):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                  <li>Visit <strong>PWABuilder.com</strong> and paste this app's URL.</li>
                  <li>Click <strong>Package for Android (Google Play)</strong>.</li>
                  <li>It generates a signed <code>.aab</code> (Android App Bundle) ready to upload to Google Play Console.</li>
                </ol>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-semibold text-slate-100 flex items-center gap-1.5 text-purple-400">
                  <span>Option 2: Apple App Store (iOS IPA / Xcode)</span>
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  For native App Store listing, package with <strong>Capacitor</strong> (Ionic) or PWABuilder iOS:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                  <li>In PWABuilder or Capacitor: <code>npx cap init</code> and wrap the URL.</li>
                  <li>Open the project in Xcode and archive for App Store Connect.</li>
                  <li>Users can also tap <strong>Share → Add to Home Screen</strong> on any iPhone for instant zero-download app experience.</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowStoreGuide(false)}
              className="mt-5 w-full py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs transition"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
};
