import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  Play,
  Pause,
  Volume2,
  Sparkles,
  ArrowRight,
  Home,
  Coffee,
  Check,
  Heart,
  Smile,
  RefreshCw,
  Music,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VoiceNote } from '../../types';

export const ActivitySoundsOfHome: React.FC = () => {
  const {
    state,
    setPatientScreen,
    generateQuestion,
    generateFeedback,
    generateSummary,
    saveActivityLog,
    speakText,
    triggerCelebration,
  } = useApp();

  const voiceNotes: VoiceNote[] = state?.voiceNotes || [];
  const language = state?.settings?.language || state?.patient?.preferred_language || 'English';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [question, setQuestion] = useState<string>('');
  const [loadingQuestion, setLoadingQuestion] = useState<boolean>(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(true);

  const [sessionEngagements, setSessionEngagements] = useState<
    Array<{ noteId: string; speaker: string; isPositive: boolean }>
  >([]);

  const currentNote = voiceNotes[currentIndex] || voiceNotes[0];

  // Dynamic Choices based on current note speaker + others
  const speakerChoices = [
    'Sentila (Granddaughter)',
    'Moa (Son)',
    'Aienla (Daughter-in-law)',
    'Lipokla (ASHA Health Worker)',
  ];

  useEffect(() => {
    let isMounted = true;
    if (!currentNote) return;

    setLoadingQuestion(true);
    setSelectedAnswer(null);
    setFeedback(null);
    setIsPlaying(false);

    generateQuestion({
      person_name: currentNote.speaker_name || 'Family member',
      relationship: 'Family',
      language: language,
      activity_type: 'sounds_of_home',
    }).then((q) => {
      if (isMounted) {
        setQuestion(q);
        setLoadingQuestion(false);
        speakText(q);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentIndex, currentNote?.id, language]);

  // Audio Playback simulation or real audio
  const togglePlayAudio = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (currentNote.audio_url) {
        const audio = new Audio(currentNote.audio_url);
        audio.play().catch((e) => console.log('Audio playback error', e));
        audio.onended = () => setIsPlaying(false);
      } else {
        // Read transcript or simulated voice note
        speakText(currentNote.transcript || currentNote.label);
        setTimeout(() => setIsPlaying(false), (currentNote.duration_sec || 5) * 1000);
      }
    }
  };

  const handleSelectChoice = async (choice: string) => {
    if (selectedAnswer || loadingFeedback) return;

    setSelectedAnswer(choice);
    setLoadingFeedback(true);

    const speakerName = currentNote.speaker_name || '';
    const match = choice.toLowerCase().includes(speakerName.toLowerCase().split(' ')[0]) ||
      speakerName.toLowerCase().includes(choice.toLowerCase().split(' ')[0]);

    setIsCorrect(match);
    if (match) triggerCelebration();

    const aiFeedback = await generateFeedback({
      is_correct: match,
      correct_name: currentNote.speaker_name || 'Your family member',
      relationship: 'Family Member',
      language: language,
      activity_type: 'sounds_of_home',
    });

    setFeedback(aiFeedback);
    setLoadingFeedback(false);
    speakText(aiFeedback);

    setSessionEngagements((prev) => [
      ...prev,
      {
        noteId: currentNote.id,
        speaker: currentNote.speaker_name || 'Family',
        isPositive: match,
      },
    ]);
  };

  const handleNextNote = async () => {
    if (currentIndex + 1 < voiceNotes.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      await finishSession();
    }
  };

  const finishSession = async () => {
    const total = sessionEngagements.length || voiceNotes.length;
    const positive = sessionEngagements.filter((s) => s.isPositive).length || total;

    const summaryText = await generateSummary({
      activity_type: 'sounds_of_home',
      count: total,
      positive_count: positive,
      patient_name: state?.patient?.name || 'Grandmother',
      patient_notes: state?.patient?.caregiver_notes,
    });

    await saveActivityLog({
      activity_type: 'sounds_of_home',
      descriptive_note: summaryText,
      positive_count: positive,
      total_count: total,
      details: {
        items_shown: voiceNotes.slice(0, total).map((v) => v.label),
      },
    });

    setPatientScreen('session_end');
  };

  if (!currentNote) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 px-4">
        <p className="text-lg text-[#3D3A33] dark:text-[#D1D0C5] mb-4 font-semibold">
          No voice notes available yet. Caregivers can record sweet voice messages in the Caregiver Hub!
        </p>
        <button
          onClick={() => setPatientScreen('home')}
          className="px-6 py-3 rounded-full bg-[#264D24] text-white font-extrabold cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setPatientScreen('home')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#264D24] text-sm font-extrabold text-[#141310] dark:text-[#FCFBF7] shadow-2xs transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4 text-[#264D24]" />
          <span>Home</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-4 py-1.5 rounded-full bg-[#FDEEEC] dark:bg-[#3A2220] text-[#9C382A] dark:text-[#E38B7D] font-extrabold text-sm border border-[#9C382A]/20">
            Voice Note {currentIndex + 1} of {voiceNotes.length}
          </span>
          <button
            onClick={() => setPatientScreen('session_end')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1D1F1A] text-xs font-bold text-[#9C382A] dark:text-[#E38B7D] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#9C382A] cursor-pointer"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Finish</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <motion.div
        key={currentNote.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-6 sm:p-8 shadow-xl"
      >
        {/* Question Header */}
        <div className="rounded-2xl bg-[#FDF3DF] dark:bg-[#32281E] border-2 border-[#965A04] p-5 sm:p-6 mb-8 shadow-xs flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#9C382A] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-extrabold tracking-wider text-[#965A04] dark:text-[#F5B83D] mb-1">
                Sounds of Home & Family
              </p>
              {loadingQuestion ? (
                <div className="flex items-center gap-2 text-base text-[#3D3A33] dark:text-[#D1D0C5] font-semibold">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#9C382A]" />
                  <span>Loading comforting prompt...</span>
                </div>
              ) : (
                <h2 className="serif text-xl sm:text-2xl font-extrabold text-[#141310] dark:text-[#FCFBF7] leading-snug">
                  {question}
                </h2>
              )}
            </div>
          </div>

          {!loadingQuestion && (
            <button
              onClick={() => speakText(question)}
              className="p-3 rounded-2xl bg-white dark:bg-black/30 text-[#9C382A] dark:text-[#E38B7D] hover:scale-105 transition-transform shadow-2xs shrink-0 cursor-pointer"
              title="Hear question aloud"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Big Audio Player Stage */}
        <div className="rounded-3xl bg-gradient-to-br from-[#264D24] to-[#173016] text-white p-8 sm:p-10 mb-8 shadow-xl text-center flex flex-col items-center justify-center relative overflow-hidden border-2 border-[#264D24]">
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center mb-5 shadow-xl transition-transform hover:scale-105 cursor-pointer"
            onClick={togglePlayAudio}
          >
            {isPlaying ? (
              <Pause className="w-12 h-12 text-[#F5B83D]" />
            ) : (
              <Play className="w-12 h-12 text-[#F5B83D] ml-1.5" />
            )}
          </div>

          <h3 className="serif text-2xl sm:text-3xl font-extrabold mb-2 text-[#FCFBF7]">
            {currentNote.label}
          </h3>
          <p className="text-white/90 text-sm sm:text-base max-w-lg mb-4 italic font-medium">
            "{currentNote.transcript || 'Listen to this gentle recording recorded with love by your family.'}"
          </p>

          <span className="px-5 py-2 rounded-full bg-white/20 text-xs font-extrabold tracking-wide uppercase">
            {isPlaying ? '🔊 Playing Voice Note...' : 'Tap to Listen to Voice'}
          </span>
        </div>

        {/* Speaker Choices */}
        <div className="space-y-3.5">
          <p className="text-sm font-bold text-[#141310] dark:text-[#FCFBF7] mb-2">
            Whose sweet voice did you hear?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {speakerChoices.map((choice, idx) => {
              const isSelected = selectedAnswer === choice;
              const isActualCorrect =
                currentNote.speaker_name &&
                choice.toLowerCase().includes(currentNote.speaker_name.toLowerCase().split(' ')[0]);

              let buttonStyle = 'bg-[#F3EFE6] dark:bg-[#272A22] text-[#141310] dark:text-[#FCFBF7] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#9C382A] hover:bg-[#FBE8C4]';
              if (selectedAnswer) {
                if (isSelected && isActualCorrect) {
                  buttonStyle = 'bg-[#264D24] text-white border-2 border-[#264D24] shadow-md';
                } else if (isSelected && !isActualCorrect) {
                  buttonStyle = 'bg-[#9C382A] text-white border-2 border-[#9C382A] shadow-md';
                } else if (isActualCorrect) {
                  buttonStyle = 'bg-[#EBF3E8] dark:bg-[#242E18] text-[#264D24] dark:text-[#8DA850] border-2 border-[#264D24]';
                } else {
                  buttonStyle = 'opacity-40 border-[#DCD4C4] dark:border-[#3C4035]';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectChoice(choice)}
                  disabled={!!selectedAnswer || loadingFeedback}
                  className={`p-4 sm:p-5 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-between text-left transition-all cursor-pointer ${buttonStyle}`}
                >
                  <span>{choice}</span>
                  {isSelected && isActualCorrect && <Check className="w-6 h-6 text-white shrink-0" />}
                  {isSelected && !isActualCorrect && <Heart className="w-6 h-6 text-white fill-current shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Section */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-6 rounded-2xl bg-[#EBF3E8] dark:bg-[#1E2818] border-2 border-[#264D24] p-5 sm:p-6 text-[#264D24] dark:text-[#8DA850] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-[#264D24] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Smile className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs uppercase font-extrabold tracking-wider opacity-85 mb-0.5">
                    Loving Note
                  </p>
                  <p className="text-lg sm:text-xl font-extrabold leading-relaxed text-[#141310] dark:text-[#FCFBF7]">
                    {feedback}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => speakText(feedback)}
                  className="p-3 rounded-2xl bg-white dark:bg-black/30 text-[#264D24] dark:text-[#8DA850] hover:scale-105 transition-transform cursor-pointer"
                  title="Hear feedback again"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextNote}
                  className="px-6 py-3.5 rounded-full bg-[#264D24] hover:bg-[#1D3D1B] text-white font-extrabold text-base flex items-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer"
                >
                  <span>{currentIndex + 1 < voiceNotes.length ? 'Next Voice Note' : 'Finish Time Together'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
