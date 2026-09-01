import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Volume2,
  Sparkles,
  ArrowRight,
  Home,
  Coffee,
  Check,
  Heart,
  Smile,
  RefreshCw,
  Trees,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FamiliarPlace } from '../../types';

export const ActivityFamiliarPlaces: React.FC = () => {
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

  const places: FamiliarPlace[] = state?.familiarPlaces || [];
  const language = state?.settings?.language || state?.patient?.preferred_language || 'English';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [question, setQuestion] = useState<string>('');
  const [loadingQuestion, setLoadingQuestion] = useState<boolean>(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(true);

  const [sessionEngagements, setSessionEngagements] = useState<
    Array<{ placeId: string; name: string; isPositive: boolean }>
  >([]);

  const currentPlace = places[currentIndex] || places[0];

  const choices = [
    'Mokokchung Town & Hills',
    'Village Baptist Church',
    'The Veranda & Orchid Garden',
    'Dzukou Valley Flower Meadows',
  ];

  useEffect(() => {
    let isMounted = true;
    if (!currentPlace) return;

    setLoadingQuestion(true);
    setSelectedAnswer(null);
    setFeedback(null);

    generateQuestion({
      place_name: currentPlace.name,
      place_location: currentPlace.location,
      language: language,
      activity_type: 'familiar_places',
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
  }, [currentIndex, currentPlace?.id, language]);

  const handleSelectChoice = async (choice: string) => {
    if (selectedAnswer || loadingFeedback) return;

    setSelectedAnswer(choice);
    setLoadingFeedback(true);

    const match = choice.toLowerCase() === currentPlace.name.toLowerCase();
    setIsCorrect(match);
    if (match) triggerCelebration();

    const aiFeedback = await generateFeedback({
      is_correct: match,
      correct_name: currentPlace.name,
      relationship: `a beloved place in ${currentPlace.location}`,
      language: language,
      activity_type: 'familiar_places',
    });

    setFeedback(aiFeedback);
    setLoadingFeedback(false);
    speakText(aiFeedback);

    setSessionEngagements((prev) => [
      ...prev,
      {
        placeId: currentPlace.id,
        name: currentPlace.name,
        isPositive: match,
      },
    ]);
  };

  const handleNextPlace = async () => {
    if (currentIndex + 1 < places.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      await finishSession();
    }
  };

  const finishSession = async () => {
    const total = sessionEngagements.length || places.length;
    const positive = sessionEngagements.filter((s) => s.isPositive).length || total;

    const summaryText = await generateSummary({
      activity_type: 'familiar_places',
      count: total,
      positive_count: positive,
      patient_name: state?.patient?.name || 'Grandmother',
      patient_notes: state?.patient?.caregiver_notes,
    });

    await saveActivityLog({
      activity_type: 'familiar_places',
      descriptive_note: summaryText,
      positive_count: positive,
      total_count: total,
      details: {
        items_shown: places.slice(0, total).map((p) => p.name),
      },
    });

    setPatientScreen('session_end');
  };

  if (!currentPlace) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 px-4">
        <p className="text-lg text-[#3D3A33] dark:text-[#D1D0C5] mb-4 font-semibold">
          No familiar places found. Let's return to the home screen.
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
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setPatientScreen('home')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#264D24] text-sm font-extrabold text-[#141310] dark:text-[#FCFBF7] shadow-2xs transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4 text-[#264D24]" />
          <span>Home</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-4 py-1.5 rounded-full bg-[#FDF3DF] dark:bg-[#32281E] text-[#965A04] dark:text-[#F5B83D] font-extrabold text-sm border border-[#965A04]/20">
            Place {currentIndex + 1} of {places.length}
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
        key={currentPlace.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-6 sm:p-8 shadow-xl"
      >
        {/* Question Banner */}
        <div className="rounded-2xl bg-[#FDF3DF] dark:bg-[#32281E] border-2 border-[#965A04] p-5 sm:p-6 mb-6 shadow-xs flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#965A04] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Trees className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-extrabold tracking-wider text-[#965A04] dark:text-[#F5B83D] mb-1">
                Familiar Places from the Hills
              </p>
              {loadingQuestion ? (
                <div className="flex items-center gap-2 text-base text-[#3D3A33] dark:text-[#D1D0C5] font-semibold">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#965A04]" />
                  <span>Loading reminiscing prompt...</span>
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
              className="p-3 rounded-2xl bg-white dark:bg-black/30 text-[#264D24] dark:text-[#8DA850] hover:scale-105 transition-transform shadow-2xs shrink-0 cursor-pointer"
              title="Hear question aloud"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Place Photo & Clues */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 flex flex-col items-center">
            <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-xl border-4 border-[#F3EFE6] dark:border-[#272A22] bg-black/5 aspect-4/3 sm:aspect-square">
              <img
                src={currentPlace.photo_url}
                alt={currentPlace.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4 text-white">
                <p className="text-xs sm:text-sm font-extrabold flex items-center gap-1.5 mb-1 text-[#F5B83D]">
                  <MapPin className="w-4 h-4" />
                  {currentPlace.location}
                </p>
                <p className="text-xs opacity-95 font-medium">{currentPlace.prompt_clue}</p>
              </div>
            </div>
          </div>

          {/* Place Choices */}
          <div className="md:col-span-6 space-y-3.5">
            <p className="text-sm font-bold text-[#141310] dark:text-[#FCFBF7] mb-2">
              Which beloved place is shown here?
            </p>

            {choices.map((choice, idx) => {
              const isSelected = selectedAnswer === choice;
              const isActualCorrect = choice.toLowerCase() === currentPlace.name.toLowerCase();

              let buttonStyle = 'bg-[#F3EFE6] dark:bg-[#272A22] text-[#141310] dark:text-[#FCFBF7] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#965A04] hover:bg-[#FBE8C4]';
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
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-between gap-3 transition-all cursor-pointer ${buttonStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/15 flex items-center justify-center text-sm font-extrabold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{choice}</span>
                  </div>
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
                  onClick={handleNextPlace}
                  className="px-6 py-3.5 rounded-full bg-[#264D24] hover:bg-[#1D3D1B] text-white font-extrabold text-base flex items-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer"
                >
                  <span>{currentIndex + 1 < places.length ? 'Next Place' : 'Finish Time Together'}</span>
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
