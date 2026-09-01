import React from 'react';
import {
  Heart,
  Moon,
  Sun,
  ShieldAlert,
  Users,
  Sparkles,
  Coffee,
  Volume2,
  VolumeX,
  Languages,
  ChevronRight,
  Home,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    appMode,
    setAppMode,
    patientScreen,
    setPatientScreen,
    state,
    updateSettings,
    setShowDisclaimerModal,
  } = useApp();

  const isTwilight = state?.settings?.twilightMode ?? false;
  const isTiredMode = state?.settings?.manualTiredMode ?? false;
  const isSpeakEnabled = state?.settings?.speakAudio ?? true;

  const languages = [
    { label: 'Nagamese / English', code: 'Nagamese / English' },
    { label: 'Assamese (অসমীয়া)', code: 'Assamese' },
    { label: 'Khasi (Ka Ktien Khasi)', code: 'Khasi' },
    { label: 'Mizo (Mizo ṭawng)', code: 'Mizo' },
    { label: 'Hindi (हिन्दी)', code: 'Hindi' },
    { label: 'English', code: 'English' },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-[#1D1F1A]/95 border-b border-[#DCD4C4] dark:border-[#3C4035] transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 md:h-24 flex items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAppMode('role_select')}
            className="flex items-center gap-3 text-left group cursor-pointer"
            title="Aapka Saathi Home"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#183C17] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
              <Heart className="w-6 h-6 md:w-7 md:h-7 fill-current text-[#F5B83D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="brand text-2xl sm:text-3xl font-black tracking-tight text-[#143513] dark:text-[#9BB858]">
                  Aapka Saathi
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#FAEBCE] text-[#5E3500] dark:bg-[#3D2D14] dark:text-[#F7C04D] border border-[#6E3B00]/40">
                  आपका साथी
                </span>
              </div>
              <p className="text-[11px] md:text-xs text-[#1C1B17] dark:text-[#E2E0D5] tracking-wider uppercase font-bold truncate max-w-[200px] sm:max-w-xs">
                {appMode === 'patient'
                  ? `Loving Companion — Patient View`
                  : 'Family Companion — Caregiver Hub'}
              </p>
            </div>
          </button>
        </div>

        {/* Community Context & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Community Context indicator */}
          <div className="text-right hidden md:block">
            <p className="text-[#1C1B17] dark:text-[#E2E0D5] text-[11px] uppercase font-extrabold tracking-wider">Heritage Context</p>
            <p className="font-extrabold text-sm text-[var(--text-main)]">
              {state?.patient?.community || 'Naga'} • {state?.patient?.hometown || 'Home'}
            </p>
          </div>

          {/* Patient Tired Mode / Gentle Pacing toggle (Comfort Setting) */}
          <button
            onClick={() => updateSettings({ manualTiredMode: !isTiredMode })}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-extrabold border-2 transition-all cursor-pointer ${
              isTiredMode
                ? 'bg-[#822417] text-white border-[#822417] shadow-xs'
                : 'bg-white dark:bg-[#1D1F1A] text-[#1C1B17] dark:text-[#E2E0D5] border-[#C8BFAD] dark:border-[#3C4035] hover:border-[#822417]'
            }`}
            title="Gentle Pacing Mode: Slows down prompts and softens audio"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">
              {isTiredMode ? 'Gentle Pace Active' : 'Rest Mode'}
            </span>
          </button>

          {/* Read Aloud Toggle */}
          <button
            onClick={() => updateSettings({ speakAudio: !isSpeakEnabled })}
            className={`p-2.5 rounded-full text-xs border-2 transition-all cursor-pointer ${
              isSpeakEnabled
                ? 'bg-[#E4EFE0] text-[#183C17] dark:bg-[#242E18] dark:text-[#8DA850] border-[#183C17]/40 font-black'
                : 'bg-white dark:bg-[#1D1F1A] text-[#1C1B17] dark:text-[#E2E0D5] border-[#C8BFAD] dark:border-[#3C4035]'
            }`}
            title={isSpeakEnabled ? 'Voice read-aloud active' : 'Voice read-aloud muted'}
          >
            {isSpeakEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language Selector */}
          <div className="relative hidden lg:block">
            <select
              value={state?.settings?.language || state?.patient?.preferred_language || 'Nagamese / English'}
              onChange={(e) => updateSettings({ language: e.target.value })}
              className="appearance-none bg-white dark:bg-[#1D1F1A] text-[var(--text-main)] text-xs font-extrabold pl-8 pr-7 py-2 rounded-full border-2 border-[#C8BFAD] dark:border-[#3C4035] hover:border-[#784400] focus:border-[#784400] cursor-pointer shadow-2xs"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <Languages className="w-3.5 h-3.5 text-[#1C1B17] dark:text-[#E2E0D5] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Twilight Theme Switch */}
          <button
            onClick={() => updateSettings({ twilightMode: !isTwilight })}
            className="p-2.5 rounded-full bg-white dark:bg-[#1D1F1A] text-[var(--text-main)] border-2 border-[#C8BFAD] dark:border-[#3C4035] hover:border-[#784400] transition-all cursor-pointer shadow-2xs"
            title={isTwilight ? 'Switch to Warm Parchment' : 'Switch to Twilight Dark'}
            aria-label="Toggle Theme"
          >
            {isTwilight ? (
              <Sun className="w-4 h-4 text-[#F5B83D]" />
            ) : (
              <Moon className="w-4 h-4 text-[#822417]" />
            )}
          </button>

          {/* Disclaimer Info Button */}
          <button
            onClick={() => setShowDisclaimerModal(true)}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAEBCE] hover:bg-[#F5DEC0] text-[#5E3500] dark:bg-[#3D2D14] dark:text-[#F5B83D] border border-[#784400]/40 text-xs font-black transition-colors cursor-pointer"
            title="View Non-Clinical Notice"
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Notice</span>
          </button>

          {/* Role Switching Button */}
          {appMode === 'patient' ? (
            <button
              onClick={() => setAppMode('caregiver')}
              className="bg-[#822417] text-white px-5 py-2.5 rounded-full font-extrabold shadow-md hover:bg-[#6B1B10] uppercase tracking-wider text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Caregiver Hub</span>
            </button>
          ) : appMode === 'caregiver' ? (
            <button
              onClick={() => {
                setAppMode('patient');
                setPatientScreen('home');
              }}
              className="bg-[#183C17] text-white px-5 py-2.5 rounded-full font-extrabold shadow-md hover:bg-[#112C10] uppercase tracking-wider text-xs transition-colors flex items-center gap-1.5 animate-gentle-pulse cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Patient View 🌸</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
