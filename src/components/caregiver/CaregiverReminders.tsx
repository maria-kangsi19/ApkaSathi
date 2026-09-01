import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Pill,
  Droplet,
  Coffee,
  Calendar,
  Footprints,
  X,
  Volume2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Reminder, ReminderType } from '../../types';

export const CaregiverReminders: React.FC = () => {
  const { state, addReminder, deleteReminder, toggleReminder, speakText } = useApp();
  const reminders = state?.reminders || [];

  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newType, setNewType] = useState<ReminderType>('routine');
  const [newNotes, setNewNotes] = useState('');

  const getReminderIcon = (type: ReminderType) => {
    switch (type) {
      case 'medicine':
        return <Pill className="w-5 h-5 text-[#9C382A] dark:text-[#E38B7D]" />;
      case 'hydration':
        return <Droplet className="w-5 h-5 text-[#1B6CA8] dark:text-[#64B5F6]" />;
      case 'meal':
        return <Coffee className="w-5 h-5 text-[#965A04] dark:text-[#F5B83D]" />;
      case 'appointment':
        return <Calendar className="w-5 h-5 text-[#264D24] dark:text-[#8DA850]" />;
      case 'routine':
      default:
        return <Footprints className="w-5 h-5 text-[#264D24] dark:text-[#8DA850]" />;
    }
  };

  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !newTime) return;

    await addReminder({
      time: newTime,
      label: newLabel,
      type: newType,
      notes: newNotes,
    });

    setNewLabel('');
    setNewTime('08:00 AM');
    setNewType('routine');
    setNewNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCD4C4] dark:border-[#3C4035] pb-6">
        <div>
          <h1 className="serif text-2xl sm:text-3xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
            Daily Routine & Reminders
          </h1>
          <p className="text-xs sm:text-sm text-[#3D3A33] dark:text-[#D1D0C5] font-semibold mt-1">
            Gentle structured routines that appear as large, simple cards on your loved one's companion screen.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#264D24] hover:bg-[#1D3D1B] text-white text-sm font-extrabold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Routine</span>
        </button>
      </div>

      {/* Routine Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {reminders.map((reminder) => {
          const isDone = reminder.completed_today;

          return (
            <motion.div
              key={reminder.id}
              layout
              className={`rounded-3xl p-5 sm:p-6 border-2 transition-all flex flex-col justify-between ${
                isDone
                  ? 'bg-[#EBF3E8] dark:bg-[#242E18] border-[#264D24]/40'
                  : 'bg-white dark:bg-[#1D1F1A] border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#965A04]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#F3EFE6] dark:bg-[#272A22]">
                      {getReminderIcon(reminder.type)}
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D3A33] dark:text-[#D1D0C5]">
                      {reminder.type}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE6] dark:bg-[#272A22] text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] border border-[#DCD4C4] dark:border-[#3C4035]">
                    <Clock className="w-3.5 h-3.5 text-[#965A04] dark:text-[#F5B83D]" />
                    {reminder.time}
                  </span>
                </div>

                <h3
                  className={`serif text-lg sm:text-xl font-extrabold mb-1 ${
                    isDone ? 'line-through text-[#3D3A33] dark:text-[#D1D0C5]' : 'text-[#141310] dark:text-[#FCFBF7]'
                  }`}
                >
                  {reminder.label}
                </h3>

                {reminder.notes && (
                  <p className="text-xs sm:text-sm text-[#3D3A33] dark:text-[#D1D0C5] font-semibold mt-1">
                    {reminder.notes}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-[#DCD4C4] dark:border-[#3C4035] flex items-center justify-between">
                <button
                  onClick={() => toggleReminder(reminder.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    isDone
                      ? 'bg-[#264D24] text-white shadow-xs'
                      : 'bg-[#F3EFE6] dark:bg-[#272A22] text-[#141310] dark:text-[#FCFBF7] border border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#264D24]'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Circle className="w-4 h-4 text-[#3D3A33] dark:text-[#D1D0C5]" />}
                  <span>{isDone ? 'Done Today' : 'Mark Done'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakText(`${reminder.label} scheduled for ${reminder.time}`)}
                    className="p-2 rounded-full text-[#264D24] dark:text-[#8DA850] hover:bg-[#EBF3E8] dark:hover:bg-[#242E18] transition-colors cursor-pointer"
                    title="Test audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="p-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Delete routine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Reminder Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#264D24] p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="serif text-xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
                  Add Daily Routine Reminder
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5 text-[#3D3A33] dark:text-[#D1D0C5]" />
                </button>
              </div>

              <form onSubmit={handleSaveReminder} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                    Routine Label *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Afternoon Ginger Tea & Rest"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                      Time *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 04:30 PM"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                      Type *
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as ReminderType)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none cursor-pointer"
                    >
                      <option value="routine">Routine</option>
                      <option value="medicine">Medicine</option>
                      <option value="hydration">Hydration</option>
                      <option value="meal">Meal</option>
                      <option value="appointment">Appointment</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                    Gentle Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Fresh warm tea with light Naga cardamom biscuits"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DCD4C4] dark:border-[#3C4035]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-full text-sm font-extrabold text-[#3D3A33] dark:text-[#D1D0C5] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#264D24] hover:bg-[#1D3D1B] text-white text-sm font-extrabold shadow-md cursor-pointer"
                  >
                    Save Routine
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
