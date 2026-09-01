import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, HeartHandshake, Info, X, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DisclaimerModal: React.FC = () => {
  const { showDisclaimerModal, setShowDisclaimerModal, state } = useApp();

  if (!showDisclaimerModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] shadow-2xl p-6 md:p-8 text-[#141310] dark:text-[#FCFBF7]"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b-2 border-[#C8BFAD] dark:border-[#3C4035] pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E4EFE0] dark:bg-[#242E18] text-[#183C17] dark:text-[#8DA850] flex items-center justify-center font-bold">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#0C0B09] dark:text-[#FCFBF7]">
                  About Aapka Saathi & Core Care Framing
                </h2>
                <p className="text-sm font-black text-[#1C1B17] dark:text-[#E2E0D5]">
                  आपका साथी — Loving Companion for Daily Engagement & Elder Care
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDisclaimerModal(false)}
              className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[#0C0B09] dark:text-[#FCFBF7] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Primary Mandate Box */}
          <div className="rounded-2xl bg-[#FAEBCE] dark:bg-[#32281E] border-2 border-[#784400] p-5 mb-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-[#784400] dark:text-[#F5B83D] shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm leading-relaxed text-[#422300] dark:text-[#FBE8C4] font-bold">
                <h3 className="font-black text-base text-[#2E1800] dark:text-[#FCFBF7]">
                  Non-Clinical Daily Companion Notice
                </h3>
                <p>
                  <strong>Aapka Saathi supports daily engagement, connection, and comfort.</strong> It does <strong>NOT</strong> diagnose, treat, cure, or claim to slow dementia progression or any cognitive condition.
                </p>
                <p>
                  Every piece of UI copy, every AI-generated response, and every dashboard metric avoids medical and clinical claim language. We use supportive, descriptive words like <em>"supports," "companion," "engagement," "comfort," "seemed,"</em> and <em>"observed"</em> — never <em>"improves," "treats," "therapy," "slows decline," "cognitive score,"</em> or <em>"diagnosis."</em>
                </p>
              </div>
            </div>
          </div>

          {/* Key Principles */}
          <div className="space-y-4 text-sm text-[#1C1B17] dark:text-[#E2E0D5] mb-6">
            <h4 className="font-black text-base text-[#0C0B09] dark:text-[#FCFBF7] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#183C17] dark:text-[#8DA850]" />
              Our Core Cultural & Care Principles
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#F0EADF] dark:bg-[#272A22] border-2 border-[#C8BFAD] dark:border-[#3C4035]">
                <p className="font-black text-[#0C0B09] dark:text-[#FCFBF7] mb-1">👵 Authentic Family Media Only</p>
                <p className="text-xs leading-relaxed text-[#1C1B17] dark:text-[#E2E0D5] font-bold">
                  Memory prompts are populated with your real family photos, local sounds, and voice recordings — never impersonal generic puzzles.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F0EADF] dark:bg-[#272A22] border-2 border-[#C8BFAD] dark:border-[#3C4035]">
                <p className="font-black text-[#0C0B09] dark:text-[#FCFBF7] mb-1">🌿 North Eastern & Indian Heritage</p>
                <p className="text-xs leading-relaxed text-[#1C1B17] dark:text-[#E2E0D5] font-bold">
                  Tailored for regional traditions with multilingual support, warm community greetings, and familiar landscapes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F0EADF] dark:bg-[#272A22] border-2 border-[#C8BFAD] dark:border-[#3C4035]">
                <p className="font-black text-[#0C0B09] dark:text-[#FCFBF7] mb-1">❤️ No Judgment or Testing</p>
                <p className="text-xs leading-relaxed text-[#1C1B17] dark:text-[#E2E0D5] font-bold">
                  No scores, no red error marks, and no timer stress. When an answer differs, Gemini offers gentle, loving recognition.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F0EADF] dark:bg-[#272A22] border-2 border-[#C8BFAD] dark:border-[#3C4035]">
                <p className="font-black text-[#0C0B09] dark:text-[#FCFBF7] mb-1">🏡 Shared Caregiver Support</p>
                <p className="text-xs leading-relaxed text-[#1C1B17] dark:text-[#E2E0D5] font-bold">
                  Caregivers receive qualitative, warm narrative observations to help notice what brings their loved one peace and joy.
                </p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between border-t-2 border-[#C8BFAD] dark:border-[#3C4035] pt-4">
            <p className="text-xs text-[#1C1B17] dark:text-[#E2E0D5] flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-[#784400] dark:text-[#F5B83D]" />
              Always consult qualified local healthcare practitioners for medical care.
            </p>
            <button
              onClick={() => setShowDisclaimerModal(false)}
              className="px-6 py-2.5 rounded-full bg-[#183C17] hover:bg-[#112C10] text-white font-black text-sm transition-colors shadow-xs cursor-pointer"
            >
              Understood
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
