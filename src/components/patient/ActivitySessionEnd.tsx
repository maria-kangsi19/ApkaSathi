import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Coffee,
  Sparkles,
  Home,
  Image as ImageIcon,
  CheckCircle2,
  Volume2,
  Smile,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ActivitySessionEnd: React.FC = () => {
  const { state, setPatientScreen, speakText, triggerCelebration } = useApp();

  const patientName = state?.patient?.nickname || state?.patient?.name || 'Grandmother';
  const closingMessage = `What a lovely time together, ${patientName}! Thank you for sharing these cherished memories with us. Have a peaceful, restful day.`;

  useEffect(() => {
    triggerCelebration();
    speakText(closingMessage);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-8 sm:p-12 shadow-2xl relative overflow-hidden"
      >
        {/* Soft decorative background circles */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#965A04]/10 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-[#264D24]/10 pointer-events-none" />

        {/* Big Heart & Tea Icon */}
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#264D24] text-white flex items-center justify-center shadow-xl mx-auto">
            <Heart className="w-12 h-12 sm:w-14 sm:h-14 fill-current text-[#F5B83D]" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[#9C382A] text-white flex items-center justify-center shadow-md">
            <Coffee className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Gentle Heading (Strictly Non-Clinical / No Scores) */}
        <h1 className="serif text-3xl sm:text-4xl font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-3 tracking-tight">
          What a Lovely Time Together!
        </h1>

        <p className="text-lg sm:text-xl text-[#3D3A33] dark:text-[#D1D0C5] leading-relaxed mb-8 max-w-lg mx-auto font-medium">
          {closingMessage}
        </p>

        {/* Read aloud button */}
        <button
          onClick={() => speakText(closingMessage)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EBF3E8] dark:bg-[#242E18] border-2 border-[#264D24]/30 text-sm font-extrabold text-[#264D24] dark:text-[#8DA850] hover:bg-[#264D24] hover:text-white transition-colors mb-8 shadow-2xs cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          <span>Listen to Loving Note</span>
        </button>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8">
          <button
            onClick={() => setPatientScreen('family_gallery')}
            className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#272A22] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#9C382A] text-left transition-all group cursor-pointer"
          >
            <ImageIcon className="w-6 h-6 text-[#9C382A] dark:text-[#E38B7D] mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-extrabold text-sm text-[#141310] dark:text-[#FCFBF7]">Family Photos</div>
            <div className="text-xs font-semibold text-[#3D3A33] dark:text-[#D1D0C5]">Look at album</div>
          </button>

          <button
            onClick={() => setPatientScreen('reminders')}
            className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#272A22] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#965A04] text-left transition-all group cursor-pointer"
          >
            <CheckCircle2 className="w-6 h-6 text-[#965A04] dark:text-[#F5B83D] mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-extrabold text-sm text-[#141310] dark:text-[#FCFBF7]">Daily Routine</div>
            <div className="text-xs font-semibold text-[#3D3A33] dark:text-[#D1D0C5]">Check reminders</div>
          </button>

          <button
            onClick={() => setPatientScreen('home')}
            className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#272A22] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#264D24] text-left transition-all group cursor-pointer"
          >
            <Home className="w-6 h-6 text-[#264D24] dark:text-[#8DA850] mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-extrabold text-sm text-[#141310] dark:text-[#FCFBF7]">Main Home</div>
            <div className="text-xs font-semibold text-[#3D3A33] dark:text-[#D1D0C5]">Return to main</div>
          </button>
        </div>

        {/* Primary Return Button */}
        <button
          onClick={() => setPatientScreen('home')}
          className="w-full py-4 rounded-full bg-[#264D24] hover:bg-[#1D3D1B] text-white font-extrabold text-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
        >
          Return to Patient Home
        </button>
      </motion.div>
    </div>
  );
};
