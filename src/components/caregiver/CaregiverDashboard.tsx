import React from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Sparkles,
  Users,
  Image as ImageIcon,
  Mic,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Coffee,
  Activity,
  Smile,
  Eye,
} from 'lucide-react';
import { useApp, CaregiverTab } from '../../context/AppContext';
import { NORTHEAST_IMAGES } from '../../assets/images';

export const CaregiverDashboard: React.FC = () => {
  const {
    state,
    setAppMode,
    setPatientScreen,
    setCaregiverTab,
    toggleReminder,
    setShowDisclaimerModal,
  } = useApp();

  const patient = state?.patient;
  const caregiver = state?.caregiver;
  const photos = state?.photos || [];
  const voiceNotes = state?.voiceNotes || [];
  const reminders = state?.reminders || [];
  const activityLogs = state?.activityLogs || [];
  const contacts = state?.supportContacts || [];

  const completedReminders = reminders.filter((r) => r.completed_today);
  const recentLogs = activityLogs.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Caregiver Welcome Banner */}
      <div className="rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-6 sm:p-8 card-shadow flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex items-center gap-5 text-center md:text-left">
          <div className="relative shrink-0">
            <img
              src={
                patient?.profile_photo_url ||
                NORTHEAST_IMAGES.grandmother
              }
              alt={patient?.name || 'Patient'}
              referrerPolicy="no-referrer"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-[#9C382A] shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#264D24] text-white flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4 fill-current text-[#F5B83D]" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="serif text-2xl sm:text-3xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
                Welcome back, {caregiver?.name || 'Family Caregiver'}
              </h1>
              <span className="px-3.5 py-0.5 rounded-full bg-[#FDEEEC] dark:bg-[#3A2220] text-[#9C382A] dark:text-[#E38B7D] font-extrabold text-xs border border-[#9C382A]/20">
                {patient?.community || 'Naga'} Heritage
              </span>
            </div>
            <p className="text-sm sm:text-base text-[#3D3A33] dark:text-[#D1D0C5] font-semibold">
              Caring for: <strong className="text-[#264D24] dark:text-[#8DA850]">{patient?.name}</strong> ({patient?.nickname || 'Ayo'}, {patient?.age} yrs) • {patient?.hometown || 'Nagaland'}
            </p>
            <p className="text-xs text-[#264D24] dark:text-[#8DA850] font-bold mt-1">
              Preferred Language: {patient?.preferred_language || 'Nagamese / English'}
            </p>
          </div>
        </div>

        {/* Quick launch Patient Companion button */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => {
              setAppMode('patient');
              setPatientScreen('home');
            }}
            className="px-6 py-3.5 rounded-full bg-[#264D24] hover:bg-[#1D3D1B] text-white font-extrabold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 hover:scale-105 transition-all cursor-pointer"
          >
            <Eye className="w-5 h-5 text-[#F5B83D]" />
            <span>Launch Patient View 🌸</span>
          </button>
        </div>
      </div>

      {/* 4 Quick Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div
          onClick={() => setCaregiverTab('media')}
          className="cursor-pointer rounded-2xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#264D24] p-5 shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF3E8] dark:bg-[#242E18] text-[#264D24] dark:text-[#8DA850] flex items-center justify-center group-hover:scale-110 transition-transform">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-[#264D24] dark:text-[#8DA850]">Personalized</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">{photos.length}</div>
          <div className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] font-semibold mt-0.5">Family Photos</div>
        </div>

        <div
          onClick={() => setCaregiverTab('media')}
          className="cursor-pointer rounded-2xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#9C382A] p-5 shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDEEEC] dark:bg-[#3A2220] text-[#9C382A] dark:text-[#E38B7D] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-[#9C382A] dark:text-[#E38B7D]">Recorded</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">{voiceNotes.length}</div>
          <div className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] font-semibold mt-0.5">Voice Notes & Songs</div>
        </div>

        <div
          onClick={() => setCaregiverTab('reminders')}
          className="cursor-pointer rounded-2xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#965A04] p-5 shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDF3DF] dark:bg-[#32281E] text-[#965A04] dark:text-[#F5B83D] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-[#965A04] dark:text-[#F5B83D]">
              {completedReminders.length}/{reminders.length} Done
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">{reminders.length}</div>
          <div className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] font-semibold mt-0.5">Daily Routines</div>
        </div>

        <div
          onClick={() => setCaregiverTab('support_circle')}
          className="cursor-pointer rounded-2xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#264D24] p-5 shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF3E8] dark:bg-[#242E18] text-[#264D24] dark:text-[#8DA850] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-[#264D24] dark:text-[#8DA850]">Support Circle</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">{contacts.length}</div>
          <div className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] font-semibold mt-0.5">Family & ASHA Helpers</div>
        </div>
      </div>

      {/* Main Grid: Recent AI Descriptive Observations + Today's Routine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent AI Descriptive Observations (Non-Clinical) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#965A04] dark:text-[#F5B83D]" />
              <h2 className="serif text-xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
                Recent Activity Observations
              </h2>
            </div>
            <button
              onClick={() => setCaregiverTab('activity_log')}
              className="text-xs font-bold text-[#9C382A] dark:text-[#E38B7D] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] font-semibold">
            Warm, descriptive narratives generated by Gemini after each activity session (strictly non-clinical and non-diagnostic).
          </p>

          {recentLogs.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-8 text-center text-sm text-[#3D3A33] dark:text-[#D1D0C5] font-medium">
              No activity logs yet. When your loved one plays "Who Is This?" or "Sounds of Home", warm observational notes will appear here!
            </div>
          ) : (
            <div className="space-y-3.5">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#965A04] p-5 shadow-xs transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-0.5 rounded-full bg-[#EBF3E8] dark:bg-[#242E18] text-[#264D24] dark:text-[#8DA850] text-xs font-extrabold capitalize border border-[#264D24]/20">
                      {log.activity_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-[#3D3A33] dark:text-[#D1D0C5] font-semibold">
                      {new Date(log.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[#141310] dark:text-[#FCFBF7] leading-relaxed">
                    "{log.descriptive_note}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Today's Routine Quick Checklist */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#264D24]" />
              <h2 className="serif text-xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">Today's Routine</h2>
            </div>
            <button
              onClick={() => setCaregiverTab('reminders')}
              className="text-xs font-bold text-[#264D24] dark:text-[#8DA850] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-5 shadow-xs space-y-3">
            {reminders.map((reminder) => {
              const isDone = reminder.completed_today;

              return (
                <div
                  key={reminder.id}
                  onClick={() => toggleReminder(reminder.id)}
                  className={`cursor-pointer rounded-xl p-3.5 border-2 transition-all flex items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-[#EBF3E8] dark:bg-[#242E18] border-[#264D24]/40 text-[#264D24] dark:text-[#8DA850]'
                      : 'bg-[#F3EFE6] dark:bg-[#272A22] border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#965A04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-[#264D24] dark:text-[#8DA850] shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#3D3A33] dark:text-[#D1D0C5] shrink-0" />
                    )}
                    <div>
                      <div className={`text-sm font-bold ${isDone ? 'line-through text-[#3D3A33] dark:text-[#D1D0C5]' : 'text-[#141310] dark:text-[#FCFBF7]'}`}>
                        {reminder.label}
                      </div>
                      <div className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] font-semibold">{reminder.time}</div>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 capitalize text-[#141310] dark:text-[#FCFBF7]">
                    {reminder.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Non-Clinical Framing Reminder */}
      <div className="p-4 rounded-2xl bg-[#FDF3DF] dark:bg-[#32281E] border-2 border-[#965A04]/40 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5 text-[#141310] dark:text-[#FCFBF7] font-semibold">
          <ShieldCheck className="w-5 h-5 text-[#965A04] dark:text-[#F5B83D] shrink-0" />
          <span>
            Aapka Saathi provides daily comfort, familiar connections, and caregiver reassurance without clinical diagnostics.
          </span>
        </div>
        <button
          onClick={() => setShowDisclaimerModal(true)}
          className="text-[#965A04] dark:text-[#F5B83D] font-extrabold hover:underline shrink-0 cursor-pointer"
        >
          View Notice
        </button>
      </div>
    </div>
  );
};
