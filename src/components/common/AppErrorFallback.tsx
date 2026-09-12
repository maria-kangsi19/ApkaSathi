import React from 'react';
import { Heart, RefreshCw, WifiOff, ShieldCheck, ArrowRight } from 'lucide-react';

interface AppErrorFallbackProps {
  title?: string;
  message?: string;
  errorDetails?: string | null;
  onRetry?: () => void;
  onContinueLocal?: () => void;
  isRetrying?: boolean;
}

export const AppErrorFallback: React.FC<AppErrorFallbackProps> = ({
  title = 'Companion Server Connection Notice',
  message = "We couldn't connect to the companion server to fetch latest updates. Aapka Saathi is ready to operate safely in offline local mode with your saved family memories and scheduled reminders.",
  errorDetails,
  onRetry,
  onContinueLocal,
  isRetrying = false,
}) => {
  return (
    <div
      id="app-error-fallback-screen"
      className="min-h-screen bg-[#FAF8F3] dark:bg-[#121310] text-[#1C1B17] dark:text-[#E2E0D5] flex flex-col justify-between p-4 sm:p-8"
    >
      <div className="max-w-2xl mx-auto w-full pt-8 sm:pt-16 pb-8 text-center">
        {/* Aapka Saathi Emblem */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-[#143513] text-white shadow-xl mb-6">
          <Heart className="w-10 h-10 fill-current text-[#F7C04D]" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAEBCE] dark:bg-[#2C2415] text-[#784400] dark:text-[#F7C04D] text-xs font-black tracking-wider uppercase mb-4 border border-[#784400]/20">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Companion Ready</span>
        </div>

        <h1 className="brand text-3xl sm:text-4xl font-black text-[#143513] dark:text-[#9BB858] mb-3">
          {title}
        </h1>

        <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 max-w-xl mx-auto mb-8 font-medium leading-relaxed">
          {message}
        </p>

        {errorDetails && (
          <div className="mb-8 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs font-mono text-amber-900 dark:text-amber-200 max-w-lg mx-auto text-left overflow-x-auto">
            <span className="font-bold">Diagnostics:</span> {errorDetails}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
          {onRetry && (
            <button
              id="retry-connection-btn"
              onClick={onRetry}
              disabled={isRetrying}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#143513] hover:bg-[#1c471b] text-white font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Reconnecting...' : 'Retry Connection'}</span>
            </button>
          )}

          {onContinueLocal && (
            <button
              id="continue-local-btn"
              onClick={onContinueLocal}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-[#1D1F1A] border-2 border-[#143513]/30 dark:border-[#9BB858]/40 text-[#143513] dark:text-[#9BB858] hover:bg-[#FAF8F3] dark:hover:bg-[#262920] font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <span>Continue in Local Mode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Safety Reassurance Card */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-[#1D1F1A]/80 border border-[#DCD4C4] dark:border-[#3C4035] shadow-xs max-w-lg mx-auto text-left flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#143513] dark:text-[#9BB858] shrink-0 mt-0.5" />
          <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            <strong className="text-neutral-900 dark:text-neutral-100 font-bold block mb-0.5">
              Your Records Are Safe
            </strong>
            Aapka Saathi automatically mirrors all patient photos, voice notes, medicine schedules, and doctor access codes to local storage. You can continue using all interactive features without interruption.
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-neutral-500 dark:text-neutral-400 py-4 border-t border-[#DCD4C4] dark:border-[#3C4035]">
        <strong>Aapka Saathi (आपका साथी)</strong> — Elder Care & Family Companion for North East India
      </footer>
    </div>
  );
};
