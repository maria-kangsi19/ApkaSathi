import React from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Users,
  Image as ImageIcon,
  Mic,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Smile,
  Sun,
  Coffee,
  Stethoscope,
  KeyRound,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RoleSelectionScreen: React.FC = () => {
  const { setAppMode, setPatientScreen, state, setShowDisclaimerModal } = useApp();

  const patient = state?.patient;
  const caregiver = state?.caregiver;
  const photoCount = state?.photos?.length || 0;
  const noteCount = state?.voiceNotes?.length || 0;
  const reminderCount = state?.reminders?.length || 0;

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        {/* Welcome Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E4EFE0] dark:bg-[#242E18] border border-[#183C17]/40 text-[#183C17] dark:text-[#8DA850] text-xs sm:text-sm font-black mb-4 uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#784400] dark:text-[#F5B83D]" />
            Elder Care & Family Loving Companion
          </div>

          <h1 className="serif text-4xl sm:text-6xl font-black tracking-tight text-[#143513] dark:text-[#FFFFFF] mb-3">
            Aapka Saathi <span className="brand italic font-black text-2xl sm:text-4xl text-[#6E3B00] dark:text-[#F7C04D]">(आपका साथी)</span>
          </h1>

          <p className="text-base sm:text-lg text-[#1C1B17] dark:text-[#E2E0D5] font-bold leading-relaxed">
            A gentle daily bridge of love, familiar faces, cherished voices, and peaceful routines for elders, families, and healthcare providers.
          </p>

          {/* Cultural Community Badge */}
          {patient && (
            <div className="mt-4 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white dark:bg-[#1D1F1A] border-2 border-[#C8BFAD] dark:border-[#3C4035] card-shadow text-xs sm:text-sm text-[#0C0B09] dark:text-[#FCFBF7] font-bold">
              <span className="w-3 h-3 rounded-full bg-[#183C17] animate-pulse"></span>
              <span>
                Personalized for: <strong className="text-[#183C17] dark:text-[#8DA850]">{patient.name}</strong> ({patient.age} yrs, {patient.community} Heritage)
              </span>
            </div>
          )}
        </div>

        {/* Three Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-6 mb-8">
          {/* Card 1: Patient Mode */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setAppMode('patient');
              setPatientScreen('home');
            }}
            className="group relative cursor-pointer rounded-[36px] bg-white dark:bg-[#1D1F1A] border-2 border-[#C8BFAD] dark:border-[#3C4035] hover:border-[#183C17] dark:hover:border-[#8DA850] p-6 sm:p-7 card-shadow transition-all flex flex-col justify-between"
          >
            <div className="absolute top-5 right-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4EFE0] dark:bg-[#242E18] text-[#183C17] dark:text-[#8DA850] font-black text-xs uppercase tracking-wider border border-[#183C17]/30">
                🌸 Large UI & Voice
              </span>
            </div>

            <div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] bg-[#183C17] text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-105 transition-transform">
                <Smile className="w-8 h-8 sm:w-9 sm:h-9 text-[#F5B83D]" />
              </div>

              <h2 className="serif text-2xl font-black text-[#0C0B09] dark:text-[#FCFBF7] mb-2">
                Elder Companion
              </h2>
              <p className="text-xs sm:text-sm text-[#1C1B17] dark:text-[#E2E0D5] mb-5 leading-relaxed font-bold">
                Simple, extra-large touch cards. Look at beloved family photos, hear familiar voices, explore cherished places, and follow peaceful daily routines.
              </p>

              <div className="space-y-2.5 text-xs text-[#0C0B09] dark:text-[#FCFBF7] font-bold mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#183C17] dark:bg-[#8DA850] shrink-0" />
                  <span>"Who Is This?" family face recognition</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#183C17] dark:bg-[#8DA850] shrink-0" />
                  <span>"Sounds of Home" with tunes & laughter</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#183C17] dark:bg-[#8DA850] shrink-0" />
                  <span>One-touch instant call cards for family</span>
                </div>
              </div>
            </div>

            <button className="w-full py-3.5 rounded-full bg-[#183C17] hover:bg-[#112C10] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md uppercase tracking-wider transition-all cursor-pointer">
              <span>Open Patient Mode</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Card 2: Caregiver Hub */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setAppMode('caregiver');
            }}
            className="group relative cursor-pointer rounded-[36px] bg-white dark:bg-[#1D1F1A] border-2 border-[#C8BFAD] dark:border-[#3C4035] hover:border-[#822417] dark:hover:border-[#E38B7D] p-6 sm:p-7 card-shadow transition-all flex flex-col justify-between"
          >
            <div className="absolute top-5 right-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBE6E3] dark:bg-[#3A2220] text-[#822417] dark:text-[#E38B7D] font-black text-xs uppercase tracking-wider border border-[#822417]/30">
                🏡 Family Hub
              </span>
            </div>

            <div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] bg-[#822417] text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-105 transition-transform">
                <Users className="w-8 h-8 sm:w-9 sm:h-9 text-[#FCFBF7]" />
              </div>

              <h2 className="serif text-2xl font-black text-[#0C0B09] dark:text-[#FCFBF7] mb-2">
                Caregiver Hub
              </h2>
              <p className="text-xs sm:text-sm text-[#1C1B17] dark:text-[#E2E0D5] mb-5 leading-relaxed font-bold">
                Personalize family memories, manage medicine schedules, generate secure doctor access codes, and track daily serenity trends.
              </p>

              {/* Status summary pill */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#F0EADF] dark:bg-[#272A22] border-2 border-[#C8BFAD] dark:border-[#3C4035] mb-6 text-center text-xs">
                <div>
                  <div className="font-black text-[#183C17] dark:text-[#8DA850] text-base">{photoCount}</div>
                  <div className="text-[11px] text-[#1C1B17] dark:text-[#E2E0D5] font-bold">Photos</div>
                </div>
                <div>
                  <div className="font-black text-[#822417] dark:text-[#E38B7D] text-base">{noteCount}</div>
                  <div className="text-[11px] text-[#1C1B17] dark:text-[#E2E0D5] font-bold">Audio</div>
                </div>
                <div>
                  <div className="font-black text-[#784400] dark:text-[#F5B83D] text-base">{reminderCount}</div>
                  <div className="text-[11px] text-[#1C1B17] dark:text-[#E2E0D5] font-bold">Routines</div>
                </div>
              </div>
            </div>

            <button className="w-full py-3.5 rounded-full bg-[#822417] hover:bg-[#6B1B10] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md uppercase tracking-wider transition-all cursor-pointer">
              <span>Open Caregiver Hub</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Card 3: Doctor / Healthcare Provider Portal */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setAppMode('doctor');
            }}
            className="group relative cursor-pointer rounded-[36px] bg-white dark:bg-[#1D1F1A] border-2 border-[#C8BFAD] dark:border-[#3C4035] hover:border-[#1E4D6B] dark:hover:border-[#60A5FA] p-6 sm:p-7 card-shadow transition-all flex flex-col justify-between"
          >
            <div className="absolute top-5 right-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3EFF7] dark:bg-[#1C2C39] text-[#1E4D6B] dark:text-[#93C5FD] font-black text-xs uppercase tracking-wider border border-[#1E4D6B]/30">
                🩺 Doctor Access
              </span>
            </div>

            <div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] bg-[#1E4D6B] text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-105 transition-transform">
                <Stethoscope className="w-8 h-8 sm:w-9 sm:h-9 text-[#FCFBF7]" />
              </div>

              <h2 className="serif text-2xl font-black text-[#0C0B09] dark:text-[#FCFBF7] mb-2">
                Doctor / Clinician
              </h2>
              <p className="text-xs sm:text-sm text-[#1C1B17] dark:text-[#E2E0D5] mb-5 leading-relaxed font-bold">
                Consent-based, read-only tracking dashboard for consulting physicians to review adherence logs and daily engagement trends.
              </p>

              <div className="space-y-2.5 text-xs text-[#0C0B09] dark:text-[#FCFBF7] font-bold mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1E4D6B] dark:bg-[#93C5FD] shrink-0" />
                  <span>Descriptive, caregiver-recorded context only</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1E4D6B] dark:bg-[#93C5FD] shrink-0" />
                  <span>Requires 6-character patient access code</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1E4D6B] dark:bg-[#93C5FD] shrink-0" />
                  <span>Strict privacy: No family photos or voice notes</span>
                </div>
              </div>
            </div>

            <button className="w-full py-3.5 rounded-full bg-[#1E4D6B] hover:bg-[#16384E] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md uppercase tracking-wider transition-all cursor-pointer">
              <span>Open Doctor Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Bottom Banner with Framing & Quick Disclaimer */}
        <div className="p-4 sm:p-5 rounded-full bg-white dark:bg-[#1D1F1A] border-2 border-[#C8BFAD] dark:border-[#3C4035] card-shadow flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm px-6">
          <div className="flex items-center gap-3 text-[#1C1B17] dark:text-[#E2E0D5] font-bold">
            <ShieldCheck className="w-5 h-5 text-[#784400] dark:text-[#F5B83D] shrink-0" />
            <span>
              Aapka Saathi supports daily connection and comfort. Non-diagnostic, descriptive records only.
            </span>
          </div>
          <button
            onClick={() => setShowDisclaimerModal(true)}
            className="text-[#784400] dark:text-[#F5B83D] hover:underline font-black whitespace-nowrap uppercase tracking-wider text-xs cursor-pointer"
          >
            Read Framing & Notice →
          </button>
        </div>
      </div>
    </div>
  );
};

