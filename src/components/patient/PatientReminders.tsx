import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Circle,
  Home,
  Volume2,
  Clock,
  Pill,
  Droplet,
  Coffee,
  Sparkles,
  Calendar,
  Footprints,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Reminder, ReminderType } from '../../types';

export const PatientReminders: React.FC = () => {
  const { state, setPatientScreen, toggleReminder, speakText } = useApp();
  const reminders: Reminder[] = state?.reminders || [];

  const getReminderIcon = (type: ReminderType) => {
    switch (type) {
      case 'medicine':
        return <Pill className="w-8 h-8 text-[#9C382A]" />;
      case 'hydration':
        return <Droplet className="w-8 h-8 text-[#1E5670]" />;
      case 'meal':
        return <Coffee className="w-8 h-8 text-[#965A04]" />;
      case 'appointment':
        return <Calendar className="w-8 h-8 text-[#264D24]" />;
      case 'routine':
      default:
        return <Footprints className="w-8 h-8 text-[#264D24]" />;
    }
  };

  const handleToggle = (reminder: Reminder) => {
    toggleReminder(reminder.id);
    if (!reminder.completed_today) {
      speakText(`Wonderful! You marked "${reminder.label}" as done.`);
    }
  };

  const completedCount = reminders.filter((r) => r.completed_today).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setPatientScreen('home')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#264D24] text-sm font-extrabold text-[#141310] dark:text-[#FCFBF7] shadow-2xs transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4 text-[#264D24]" />
          <span>Home</span>
        </button>

        <div className="text-center">
          <h1 className="serif text-2xl sm:text-4xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
            Today's Routine & Care
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#3D3A33] dark:text-[#D1D0C5] mt-1">
            {completedCount} of {reminders.length} routines completed today 🌟
          </p>
        </div>

        <div className="w-16" />
      </div>

      {/* Reminders List */}
      <div className="space-y-4 sm:space-y-5 mb-8">
        {reminders.map((reminder) => {
          const isDone = reminder.completed_today;

          return (
            <motion.div
              key={reminder.id}
              whileHover={{ scale: 1.01 }}
              className={`rounded-3xl p-5 sm:p-7 border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 shadow-md ${
                isDone
                  ? 'bg-[#EBF3E8] dark:bg-[#1E2818] border-[#264D24] opacity-95'
                  : 'bg-white dark:bg-[#1D1F1A] border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#965A04]'
              }`}
            >
              <div className="flex items-start gap-4 sm:gap-5">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                    isDone ? 'bg-[#264D24]/20' : 'bg-[#F3EFE6] dark:bg-[#272A22]'
                  }`}
                >
                  {getReminderIcon(reminder.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F3EFE6] dark:bg-[#272A22] text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7]">
                      <Clock className="w-3.5 h-3.5 text-[#965A04]" />
                      {reminder.time}
                    </span>
                    {isDone && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#264D24] text-white text-[11px] font-extrabold">
                        Done Today ✨
                      </span>
                    )}
                  </div>

                  <h3
                    className={`text-xl sm:text-2xl font-bold ${
                      isDone
                        ? 'line-through text-[#264D24] dark:text-[#8DA850]'
                        : 'text-[#141310] dark:text-[#FCFBF7]'
                    }`}
                  >
                    {reminder.label}
                  </h3>

                  {reminder.notes && (
                    <p className="text-sm text-[#3D3A33] dark:text-[#D1D0C5] mt-1 font-medium">
                      {reminder.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Big Action Checkbox Button */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => speakText(`${reminder.label} scheduled for ${reminder.time}. ${reminder.notes || ''}`)}
                  className="p-3 rounded-2xl bg-[#F3EFE6] hover:bg-[#FBE8C4] text-[#264D24] dark:bg-[#272A22] dark:text-[#8DA850] transition-colors cursor-pointer"
                  title="Read aloud"
                >
                  <Volume2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleToggle(reminder)}
                  className={`px-6 py-4 rounded-2xl font-extrabold text-base sm:text-lg flex items-center gap-2.5 shadow-md transition-all cursor-pointer ${
                    isDone
                      ? 'bg-[#264D24] text-white hover:bg-[#1D3D1B]'
                      : 'bg-[#965A04] hover:bg-[#7D4B03] text-white hover:scale-105'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      <span>Done!</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-6 h-6" />
                      <span>Mark Done</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
