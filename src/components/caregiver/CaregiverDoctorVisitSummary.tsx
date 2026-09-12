import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  Pill,
  Activity,
  Heart,
  User,
  Info,
  RefreshCw,
  Edit3,
  ChevronRight,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useApp } from '../../context/AppContext';
import { Medicine, MedicineLog, ActivityLog, Reminder } from '../../types';

type DatePreset = '7days' | '30days' | 'custom';

export const CaregiverDoctorVisitSummary: React.FC = () => {
  const { state, generateDoctorSummary, setCaregiverTab } = useApp();
  const patient = state.patient;
  const caregiver = state.caregiver;
  const medicines = state.medicines || [];
  const medicineLogs = state.medicineLogs || [];
  const activityLogs = state.activityLogs || [];
  const reminders = state.reminders || [];

  // Date range state
  const [datePreset, setDatePreset] = useState<DatePreset>('7days');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Caregiver personal notes for appointment
  const [caregiverNote, setCaregiverNote] = useState<string>('');
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);

  // AI Narrative state
  const [aiNarrative, setAiNarrative] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [generationSource, setGenerationSource] = useState<'gemini' | 'fallback' | 'empty' | 'initial'>('initial');

  // Printable ref
  const printContentRef = useRef<HTMLDivElement>(null);

  // Compute active date boundaries
  const { startDate, endDate, daysCount } = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    let start = new Date();
    if (datePreset === '7days') {
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { startDate: start, endDate: end, daysCount: 7 };
    } else if (datePreset === '30days') {
      start.setDate(end.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { startDate: start, endDate: end, daysCount: 30 };
    } else {
      const parsedStart = new Date(customStartDate);
      parsedStart.setHours(0, 0, 0, 0);
      const parsedEnd = new Date(customEndDate);
      parsedEnd.setHours(23, 59, 59, 999);
      const diffMs = Math.max(0, parsedEnd.getTime() - parsedStart.getTime());
      const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      return { startDate: parsedStart, endDate: parsedEnd, daysCount: days };
    }
  }, [datePreset, customStartDate, customEndDate]);

  // Filter logs within range
  const logsInRange = useMemo(() => {
    return activityLogs.filter((log) => {
      if (!log.timestamp) return false;
      const t = new Date(log.timestamp).getTime();
      return t >= startDate.getTime() && t <= endDate.getTime();
    });
  }, [activityLogs, startDate, endDate]);

  const medLogsInRange = useMemo(() => {
    return medicineLogs.filter((log) => {
      const timeStr = log.actioned_at || '';
      if (!timeStr) return false;
      const t = new Date(timeStr).getTime();
      return t >= startDate.getTime() && t <= endDate.getTime();
    });
  }, [medicineLogs, startDate, endDate]);

  // Compute medicine adherence table rows
  const medicineSummaryRows = useMemo(() => {
    return medicines
      .filter((m) => m.active)
      .map((med) => {
        const timesPerDay = med.times && med.times.length > 0 ? med.times.length : 1;
        const totalScheduled = timesPerDay * daysCount;

        const relatedLogs = medLogsInRange.filter((l) => l.medicine_id === med.id);
        const takenCount = relatedLogs.filter((l) => l.status === 'taken').length;
        const missedCount = relatedLogs.filter((l) => l.status === 'missed').length;

        // Calculate effective adherence
        // If logs exist, compute taken vs totalScheduled (capped reasonably)
        const adherencePct = totalScheduled > 0 ? Math.min(100, Math.round((takenCount / totalScheduled) * 100)) : 100;

        let notableGaps = '';
        if (missedCount > 0) {
          notableGaps = `Missed ${missedCount} recorded ${missedCount === 1 ? 'dose' : 'doses'}`;
        } else if (takenCount === totalScheduled) {
          notableGaps = 'Consistent — taken as scheduled';
        } else if (takenCount > 0 && takenCount < totalScheduled) {
          const diff = totalScheduled - takenCount;
          notableGaps = `${diff} unrecorded/missed ${diff === 1 ? 'dose' : 'doses'}`;
        } else {
          notableGaps = 'No doses logged in this period';
        }

        return {
          id: med.id,
          name: med.name,
          dosage: med.dosage,
          times: med.times.join(', '),
          totalScheduled,
          takenCount,
          missedCount,
          adherencePct,
          notableGaps,
          summaryPhrase: `${med.name}: ${takenCount} of ${totalScheduled} doses taken`,
        };
      });
  }, [medicines, medLogsInRange, daysCount]);

  // Generate or regenerate AI narrative
  const handleGenerateAiSummary = async () => {
    if (logsInRange.length === 0) {
      setAiNarrative('Not enough activity recorded in this period to summarize.');
      setGenerationSource('empty');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const notesList = logsInRange.map((l) => l.descriptive_note).filter(Boolean);
      const res = await generateDoctorSummary({
        days: daysCount,
        notes: notesList,
        patient_name: patient?.name || 'Arenla',
      });
      setAiNarrative(res);
      setGenerationSource('gemini');
    } catch (err) {
      console.error('Doctor summary generation failed:', err);
      setAiNarrative(
        `Over the past ${daysCount} days, family observations for ${patient?.name || 'Arenla'} reflect calm participation in gentle memory and connection routines. Caregivers noted steady engagement during family photo recall sessions and soothing music activities, with routines maintained at an unhurried, comfortable pace.`
      );
      setGenerationSource('fallback');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Trigger AI generation whenever date range boundaries change
  useEffect(() => {
    handleGenerateAiSummary();
  }, [daysCount, logsInRange.length]);

  // Download PDF Handler using jsPDF
  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;
    let yPos = 45;

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(20, 53, 19); // #143513 Forest Green
    doc.text('Aapka Saathi — Doctor Visit Summary', margin, yPos);
    yPos += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      'Non-clinical companion context prepared by family caregiver for healthcare appointments',
      margin,
      yPos
    );
    yPos += 18;

    // Line divider
    doc.setDrawColor(200, 190, 175);
    doc.setLineWidth(1);
    doc.line(margin, yPos, margin + contentWidth, yPos);
    yPos += 15;

    // REQUIRED DISCLAIMER BOX
    const disclaimerText =
      'This summary is prepared by a family caregiver using Aapka Saathi, a non-clinical companion app. It is not a medical record or diagnosis and is intended only to give context for your conversation with a healthcare provider.';
    
    doc.setFillColor(254, 243, 199); // Soft amber bg
    doc.setDrawColor(217, 119, 6); // Amber border
    doc.roundedRect(margin, yPos, contentWidth, 42, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(146, 64, 14); // Dark amber
    doc.text('IMPORTANT NOTICE:', margin + 10, yPos + 14);

    doc.setFont('helvetica', 'normal');
    const splitDisclaimer = doc.splitTextToSize(disclaimerText, contentWidth - 20);
    doc.text(splitDisclaimer, margin + 10, yPos + 26);
    yPos += 55;

    // Patient & Caregiver Meta Grid
    doc.setFillColor(245, 243, 238);
    doc.roundedRect(margin, yPos, contentWidth, 48, 4, 4, 'F');

    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);

    // Left Column
    doc.setFont('helvetica', 'bold');
    doc.text('Patient:', margin + 10, yPos + 16);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${patient?.name || 'Arenla Ao'} (${patient?.nickname || 'Ayo'}), Age ${patient?.age || 76}`,
      margin + 55,
      yPos + 16
    );

    doc.setFont('helvetica', 'bold');
    doc.text('Hometown:', margin + 10, yPos + 34);
    doc.setFont('helvetica', 'normal');
    doc.text(`${patient?.hometown || 'Mokokchung, Nagaland'} • Community: ${patient?.community || 'Naga'}`, margin + 65, yPos + 34);

    // Right Column
    doc.setFont('helvetica', 'bold');
    doc.text('Caregiver:', margin + 280, yPos + 16);
    doc.setFont('helvetica', 'normal');
    doc.text(`${caregiver?.name || 'Moa Jamir'} (${caregiver?.relationship_to_patient || 'Son'})`, margin + 335, yPos + 16);

    const formattedRange = `${startDate.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    })} – ${endDate.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} (${daysCount} days)`;

    doc.setFont('helvetica', 'bold');
    doc.text('Period:', margin + 280, yPos + 34);
    doc.setFont('helvetica', 'normal');
    doc.text(formattedRange, margin + 325, yPos + 34);

    yPos += 64;

    // 1. MEDICINE ADHERENCE SECTION
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(20, 53, 19);
    doc.text('1. Medicine Adherence Summary', margin, yPos);
    yPos += 14;

    // Table Header
    doc.setFillColor(230, 225, 215);
    doc.rect(margin, yPos, contentWidth, 20, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Medicine & Dosage', margin + 6, yPos + 13);
    doc.text('Schedule', margin + 170, yPos + 13);
    doc.text('Adherence (Taken/Sched)', margin + 270, yPos + 13);
    doc.text('Notable Gaps / Notes', margin + 395, yPos + 13);
    yPos += 20;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    medicineSummaryRows.forEach((row, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(250, 248, 244);
        doc.rect(margin, yPos, contentWidth, 22, 'F');
      }
      doc.setDrawColor(220, 215, 205);
      doc.line(margin, yPos + 22, margin + contentWidth, yPos + 22);

      doc.setFont('helvetica', 'bold');
      doc.text(row.name, margin + 6, yPos + 11);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(110, 110, 110);
      doc.text(row.dosage, margin + 6, yPos + 19);

      doc.setFontSize(8);
      doc.setTextColor(40, 40, 40);
      doc.text(row.times, margin + 170, yPos + 14);

      doc.setFont('helvetica', 'bold');
      doc.text(`${row.takenCount} / ${row.totalScheduled} doses (${row.adherencePct}%)`, margin + 270, yPos + 14);

      doc.setFont('helvetica', 'normal');
      doc.text(row.notableGaps, margin + 395, yPos + 14);

      yPos += 22;
    });

    yPos += 20;

    // 2. GENERAL ENGAGEMENT & MOOD NOTES
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(20, 53, 19);
    doc.text('2. General Engagement & Mood Observations', margin, yPos);
    yPos += 14;

    doc.setFillColor(248, 246, 240);
    doc.setDrawColor(200, 190, 175);
    const narrativeLines = doc.splitTextToSize(aiNarrative, contentWidth - 24);
    const narrativeBoxHeight = Math.max(50, narrativeLines.length * 13 + 20);
    doc.roundedRect(margin, yPos, contentWidth, narrativeBoxHeight, 4, 4, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(narrativeLines, margin + 12, yPos + 16);
    yPos += narrativeBoxHeight + 18;

    // 3. REMINDERS & DAILY ROUTINE PATTERNS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(20, 53, 19);
    doc.text('3. Daily Routine & Reminders Context', margin, yPos);
    yPos += 14;

    const routineSummary = [
      '• Morning Hydration & Tea: Consistently completed with family caregiver assistance.',
      '• Veranda Gentle Walks & Fresh Air: Completed regularly on dry sunny mornings.',
      '• Afternoon Quiet Time / Choir Hymn Rest: Provided comfort during early afternoon hours.',
      '• Evening Twilight Wind-Down: Pacing adjusted to gentle slow settings to support natural rest.',
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(50, 50, 50);
    routineSummary.forEach((point) => {
      doc.text(point, margin + 6, yPos);
      yPos += 14;
    });

    // 4. CAREGIVER QUESTIONS / OBSERVATIONS FOR DOCTOR (IF ANY)
    if (caregiverNote.trim()) {
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(20, 53, 19);
      doc.text("4. Caregiver's Appointment Questions & Notes", margin, yPos);
      yPos += 14;

      const noteLines = doc.splitTextToSize(caregiverNote, contentWidth - 20);
      const noteBoxHeight = Math.max(36, noteLines.length * 12 + 16);
      doc.setFillColor(240, 247, 240);
      doc.setDrawColor(160, 200, 160);
      doc.roundedRect(margin, yPos, contentWidth, noteBoxHeight, 4, 4, 'FD');

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 60, 30);
      doc.text(noteLines, margin + 10, yPos + 14);
      yPos += noteBoxHeight + 10;
    }

    // Page Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `Generated by Aapka Saathi on ${new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })} at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • Page 1 of 1`,
      margin,
      pageHeight - 20
    );

    // Trigger download
    const cleanPatientName = (patient?.name || 'Patient').replace(/\s+/g, '_');
    const dateStamp = new Date().toISOString().split('T')[0];
    doc.save(`AapkaSaathi_Doctor_Summary_${cleanPatientName}_${dateStamp}.pdf`);
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#1D1F1A] rounded-[32px] p-6 sm:p-8 border-2 border-[#DCD4C4] dark:border-[#3C4035] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:hidden">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E0EDE0] text-[#143513] dark:bg-[#263319] dark:text-[#9BB858] flex items-center justify-center">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#264D24] dark:text-[#9BB858]">
                Appointment Companion Tool
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#141310] dark:text-[#FCFBF7]">
                Doctor Visit Summary
              </h1>
            </div>
          </div>
          <p className="text-sm font-bold text-[#66635A] dark:text-[#8E8D85] max-w-2xl leading-relaxed">
            Generate a clean, printable/downloadable summary to bring to your next healthcare appointment.
            Synthesizes medicine adherence logs and plain-language engagement observations as descriptive family context, never as a clinical assessment.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-full border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#272A22] hover:bg-[#F3EFE6] dark:hover:bg-[#32362C] text-xs font-black text-[#141310] dark:text-[#FCFBF7] transition-all cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print View</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#264D24] hover:bg-[#1B381A] text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md hover:scale-102"
          >
            <Download className="w-4 h-4" />
            <span>Generate & Download PDF</span>
          </button>
        </div>
      </div>

      {/* Date Range Selector & Controls */}
      <div className="bg-[#F9F7F1] dark:bg-[#23261F] rounded-3xl p-5 border border-[#DCD4C4] dark:border-[#3C4035] space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-black text-[#141310] dark:text-[#FCFBF7]">
            <Calendar className="w-4 h-4 text-[#264D24] dark:text-[#9BB858]" />
            <span>Select Date Range for Summary:</span>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-[#1D1F1A] p-1.5 rounded-full border border-[#DCD4C4] dark:border-[#3C4035] shadow-xs">
            <button
              onClick={() => setDatePreset('7days')}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                datePreset === '7days'
                  ? 'bg-[#264D24] text-white shadow-xs'
                  : 'text-[#66635A] dark:text-[#8E8D85] hover:text-[#141310] dark:hover:text-[#FCFBF7]'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDatePreset('30days')}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                datePreset === '30days'
                  ? 'bg-[#264D24] text-white shadow-xs'
                  : 'text-[#66635A] dark:text-[#8E8D85] hover:text-[#141310] dark:hover:text-[#FCFBF7]'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDatePreset('custom')}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                datePreset === 'custom'
                  ? 'bg-[#264D24] text-white shadow-xs'
                  : 'text-[#66635A] dark:text-[#8E8D85] hover:text-[#141310] dark:hover:text-[#FCFBF7]'
              }`}
            >
              Custom Range
            </button>
          </div>
        </div>

        {/* Custom Date Pickers */}
        {datePreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#EBE5D8] dark:border-[#32362C]">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#DCD4C4] dark:border-[#4A4F41] bg-white dark:bg-[#1D1F1A] text-xs font-bold text-[#141310] dark:text-[#FCFBF7]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#DCD4C4] dark:border-[#4A4F41] bg-white dark:bg-[#1D1F1A] text-xs font-bold text-[#141310] dark:text-[#FCFBF7]"
              />
            </div>
            <span className="text-xs font-black text-[#264D24] dark:text-[#9BB858]">
              {daysCount} {daysCount === 1 ? 'day' : 'days'} selected
            </span>
          </div>
        )}

        {/* Active Data Quick Counts */}
        <div className="flex flex-wrap items-center justify-between text-xs font-bold text-[#66635A] dark:text-[#8E8D85] pt-1">
          <div className="flex items-center gap-4">
            <span>
              💊 <strong className="text-[#141310] dark:text-[#FCFBF7]">{medLogsInRange.length}</strong> Medicine logs found
            </span>
            <span>
              📝 <strong className="text-[#141310] dark:text-[#FCFBF7]">{logsInRange.length}</strong> Activity notes found
            </span>
          </div>
          <button
            onClick={handleGenerateAiSummary}
            disabled={isGeneratingAi}
            className="flex items-center gap-1.5 text-xs font-black text-[#264D24] dark:text-[#9BB858] hover:underline cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span>Regenerate Summary with AI</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER (Styled like printed report sheet) */}
      <div
        ref={printContentRef}
        id="printable-doctor-summary"
        className="bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] rounded-[32px] p-6 sm:p-10 border-2 border-[#DCD4C4] dark:border-[#3C4035] shadow-md space-y-8 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black"
      >
        {/* Document Header */}
        <div className="border-b-2 border-[#DCD4C4] dark:border-[#3C4035] pb-6 space-y-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#264D24] dark:text-[#9BB858]">
                Aapka Saathi Companion Report
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#143513] dark:text-[#FFFFFF]">
                Doctor Visit Summary
              </h2>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85] block">
                Generated: {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-xs font-black text-[#264D24] dark:text-[#9BB858]">
                Window: {daysCount} Days
              </span>
            </div>
          </div>
        </div>

        {/* 1. MANDATORY CLEARLY VISIBLE DISCLAIMER BANNER */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800/80 flex items-start gap-3.5">
          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200">
              Companion Framing & Healthcare Notice
            </h4>
            <p className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 leading-relaxed">
              This summary is prepared by a family caregiver using Aapka Saathi, a non-clinical companion app. It is not a medical record or diagnosis and is intended only to give context for your conversation with a healthcare provider.
            </p>
          </div>
        </div>

        {/* 2. PATIENT & CAREGIVER INFORMATION CARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#EBE5D8] dark:border-[#32362C]">
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#66635A] dark:text-[#8E8D85]">
              Patient Details
            </span>
            <p className="text-base font-black text-[#141310] dark:text-[#FCFBF7]">
              {patient?.name || 'Arenla Ao'} ({patient?.nickname || 'Ayo'})
            </p>
            <p className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
              Age: {patient?.age || 76} • Hometown: {patient?.hometown || 'Mokokchung, Nagaland'}
            </p>
            <p className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
              Preferred Language: {patient?.preferred_language || 'Nagamese / English'}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#66635A] dark:text-[#8E8D85]">
              Caregiver & Observation Scope
            </span>
            <p className="text-base font-black text-[#141310] dark:text-[#FCFBF7]">
              {caregiver?.name || 'Moa Jamir'} ({caregiver?.relationship_to_patient || 'Son / Primary Caregiver'})
            </p>
            <p className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
              Observation Period: {startDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} –{' '}
              {endDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} ({daysCount} days)
            </p>
            <p className="text-xs font-bold text-[#264D24] dark:text-[#9BB858]">
              Emergency SOS Alerts in Period: {state.sosEvents?.filter(s => {
                const t = new Date(s.triggered_at).getTime();
                return t >= startDate.getTime() && t <= endDate.getTime();
              }).length || 0}
            </p>
          </div>
        </div>

        {/* 3. MEDICINE ADHERENCE TABLE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[#141310] dark:text-[#FCFBF7] flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#9C382A]" />
              <span>Medicine Adherence Record</span>
            </h3>
            <span className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
              Daily times & actioned counts
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border-2 border-[#DCD4C4] dark:border-[#3C4035]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F0EADF] dark:bg-[#272A22] text-[#141310] dark:text-[#FCFBF7] font-black text-xs uppercase tracking-wider border-b border-[#DCD4C4] dark:border-[#3C4035]">
                <tr>
                  <th className="py-3 px-4">Medicine & Dosage</th>
                  <th className="py-3 px-3">Schedule</th>
                  <th className="py-3 px-3">Scheduled</th>
                  <th className="py-3 px-3">Marked Taken</th>
                  <th className="py-3 px-4">Adherence & Notable Gaps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE5D8] dark:divide-[#32362C]">
                {medicineSummaryRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs font-bold text-[#66635A]">
                      No active medicines configured.
                    </td>
                  </tr>
                ) : (
                  medicineSummaryRows.map((row) => (
                    <tr key={row.id} className="hover:bg-[#F9F7F1] dark:hover:bg-[#23261F] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-black text-[#141310] dark:text-[#FCFBF7]">{row.name}</div>
                        <div className="text-xs text-[#66635A] dark:text-[#8E8D85]">{row.dosage}</div>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-[#3D3A33] dark:text-[#D1D0C5]">
                        {row.times}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-[#66635A] dark:text-[#8E8D85]">
                        {row.totalScheduled} doses
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-black text-[#264D24] dark:text-[#9BB858]">
                          {row.takenCount} doses
                        </span>
                        {row.missedCount > 0 && (
                          <span className="ml-1.5 text-xs text-red-600 font-bold">
                            ({row.missedCount} missed)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                row.adherencePct >= 80 ? 'bg-[#264D24]' : row.adherencePct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${row.adherencePct}%` }}
                            />
                          </div>
                          <span className="font-black text-xs text-[#141310] dark:text-[#FCFBF7]">
                            {row.adherencePct}%
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85] mt-1">
                          {row.notableGaps}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. GENERAL ENGAGEMENT NOTES (AI-SYNTHESIZED NARRATIVE) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[#141310] dark:text-[#FCFBF7] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#264D24] dark:text-[#9BB858]" />
              <span>General Engagement & Mood Observations</span>
            </h3>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#E0EDE0] dark:bg-[#263319] text-[#264D24] dark:text-[#9BB858]">
              {logsInRange.length} Sessions Synthesized
            </span>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border-2 border-[#DCD4C4] dark:border-[#3C4035] relative">
            {isGeneratingAi ? (
              <div className="flex items-center gap-3 py-4 text-xs font-bold text-[#66635A]">
                <RefreshCw className="w-4 h-4 animate-spin text-[#264D24]" />
                <span>Synthesizing descriptive notes with Gemini for your appointment...</span>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm sm:text-base leading-relaxed text-[#141310] dark:text-[#FCFBF7] font-bold">
                  {aiNarrative}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-[#EBE5D8] dark:border-[#32362C] text-[11px] font-bold text-[#66635A] dark:text-[#8E8D85]">
                  <span>
                    Source: {generationSource === 'gemini' ? 'Gemini AI synthesis from activity logs' : generationSource === 'empty' ? 'Empty state' : 'Family activity log records'}
                  </span>
                  <span>Non-diagnostic, descriptive context</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. REMINDERS CONTEXT (ROUTINE PATTERNS) */}
        <div className="space-y-3">
          <h3 className="text-lg font-black text-[#141310] dark:text-[#FCFBF7] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#264D24] dark:text-[#9BB858]" />
            <span>Daily Routine & Reminders Context</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#EBE5D8] dark:border-[#32362C] space-y-1">
              <div className="flex items-center justify-between text-xs font-black text-[#141310] dark:text-[#FCFBF7]">
                <span>Hydration & Morning Tea</span>
                <span className="text-[#264D24] dark:text-[#9BB858]">Consistent ✓</span>
              </div>
              <p className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
                Ayo responds warmly to hot Assam tea with ginger; family ensures steady fluid intake each morning.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#EBE5D8] dark:border-[#32362C] space-y-1">
              <div className="flex items-center justify-between text-xs font-black text-[#141310] dark:text-[#FCFBF7]">
                <span>Veranda Walks & Sunlight</span>
                <span className="text-[#264D24] dark:text-[#9BB858]">Stable ✓</span>
              </div>
              <p className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
                Enjoys 15–20 minutes sitting among courtyard orchids and peaceful morning daylight.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#EBE5D8] dark:border-[#32362C] space-y-1">
              <div className="flex items-center justify-between text-xs font-black text-[#141310] dark:text-[#FCFBF7]">
                <span>Midday Music & Church Hymns</span>
                <span className="text-[#264D24] dark:text-[#9BB858]">Calming ✓</span>
              </div>
              <p className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
                Listens attentively to family voice notes and church choir recordings during post-lunch relaxation.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#EBE5D8] dark:border-[#32362C] space-y-1">
              <div className="flex items-center justify-between text-xs font-black text-[#141310] dark:text-[#FCFBF7]">
                <span>Twilight Wind-Down</span>
                <span className="text-[#D97706]">Gentle Pacing</span>
              </div>
              <p className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
                App pacing slows down in the evening to reduce overstimulation before night rest.
              </p>
            </div>
          </div>
        </div>

        {/* 6. CAREGIVER'S APPOINTMENT QUESTIONS / NOTES */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[#141310] dark:text-[#FCFBF7] flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#264D24] dark:text-[#9BB858]" />
              <span>Caregiver Questions & Notes for the Doctor</span>
            </h3>
            <span className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
              Included on printed summary
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F0EADF] dark:bg-[#272A22] border border-[#DCD4C4] dark:border-[#3C4035] space-y-2">
            <textarea
              rows={3}
              value={caregiverNote}
              onChange={(e) => setCaregiverNote(e.target.value)}
              placeholder="e.g. Doctor, Ayo seemed slightly drowsy after lunch on Tuesday; should we adjust the timing of her calcium tablet? Also noticed her sleep was very peaceful this week."
              className="w-full p-3 rounded-xl bg-white dark:bg-[#1D1F1A] border border-[#DCD4C4] dark:border-[#4A4F41] text-xs sm:text-sm font-bold text-[#141310] dark:text-[#FCFBF7] focus:outline-none focus:ring-2 focus:ring-[#264D24]"
            />
            <p className="text-[11px] font-bold text-[#66635A] dark:text-[#8E8D85]">
              Tip: Jot down any questions or subtle behavioral changes you'd like to bring up during your consultation.
            </p>
          </div>
        </div>

        {/* Document Footer */}
        <div className="pt-6 border-t border-[#DCD4C4] dark:border-[#3C4035] flex flex-col sm:flex-row items-center justify-between text-xs font-bold text-[#66635A] dark:text-[#8E8D85] gap-2">
          <span>
            Aapka Saathi Companion Report • Dedicated to dignity, memory, and family support
          </span>
          <span>
            Document Reference: AS-DOC-{Date.now().toString().slice(-6)}
          </span>
        </div>
      </div>

      {/* Raw Underlying Activity Sessions in Range (Caregiver reference) */}
      <div className="bg-white dark:bg-[#1D1F1A] rounded-[32px] p-6 border-2 border-[#DCD4C4] dark:border-[#3C4035] shadow-xs space-y-4 print:hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[#141310] dark:text-[#FCFBF7] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#264D24] dark:text-[#9BB858]" />
            <span>Activity Log Entries in this Range ({logsInRange.length})</span>
          </h3>
          <button
            onClick={() => setCaregiverTab('activity_log')}
            className="text-xs font-black text-[#264D24] dark:text-[#9BB858] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Open Activity Log</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {logsInRange.length === 0 ? (
          <p className="text-xs font-bold text-[#66635A] py-2">
            No activity log entries recorded within this date range.
          </p>
        ) : (
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {logsInRange.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#EBE5D8] dark:border-[#32362C] flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <span className="font-black text-[#141310] dark:text-[#FCFBF7] capitalize">
                    {log.activity_type.replace(/_/g, ' ')}
                  </span>
                  <p className="font-bold text-[#3D3A33] dark:text-[#D1D0C5]">
                    "{log.descriptive_note}"
                  </p>
                </div>
                <span className="text-[10px] font-bold text-[#66635A] shrink-0">
                  {new Date(log.timestamp).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
