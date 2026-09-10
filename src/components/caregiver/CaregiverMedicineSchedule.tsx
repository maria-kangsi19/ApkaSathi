import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Pill,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit2,
  Volume2,
  BellRing,
  ShieldCheck,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Medicine } from '../../types';

export const CaregiverMedicineSchedule: React.FC = () => {
  const {
    state,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    triggerTestMedicineAlarm,
    highlightedMedicineId,
    setHighlightedMedicineId,
    speakText,
  } = useApp();

  const patient = state?.patient;
  const medicines = state?.medicines || [];
  const logs = state?.medicineLogs || [];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formTimes, setFormTimes] = useState<string[]>(['08:00 AM']);
  const [newTimeInput, setNewTimeInput] = useState('08:00 AM');
  const [formNotes, setFormNotes] = useState('');
  const [formActive, setFormActive] = useState(true);

  const resetForm = () => {
    setFormName('');
    setFormDosage('');
    setFormTimes(['08:00 AM']);
    setFormNotes('');
    setFormActive(true);
    setEditingMedicine(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (med: Medicine) => {
    setEditingMedicine(med);
    setFormName(med.name);
    setFormDosage(med.dosage);
    setFormTimes(med.times && med.times.length > 0 ? [...med.times] : ['08:00 AM']);
    setFormNotes(med.notes || '');
    setFormActive(med.active);
    setIsAddModalOpen(true);
  };

  const handleAddTime = () => {
    if (newTimeInput && !formTimes.includes(newTimeInput)) {
      setFormTimes([...formTimes, newTimeInput]);
    }
  };

  const handleRemoveTime = (timeToRemove: string) => {
    if (formTimes.length <= 1) return; // Keep at least one time
    setFormTimes(formTimes.filter((t) => t !== timeToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDosage.trim()) return;

    if (editingMedicine) {
      await updateMedicine(editingMedicine.id, {
        name: formName.trim(),
        dosage: formDosage.trim(),
        times: formTimes,
        notes: formNotes.trim(),
        active: formActive,
      });
    } else {
      await addMedicine({
        name: formName.trim(),
        dosage: formDosage.trim(),
        times: formTimes,
        notes: formNotes.trim(),
        active: formActive,
      });
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const todayDateStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner with Safety Framing */}
      <div className="bg-white dark:bg-[#1D1F1A] rounded-[32px] p-6 sm:p-8 border-2 border-[#DCD4C4] dark:border-[#3C4035] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAE4E1] text-[#9C382A] dark:bg-[#3D2321] dark:text-[#EA9688] text-xs font-black uppercase tracking-wider">
              <Pill className="w-3.5 h-3.5" />
              <span>Medicine Schedule & Log</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#141310] dark:text-[#FCFBF7]">
              {patient?.name || 'Patient'}'s Daily Medicines
            </h1>
            <p className="text-sm font-bold text-[#66635A] dark:text-[#8E8D85] max-w-2xl">
              Configure daily scheduled times, view real-time adherence logs, and test triggers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => triggerTestMedicineAlarm()}
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#F3EFE6] dark:bg-[#272A22] border-2 border-[#BFB5A2] dark:border-[#4A4F41] text-[#141310] dark:text-[#FCFBF7] text-xs font-black hover:border-[#143513] transition-all cursor-pointer shadow-xs"
              title="Test trigger alarm on patient view immediately without waiting for scheduled time"
            >
              <BellRing className="w-4 h-4 text-[#9C382A]" />
              <span>Test Trigger Alarm Now ⚡</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#264D24] hover:bg-[#1E3E1C] text-white text-xs sm:text-sm font-black shadow-md hover:scale-105 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Medicine</span>
            </button>
          </div>
        </div>

        {/* Framing & Medical Disclaimer Notice */}
        <div className="mt-6 p-4 rounded-2xl bg-[#F0EADF] dark:bg-[#272A22] border border-[#BFB5A2] dark:border-[#4A4F41] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#264D24] dark:text-[#9BB858] shrink-0 mt-0.5" />
          <p className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] leading-relaxed font-bold">
            <span className="font-black text-[#141310] dark:text-[#FCFBF7]">Safety & Support Framing: </span>
            This feature reminds and logs daily medicine taking. It does not provide medical treatment,
            diagnose conditions, or adjust dosages. Always consult your family physician regarding clinical decisions.
          </p>
        </div>
      </div>

      {/* Medicines List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#141310] dark:text-[#FCFBF7] flex items-center gap-2">
            <span>Scheduled Medicines ({medicines.length})</span>
          </h2>
          <span className="text-xs text-[#66635A] dark:text-[#8E8D85] font-bold">
            All active medicines sync automatically to Patient view
          </span>
        </div>

        {medicines.length === 0 ? (
          <div className="bg-white dark:bg-[#1D1F1A] rounded-[32px] p-12 text-center border-2 border-dashed border-[#DCD4C4] dark:border-[#3C4035]">
            <Pill className="w-12 h-12 text-[#BFB5A2] mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-black text-[#141310] dark:text-[#FCFBF7]">No Medicines Added Yet</h3>
            <p className="text-sm font-bold text-[#66635A] dark:text-[#8E8D85] mt-1 mb-6">
              Add your elder's daily vitamins or prescribed tablets to enable full-screen gentle reminders.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-6 py-3 rounded-full bg-[#264D24] text-white text-xs font-black cursor-pointer shadow-md"
            >
              + Add First Medicine
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((med) => {
              const isHighlighted = highlightedMedicineId === med.id;
              // Check today's logs for this medicine
              const todayMedLogs = logs.filter((l) => {
                if (l.medicine_id !== med.id) return false;
                if (!l.actioned_at) return false;
                const logDate = new Date(l.actioned_at).toISOString().split('T')[0];
                return logDate === todayDateStr;
              });

              const isTakenToday = todayMedLogs.some((l) => l.status === 'taken');

              return (
                <div
                  key={med.id}
                  className={`bg-white dark:bg-[#1D1F1A] rounded-[32px] p-6 border-2 transition-all flex flex-col justify-between shadow-xs ${
                    isHighlighted
                      ? 'border-[#9C382A] ring-4 ring-[#9C382A]/20 bg-[#FFF7F5] dark:bg-[#2A1D1B]'
                      : 'border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#264D24]'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            med.active
                              ? 'bg-[#FAE4E1] text-[#9C382A] dark:bg-[#3D2321] dark:text-[#EA9688]'
                              : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                          }`}
                        >
                          <Pill className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-black text-lg text-[#141310] dark:text-[#FCFBF7] leading-tight">
                            {med.name}
                          </h3>
                          <p className="text-xs font-black text-[#264D24] dark:text-[#9BB858] mt-0.5">
                            {med.dosage}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(med)}
                          className="p-2 rounded-full hover:bg-[#F3EFE6] dark:hover:bg-[#272A22] text-[#66635A] dark:text-[#8E8D85] cursor-pointer"
                          title="Edit medicine"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMedicine(med.id)}
                          className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 cursor-pointer"
                          title="Delete medicine"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isHighlighted && (
                      <div className="px-3 py-1.5 rounded-xl bg-[#FAE4E1] dark:bg-[#3D2321] border border-[#9C382A]/30 text-[#9C382A] dark:text-[#EA9688] text-xs font-black flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Missed Reminder Flagged Today</span>
                      </div>
                    )}

                    {/* Scheduled Times Badges */}
                    <div>
                      <span className="text-[11px] font-black uppercase text-[#66635A] dark:text-[#8E8D85] tracking-wider block mb-1.5">
                        Daily Times:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {med.times.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F3EFE6] dark:bg-[#272A22] text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] border border-[#DCD4C4] dark:border-[#3C4035]"
                          >
                            <Clock className="w-3 h-3 text-[#965A04]" />
                            <span>{t}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {med.notes && (
                      <p className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] bg-[#F9F7F1] dark:bg-[#23261F] p-3 rounded-2xl font-bold border border-[#EBE5D8] dark:border-[#32362C]">
                        {med.notes}
                      </p>
                    )}

                    {/* Today's Status */}
                    <div className="pt-2 border-t border-[#EBE5D8] dark:border-[#32362C] flex items-center justify-between text-xs font-bold">
                      <span className="text-[#66635A] dark:text-[#8E8D85]">Status Today:</span>
                      {isTakenToday ? (
                        <span className="inline-flex items-center gap-1 text-[#264D24] dark:text-[#9BB858] font-black">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Taken ✓
                        </span>
                      ) : (
                        <span className="text-[#965A04] dark:text-[#E0A838] font-black">
                          Pending / Scheduled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="mt-6 pt-4 border-t border-[#EBE5D8] dark:border-[#32362C] flex items-center justify-between">
                    <button
                      onClick={() => updateMedicine(med.id, { active: !med.active })}
                      className={`text-xs font-extrabold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                        med.active
                          ? 'bg-[#E0EDE0] text-[#143513] dark:bg-[#263319] dark:text-[#9BB858]'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                      }`}
                    >
                      {med.active ? 'Active Reminders' : 'Paused'}
                    </button>

                    <button
                      onClick={() => triggerTestMedicineAlarm(med.id)}
                      className="text-xs font-extrabold text-[#9C382A] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <BellRing className="w-3 h-3" />
                      <span>Test Alarm</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Adherence Log Table */}
      <div className="bg-white dark:bg-[#1D1F1A] rounded-[32px] p-6 sm:p-8 border-2 border-[#DCD4C4] dark:border-[#3C4035] shadow-xs">
        <h3 className="text-lg font-black text-[#141310] dark:text-[#FCFBF7] mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#264D24]" />
          <span>Recent Medicine Action History</span>
        </h3>

        {logs.length === 0 ? (
          <p className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85] py-4 text-center">
            No medicine action logs recorded yet. When reminders are responded to on the patient screen, logs will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#DCD4C4] dark:border-[#3C4035] text-[#66635A] dark:text-[#8E8D85] font-black uppercase text-[11px] tracking-wider">
                  <th className="pb-3">Medicine</th>
                  <th className="pb-3">Scheduled Time</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actioned At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE5D8] dark:divide-[#32362C]">
                {logs.slice(0, 8).map((log) => {
                  const med = medicines.find((m) => m.id === log.medicine_id);
                  const formattedDate = log.actioned_at
                    ? new Date(log.actioned_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short',
                      })
                    : 'N/A';

                  return (
                    <tr key={log.id} className="font-bold text-[#141310] dark:text-[#FCFBF7]">
                      <td className="py-3 font-black flex items-center gap-2">
                        <Pill className="w-3.5 h-3.5 text-[#9C382A]" />
                        <span>{med?.name || 'Medicine'}</span>
                      </td>
                      <td className="py-3 text-[#66635A] dark:text-[#8E8D85]">
                        {log.scheduled_time}
                      </td>
                      <td className="py-3">
                        {log.status === 'taken' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E0EDE0] text-[#143513] dark:bg-[#263319] dark:text-[#9BB858] font-black text-xs">
                            Taken ✓
                          </span>
                        )}
                        {log.status === 'snoozed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 font-black text-xs">
                            Snoozed 15m
                          </span>
                        )}
                        {log.status === 'missed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 font-black text-xs">
                            Missed
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-[#66635A] dark:text-[#8E8D85]">{formattedDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Medicine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#1D1F1A] rounded-[36px] p-6 sm:p-8 max-w-lg w-full border-2 border-[#DCD4C4] dark:border-[#3C4035] shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#EBE5D8] dark:border-[#32362C]">
              <h3 className="text-xl font-black text-[#141310] dark:text-[#FCFBF7] flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#9C382A]" />
                <span>{editingMedicine ? 'Edit Medicine' : '+ Add New Medicine'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[#66635A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-[#66635A] dark:text-[#8E8D85] mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amlodipine, Vitamin D3"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border-2 border-[#DCD4C4] dark:border-[#3C4035] text-sm font-bold text-[#141310] dark:text-[#FCFBF7] focus:outline-hidden focus:border-[#264D24]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#66635A] dark:text-[#8E8D85] mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5mg — 1 tablet with warm water"
                  value={formDosage}
                  onChange={(e) => setFormDosage(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border-2 border-[#DCD4C4] dark:border-[#3C4035] text-sm font-bold text-[#141310] dark:text-[#FCFBF7] focus:outline-hidden focus:border-[#264D24]"
                />
              </div>

              {/* Times Per Day */}
              <div>
                <label className="block text-xs font-black uppercase text-[#66635A] dark:text-[#8E8D85] mb-1">
                  Scheduled Daily Times
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formTimes.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0EDE0] text-[#143513] dark:bg-[#263319] dark:text-[#9BB858] text-xs font-black"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{t}</span>
                      {formTimes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTime(t)}
                          className="hover:text-red-600 cursor-pointer ml-1"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={newTimeInput}
                    onChange={(e) => setNewTimeInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#DCD4C4] dark:border-[#3C4035] text-xs font-bold"
                  >
                    {[
                      '06:00 AM',
                      '07:00 AM',
                      '08:00 AM',
                      '09:00 AM',
                      '10:00 AM',
                      '11:00 AM',
                      '12:00 PM',
                      '01:00 PM',
                      '01:30 PM',
                      '02:00 PM',
                      '04:00 PM',
                      '06:00 PM',
                      '07:00 PM',
                      '08:00 PM',
                      '08:30 PM',
                      '09:00 PM',
                      '10:00 PM',
                    ].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddTime}
                    className="px-3 py-2 rounded-xl bg-[#264D24] text-white text-xs font-black cursor-pointer hover:bg-[#1E3E1C]"
                  >
                    + Add Time
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#66635A] dark:text-[#8E8D85] mb-1">
                  Gentle Notes for Ayo (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Take after morning meal with warm water."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border-2 border-[#DCD4C4] dark:border-[#3C4035] text-sm font-bold text-[#141310] dark:text-[#FCFBF7] focus:outline-hidden focus:border-[#264D24]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="formActive"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 text-[#264D24] rounded-md cursor-pointer"
                />
                <label htmlFor="formActive" className="text-xs font-black text-[#141310] dark:text-[#FCFBF7] cursor-pointer">
                  Activate scheduled alarms for this medicine
                </label>
              </div>

              {/* Safety Framing in Modal */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-[11px] font-bold border border-amber-200 dark:border-amber-800/40">
                Reminders are support tools only and do not replace professional medical prescriptions.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBE5D8] dark:border-[#32362C]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border-2 border-[#DCD4C4] dark:border-[#3C4035] text-xs font-black text-[#66635A] hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#264D24] hover:bg-[#1E3E1C] text-white text-xs font-black shadow-md cursor-pointer"
                >
                  {editingMedicine ? 'Save Changes' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
