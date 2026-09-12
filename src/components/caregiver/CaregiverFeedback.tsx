import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquarePlus,
  Send,
  Lightbulb,
  HeartHandshake,
  Globe,
  Pill,
  Bug,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Cpu,
  User,
  Phone,
  Mail,
  HelpCircle,
  Copy,
  Check,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FeedbackCategory, FeedbackPriority, DeveloperFeedback } from '../../types';

interface SuggestionStarter {
  category: FeedbackCategory;
  topic: string;
  starterText: string;
  label: string;
}

const SUGGESTION_STARTERS: SuggestionStarter[] = [
  {
    category: 'cultural_languages',
    label: 'Traditional Folk Lullabies',
    topic: 'Add traditional North Eastern folk songs & lullabies',
    starterText: 'I would love to have traditional folk melodies and choir recordings in Ao, Angami, Assamese, or Khasi included in the Sounds of Home library. Elders recognize these tunes with great emotion.',
  },
  {
    category: 'elder_comfort',
    label: 'Larger Touch Targets',
    topic: 'Option for extra-large buttons on tablet mode',
    starterText: 'When my elder touches the screen, tremors make it harder to hit smaller buttons. Having an extra-large button option would make independent interaction much easier.',
  },
  {
    category: 'medicines_routines',
    label: 'Louder Distinct Morning Chime',
    topic: 'Configurable sound tones for morning vs evening medicine alarms',
    starterText: 'A distinct sound for morning vitamins vs evening blood pressure tablets would help the whole household immediately recognize which routine is happening.',
  },
  {
    category: 'feature_suggestion',
    label: 'Festive Season Memory Album',
    topic: 'Festive remembrance packs (Hornbill, Bihu, Christmas, Moatsü)',
    starterText: 'Seasonal themes with historic festival photos, songs, and gentle prompts about regional celebrations would spark wonderful storytelling during harvest and festive weeks.',
  },
  {
    category: 'feature_suggestion',
    label: 'Longer Voice Greetings',
    topic: 'Extend voice note recording time for relatives living away',
    starterText: 'Grandchildren studying outside the state would love to send 1-2 minute audio messages and prayers rather than shorter clips.',
  },
  {
    category: 'issue_bug',
    label: 'Audio Playback Check',
    topic: 'Audio volume behavior when background rain sounds are active',
    starterText: 'When ambient rain sounds are playing softly, voice read-aloud is sometimes lower in volume. Could background audio automatically dip slightly when voice speaks?',
  },
];

const CATEGORY_DETAILS: Record<
  FeedbackCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; desc: string }
> = {
  feature_suggestion: {
    label: 'New Feature or Memory Activity',
    icon: Lightbulb,
    color: 'text-[#965A04] dark:text-[#F5B83D]',
    bg: 'bg-[#FDF3DF] dark:bg-[#3D2D14] border-[#965A04]/30',
    desc: 'Propose new memory games, photo sharing tools, or daily comfort tools',
  },
  elder_comfort: {
    label: 'Elder Usability & Comfort',
    icon: HeartHandshake,
    color: 'text-[#183C17] dark:text-[#8DA850]',
    bg: 'bg-[#E4EFE0] dark:bg-[#242E18] border-[#183C17]/30',
    desc: 'Font sizes, button contrast, touch pacing, or sensory accessibility',
  },
  cultural_languages: {
    label: 'Regional Languages & Heritage',
    icon: Globe,
    color: 'text-[#1E4D6B] dark:text-[#76A9C8]',
    bg: 'bg-[#E1EFF7] dark:bg-[#1C3242] border-[#1E4D6B]/30',
    desc: 'North Eastern dialects, folk songs, traditional practices, or phrasing',
  },
  medicines_routines: {
    label: 'Medicine & Routine Tracking',
    icon: Pill,
    color: 'text-[#822417] dark:text-[#E07A6D]',
    bg: 'bg-[#FAECE9] dark:bg-[#3D1E1A] border-[#822417]/30',
    desc: 'Alarm chimes, snooze behaviors, dose schedules, or log exports',
  },
  issue_bug: {
    label: 'Report a Glitch or Issue',
    icon: Bug,
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-900/50',
    desc: 'Something did not work as expected or displayed incorrectly',
  },
  general_appreciation: {
    label: 'Appreciation & General Feedback',
    icon: Sparkles,
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900/50',
    desc: 'Share what has helped your family or general thoughts with the creators',
  },
};

export const CaregiverFeedback: React.FC = () => {
  const { state, submitDeveloperFeedback } = useApp();

  const [category, setCategory] = useState<FeedbackCategory>('feature_suggestion');
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [priority, setPriority] = useState<FeedbackPriority>('helpful');
  const [caregiverName, setCaregiverName] = useState(state?.caregiver?.name || 'Moa Jamir');
  const [caregiverContact, setCaregiverContact] = useState(
    state?.caregiver?.phone || state?.caregiver?.phone_number || '+91 98621 54321'
  );
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [showDiagnosticsDetail, setShowDiagnosticsDetail] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<DeveloperFeedback | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const feedbackList: DeveloperFeedback[] = state?.developerFeedback || [];

  const handleApplyStarter = (starter: SuggestionStarter) => {
    setCategory(starter.category);
    setTopic(starter.topic);
    setDetails(starter.starterText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !details.trim()) {
      return;
    }

    setIsSubmitting(true);

    const diagnosticsPayload = includeDiagnostics
      ? {
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 150) : 'Browser',
          screen_size: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Standard',
          theme: state?.settings?.twilightMode ? 'Twilight Dark' : 'Warm Parchment',
          language: state?.settings?.language || state?.patient?.preferred_language || 'Nagamese / English',
        }
      : undefined;

    try {
      const saved = await submitDeveloperFeedback({
        caregiver_id: state?.caregiver?.id || 'cg-1',
        caregiver_name: caregiverName.trim() || 'Caregiver',
        caregiver_contact: caregiverContact.trim(),
        category,
        topic: topic.trim(),
        details: details.trim(),
        priority,
        app_version: 'v1.4 (North East India Edition)',
        system_info: diagnosticsPayload,
      });

      setSubmissionSuccess(saved);
      // Reset main fields for new submissions
      setTopic('');
      setDetails('');
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyFeedbackRef = (id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredHistory = feedbackList.filter(item => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-white via-[#FAF7F0] to-[#F2EDE2] dark:from-[#1D1F1A] dark:via-[#22251F] dark:to-[#171915] p-6 sm:p-8 border-2 border-[#DCD4C4] dark:border-[#3C4035] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAEBCE] text-[#5E3500] dark:bg-[#3D2D14] dark:text-[#F7C04D] border border-[#6E3B00]/30 text-xs font-black uppercase tracking-wider">
              <MessageSquarePlus className="w-3.5 h-3.5" />
              Direct Developer Feedback Channel
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#141310] dark:text-[#FCFBF7] tracking-tight">
              Caregiver Improvement Suggestions
            </h1>
            <p className="text-xs sm:text-sm text-[#545048] dark:text-[#BCB9AB] font-medium leading-relaxed">
              You know your loved one&apos;s daily comfort, memory patterns, and cultural joy better than anyone. Share your suggestions, ideas for new activities, language nuances, or usability adjustments directly with our engineering and design team.
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 p-4 rounded-2xl bg-white dark:bg-[#252820] border border-[#DCD4C4] dark:border-[#3C4035] shrink-0">
            <div className="text-left md:text-right">
              <p className="text-[11px] uppercase font-bold text-[#8C877D] dark:text-[#9C988D]">Submitted Ideas</p>
              <p className="text-2xl font-black text-[#183C17] dark:text-[#8DA850]">{feedbackList.length}</p>
            </div>
            <span className="text-[11px] font-bold text-[#5E3500] dark:text-[#F5B83D] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Actively Reviewed
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {submissionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 sm:p-6 rounded-2xl bg-[#E4EFE0] dark:bg-[#242E18] border-2 border-[#183C17]/40 text-[#183C17] dark:text-[#8DA850] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-[#183C17] text-white shrink-0 mt-0.5 sm:mt-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black">
                  Thank you! Your feedback has been safely submitted to our development team.
                </p>
                <p className="text-xs text-[#143013] dark:text-[#B7D284] mt-0.5">
                  Reference ID: <span className="font-mono font-bold">{submissionSuccess.id}</span> • Topic:{' '}
                  &ldquo;{submissionSuccess.topic}&rdquo;
                </p>
              </div>
            </div>
            <button
              onClick={() => setSubmissionSuccess(null)}
              className="px-4 py-2 rounded-full bg-[#183C17] hover:bg-[#102910] text-white text-xs font-black transition-colors cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Inspiration Starters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#706B61] dark:text-[#A8A499]">
          <Sparkles className="w-4 h-4 text-[#965A04] dark:text-[#F5B83D]" />
          Quick Suggestion Starters (Tap to fill form)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SUGGESTION_STARTERS.map((starter, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyStarter(starter)}
              className="text-left p-3.5 rounded-2xl bg-white dark:bg-[#1D1F1A] border border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#183C17] dark:hover:border-[#8DA850] transition-all hover:scale-[1.01] cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-[#141310] dark:text-[#FCFBF7] group-hover:text-[#183C17] dark:group-hover:text-[#8DA850] transition-colors">
                  {starter.label}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3EFE6] dark:bg-[#272A22] text-[#5E5A52] dark:text-[#B3AFA5]">
                  {starter.category === 'cultural_languages'
                    ? 'Heritage'
                    : starter.category === 'elder_comfort'
                    ? 'Comfort'
                    : starter.category === 'medicines_routines'
                    ? 'Routine'
                    : 'Feature'}
                </span>
              </div>
              <p className="text-[11px] text-[#5E5A52] dark:text-[#B3AFA5] line-clamp-2 leading-relaxed">
                {starter.starterText}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Submission Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-6 sm:p-8 space-y-6 shadow-xs"
      >
        <div className="border-b border-[#DCD4C4] dark:border-[#3C4035] pb-4">
          <h2 className="text-lg font-black text-[#141310] dark:text-[#FCFBF7]">
            Submit a Suggestion or Improvement
          </h2>
          <p className="text-xs text-[#6E6A60] dark:text-[#B3AFA5] mt-1">
            Choose what type of feedback this is and let us know your suggestions in detail.
          </p>
        </div>

        {/* 1. Category Selector */}
        <div className="space-y-2.5">
          <label className="block text-xs font-black uppercase tracking-wider text-[#3D3A33] dark:text-[#D1D0C5]">
            1. Feedback Category *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.keys(CATEGORY_DETAILS) as FeedbackCategory[]).map((catKey) => {
              const meta = CATEGORY_DETAILS[catKey];
              const Icon = meta.icon;
              const isSelected = category === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setCategory(catKey)}
                  className={`text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? `${meta.bg} border-[#183C17] dark:border-[#8DA850] shadow-xs`
                      : 'bg-white dark:bg-[#252820] border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#8C877D]'
                  }`}
                >
                  <div className={`p-2 rounded-xl bg-white/80 dark:bg-black/20 ${meta.color} shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[#141310] dark:text-[#FCFBF7] leading-tight">
                      {meta.label}
                    </p>
                    <p className="text-[10px] text-[#6E6A60] dark:text-[#B3AFA5] mt-1 leading-snug">
                      {meta.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Topic / Headline */}
        <div className="space-y-2">
          <label
            htmlFor="feedback-topic"
            className="block text-xs font-black uppercase tracking-wider text-[#3D3A33] dark:text-[#D1D0C5]"
          >
            2. Suggestion Topic or Title *
          </label>
          <input
            id="feedback-topic"
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Add Ao Naga church lullabies, or Larger touch buttons on iPad"
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#252820] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#183C17] dark:focus:border-[#8DA850] outline-none transition-colors"
          />
        </div>

        {/* 3. Detailed Feedback */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="feedback-details"
              className="block text-xs font-black uppercase tracking-wider text-[#3D3A33] dark:text-[#D1D0C5]"
            >
              3. Details, Observations & Suggestions *
            </label>
            <span className="text-[11px] text-[#8C877D] font-bold">
              {details.length} characters
            </span>
          </div>
          <textarea
            id="feedback-details"
            required
            rows={5}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Please describe how this would help your loved one, what happened, or specific ideas for how you'd like it to look and work..."
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#252820] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#183C17] dark:focus:border-[#8DA850] outline-none transition-colors resize-y leading-relaxed"
          />
        </div>

        {/* 4. Priority & Importance */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider text-[#3D3A33] dark:text-[#D1D0C5]">
            4. Suggested Priority / Daily Impact
          </label>
          <div className="flex flex-wrap gap-2.5">
            {[
              { id: 'standard', label: 'Nice to Have / Future Enhancement', color: 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300' },
              { id: 'helpful', label: 'Helpful Improvement for Daily Care', color: 'border-amber-600 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-300' },
              { id: 'urgent', label: 'High Priority / Affects Usability', color: 'border-red-600 bg-red-50 text-red-900 dark:bg-red-950/30 dark:text-red-300' },
            ].map((p) => {
              const isSelected = priority === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id as FeedbackPriority)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold border-2 transition-all cursor-pointer ${
                    isSelected
                      ? `${p.color} border-current shadow-2xs scale-[1.02]`
                      : 'bg-[#F3EFE6] dark:bg-[#272A22] border-[#DCD4C4] dark:border-[#3C4035] text-[#545048] dark:text-[#B3AFA5]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Caregiver Contact & Follow-up */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#DCD4C4] dark:border-[#3C4035]">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-black text-[#3D3A33] dark:text-[#D1D0C5]">
              <User className="w-3.5 h-3.5" /> Caregiver Name
            </label>
            <input
              type="text"
              value={caregiverName}
              onChange={(e) => setCaregiverName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#252820] text-[#141310] dark:text-[#FCFBF7] text-xs font-bold focus:border-[#183C17] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-black text-[#3D3A33] dark:text-[#D1D0C5]">
              <Phone className="w-3.5 h-3.5" /> Contact Phone or Email (Optional for developer follow-up)
            </label>
            <input
              type="text"
              value={caregiverContact}
              onChange={(e) => setCaregiverContact(e.target.value)}
              placeholder="+91 94360... or email@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#252820] text-[#141310] dark:text-[#FCFBF7] text-xs font-bold focus:border-[#183C17] outline-none"
            />
          </div>
        </div>

        {/* Diagnostics & Environment details */}
        <div className="p-4 rounded-2xl bg-[#F8F5EE] dark:bg-[#242721] border border-[#DCD4C4] dark:border-[#3C4035] space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDiagnostics}
                onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                className="w-4 h-4 rounded text-[#183C17] focus:ring-[#183C17]"
              />
              <span className="text-xs font-bold text-[#141310] dark:text-[#FCFBF7]">
                Include anonymous device & app settings to help the developer reproduce
              </span>
            </label>
            <button
              type="button"
              onClick={() => setShowDiagnosticsDetail(!showDiagnosticsDetail)}
              className="text-[11px] font-bold text-[#183C17] dark:text-[#8DA850] flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5" />
              {showDiagnosticsDetail ? 'Hide Technical Context' : 'Preview Context'}
              {showDiagnosticsDetail ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {showDiagnosticsDetail && includeDiagnostics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-[11px] font-mono text-[#545048] dark:text-[#B3AFA5] bg-white dark:bg-[#1D1F1A] p-3 rounded-xl border border-[#DCD4C4] dark:border-[#3C4035] space-y-1"
            >
              <p>• App Version: v1.4 (North East India Edition)</p>
              <p>• Preferred Language: {state?.settings?.language || state?.patient?.preferred_language || 'Nagamese / English'}</p>
              <p>• Theme: {state?.settings?.twilightMode ? 'Twilight Mode (Dark)' : 'Warm Parchment (Light)'}</p>
              <p>• Screen: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '1024x768'}</p>
              <p>• Community Context: {state?.patient?.community || 'Naga'}</p>
            </motion.div>
          )}
        </div>

        {/* Submit Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-[#706B61] dark:text-[#A8A499] text-center sm:text-left">
            Your feedback is stored securely and directly shared with the Aapka Saathi development team.
          </p>

          <button
            type="submit"
            disabled={isSubmitting || !topic.trim() || !details.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#183C17] hover:bg-[#112B10] disabled:bg-[#8A9689] text-white text-sm font-black shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending Feedback...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Feedback to Developer</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Submitted History Log */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCD4C4] dark:border-[#3C4035] pb-3">
          <div>
            <h3 className="text-lg font-black text-[#141310] dark:text-[#FCFBF7] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#183C17] dark:text-[#8DA850]" />
              Submitted Suggestions & Log ({feedbackList.length})
            </h3>
            <p className="text-xs text-[#6E6A60] dark:text-[#B3AFA5]">
              Suggestions and improvement logs previously recorded in this installation
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'feature_suggestion', label: 'Features' },
              { id: 'elder_comfort', label: 'Comfort' },
              { id: 'cultural_languages', label: 'Culture' },
              { id: 'medicines_routines', label: 'Medicines' },
              { id: 'issue_bug', label: 'Issues' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterCategory(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-extrabold transition-colors cursor-pointer shrink-0 ${
                  filterCategory === f.id
                    ? 'bg-[#183C17] text-white'
                    : 'bg-white dark:bg-[#1D1F1A] text-[#545048] dark:text-[#B3AFA5] border border-[#DCD4C4] dark:border-[#3C4035]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-3xl bg-white dark:bg-[#1D1F1A] border border-[#DCD4C4] dark:border-[#3C4035]">
            <HelpCircle className="w-10 h-10 text-[#A8A499] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#141310] dark:text-[#FCFBF7]">No feedback in this category yet</p>
            <p className="text-xs text-[#706B61] dark:text-[#A8A499] mt-1">
              Use the form above or tap one of our quick suggestion starters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => {
              const meta = CATEGORY_DETAILS[item.category] || CATEGORY_DETAILS.feature_suggestion;
              const Icon = meta.icon;
              const formattedDate = new Date(item.created_at).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#1D1F1A] border border-[#DCD4C4] dark:border-[#3C4035] space-y-3 shadow-2xs hover:border-[#8C877D] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${meta.bg}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {meta.label}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.priority === 'urgent'
                            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                            : item.priority === 'helpful'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {item.priority === 'urgent'
                          ? 'High Priority'
                          : item.priority === 'helpful'
                          ? 'Helpful Idea'
                          : 'Standard'}
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-900">
                        <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        Received by Team
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#706B61] dark:text-[#A8A499] shrink-0">
                      <span>{formattedDate}</span>
                      <button
                        onClick={() => copyFeedbackRef(item.id)}
                        className="p-1 hover:bg-[#F3EFE6] dark:hover:bg-[#272A22] rounded text-[#545048] dark:text-[#B3AFA5] cursor-pointer"
                        title="Copy feedback reference ID"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-[#183C17]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-[#141310] dark:text-[#FCFBF7] mb-1">
                      {item.topic}
                    </h4>
                    <p className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] leading-relaxed whitespace-pre-line">
                      {item.details}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#F0EBE0] dark:border-[#2C2F27] text-[10px] text-[#706B61] dark:text-[#A8A499]">
                    <div className="flex items-center gap-3">
                      <span>Submitted by: <strong>{item.caregiver_name}</strong></span>
                      {item.caregiver_contact && (
                        <span>Contact: <strong>{item.caregiver_contact}</strong></span>
                      )}
                    </div>
                    {item.app_version && (
                      <span className="font-mono">{item.app_version}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
