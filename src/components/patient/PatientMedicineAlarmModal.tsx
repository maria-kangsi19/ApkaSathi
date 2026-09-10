import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pill,
  CheckCircle2,
  Clock,
  Volume2,
  BellRing,
  ShieldCheck,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playMedicineAlarmChime } from '../../utils/audio';

export const PatientMedicineAlarmModal: React.FC = () => {
  const {
    activeMedicineAlarm,
    setActiveMedicineAlarm,
    logMedicineAction,
    speakText,
    state,
  } = useApp();

  if (!activeMedicineAlarm) return null;

  const { medicine, scheduledTime, isTest } = activeMedicineAlarm;
  const patient = state?.patient;

  const handleTaken = () => {
    logMedicineAction(medicine.id, scheduledTime, 'taken');
  };

  const handleSnooze = () => {
    logMedicineAction(medicine.id, scheduledTime, 'snoozed');
  };

  const handleSpeak = () => {
    playMedicineAlarmChime();
    speakText(`Time for your medicine: ${medicine.name}, ${medicine.dosage}. ${medicine.notes || ''}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-[#1D1F1A] rounded-[44px] p-6 sm:p-10 max-w-xl w-full border-4 border-[#9C382A] shadow-2xl space-y-6 text-center relative overflow-hidden"
        >
          {/* Subtle top indicator */}
          <div className="flex items-center justify-between pb-2 border-b border-[#EBE5D8] dark:border-[#32362C]">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAE4E1] text-[#9C382A] dark:bg-[#3D2321] dark:text-[#EA9688] text-xs font-black uppercase tracking-wider">
              <BellRing className="w-3.5 h-3.5 animate-bounce" />
              <span>{isTest ? 'Test Medicine Alarm' : 'Daily Medicine Reminder'}</span>
            </div>

            <button
              onClick={handleSpeak}
              className="p-2 rounded-full bg-[#F3EFE6] dark:bg-[#272A22] text-[#264D24] dark:text-[#9BB858] hover:scale-105 transition-transform cursor-pointer"
              title="Hear reminder spoken aloud"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Large Visual Medicine Icon */}
          <div className="relative mx-auto w-24 h-24 rounded-[32px] bg-[#FAE4E1] dark:bg-[#3D2321] text-[#9C382A] dark:text-[#EA9688] flex items-center justify-center shadow-md">
            <Pill className="w-12 h-12" />
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#9C382A] text-white flex items-center justify-center text-xs font-black animate-ping" />
          </div>

          {/* Main Copy */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase text-[#66635A] dark:text-[#8E8D85] tracking-widest block">
              Scheduled for {scheduledTime}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#141310] dark:text-[#FCFBF7] leading-tight">
              Time for your medicine: <br />
              <span className="text-[#9C382A] dark:text-[#EA9688]">{medicine.name}</span>
            </h2>

            {/* Dosage Badge */}
            <div className="inline-block px-5 py-2 rounded-2xl bg-[#F3EFE6] dark:bg-[#272A22] border border-[#DCD4C4] dark:border-[#3C4035] text-base font-black text-[#264D24] dark:text-[#9BB858]">
              {medicine.dosage}
            </div>

            {/* Notes if present */}
            {medicine.notes && (
              <p className="text-sm font-bold text-[#3D3A33] dark:text-[#D1D0C5] bg-[#F9F7F1] dark:bg-[#23261F] p-4 rounded-2xl border border-[#EBE5D8] dark:border-[#32362C] max-w-md mx-auto">
                "{medicine.notes}"
              </p>
            )}
          </div>

          {/* Large Touch Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              onClick={handleTaken}
              className="py-5 px-6 rounded-3xl bg-[#264D24] hover:bg-[#1E3E1C] text-white font-black text-lg sm:text-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>Taken ✓</span>
            </button>

            <button
              onClick={handleSnooze}
              className="py-5 px-6 rounded-3xl bg-[#F3EFE6] dark:bg-[#272A22] hover:bg-[#EAE4D7] text-[#141310] dark:text-[#FCFBF7] border-2 border-[#BFB5A2] dark:border-[#4A4F41] font-black text-base sm:text-lg shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Clock className="w-5 h-5 text-[#965A04]" />
              <span>Remind Later (15 min)</span>
            </button>
          </div>

          {/* Safety Framing in UI */}
          <div className="pt-3 border-t border-[#EBE5D8] dark:border-[#32362C] flex items-center justify-center gap-2 text-[11px] font-bold text-[#66635A] dark:text-[#8E8D85]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#264D24]" />
            <span>Safety tool: This reminder logs taking. It does not adjust doses or provide medical treatment.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
