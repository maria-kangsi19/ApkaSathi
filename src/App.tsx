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
import { RefreshCw, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { appMode, loading, error } = useApp();

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

  return (
    <div className="min-h-screen bg-[var(--bg-parchment)] text-[var(--text-main)] transition-colors flex flex-col justify-between">
      <div>
        <Header />

        {error && (
          <div className="max-w-4xl mx-auto px-4 mt-4">
            <div className="p-4 rounded-2xl bg-amber-100 dark:bg-amber-950/40 border border-amber-300 text-amber-900 dark:text-amber-200 text-xs font-semibold">
              Notice: {error}
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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
