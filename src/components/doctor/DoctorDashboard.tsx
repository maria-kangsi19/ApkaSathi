import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Stethoscope,
  ShieldCheck,
  Calendar,
  Pill,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  KeyRound,
  FileText,
  Printer,
  User,
  Heart,
  Activity,
  AlertTriangle,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PatientConditionEngagementVisualizer } from '../caregiver/PatientConditionEngagementVisualizer';
import { getConditionQualitativeTag } from '../caregiver/PatientConditionEngagementVisualizer';

export const DoctorDashboard: React.FC = () => {
  const {
    state,
    currentDoctor,
    activePatientGrant,
    logoutDoctor,
    setActivePatientGrant,
    setShowDisclaimerModal,
  } = useApp();

  const [dateRange, setDateRange] = useState<'7days' | '30days' | 'all'>('7days');

  const patient = state?.patient;
  const caregiver = state?.caregiver;
  const medicines = useMemo(() => state?.medicines || [], [state?.medicines]);
  const medicineLogs = useMemo(() => state?.medicineLogs || [], [state?.medicineLogs]);
  const conditionCheckIns = useMemo(() => state?.conditionCheckIns || [], [state?.conditionCheckIns]);

  // Date range cutoff calculation
  const cutoffTimestamp = useMemo(() => {
    const now = Date.now();
    if (dateRange === '7days') return now - 7 * 86400000;
    if (dateRange === '30days') return now - 30 * 86400000;
    return 0; // All
  }, [dateRange]);

  // Filtered medicine logs
  const filteredMedicineLogs = useMemo(() => {
    return medicineLogs.filter(log => {
      const logTime = new Date(log.actioned_at || log.created_at || Date.now()).getTime();
      return logTime >= cutoffTimestamp;
    });
  }, [medicineLogs, cutoffTimestamp]);

  // Adherence statistics calculation
  const adherenceStats = useMemo(() => {
    const totalLogged = filteredMedicineLogs.length;
    const takenCount = filteredMedicineLogs.filter(l => l.status === 'taken').length;
    const missedCount = filteredMedicineLogs.filter(l => l.status === 'missed').length;
    const rate = totalLogged > 0 ? Math.round((takenCount / totalLogged) * 100) : 100;

    return {
      totalLogged,
      takenCount,
      missedCount,
      rate,
    };
  }, [filteredMedicineLogs]);

  // Per-medicine adherence summary
  const perMedicineStats = useMemo(() => {
    return medicines.map(med => {
      const logsForMed = filteredMedicineLogs.filter(l => l.medicine_id === med.id);
      const taken = logsForMed.filter(l => l.status === 'taken').length;
      const missed = logsForMed.filter(l => l.status === 'missed').length;
      const total = logsForMed.length;
      const rate = total > 0 ? Math.round((taken / total) * 100) : null;

      return {
        medicine: med,
        taken,
        missed,
        total,
        rate,
        recentLogs: logsForMed.slice(0, 5),
      };
    });
  }, [medicines, filteredMedicineLogs]);

  // Filtered check-ins for the caregiver observations history
  const filteredCheckIns = useMemo(() => {
    return conditionCheckIns.filter(chk => {
      const time = new Date(chk.timestamp).getTime();
      return time >= cutoffTimestamp;
    });
  }, [conditionCheckIns, cutoffTimestamp]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. REQUIRED PROMINENT FRAMING & CLINICAL DISCLAIMER BANNER */}
      <div className="rounded-[28px] bg-[#E3EFF7] dark:bg-[#182632] border-2 border-[#BBD5E8] dark:border-[#2B3F50] p-5 sm:p-6 card-shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#1E4D6B] text-white flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6 text-[#93C5FD]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-black text-[#1E4D6B] dark:text-[#93C5FD] tracking-tight">
                Descriptive, Caregiver-Recorded Information — Not a Diagnostic Assessment
              </h2>
              <p className="text-xs font-bold text-[#325268] dark:text-[#CBDDE8] leading-relaxed max-w-3xl">
                This tracking portal presents caregiver-logged medicine adherence and daily engagement observations to provide non-diagnostic context for your consultation. It does not replace your direct clinical evaluation or clinical judgement.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDisclaimerModal(true)}
            className="text-xs font-black text-[#1E4D6B] dark:text-[#93C5FD] hover:underline uppercase tracking-wider shrink-0 cursor-pointer"
          >
            Clinical Scope Details →
          </button>
        </div>
      </div>

      {/* 2. TOP DOCTOR & PATIENT CONTEXT BAR */}
      <div className="bg-white dark:bg-[#1D1F1A] rounded-[32px] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-6 card-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Doctor & Patient Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Doctor Info */}
          <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-[#EBE5D8] dark:border-[#32362C] pb-4 sm:pb-0 sm:pr-6">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-[#1E4D6B] dark:text-[#93C5FD] uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Consulting Clinician</span>
            </div>
            <h1 className="serif text-xl sm:text-2xl font-black text-[#141310] dark:text-[#FCFBF7]">
              {currentDoctor?.name || 'Dr. Healthcare Provider'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
              <span>{currentDoctor?.phone_or_email || 'Contact on file'}</span>
              {currentDoctor?.medical_registration_id && (
                <>
                  <span>•</span>
                  <span className="font-mono text-[#1E4D6B] dark:text-[#93C5FD]">
                    Reg: {currentDoctor.medical_registration_id}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Patient Info */}
          {patient && (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-[#183C17] dark:text-[#8DA850] uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5" />
                <span>Authorized Patient</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="serif text-xl sm:text-2xl font-black text-[#141310] dark:text-[#FCFBF7]">
                  {patient.name}
                </span>
                <span className="px-3 py-0.5 rounded-full bg-[#E4EFE0] dark:bg-[#242E18] text-[#183C17] dark:text-[#8DA850] text-xs font-black">
                  {patient.age} yrs • {patient.community}
                </span>
              </div>
              <div className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
                Language: <strong className="text-[#141310] dark:text-[#FCFBF7]">{patient.preferred_language}</strong>
                {caregiver && (
                  <span className="ml-3">
                    Caregiver: <strong className="text-[#141310] dark:text-[#FCFBF7]">{caregiver.name}</strong> ({caregiver.relationship}, {caregiver.phone})
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions and Grant status */}
        <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#EBE5D8] dark:border-[#32362C]">
          {activePatientGrant && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0EADF] dark:bg-[#272A22] border border-[#C8BFAD] dark:border-[#3C4035] text-xs font-mono font-bold text-[#141310] dark:text-[#FCFBF7]">
              <KeyRound className="w-3.5 h-3.5 text-[#1E4D6B] dark:text-[#93C5FD]" />
              <span>Code: {activePatientGrant.access_code}</span>
            </div>
          )}

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#23261F] border border-[#C8BFAD] dark:border-[#3C4035] hover:bg-[#F9F7F1] dark:hover:bg-[#2C3026] text-xs font-black text-[#141310] dark:text-[#FCFBF7] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Summary View</span>
          </button>

          <button
            onClick={() => setActivePatientGrant(null)}
            className="px-4 py-2.5 rounded-xl bg-[#E3EFF7] dark:bg-[#1C2C39] hover:bg-[#D0E5F3] text-xs font-black text-[#1E4D6B] dark:text-[#93C5FD] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Switch Code</span>
          </button>

          <button
            onClick={logoutDoctor}
            className="px-4 py-2.5 rounded-xl bg-[#FBE6E3] dark:bg-[#3A2220] hover:bg-[#F6CFCA] text-xs font-black text-[#822417] dark:text-[#E38B7D] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Portal</span>
          </button>
        </div>
      </div>

      {/* 3. DATE RANGE SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035]">
        <div className="flex items-center gap-2 text-xs font-black text-[#141310] dark:text-[#FCFBF7]">
          <Calendar className="w-4 h-4 text-[#1E4D6B] dark:text-[#93C5FD]" />
          <span>Tracking Window:</span>
        </div>
        <div className="flex items-center gap-2">
          {(['7days', '30days', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                dateRange === range
                  ? 'bg-[#1E4D6B] text-white shadow-xs'
                  : 'bg-[#F4F1EA] dark:bg-[#272A22] text-[#66635A] dark:text-[#8E8D85] hover:text-[#141310]'
              }`}
            >
              {range === '7days' && 'Last 7 Days'}
              {range === '30days' && 'Last 30 Days'}
              {range === 'all' && 'All Logged Records'}
            </button>
          ))}
        </div>
      </div>

      {/* 4. MEDICINE ADHERENCE SECTION (READ-ONLY) */}
      <div className="bg-white dark:bg-[#1D1F1A] rounded-[32px] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-6 sm:p-8 card-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#1E4D6B] dark:text-[#93C5FD] uppercase tracking-wider">
              <Pill className="w-4 h-4" />
              <span>Prescription Medicine Adherence (Read-Only)</span>
            </div>
            <h2 className="serif text-2xl font-black text-[#141310] dark:text-[#FCFBF7]">
              Caregiver-Logged Medicine Administration
            </h2>
          </div>

          {/* Overall adherence pill */}
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#DCD4C4] dark:border-[#3C4035]">
            <div>
              <div className="text-[11px] font-bold text-[#66635A] dark:text-[#8E8D85]">
                Overall Adherence
              </div>
              <div className="text-xl font-black text-[#183C17] dark:text-[#8DA850]">
                {adherenceStats.rate}%
              </div>
            </div>
            <div className="h-8 w-[1px] bg-[#DCD4C4] dark:bg-[#3C4035]" />
            <div>
              <div className="text-[11px] font-bold text-[#66635A] dark:text-[#8E8D85]">
                Doses Taken
              </div>
              <div className="text-xl font-black text-[#141310] dark:text-[#FCFBF7]">
                {adherenceStats.takenCount} <span className="text-xs font-normal text-[#66635A]">/ {adherenceStats.totalLogged}</span>
              </div>
            </div>
            {adherenceStats.missedCount > 0 && (
              <>
                <div className="h-8 w-[1px] bg-[#DCD4C4] dark:bg-[#3C4035]" />
                <div>
                  <div className="text-[11px] font-bold text-[#822417] dark:text-[#E38B7D]">
                    Missed Gaps
                  </div>
                  <div className="text-xl font-black text-[#822417] dark:text-[#E38B7D]">
                    {adherenceStats.missedCount}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Per-medicine cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {perMedicineStats.map(({ medicine, taken, missed, total, rate, recentLogs }) => (
            <div
              key={medicine.id}
              className="p-5 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#DCD4C4] dark:border-[#3C4035] space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-[#141310] dark:text-[#FCFBF7]">
                    {medicine.name}
                  </h3>
                  <div className="text-xs font-bold text-[#1E4D6B] dark:text-[#93C5FD]">
                    {medicine.dosage}
                  </div>
                </div>
                {rate !== null ? (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-black ${
                      rate >= 80
                        ? 'bg-[#E4EFE0] dark:bg-[#242E18] text-[#183C17] dark:text-[#8DA850]'
                        : 'bg-[#FBE6E3] dark:bg-[#3A2220] text-[#822417] dark:text-[#E38B7D]'
                    }`}
                  >
                    {rate}%
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-600">
                    No Logs
                  </span>
                )}
              </div>

              {/* Scheduled times */}
              <div className="flex flex-wrap gap-1.5">
                {(medicine.times || []).map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1D1F1A] border border-[#DCD4C4] dark:border-[#3C4035] text-xs font-mono font-bold text-[#141310] dark:text-[#FCFBF7]"
                  >
                    <Clock className="w-3 h-3 text-[#66635A]" />
                    {t}
                  </span>
                ))}
              </div>

              {/* Instructions / context */}
              {medicine.instructions && (
                <p className="text-xs text-[#66635A] dark:text-[#8E8D85] font-medium italic">
                  "{medicine.instructions}"
                </p>
              )}

              {/* Period performance line */}
              <div className="pt-2 border-t border-[#EBE5D8] dark:border-[#32362C] flex items-center justify-between text-xs font-bold">
                <span className="text-[#66635A] dark:text-[#8E8D85]">
                  Logged in period:
                </span>
                <span className="text-[#141310] dark:text-[#FCFBF7]">
                  <strong>{taken}</strong> of <strong>{total}</strong> taken
                  {missed > 0 && <span className="text-red-600 ml-1">({missed} missed)</span>}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. WELLNESS & ENGAGEMENT TRENDS (DOCTOR VIEW - QUALITATIVE TAGS ONLY) */}
      <div className="bg-white dark:bg-[#1D1F1A] rounded-[32px] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-6 sm:p-8 card-shadow space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#183C17] dark:text-[#8DA850] uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>Daily Engagement & Serenity Trends</span>
          </div>
          <h2 className="serif text-2xl font-black text-[#141310] dark:text-[#FCFBF7]">
            Caregiver Observational Check-Ins
          </h2>
          <p className="text-xs sm:text-sm text-[#66635A] dark:text-[#8E8D85] font-bold">
            Descriptive qualitative milestones recorded during daily companion sessions.
          </p>
        </div>

        {/* Embedded Visualizer in Doctor Mode */}
        <div className="border rounded-2xl p-2 border-[#DCD4C4] dark:border-[#3C4035] bg-[#FDFBF7] dark:bg-[#191B16]">
          <PatientConditionEngagementVisualizer readOnly={true} isDoctorView={true} />
        </div>
      </div>

      {/* 6. CHRONOLOGICAL CAREGIVER NOTES & OBSERVATIONS */}
      <div className="bg-white dark:bg-[#1D1F1A] rounded-[32px] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-6 sm:p-8 card-shadow space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#784400] dark:text-[#F5B83D] uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Observational Notes History</span>
            </div>
            <h2 className="serif text-2xl font-black text-[#141310] dark:text-[#FCFBF7]">
              Contextual Notes Logged by Family
            </h2>
          </div>
          <span className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
            Strict Privacy: No media or personal voice audio exposed
          </span>
        </div>

        {filteredCheckIns.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
            No check-in observations recorded in this timeframe.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCheckIns.map(chk => {
              const qualitativeTag = getConditionQualitativeTag(chk.condition_score);
              const dateStr = new Date(chk.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });
              const timeStr = new Date(chk.timestamp).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={chk.id}
                  className="p-4 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#DCD4C4] dark:border-[#3C4035] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E4EFE0] dark:bg-[#242E18] text-[#183C17] dark:text-[#8DA850] text-xs font-black">
                        {qualitativeTag}
                      </span>
                      <span className="text-xs font-black text-[#141310] dark:text-[#FCFBF7]">
                        {chk.activity_label || 'Routine Observation'}
                      </span>
                      <span className="text-xs font-medium text-[#66635A] dark:text-[#8E8D85]">
                        by {chk.logged_by || 'Caregiver'}
                      </span>
                    </div>
                    {chk.notes && (
                      <p className="text-xs text-[#3A3833] dark:text-[#D1CFCA] font-medium leading-relaxed">
                        "{chk.notes}"
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0 text-xs font-mono font-bold text-[#66635A] dark:text-[#8E8D85]">
                    <div>{dateStr}</div>
                    <div className="text-[11px] font-normal">{timeStr}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. BOTTOM REMINDER OF NON-DIAGNOSTIC SCOPE */}
      <div className="p-4 rounded-2xl bg-[#F0EADF] dark:bg-[#272A22] border border-[#C8BFAD] dark:border-[#3C4035] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#1E4D6B] dark:text-[#93C5FD] shrink-0" />
          <span>
            Aapka Saathi is a supportive companion application for elders and caregivers. The information above reflects home-recorded observations.
          </span>
        </div>
        <button
          onClick={() => setShowDisclaimerModal(true)}
          className="text-[#1E4D6B] dark:text-[#93C5FD] font-black hover:underline shrink-0 uppercase tracking-wider text-[11px] cursor-pointer"
        >
          View Framing Notice
        </button>
      </div>
    </div>
  );
};
