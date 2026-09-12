import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { RoleSelectionScreen } from './components/common/RoleSelectionScreen';
import { DisclaimerModal } from './components/common/DisclaimerModal';
import { CaregiverHubLayout } from './components/caregiver/CaregiverHubLayout';
import { PatientContainer } from './components/patient/PatientContainer';
import { DoctorContainer } from './components/doctor/DoctorContainer';
import { PatientMedicineAlarmModal } from './components/patient/PatientMedicineAlarmModal';
import { PatientSOSModal } from './components/patient/PatientSOSModal';
import { DeveloperFeedbackModal } from './components/caregiver/DeveloperFeedbackModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppErrorFallback } from './components/common/AppErrorFallback';
import { RefreshCw, Heart, WifiOff, X, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    state,
    appMode,
    loading,
    error,
    isRetrying,
    retryInitialFetch,
    dismissError,
    resetToSafeLocalState,
  } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] dark:bg-[#121310] text-[#000000] dark:text-[#FFFFFF] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-[24px] bg-[#143513] text-white flex items-center justify-center mb-4 card-shadow animate-pulse">
          <Heart className="w-8 h-8 fill-current text-[#F7C04D]" />
        </div>
        <div className="flex items-center gap-3 text-lg font-black text-[#143513] dark:text-[#9BB858]">
          <RefreshCw className="w-5 h-5 animate-spin text-[#6E3B00] dark:text-[#F7C04D]" />
          <span className="serif">Opening Aapka Saathi...</span>
        </div>
        <p className="text-xs text-[#121210] dark:text-[#F6F5EE] mt-2 font-bold tracking-wide">
          आपका साथी — Elder Care & Family Loving Companion
        </p>
      </div>
    );
  }

  // Graceful fallback screen if state could not be loaded at all
  if (!state || !state.patient) {
    return (
      <AppErrorFallback
        title="Unable to Reach Companion Server"
        message={
          error ||
          "We're having trouble connecting to the companion server to fetch latest patient records. You can retry the connection or continue using your saved local companion data."
        }
        errorDetails={error}
        onRetry={retryInitialFetch}
        onContinueLocal={resetToSafeLocalState}
        isRetrying={isRetrying}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-parchment)] text-[var(--text-main)] transition-colors flex flex-col justify-between">
      <div>
        <Header />

        {/* Friendly, Non-Alarmist Offline / Connection Status Banner */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 dark:text-amber-100">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 shrink-0">
                  <WifiOff className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs uppercase tracking-wider text-[#784400] dark:text-[#F7C04D]">
                      Offline Companion Mode
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Local Data Safe
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-0.5 font-medium leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={retryInitialFetch}
                  disabled={isRetrying}
                  className="px-3 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 dark:bg-amber-900/60 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                  title="Retry connecting to companion server"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                  <span>{isRetrying ? 'Connecting...' : 'Retry Connection'}</span>
                </button>
                <button
                  onClick={dismissError}
                  className="p-1.5 rounded-xl text-amber-800 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100 hover:bg-amber-200/50 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
                  title="Dismiss notification"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <main>
          {appMode === 'role_select' && <RoleSelectionScreen />}
          {appMode === 'patient' && <PatientContainer />}
          {appMode === 'caregiver' && <CaregiverHubLayout />}
          {appMode === 'doctor' && <DoctorContainer />}
        </main>
      </div>

      {/* Global Modals for Medicine Alarms and SOS Alerts */}
      <PatientMedicineAlarmModal />
      <PatientSOSModal />

      {/* Global Non-Clinical Disclaimer Modal */}
      <DisclaimerModal />

      {/* Global Developer Feedback Modal */}
      <DeveloperFeedbackModal />

      {/* Subtle Persistent Disclaimer & Cultural Footer */}
      <footer className="h-16 px-6 sm:px-12 bg-white/70 dark:bg-[#1D1F1A]/80 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between border-t-2 border-[#BFB5A2] dark:border-[#4A4F41] gap-2 py-3">
        <div className="disclaimer-text flex-1 text-center sm:text-left text-xs font-bold text-[#121210] dark:text-[#F6F5EE]">
          <strong>Aapka Saathi (आपका साथी)</strong> is a gentle daily engagement and comfort companion for elders and families in India's North East. It does not provide medical diagnoses or clinical treatment.
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="px-3 py-1 bg-[#143513]/10 dark:bg-[#9BB858]/20 rounded-full text-[10px] font-black text-[#143513] dark:text-[#9BB858] uppercase tracking-wider">
            Nagaland & NE Region
          </span>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
