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
  Plus,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Smile,
  Eye,
  Pill,
  AlertTriangle,
  PhoneCall,
  Settings as SettingsIcon,
  BellRing,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { useApp, CaregiverTab } from '../../context/AppContext';
import { NORTHEAST_IMAGES } from '../../assets/images';
import { PatientConditionEngagementVisualizer } from './PatientConditionEngagementVisualizer';

export const CaregiverDashboard: React.FC = () => {
  const {
    state,
    setAppMode,
    setPatientScreen,
    setCaregiverTab,
    missedMedicineAlerts,
    activeSOSEvents,
    resolveSOSEvent,
    setHighlightedMedicineId,
    triggerTestMedicineAlarm,
    setShowDisclaimerModal,
    setSelectedContactForCall,
    setShowCallModal,
  } = useApp();

  const patient = state?.patient;
  const caregiver = state?.caregiver;
  const medicines = state?.medicines || [];
  const medicineLogs = state?.medicineLogs || [];
  const sosEvents = state?.sosEvents || [];
  const activityLogs = state?.activityLogs || [];
  const contacts = state?.supportContacts || [];

  const activeMedicines = medicines.filter((m) => m.active);
  const recentLogs = activityLogs.slice(0, 3);
  const primaryContact = contacts.find((c) => c.is_primary) || contacts[0];

  const handleNavigateToMissedMed = (medId: string) => {
    setHighlightedMedicineId(medId);
    setCaregiverTab('medicines');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* 1. ACTIVE SOS EMERGENCY ALERT BANNER (If active SOSEvent exists) */}
      {activeSOSEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[32px] bg-red-600 text-white p-6 sm:p-8 shadow-2xl border-4 border-red-700 space-y-4 animate-pulse"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1">
                <span className="inline-block px-3 py-0.5 rounded-full bg-white text-red-700 text-xs font-black uppercase tracking-wider">
                  🚨 Active Emergency SOS
                </span>
                <h2 className="text-xl sm:text-2xl font-black">
                  {patient?.name || 'Patient'} triggered an emergency alert!
                </h2>
                <p className="text-xs sm:text-sm text-red-100 font-bold flex flex-wrap items-center gap-2">
                  <span>Triggered at: {new Date(activeSOSEvents[0].triggered_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  {activeSOSEvents[0].location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {activeSOSEvents[0].location}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => resolveSOSEvent(activeSOSEvents[0].id)}
                className="px-6 py-3 rounded-full bg-white text-red-700 hover:bg-red-50 text-xs sm:text-sm font-black shadow-lg cursor-pointer transition-transform hover:scale-105"
              >
                Mark as Resolved ✓
              </button>

              <button
                onClick={() => setCaregiverTab('emergency_log')}
                className="px-5 py-3 rounded-full bg-red-800/80 hover:bg-red-800 text-white text-xs sm:text-sm font-black border border-white/30 cursor-pointer"
              >
                View Emergency Log →
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. MISSED MEDICINE ALERT BANNER (If scheduled > 30 mins ago and not taken) */}
      {missedMedicineAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] bg-[#FAE4E1] dark:bg-[#3D2321] border-2 border-[#9C382A] p-5 sm:p-6 shadow-md text-[#141310] dark:text-[#FCFBF7] space-y-3"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#9C382A] text-white flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9C382A] text-white text-[11px] font-black uppercase tracking-wider mb-1">
                  <span>Missed Medicine Alert ({missedMedicineAlerts.length})</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#9C382A] dark:text-[#EA9688]">
                  {patient?.name || 'Ayo'} has not taken scheduled medicine
                </h3>
                <p className="text-xs sm:text-sm font-bold text-[#66635A] dark:text-[#D1D0C5]">
                  {missedMedicineAlerts.map((a, i) => (
                    <span key={a.medicine.id + a.scheduledTime}>
                      <strong className="text-[#141310] dark:text-[#FCFBF7]">{a.medicine.name}</strong> ({a.medicine.dosage}) scheduled for{' '}
                      <strong>{a.scheduledTime}</strong> was due {a.delayMinutes} minutes ago.
                      {i < missedMedicineAlerts.length - 1 ? ' • ' : ''}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleNavigateToMissedMed(missedMedicineAlerts[0].medicine.id)}
              className="self-start md:self-center px-5 py-2.5 rounded-full bg-[#9C382A] hover:bg-[#832E22] text-white text-xs font-black shadow-md cursor-pointer transition-transform hover:scale-105 shrink-0 flex items-center gap-1.5"
            >
              <Pill className="w-4 h-4" />
              <span>Review Medicine Schedule →</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Header Banner */}
      <div className="rounded-[36px] bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-6 sm:p-8 card-shadow flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex items-center gap-5 text-center md:text-left">
          <div className="relative shrink-0">
            <img
              src={patient?.profile_photo_url || NORTHEAST_IMAGES.grandmother}
              alt={patient?.name || 'Patient'}
              referrerPolicy="no-referrer"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-[#264D24] shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#264D24] text-white flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4 fill-current text-[#F5B83D]" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="serif text-2xl sm:text-3xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
                Caregiver Hub — {caregiver?.name || 'Family Caregiver'}
              </h1>
              <span className="px-3.5 py-0.5 rounded-full bg-[#E0EDE0] text-[#143513] dark:bg-[#263319] dark:text-[#9BB858] font-extrabold text-xs">
                {patient?.community || 'Naga'} Heritage
              </span>
            </div>
            <p className="text-sm sm:text-base text-[#3D3A33] dark:text-[#D1D0C5] font-semibold">
              Caring for: <strong className="text-[#264D24] dark:text-[#9BB858]">{patient?.name}</strong> ({patient?.nickname || 'Ayo'}, {patient?.age} yrs) • {patient?.hometown || 'Nagaland'}
            </p>
            <p className="text-xs text-[#66635A] dark:text-[#8E8D85] font-bold mt-1">
              Preferred Language: {patient?.preferred_language || 'Nagamese / English'}
            </p>
          </div>
        </div>

        {/* Quick Launch Patient View Button */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => {
              setAppMode('patient');
              setPatientScreen('home');
            }}
            className="px-6 py-3.5 rounded-full bg-[#264D24] hover:bg-[#1E3E1C] text-white font-extrabold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 hover:scale-105 transition-all cursor-pointer"
          >
            <Eye className="w-5 h-5 text-[#F5B83D]" />
            <span>Open Patient Mode 🌸</span>
          </button>
        </div>
      </div>

      {/* PATIENT CONDITION & ENGAGEMENT THROUGHOUT THE DAY */}
      <PatientConditionEngagementVisualizer />

      {/* 6 CAREGIVER DASHBOARD SECTIONS */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-[#141310] dark:text-[#FCFBF7] flex items-center gap-2">
          <span>Caregiver Management Sections</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* SECTION 1: MEDICINE SCHEDULE */}
          <div className="bg-white dark:bg-[#1D1F1A] rounded-[32px] p-6 border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#9C382A] transition-all flex flex-col justify-between shadow-xs group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#FAE4E1] text-[#9C382A] dark:bg-[#3D2321] dark:text-[#EA9688] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Pill className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-[#9C382A] dark:text-[#EA9688] px-2.5 py-0.5 rounded-full bg-[#FAE4E1] dark:bg-[#3D2321]">
                  {activeMedicines.length} Active
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#141310] dark:text-[#FCFBF7]">
                  Medicine Schedule
                </h3>
                <p className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85] mt-1">
                  Manage patient medicines, scheduled times, notes, and view real-time adherence logs.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#EBE5D8] dark:border-[#32362C] space-y-1.5 text-xs font-bold">
                <div className="flex items-center justify-between text-[#3D3A33] dark:text-[#D1D0C5]">
                  <span>Configured Medicines:</span>
                  <span className="font-black text-[#141310] dark:text-[#FCFBF7]">{medicines.length}</span>
                </div>
                <div className="flex items-center justify-between text-[#3D3A33] dark:text-[#D1D0C5]">
                  <span>Today's Actions Logged:</span>
                  <span className="font-black text-[#264D24] dark:text-[#9BB858]">{medicineLogs.length}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EBE5D8] dark:border-[#32362C] flex items-center justify-between gap-2">
              <button
                onClick={() => triggerTestMedicineAlarm()}
                className="text-xs font-bold text-[#9C382A] hover:underline flex items-center gap-1 cursor-pointer"
                title="Trigger instant test alarm on patient companion screen"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Test Alarm ⚡</span>
              </button>

              <button
                onClick={() => setCaregiverTab('medicines')}
                className="text-xs font-black text-[#264D24] dark:text-[#9BB858] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Manage Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SECTION 2: EMERGENCY ALERT LOG */}
          <div className="bg-white dark:bg-[#1D1F1A] rounded-[32px] p-6 border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-red-500 transition-all flex flex-col justify-between shadow-xs group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                {activeSOSEvents.length > 0 ? (
                  <span className="text-xs font-black text-white px-2.5 py-0.5 rounded-full bg-red-600 animate-pulse">
                    {activeSOSEvents.length} Alert Active!
                  </span>
                ) : (
                  <span className="text-xs font-black text-[#264D24] dark:text-[#9BB858] px-2.5 py-0.5 rounded-full bg-[#E0EDE0] dark:bg-[#263319]">
                    System Safe ✓
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-black text-[#141310] dark:text-[#FCFBF7]">
                  Emergency Alert Log
                </h3>
                <p className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85] mt-1">
                  Chronological records of one-touch SOS distress alerts sent from Ayo's screen.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#EBE5D8] dark:border-[#32362C] space-y-1.5 text-xs font-bold">
                <div className="flex items-center justify-between text-[#3D3A33] dark:text-[#D1D0C5]">
                  <span>Total Past Alerts:</span>
                  <span className="font-black text-[#141310] dark:text-[#FCFBF7]">{sosEvents.length}</span>
                </div>
                <div className="flex items-center justify-between text-[#3D3A33] dark:text-[#D1D0C5]">
                  <span>Active Distress Events:</span>
                  <span className={`font-black ${activeSOSEvents.length > 0 ? 'text-red-600' : 'text-[#264D24] dark:text-[#9BB858]'}`}>
                    {activeSOSEvents.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EBE5D8] dark:border-[#32362C] flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
                {activeSOSEvents.length > 0 ? 'Action required' : 'All resolved'}
              </span>

              <button
                onClick={() => setCaregiverTab('emergency_log')}
                className="text-xs font-black text-red-600 dark:text-red-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Open Alert Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SECTION 3: ACTIVITY LOG */}
          <div className="bg-white dark:bg-[#1D1F1A] rounded-[32px] p-6 border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#264D24] transition-all flex flex-col justify-between shadow-xs group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#E0EDE0] text-[#143513] dark:bg-[#263319] dark:text-[#9BB858] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-[#264D24] dark:text-[#9BB858] px-2.5 py-0.5 rounded-full bg-[#E0EDE0] dark:bg-[#263319]">
                  {activityLogs.length} Sessions
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#141310] dark:text-[#FCFBF7]">
                  Activity Log
                </h3>
                <p className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85] mt-1">
                  Warm, observational AI session narratives from family photos and singing hymns.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#EBE5D8] dark:border-[#32362C] space-y-1.5 text-xs font-bold">
                {recentLogs.length > 0 ? (
                  <p className="text-[#3D3A33] dark:text-[#D1D0C5] line-clamp-2 italic">
                    "{recentLogs[0].descriptive_note}"
                  </p>
                ) : (
                  <p className="text-[#66635A] dark:text-[#8E8D85]">No activity sessions completed yet today.</p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EBE5D8] dark:border-[#32362C] flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
                Non-clinical notes
              </span>

              <button
                onClick={() => setCaregiverTab('activity_log')}
                className="text-xs font-black text-[#264D24] dark:text-[#9BB858] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>View Full Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SECTION 4: SUPPORT CIRCLE */}
          <div className="bg-white dark:bg-[#1D1F1A] rounded-[32px] p-6 border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#264D24] transition-all flex flex-col justify-between shadow-xs group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#E0EDE0] text-[#143513] dark:bg-[#263319] dark:text-[#9BB858] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-[#264D24] dark:text-[#9BB858] px-2.5 py-0.5 rounded-full bg-[#E0EDE0] dark:bg-[#263319]">
                  {contacts.length} Helpers
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#141310] dark:text-[#FCFBF7]">
                  Support Circle
                </h3>
                <p className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85] mt-1">
                  Trusted family members, neighbors, and community ASHA health contacts.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#EBE5D8] dark:border-[#32362C] space-y-1.5 text-xs font-bold">
                <div className="flex items-center justify-between text-[#3D3A33] dark:text-[#D1D0C5]">
                  <span>Primary Contact:</span>
                  <span className="font-black text-[#141310] dark:text-[#FCFBF7]">{primaryContact?.name || 'Caregiver'}</span>
                </div>
                <div className="flex items-center justify-between text-[#3D3A33] dark:text-[#D1D0C5]">
                  <span>One-Touch Calling:</span>
                  <span className="font-black text-[#264D24] dark:text-[#9BB858]">Enabled</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EBE5D8] dark:border-[#32362C] flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  if (primaryContact) {
                    setSelectedContactForCall(primaryContact);
                    setShowCallModal(true);
                  }
                }}
                className="text-xs font-bold text-[#264D24] dark:text-[#9BB858] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Test Call Ayo</span>
              </button>

              <button
                onClick={() => setCaregiverTab('support_circle')}
                className="text-xs font-black text-[#264D24] dark:text-[#9BB858] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Manage Circle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SECTION 5: SETTINGS */}
          <div className="bg-white dark:bg-[#1D1F1A] rounded-[32px] p-6 border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#965A04] transition-all flex flex-col justify-between shadow-xs group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#965A04] dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <SettingsIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-[#965A04] dark:text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60">
                  Settings
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#141310] dark:text-[#FCFBF7]">
                  Settings & Profiles
                </h3>
                <p className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85] mt-1">
                  Adjust gentle speech pacing, twilight bedtime mode, and language preferences.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#EBE5D8] dark:border-[#32362C] space-y-1.5 text-xs font-bold">
                <div className="flex items-center justify-between text-[#3D3A33] dark:text-[#D1D0C5]">
                  <span>Pacing Mode:</span>
                  <span className="font-black text-[#141310] dark:text-[#FCFBF7] capitalize">
                    {state?.settings?.pacing?.replace(/_/g, ' ') || 'Gentle Slow'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#3D3A33] dark:text-[#D1D0C5]">
                  <span>Spoken Audio:</span>
                  <span className="font-black text-[#264D24] dark:text-[#9BB858]">
                    {state?.settings?.speakAudio ? 'Active' : 'Muted'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EBE5D8] dark:border-[#32362C] flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
                {state?.settings?.twilightMode ? 'Twilight Mode On' : 'Day Theme'}
              </span>

              <button
                onClick={() => setCaregiverTab('settings')}
                className="text-xs font-black text-[#965A04] dark:text-amber-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Edit Settings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SECTION 6: OPEN PATIENT MODE */}
          <div className="bg-[#264D24] text-white rounded-[32px] p-6 border-2 border-[#1E3E1C] transition-all flex flex-col justify-between shadow-lg group hover:scale-[1.02]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Eye className="w-6 h-6 text-[#F5B83D]" />
                </div>
                <span className="text-xs font-black text-[#143513] px-2.5 py-0.5 rounded-full bg-[#F5B83D]">
                  Companion View
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white">
                  Open Patient Mode
                </h3>
                <p className="text-xs font-bold text-emerald-100 mt-1">
                  Switch to the elder-friendly tactile interface with large buttons, gentle voice guidance, and warm cultural reminders.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 border border-white/10 space-y-1 text-xs font-bold text-emerald-100">
                <p>🌸 High-contrast touch targets</p>
                <p>🗣️ Nagamese / English spoken prompts</p>
                <p>🚨 Emergency SOS & Medicine Reminders</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/20">
              <button
                onClick={() => {
                  setAppMode('patient');
                  setPatientScreen('home');
                }}
                className="w-full py-3 rounded-full bg-white text-[#264D24] hover:bg-emerald-50 text-xs sm:text-sm font-black shadow-md cursor-pointer transition-transform flex items-center justify-center gap-2"
              >
                <span>Launch Patient Mode Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Framing & Medical Disclaimer Notice */}
      <div className="p-5 rounded-[28px] bg-[#FDF3DF] dark:bg-[#32281E] border-2 border-[#965A04]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3 text-[#141310] dark:text-[#FCFBF7] font-bold">
          <ShieldCheck className="w-5 h-5 text-[#965A04] dark:text-[#F5B83D] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-black">Safety & Support Framing: </span>
            Aapka Saathi provides daily comfort, familiar connections, and caregiver reassurance.
            The medicine feature reminds and logs, it does not diagnose or adjust dosage; the SOS feature alerts
            a trusted contact, it is not a substitute for emergency services.
          </p>
        </div>
        <button
          onClick={() => setShowDisclaimerModal(true)}
          className="text-[#965A04] dark:text-[#F5B83D] font-black hover:underline shrink-0 cursor-pointer"
        >
          View Full Notice →
        </button>
      </div>
    </div>
  );
};
