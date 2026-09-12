import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  User,
  Heart,
  Globe,
  Moon,
  Sun,
  ShieldAlert,
  RotateCcw,
  Save,
  Coffee,
  Volume2,
  Sparkles,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Community } from '../../types';

export const CaregiverSettings: React.FC = () => {
  const {
    state,
    updatePatient,
    updateCaregiver,
    updateSettings,
    resetSeedData,
    setShowDisclaimerModal,
  } = useApp();

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [patientName, setPatientName] = useState(state?.patient?.name || '');
  const [patientNickname, setPatientNickname] = useState(state?.patient?.nickname || '');
  const [patientAge, setPatientAge] = useState(state?.patient?.age || 76);
  const [patientHometown, setPatientHometown] = useState(state?.patient?.hometown || 'Mokokchung, Nagaland');
  const [patientCommunity, setPatientCommunity] = useState(state?.patient?.community || 'Naga');
  const [patientLanguage, setPatientLanguage] = useState(state?.patient?.preferred_language || 'Nagamese / English');
  const [patientNotes, setPatientNotes] = useState(state?.patient?.caregiver_notes || '');

  const [caregiverName, setCaregiverName] = useState(state?.caregiver?.name || '');
  const [caregiverRelationship, setCaregiverRelationship] = useState(state?.caregiver?.relationship || 'Son');
  const [caregiverPhone, setCaregiverPhone] = useState(state?.caregiver?.phone || '+91 94360 12345');

  const isTwilight = state?.settings?.twilightMode ?? false;
  const isTiredMode = state?.settings?.manualTiredMode ?? false;
  const isAudioEnabled = state?.settings?.speakAudio ?? true;

  const communities = [
    'Naga (Ao / Angami / Sema / Lotha / Others)',
    'Khasi / Jaintia / Garo (Meghalaya)',
    'Mizo (Mizoram)',
    'Assamese (Assam)',
    'Manipuri (Meitei / Kuki / Naga)',
    'Tripuri (Tripura)',
    'Arunachali (Monpa / Nyishi / Adi)',
    'Other North Eastern Heritage',
  ];

  const languages = [
    'Nagamese / English',
    'Assamese (অসমীয়া)',
    'Khasi (Ka Ktien Khasi)',
    'Mizo (Mizo ṭawng)',
    'Hindi (हिन्दी)',
    'English',
  ];

  const handleSaveProfiles = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePatient({
      name: patientName,
      nickname: patientNickname,
      age: Number(patientAge),
      hometown: patientHometown,
      community: patientCommunity,
      preferred_language: patientLanguage,
      caregiver_notes: patientNotes,
    });

    await updateCaregiver({
      name: caregiverName,
      relationship: caregiverRelationship,
      phone: caregiverPhone,
    });

    await updateSettings({
      language: patientLanguage,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all photos, voice notes, and routines to the fresh default demo state?')) {
      await resetSeedData();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#DCD4C4] dark:border-[#3C4035] pb-6">
        <h1 className="serif text-2xl sm:text-3xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
          Companion & Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#3D3A33] dark:text-[#D1D0C5] font-semibold mt-1">
          Customize cultural heritage, language preferences, comfort pacing, and caregiver information.
        </p>
      </div>

      <form onSubmit={handleSaveProfiles} className="space-y-8">
        {/* Section 1: Patient Profile */}
        <div className="rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-6 sm:p-8 shadow-md">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#DCD4C4] dark:border-[#3C4035]">
            <div className="w-10 h-10 rounded-xl bg-[#264D24] text-white flex items-center justify-center">
              <Heart className="w-5 h-5 fill-current text-[#F5B83D]" />
            </div>
            <div>
              <h2 className="serif text-lg sm:text-xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
                Elder / Loved One's Profile
              </h2>
              <p className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] font-semibold">
                Information used to personalize greetings and gentle AI prompts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                Loving Nickname (e.g. Ayo / Grandma) *
              </label>
              <input
                type="text"
                required
                value={patientNickname}
                onChange={(e) => setPatientNickname(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                Age
              </label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                Hometown / Village
              </label>
              <input
                type="text"
                value={patientHometown}
                onChange={(e) => setPatientHometown(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                Cultural Community / Heritage
              </label>
              <select
                value={patientCommunity}
                onChange={(e) => setPatientCommunity(e.target.value as Community)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none cursor-pointer"
              >
                {communities.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                Preferred Language
              </label>
              <select
                value={patientLanguage}
                onChange={(e) => setPatientLanguage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none cursor-pointer"
              >
                {languages.map((l, i) => (
                  <option key={i} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                Caregiver Notes (Favorites, hobbies, calming topics)
              </label>
              <textarea
                rows={2}
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                placeholder="e.g. Loves talking about her orchid garden and traditional Naga weaving patterns."
                className="w-full px-4 py-2 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Caregiver Profile */}
        <div className="rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-6 sm:p-8 shadow-md">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#DCD4C4] dark:border-[#3C4035]">
            <div className="w-10 h-10 rounded-xl bg-[#9C382A] text-white flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="serif text-lg sm:text-xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
                Family Caregiver Profile
              </h2>
              <p className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] font-semibold">
                Your details as the managing family member
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                Caregiver Name *
              </label>
              <input
                type="text"
                required
                value={caregiverName}
                onChange={(e) => setCaregiverName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#9C382A] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                Relationship to Elder *
              </label>
              <input
                type="text"
                required
                value={caregiverRelationship}
                onChange={(e) => setCaregiverRelationship(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#9C382A] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={caregiverPhone}
                onChange={(e) => setCaregiverPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#9C382A] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Comfort, Theme & Pacing Controls */}
        <div className="rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-6 sm:p-8 shadow-md">
          <h2 className="serif text-lg sm:text-xl font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-4">
            Comfort, Theme & Pacing
          </h2>

          <div className="space-y-4">
            {/* Twilight Mode Switch */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#272A22] border border-[#DCD4C4] dark:border-[#3C4035]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#264D24]/15 text-[#264D24] dark:text-[#8DA850]">
                  {isTwilight ? <Sun className="w-5 h-5 text-[#F5B83D]" /> : <Moon className="w-5 h-5 text-[#9C382A]" />}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-[#141310] dark:text-[#FCFBF7]">
                    Twilight Dark Canvas Theme
                  </div>
                  <div className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] font-semibold">
                    Soft, low-glare soothing twilight theme for evening comfort
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateSettings({ twilightMode: !isTwilight })}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  isTwilight
                    ? 'bg-[#264D24] text-white shadow-xs'
                    : 'bg-white text-[#141310] border border-[#DCD4C4] hover:border-[#264D24]'
                }`}
              >
                {isTwilight ? 'Twilight Active' : 'Warm Light'}
              </button>
            </div>

            {/* Rest / Gentle Pace Mode */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#272A22] border border-[#DCD4C4] dark:border-[#3C4035]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#9C382A]/15 text-[#9C382A]">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-[#141310] dark:text-[#FCFBF7]">
                    "Patient Seems Tired" Gentle Pacing
                  </div>
                  <div className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] font-semibold">
                    Softens audio, extends reading delays, and provides calmer questions
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateSettings({ manualTiredMode: !isTiredMode })}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  isTiredMode
                    ? 'bg-[#9C382A] text-white shadow-xs'
                    : 'bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] border border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#9C382A]'
                }`}
              >
                {isTiredMode ? 'Gentle Rest Active' : 'Standard Pace'}
              </button>
            </div>

            {/* Read Aloud Audio */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#272A22] border border-[#DCD4C4] dark:border-[#3C4035]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#965A04]/15 text-[#965A04] dark:text-[#F5B83D]">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-[#141310] dark:text-[#FCFBF7]">
                    Voice Read-Aloud Engine
                  </div>
                  <div className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] font-semibold">
                    Automatically speaks questions, loving notes, and reminders aloud
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateSettings({ speakAudio: !isAudioEnabled })}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  isAudioEnabled
                    ? 'bg-[#264D24] text-white shadow-xs'
                    : 'bg-white dark:bg-[#1D1F1A] text-[#3D3A33] dark:text-[#D1D0C5] border border-[#DCD4C4] dark:border-[#3C4035]'
                }`}
              >
                {isAudioEnabled ? 'Voice Enabled' : 'Muted'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Save Bar */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Sample Data</span>
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs font-extrabold text-[#264D24] dark:text-[#8DA850] flex items-center gap-1 animate-pulse">
                <Check className="w-4 h-4" />
                Profile changes saved!
              </span>
            )}
            <button
              type="submit"
              className="flex items-center gap-2 px-7 py-3 rounded-full bg-[#264D24] hover:bg-[#1D3D1B] text-white font-extrabold text-sm shadow-md hover:scale-105 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save All Changes</span>
            </button>
          </div>
        </div>
      </form>

      {/* Persistent Disclaimer Notice */}
      <div className="rounded-3xl bg-[#FDF3DF] dark:bg-[#3D2D14] border-2 border-[#965A04] p-6 sm:p-8 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#965A04] text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="serif text-lg font-extrabold text-[#965A04] dark:text-[#F5B83D] mb-1">
              Important Framing & Non-Clinical Disclaimer
            </h3>
            <p className="text-xs sm:text-sm text-[#523202] dark:text-[#F5D899] font-medium leading-relaxed mb-4">
              Aapka Saathi (आपका साथी) is designed solely as a cognitive engagement and daily comfort companion for elderly individuals and their families. It is NOT a medical device, does not diagnose, treat, or cure any condition, and does not claim to slow cognitive decline.
            </p>
            <button
              onClick={() => setShowDisclaimerModal(true)}
              className="px-5 py-2.5 rounded-full bg-[#965A04] hover:bg-[#7D4902] text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
            >
              Open Full Non-Clinical Notice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
