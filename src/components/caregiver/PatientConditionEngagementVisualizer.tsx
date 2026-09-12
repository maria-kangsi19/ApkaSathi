import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Heart,
  Activity,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Clock,
  Pill,
  Smile,
  Plus,
  X,
  CheckCircle2,
  Calendar,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConditionMood } from '../../types';

interface HourlyDataPoint {
  hourStr: string;
  timeLabel: string;
  hourNumber: number;
  condition: number;
  engagement: number;
  phase: 'morning' | 'afternoon' | 'evening' | 'night';
  phaseName: string;
  eventTitle?: string;
  notes?: string;
  iconType?: 'pill' | 'photo' | 'music' | 'rest' | 'tea' | 'chat';
}

export interface PatientConditionEngagementVisualizerProps {
  readOnly?: boolean;
  isDoctorView?: boolean;
}

export const getConditionQualitativeTag = (score: number): { label: string; color: string } => {
  if (score >= 90) return { label: 'Serene & Receptive', color: 'text-[#264D24] dark:text-[#9BB858]' };
  if (score >= 80) return { label: 'Calm & Content', color: 'text-[#264D24] dark:text-[#9BB858]' };
  if (score >= 70) return { label: 'Settled & Steady', color: 'text-emerald-700 dark:text-emerald-400' };
  if (score >= 60) return { label: 'Mild Restlessness', color: 'text-amber-700 dark:text-amber-400' };
  return { label: 'Quiet Resting Needed', color: 'text-stone-600 dark:text-stone-400' };
};

export const PatientConditionEngagementVisualizer: React.FC<PatientConditionEngagementVisualizerProps> = ({
  readOnly = false,
  isDoctorView = false,
}) => {
  const { state, addConditionCheckIn, setShowDisclaimerModal } = useApp();
  const patient = state?.patient;
  const activityLogs = state?.activityLogs || [];
  const medicineLogs = state?.medicineLogs || [];
  const medicines = state?.medicines || [];
  const conditionCheckIns = state?.conditionCheckIns || [];

  // Filter states
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [metricFilter, setMetricFilter] = useState<'both' | 'condition' | 'engagement'>('both');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);

  // Quick observation form state
  const [logMood, setLogMood] = useState<ConditionMood>('peaceful');
  const [logConditionScore, setLogConditionScore] = useState<number>(88);
  const [logEngagementScore, setLogEngagementScore] = useState<number>(75);
  const [logActivityLabel, setLogActivityLabel] = useState<string>('Afternoon Tea & Reminiscence');
  const [logNotes, setLogNotes] = useState<string>('Ayo looked calm and engaged with family photos.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Pre-calculated base hourly data points for a full 16-hour day (06:00 to 22:00)
  const fullDayHourlyData = useMemo<HourlyDataPoint[]>(() => {
    const hours = [
      {
        hourStr: '06:00 AM',
        timeLabel: '6 AM',
        hourNumber: 6,
        condition: 84,
        engagement: 32,
        phase: 'morning' as const,
        phaseName: 'Morning Awakening',
        eventTitle: 'Waking Up & Gentle Sunlight',
        notes: 'Woke up peacefully to hillside birdsong outside the window.',
        iconType: 'tea' as const,
      },
      {
        hourStr: '07:00 AM',
        timeLabel: '7 AM',
        hourNumber: 7,
        condition: 88,
        engagement: 50,
        phase: 'morning' as const,
        phaseName: 'Breakfast Preparation',
        eventTitle: 'Fresh Warm Assam Tea',
        notes: 'Enjoyed spiced warm tea on the veranda with Moa.',
        iconType: 'tea' as const,
      },
      {
        hourStr: '08:00 AM',
        timeLabel: '8 AM',
        hourNumber: 8,
        condition: 93,
        engagement: 80,
        phase: 'morning' as const,
        phaseName: 'Morning Medication',
        eventTitle: 'Blood Pressure Medicine Taken',
        notes: 'Amlodipine taken smoothly with warm water.',
        iconType: 'pill' as const,
      },
      {
        hourStr: '09:00 AM',
        timeLabel: '9 AM',
        hourNumber: 9,
        condition: 95,
        engagement: 92,
        phase: 'morning' as const,
        phaseName: 'Memory Recall',
        eventTitle: 'Family Photo Album Session',
        notes: 'Recognized Moa and granddaughter Sentila. Radiant smiles.',
        iconType: 'photo' as const,
      },
      {
        hourStr: '10:00 AM',
        timeLabel: '10 AM',
        hourNumber: 10,
        condition: 91,
        engagement: 85,
        phase: 'morning' as const,
        phaseName: 'Courtyard Stroll',
        eventTitle: 'Veranda Wild Orchids Stroll',
        notes: 'Walked gently admiring potted orchids in bloom.',
        iconType: 'photo' as const,
      },
      {
        hourStr: '11:00 AM',
        timeLabel: '11 AM',
        hourNumber: 11,
        condition: 88,
        engagement: 74,
        phase: 'morning' as const,
        phaseName: 'Cognitive Play',
        eventTitle: 'Mountain Orchid Memory Matching',
        notes: 'Successfully matched floral memory cards at gentle pacing.',
        iconType: 'photo' as const,
      },
      {
        hourStr: '12:00 PM',
        timeLabel: '12 PM',
        hourNumber: 12,
        condition: 85,
        engagement: 62,
        phase: 'afternoon' as const,
        phaseName: 'Midday Meal',
        eventTitle: 'Warm Rice Stew & Broth',
        notes: 'Nourishing warm traditional lunch with family.',
        iconType: 'tea' as const,
      },
      {
        hourStr: '01:00 PM',
        timeLabel: '1 PM',
        hourNumber: 13,
        condition: 82,
        engagement: 48,
        phase: 'afternoon' as const,
        phaseName: 'Midday Routine',
        eventTitle: 'Midday Calcium Dose',
        notes: 'Calcium + Vitamin D3 taken; prepared for restful nap.',
        iconType: 'pill' as const,
      },
      {
        hourStr: '02:00 PM',
        timeLabel: '2 PM',
        hourNumber: 14,
        condition: 90,
        engagement: 22,
        phase: 'afternoon' as const,
        phaseName: 'Quiet Rest',
        eventTitle: 'Afternoon Rest & Soft Wool Shawl',
        notes: 'Deep, soothing nap in comfortable armchair.',
        iconType: 'rest' as const,
      },
      {
        hourStr: '03:00 PM',
        timeLabel: '3 PM',
        hourNumber: 15,
        condition: 89,
        engagement: 66,
        phase: 'afternoon' as const,
        phaseName: 'Ambient Hymns',
        eventTitle: 'Ao Naga Church Choir Harmonies',
        notes: 'Awoke gently and hummed softly with familiar choral hymns.',
        iconType: 'music' as const,
      },
      {
        hourStr: '04:00 PM',
        timeLabel: '4 PM',
        hourNumber: 16,
        condition: 94,
        engagement: 88,
        phase: 'afternoon' as const,
        phaseName: 'Family Voice Note',
        eventTitle: 'Granddaughter Sentila Check-in',
        notes: 'Listened attentively to Sentila’s cheerful voice note.',
        iconType: 'chat' as const,
      },
      {
        hourStr: '05:00 PM',
        timeLabel: '5 PM',
        hourNumber: 17,
        condition: 90,
        engagement: 76,
        phase: 'evening' as const,
        phaseName: 'Evening Tea',
        eventTitle: 'Ginger Chai & Weaving Patterns',
        notes: 'Talked about traditional Naga shawl designs over tea.',
        iconType: 'tea' as const,
      },
      {
        hourStr: '06:00 PM',
        timeLabel: '6 PM',
        hourNumber: 18,
        condition: 87,
        engagement: 64,
        phase: 'evening' as const,
        phaseName: 'Gentle Fellowship',
        eventTitle: 'Family Conversation & Relaxation',
        notes: 'Calm, relaxed interaction in the living room.',
        iconType: 'chat' as const,
      },
      {
        hourStr: '07:00 PM',
        timeLabel: '7 PM',
        hourNumber: 19,
        condition: 89,
        engagement: 70,
        phase: 'evening' as const,
        phaseName: 'Evening Dinner',
        eventTitle: 'Wholesome Light Dinner',
        notes: 'Light broth and boiled greens with family.',
        iconType: 'tea' as const,
      },
      {
        hourStr: '08:00 PM',
        timeLabel: '8 PM',
        hourNumber: 20,
        condition: 86,
        engagement: 52,
        phase: 'evening' as const,
        phaseName: 'Night Medication',
        eventTitle: 'Donepezil Memory Support Dose',
        notes: 'Bedtime medicine taken with half glass of water.',
        iconType: 'pill' as const,
      },
      {
        hourStr: '09:00 PM',
        timeLabel: '9 PM',
        hourNumber: 21,
        condition: 92,
        engagement: 34,
        phase: 'night' as const,
        phaseName: 'Twilight Wind-Down',
        eventTitle: 'Bedtime Prayer & Soft Dim Light',
        notes: 'Quiet prayer; settled comfortably under warm quilt.',
        iconType: 'rest' as const,
      },
      {
        hourStr: '10:00 PM',
        timeLabel: '10 PM',
        hourNumber: 22,
        condition: 94,
        engagement: 16,
        phase: 'night' as const,
        phaseName: 'Night Rest',
        eventTitle: 'Peaceful Night Sleep',
        notes: 'Calm breathing and continuous serene rest.',
        iconType: 'rest' as const,
      },
    ];

    // Overlay dynamically recorded conditionCheckIns if available
    if (conditionCheckIns.length > 0) {
      conditionCheckIns.forEach((chk) => {
        const d = new Date(chk.timestamp);
        const chkHour = d.getHours();
        const target = hours.find((h) => h.hourNumber === chkHour);
        if (target) {
          target.condition = chk.condition_score;
          target.engagement = chk.engagement_score;
          target.eventTitle = chk.activity_label || target.eventTitle;
          target.notes = chk.notes || target.notes;
        }
      });
    }

    // Overlay real activity logs onto matching hours
    if (activityLogs.length > 0) {
      activityLogs.forEach((log) => {
        const d = new Date(log.timestamp);
        const logHour = d.getHours();
        const target = hours.find((h) => h.hourNumber === logHour);
        if (target) {
          target.engagement = Math.min(100, Math.max(target.engagement, 85));
          target.notes = `${log.descriptive_note} (${target.notes})`;
        }
      });
    }

    return hours;
  }, [conditionCheckIns, activityLogs]);

  // Filtered dataset based on time filter
  const filteredData = useMemo(() => {
    if (timeFilter === 'morning') {
      return fullDayHourlyData.filter((d) => d.phase === 'morning');
    }
    if (timeFilter === 'afternoon') {
      return fullDayHourlyData.filter((d) => d.phase === 'afternoon');
    }
    if (timeFilter === 'evening') {
      return fullDayHourlyData.filter((d) => d.phase === 'evening' || d.phase === 'night');
    }
    return fullDayHourlyData;
  }, [fullDayHourlyData, timeFilter]);

  // Aggregate stats
  const avgCondition = useMemo(() => {
    const sum = fullDayHourlyData.reduce((acc, curr) => acc + curr.condition, 0);
    return Math.round(sum / fullDayHourlyData.length);
  }, [fullDayHourlyData]);

  const peakEngagementHour = useMemo(() => {
    let max = -1;
    let peak = fullDayHourlyData[0];
    fullDayHourlyData.forEach((d) => {
      if (d.engagement > max) {
        max = d.engagement;
        peak = d;
      }
    });
    return peak;
  }, [fullDayHourlyData]);

  const selectedPoint = selectedPointIndex !== null ? filteredData[selectedPointIndex] : null;

  // Handle saving new observation
  const handleSaveObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addConditionCheckIn({
        condition_score: logConditionScore,
        engagement_score: logEngagementScore,
        mood: logMood,
        activity_label: logActivityLabel,
        notes: logNotes,
      });
      setShowLogModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom Chart Tooltip
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as HourlyDataPoint;
      return (
        <div className="bg-white dark:bg-[#1D1F1A] border-2 border-[#264D24] dark:border-[#9BB858] p-4 rounded-2xl shadow-xl max-w-xs space-y-2 text-[#141310] dark:text-[#FCFBF7]">
          <div className="flex items-center justify-between gap-2 border-b border-[#EBE5D8] dark:border-[#32362C] pb-2">
            <span className="text-xs font-black text-[#264D24] dark:text-[#9BB858] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {dataPoint.hourStr}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E0EDE0] dark:bg-[#263319] text-[#143513] dark:text-[#9BB858]">
              {dataPoint.phaseName}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#66635A] dark:text-[#8E8D85] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#264D24]" />
                {isDoctorView ? 'Caregiver Observation:' : 'Patient Condition:'}
              </span>
              <span className="font-black text-[#264D24] dark:text-[#9BB858]">
                {isDoctorView ? getConditionQualitativeTag(dataPoint.condition).label : `${dataPoint.condition}%`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-[#66635A] dark:text-[#8E8D85] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                Engagement Level:
              </span>
              <span className="font-black text-[#D97706]">
                {dataPoint.engagement}%
              </span>
            </div>
          </div>

          {dataPoint.eventTitle && (
            <div className="pt-2 border-t border-[#EBE5D8] dark:border-[#32362C]">
              <p className="text-xs font-black text-[#141310] dark:text-[#FCFBF7]">
                {dataPoint.eventTitle}
              </p>
              {dataPoint.notes && (
                <p className="text-[11px] text-[#66635A] dark:text-[#8E8D85] font-semibold mt-0.5 line-clamp-2">
                  {dataPoint.notes}
                </p>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Controls */}
      <div className="bg-white dark:bg-[#1D1F1A] rounded-[36px] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-6 sm:p-8 card-shadow space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#E0EDE0] dark:bg-[#263319] text-[#264D24] dark:text-[#9BB858] flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-[#264D24] dark:text-[#9BB858]">
                Daily Wellness & Engagement Visualizer
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#141310] dark:text-[#FCFBF7]">
              {patient?.name || 'Arenla Ao'}’s Condition & Engagement Throughout the Day
            </h2>
            <p className="text-xs sm:text-sm text-[#66635A] dark:text-[#8E8D85] font-bold">
              Hourly serenity level, emotional calm, cognitive responsiveness, and care routines from 6 AM to 10 PM.
            </p>
          </div>

          {!readOnly && !isDoctorView && (
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Log Observation Button */}
              <button
                onClick={() => setShowLogModal(true)}
                className="px-5 py-2.5 rounded-full bg-[#264D24] hover:bg-[#1E3E1C] text-white text-xs sm:text-sm font-black shadow-sm flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Log Mood / Check-In</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Key Metrics Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#EBE5D8] dark:border-[#32362C] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
                {isDoctorView ? 'Observed Demeanor' : 'Avg Condition / Comfort'}
              </span>
              <Heart className="w-4 h-4 text-[#264D24] fill-current" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-2xl font-black text-[#264D24] dark:text-[#9BB858]">
                {isDoctorView ? getConditionQualitativeTag(avgCondition).label : `${avgCondition}%`}
              </span>
              <span className="text-[11px] font-bold text-[#3D3A33] dark:text-[#D1D0C5]">
                {isDoctorView ? 'Descriptive Log' : 'Serene & Peaceful'}
              </span>
            </div>
          </div>


          <div className="p-4 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#EBE5D8] dark:border-[#32362C] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
                Peak Engagement Window
              </span>
              <TrendingUp className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#D97706]">
                {peakEngagementHour.timeLabel}
              </span>
              <span className="text-[11px] font-bold text-[#3D3A33] dark:text-[#D1D0C5]">
                {peakEngagementHour.engagement}% Activity
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#EBE5D8] dark:border-[#32362C] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
                Medicines & Routines
              </span>
              <Pill className="w-4 h-4 text-[#9C382A]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#141310] dark:text-[#FCFBF7]">
                {medicines.filter((m) => m.active).length} Doses
              </span>
              <span className="text-[11px] font-bold text-[#264D24] dark:text-[#9BB858]">
                Active Schedule
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#EBE5D8] dark:border-[#32362C] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
                Rest & Quiet Periods
              </span>
              <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300">
                2.5 hrs
              </span>
              <span className="text-[11px] font-bold text-[#3D3A33] dark:text-[#D1D0C5]">
                Nap & Ambience
              </span>
            </div>
          </div>
        </div>

        {/* 3. Filter Bar (Time of Day & Metrics) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#EBE5D8] dark:border-[#32362C]">
          {/* Time Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-black text-[#66635A] dark:text-[#8E8D85] mr-1">
              Time Window:
            </span>
            <button
              onClick={() => {
                setTimeFilter('all');
                setSelectedPointIndex(null);
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                timeFilter === 'all'
                  ? 'bg-[#264D24] text-white shadow-xs'
                  : 'bg-[#F3EFE6] dark:bg-[#272A22] text-[#3D3A33] dark:text-[#D1D0C5] hover:bg-[#EBE5D8]'
              }`}
            >
              Full Day (6am - 10pm)
            </button>
            <button
              onClick={() => {
                setTimeFilter('morning');
                setSelectedPointIndex(null);
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                timeFilter === 'morning'
                  ? 'bg-[#264D24] text-white shadow-xs'
                  : 'bg-[#F3EFE6] dark:bg-[#272A22] text-[#3D3A33] dark:text-[#D1D0C5] hover:bg-[#EBE5D8]'
              }`}
            >
              Morning (6am - 12pm)
            </button>
            <button
              onClick={() => {
                setTimeFilter('afternoon');
                setSelectedPointIndex(null);
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                timeFilter === 'afternoon'
                  ? 'bg-[#264D24] text-white shadow-xs'
                  : 'bg-[#F3EFE6] dark:bg-[#272A22] text-[#3D3A33] dark:text-[#D1D0C5] hover:bg-[#EBE5D8]'
              }`}
            >
              Afternoon (12pm - 5pm)
            </button>
            <button
              onClick={() => {
                setTimeFilter('evening');
                setSelectedPointIndex(null);
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                timeFilter === 'evening'
                  ? 'bg-[#264D24] text-white shadow-xs'
                  : 'bg-[#F3EFE6] dark:bg-[#272A22] text-[#3D3A33] dark:text-[#D1D0C5] hover:bg-[#EBE5D8]'
              }`}
            >
              Evening & Twilight (5pm - 10pm)
            </button>
          </div>

          {/* Metric Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#66635A] dark:text-[#8E8D85]">
              Metrics:
            </span>
            <div className="inline-flex rounded-xl bg-[#F3EFE6] dark:bg-[#272A22] p-0.5 text-xs font-black">
              <button
                onClick={() => setMetricFilter('both')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  metricFilter === 'both' ? 'bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] shadow-xs' : 'text-[#66635A] dark:text-[#8E8D85]'
                }`}
              >
                Both
              </button>
              <button
                onClick={() => setMetricFilter('condition')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  metricFilter === 'condition' ? 'bg-[#264D24] text-white shadow-xs' : 'text-[#66635A] dark:text-[#8E8D85]'
                }`}
              >
                Condition Only
              </button>
              <button
                onClick={() => setMetricFilter('engagement')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  metricFilter === 'engagement' ? 'bg-[#D97706] text-white shadow-xs' : 'text-[#66635A] dark:text-[#8E8D85]'
                }`}
              >
                Engagement Only
              </button>
            </div>
          </div>
        </div>

        {/* 4. The Interactive Graph */}
        <div className="w-full h-80 sm:h-96 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(state) => {
                if (state && state.activeTooltipIndex !== undefined) {
                  setSelectedPointIndex(Number(state.activeTooltipIndex));
                }
              }}
            >
              <defs>
                <linearGradient id="conditionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#264D24" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#264D24" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D97706" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />

              <XAxis
                dataKey="timeLabel"
                tickLine={false}
                axisLine={{ stroke: '#DCD4C4', strokeWidth: 1 }}
                tick={{ fill: '#66635A', fontSize: 12, fontWeight: 700 }}
              />

              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#66635A', fontSize: 11, fontWeight: 700 }}
                unit="%"
              />

              <Tooltip content={<CustomChartTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px', fontWeight: 'bold' }}
              />

              {/* Area for Patient Condition */}
              {(metricFilter === 'both' || metricFilter === 'condition') && (
                <Area
                  type="monotone"
                  dataKey="condition"
                  name="Patient Condition (Comfort / Serenity)"
                  stroke="#264D24"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#conditionGradient)"
                  activeDot={{ r: 6, stroke: '#264D24', strokeWidth: 2, fill: '#FFFFFF' }}
                />
              )}

              {/* Area / Line for Patient Engagement */}
              {(metricFilter === 'both' || metricFilter === 'engagement') && (
                <Area
                  type="monotone"
                  dataKey="engagement"
                  name="Engagement (Activities / Interactions)"
                  stroke="#D97706"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#engagementGradient)"
                  activeDot={{ r: 6, stroke: '#D97706', strokeWidth: 2, fill: '#FFFFFF' }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 5. Selected Hourly Milestone Highlight Card */}
        {selectedPoint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-3xl bg-[#F9F7F1] dark:bg-[#23261F] border-2 border-[#264D24] dark:border-[#9BB858] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#264D24] text-white text-[11px] font-black">
                  {selectedPoint.hourStr}
                </span>
                <span className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85]">
                  {selectedPoint.phaseName}
                </span>
              </div>
              <h4 className="text-base font-black text-[#141310] dark:text-[#FCFBF7]">
                {selectedPoint.eventTitle}
              </h4>
              <p className="text-xs font-bold text-[#3D3A33] dark:text-[#D1D0C5]">
                {selectedPoint.notes}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center px-3 py-1.5 rounded-xl bg-white dark:bg-[#1D1F1A] border border-[#EBE5D8] dark:border-[#32362C]">
                <span className="block text-[10px] font-bold text-[#66635A] dark:text-[#8E8D85]">
                  {isDoctorView ? 'Observed State' : 'Condition'}
                </span>
                <span className="text-xs sm:text-sm font-black text-[#264D24] dark:text-[#9BB858]">
                  {isDoctorView ? getConditionQualitativeTag(selectedPoint.condition).label : `${selectedPoint.condition}%`}
                </span>
              </div>
              <div className="text-center px-3 py-1.5 rounded-xl bg-white dark:bg-[#1D1F1A] border border-[#EBE5D8] dark:border-[#32362C]">
                <span className="block text-[10px] font-bold text-[#66635A] dark:text-[#8E8D85]">Engagement</span>
                <span className="text-sm font-black text-[#D97706]">
                  {selectedPoint.engagement}%
                </span>
              </div>
              <button
                onClick={() => setSelectedPointIndex(null)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#66635A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* 6. Hourly Milestone Track Strip */}
        <div className="space-y-2 pt-2 border-t border-[#EBE5D8] dark:border-[#32362C]">
          <h3 className="text-xs font-black text-[#66635A] dark:text-[#8E8D85] uppercase tracking-wider">
            Daily Activity & Routine Milestones (Click to Inspect on Graph)
          </h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {filteredData.map((point, index) => {
              const isSelected = selectedPointIndex === index;
              return (
                <button
                  key={point.hourStr}
                  onClick={() => setSelectedPointIndex(index)}
                  className={`px-3 py-2 rounded-2xl border text-left shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#264D24] text-white border-[#264D24] shadow-md scale-105'
                      : 'bg-[#F9F7F1] dark:bg-[#23261F] text-[#141310] dark:text-[#FCFBF7] border-[#EBE5D8] dark:border-[#32362C] hover:border-[#264D24]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] font-black">
                    <span>{point.timeLabel}</span>
                    <span className={isSelected ? 'text-emerald-200' : 'text-[#264D24] dark:text-[#9BB858]'}>
                      {isDoctorView ? getConditionQualitativeTag(point.condition).label.split(' ')[0] : `${point.condition}%`}
                    </span>
                  </div>
                  <div className="text-xs font-black truncate max-w-[130px] mt-0.5">
                    {point.eventTitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7. Quick Check-In / Observation Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1D1F1A] border-2 border-[#264D24] dark:border-[#9BB858] rounded-[36px] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-[#141310] dark:text-[#FCFBF7]"
            >
              <div className="flex items-center justify-between border-b border-[#EBE5D8] dark:border-[#32362C] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E0EDE0] dark:bg-[#263319] text-[#264D24] dark:text-[#9BB858] flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">Log Condition Check-In</h3>
                    <p className="text-xs text-[#66635A] dark:text-[#8E8D85] font-bold">
                      Record {patient?.name || 'Ayo'}’s current state
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#66635A] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveObservation} className="space-y-4">
                {/* Mood selector pills */}
                <div>
                  <label className="block text-xs font-black uppercase text-[#66635A] dark:text-[#8E8D85] mb-2">
                    Observed Emotional State
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'radiant' as ConditionMood, label: 'Radiant & Smiling 🌸', score: 95, eng: 88 },
                      { id: 'peaceful' as ConditionMood, label: 'Calm & Peaceful 🌿', score: 88, eng: 65 },
                      { id: 'mild_fatigue' as ConditionMood, label: 'Mild Fatigue / Quiet 🍵', score: 78, eng: 40 },
                      { id: 'needs_comfort' as ConditionMood, label: 'Needs Comfort & Hugs 🫂', score: 65, eng: 30 },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          setLogMood(item.id);
                          setLogConditionScore(item.score);
                          setLogEngagementScore(item.eng);
                        }}
                        className={`p-2.5 rounded-2xl text-xs font-black border text-left transition-all cursor-pointer ${
                          logMood === item.id
                            ? 'bg-[#264D24] text-white border-[#264D24] shadow-xs'
                            : 'bg-[#F9F7F1] dark:bg-[#23261F] text-[#141310] dark:text-[#FCFBF7] border-[#EBE5D8] dark:border-[#32362C]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score Sliders */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-black">
                      <span>Condition / Comfort:</span>
                      <span className="text-[#264D24] dark:text-[#9BB858]">{logConditionScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={logConditionScore}
                      onChange={(e) => setLogConditionScore(parseInt(e.target.value, 10))}
                      className="w-full accent-[#264D24]"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-black">
                      <span>Engagement:</span>
                      <span className="text-[#D97706]">{logEngagementScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={logEngagementScore}
                      onChange={(e) => setLogEngagementScore(parseInt(e.target.value, 10))}
                      className="w-full accent-[#D97706]"
                    />
                  </div>
                </div>

                {/* Activity Context */}
                <div>
                  <label className="block text-xs font-black uppercase text-[#66635A] dark:text-[#8E8D85] mb-1">
                    Activity Context
                  </label>
                  <input
                    type="text"
                    value={logActivityLabel}
                    onChange={(e) => setLogActivityLabel(e.target.value)}
                    placeholder="e.g. Afternoon Tea & Church Choir Hymn"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#DCD4C4] dark:border-[#3C4035] bg-[#F9F7F1] dark:bg-[#23261F] text-xs font-bold text-[#141310] dark:text-[#FCFBF7] focus:outline-hidden focus:border-[#264D24]"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-black uppercase text-[#66635A] dark:text-[#8E8D85] mb-1">
                    Caregiver Observation Notes
                  </label>
                  <textarea
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    rows={3}
                    placeholder="How was Ayo responding? Any smiles, stories, or peaceful resting?"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#DCD4C4] dark:border-[#3C4035] bg-[#F9F7F1] dark:bg-[#23261F] text-xs font-bold text-[#141310] dark:text-[#FCFBF7] focus:outline-hidden focus:border-[#264D24]"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-5 py-2.5 rounded-full border border-[#DCD4C4] dark:border-[#3C4035] text-xs font-black hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-full bg-[#264D24] hover:bg-[#1E3E1C] text-white text-xs font-black shadow-md cursor-pointer transition-transform hover:scale-105"
                  >
                    {isSubmitting ? 'Saving...' : 'Save & Plot onto Graph ✓'}
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
