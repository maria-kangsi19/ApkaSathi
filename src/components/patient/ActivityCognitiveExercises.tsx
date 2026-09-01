import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Volume2,
  VolumeX,
  ArrowRight,
  Home,
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle2,
  Smile,
  Music,
  HelpCircle,
  Flower2,
  Coffee,
  Mountain,
  Sun,
  Layers,
  Check,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

type ExerciseMode = 'card_match' | 'pattern_sequence' | 'daily_pairs';

interface MemoryCard {
  id: string;
  pairId: string;
  label: string;
  description: string;
  emoji: string;
  color: string;
  bgColor: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const TILE_CATALOG = [
  {
    pairId: 'tea',
    label: 'Morning Chai',
    description: 'Hot spiced Lal Cha in a clay cup',
    emoji: '☕',
    color: '#7B1F13',
    bgColor: '#FAE4E1',
  },
  {
    pairId: 'orchid',
    label: 'Wild Orchid',
    description: 'Fresh blooming mountain flowers',
    emoji: '🌸',
    color: '#143513',
    bgColor: '#E0EDE0',
  },
  {
    pairId: 'hills',
    label: 'Green Hills',
    description: 'Mist rolling over peaceful ridges',
    emoji: '🏔️',
    color: '#6E3B00',
    bgColor: '#F8E7C6',
  },
  {
    pairId: 'shawl',
    label: 'Woven Shawl',
    description: 'Handwoven traditional patterns',
    emoji: '🧣',
    color: '#7B1F13',
    bgColor: '#FAE4E1',
  },
  {
    pairId: 'bird',
    label: 'Hill Songbird',
    description: 'Sweet morning songs in the trees',
    emoji: '🐦',
    color: '#143513',
    bgColor: '#E0EDE0',
  },
  {
    pairId: 'sun',
    label: 'Golden Sun',
    description: 'Warm morning light on the porch',
    emoji: '☀️',
    color: '#6E3B00',
    bgColor: '#F8E7C6',
  },
];

// Cultural Association Pairs
const PAIRING_CHALLENGES = [
  {
    id: 'p1',
    promptItem: {
      name: 'Clay Tea Kettle',
      emoji: '🫖',
      hint: 'Warm on the morning hearth',
    },
    correctMatch: {
      name: 'Spiced Chai Cup',
      emoji: '☕',
      explanation: 'A warm tea kettle fills the cup with comforting sweet tea.',
    },
    distractors: [
      { name: 'Rain Umbrella', emoji: '☂️' },
      { name: 'Garden Trowel', emoji: '🌱' },
    ],
  },
  {
    id: 'p2',
    promptItem: {
      name: 'Wooden Weaving Loom',
      emoji: '🧵',
      hint: 'Crafted with care in the courtyard',
    },
    correctMatch: {
      name: 'Colorful Shawl',
      emoji: '🧣',
      explanation: 'The wooden loom weaves colorful threads into warm family shawls.',
    },
    distractors: [
      { name: 'Morning Bell', emoji: '🔔' },
      { name: 'Clay Pot', emoji: '🏺' },
    ],
  },
  {
    id: 'p3',
    promptItem: {
      name: 'Morning Rain Clouds',
      emoji: '🌧️',
      hint: 'Soothing rain over the valley',
    },
    correctMatch: {
      name: 'Green Mountain Pine',
      emoji: '🌲',
      explanation: 'The gentle rain refreshes the evergreen pine hills and gardens.',
    },
    distractors: [
      { name: 'Kerosene Lantern', emoji: '🏮' },
      { name: 'Wooden Spoon', emoji: '🥄' },
    ],
  },
  {
    id: 'p4',
    promptItem: {
      name: 'Acoustic Guitar',
      emoji: '🎸',
      hint: 'Strumming softly in the evening',
    },
    correctMatch: {
      name: 'Folk Song Melody',
      emoji: '🎶',
      explanation: 'The gentle guitar brings joyful family hymns and village songs.',
    },
    distractors: [
      { name: 'Bamboo Basket', emoji: '🧺' },
      { name: 'Walking Stick', emoji: '🦯' },
    ],
  },
];

// Bells for rhythm sequence
const RHYTHM_BELLS = [
  { id: 0, label: 'Morning Sun', emoji: '☀️', color: '#D97706', bg: '#FEF3C7', freq: 261.63 }, // C4
  { id: 1, label: 'Highland Pine', emoji: '🌲', color: '#16A34A', bg: '#DCFCE7', freq: 329.63 }, // E4
  { id: 2, label: 'River Spring', emoji: '🌊', color: '#2563EB', bg: '#DBEAFE', freq: 392.00 }, // G4
  { id: 3, label: 'Evening Hearth', emoji: '🔥', color: '#DC2626', bg: '#FEE2E2', freq: 523.25 }, // C5
];

export const ActivityCognitiveExercises: React.FC = () => {
  const {
    state,
    setPatientScreen,
    saveActivityLog,
    generateSummary,
    speakText,
    triggerCelebration,
  } = useApp();

  const patientName = state?.patient?.nickname || state?.patient?.name || 'Grandmother';
  const isTiredMode = state?.settings?.manualTiredMode || false;
  const isSpeakAudio = state?.settings?.speakAudio ?? true;

  const [activeTab, setActiveTab] = useState<ExerciseMode>('card_match');
  const [gridSize, setGridSize] = useState<4 | 6>(isTiredMode ? 4 : 6);

  // 1. State for Card Matching Game
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isPeeking, setIsPeeking] = useState<boolean>(false);
  const [cardGameWon, setCardGameWon] = useState<boolean>(false);

  // 2. State for Pattern Rhythm Game
  const [rhythmSequence, setRhythmSequence] = useState<number[]>([]);
  const [userSequenceIndex, setUserSequenceIndex] = useState<number>(0);
  const [activePlayingBell, setActivePlayingBell] = useState<number | null>(null);
  const [isSequencePlaying, setIsSequencePlaying] = useState<boolean>(false);
  const [rhythmRound, setRhythmRound] = useState<number>(1);
  const [rhythmFeedback, setRhythmFeedback] = useState<string>('Listen to the gentle rhythm, then tap the bells in order.');

  // 3. State for Pairings Game
  const [pairingIndex, setPairingIndex] = useState<number>(0);
  const [pairingSelected, setPairingSelected] = useState<string | null>(null);
  const [pairingFeedback, setPairingFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [pairingCompletedCount, setPairingCompletedCount] = useState<number>(0);

  // Audio Context ref for chime synthesis
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playChime = (freq: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current && AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (audioCtxRef.current) {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.001, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.3, audioCtxRef.current.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.6);
      }
    } catch {
      // Audio synthesis fallback silently if restricted
    }
  };

  // ----------------------------------------------------
  // Card Matching Initialization & Logic
  // ----------------------------------------------------
  const initializeCards = (size: 4 | 6 = gridSize) => {
    const pairCount = size / 2;
    const selectedPairs = TILE_CATALOG.slice(0, pairCount);
    const cardPool: MemoryCard[] = [];

    selectedPairs.forEach((item, idx) => {
      // Create 2 identical cards per pair
      cardPool.push({
        id: `card-${idx}-a`,
        pairId: item.pairId,
        label: item.label,
        description: item.description,
        emoji: item.emoji,
        color: item.color,
        bgColor: item.bgColor,
        isFlipped: false,
        isMatched: false,
      });
      cardPool.push({
        id: `card-${idx}-b`,
        pairId: item.pairId,
        label: item.label,
        description: item.description,
        emoji: item.emoji,
        color: item.color,
        bgColor: item.bgColor,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffled = cardPool.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setMatchCount(0);
    setCardGameWon(false);
    setIsEvaluating(false);
  };

  useEffect(() => {
    initializeCards(gridSize);
  }, [gridSize]);

  // Initial welcome voice prompt
  useEffect(() => {
    if (isSpeakAudio) {
      speakText(`Welcome to gentle cognitive exercises, ${patientName}. Let us match lovely pictures and enjoy peaceful rhythms together.`);
    }
  }, []);

  const handleCardClick = (index: number) => {
    if (isEvaluating || isPeeking || cardGameWon) return;
    const clickedCard = cards[index];
    if (clickedCard.isFlipped || clickedCard.isMatched) return;

    playChime(350 + index * 40);

    const newFlipped = [...flippedIndices, index];
    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsEvaluating(true);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = updatedCards[firstIdx];
      const secondCard = updatedCards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // MATCH!
        setTimeout(() => {
          updatedCards[firstIdx].isMatched = true;
          updatedCards[secondIdx].isMatched = true;
          setCards(updatedCards);
          setFlippedIndices([]);
          setIsEvaluating(false);
          const newMatchTotal = matchCount + 1;
          setMatchCount(newMatchTotal);

          playChime(587.33); // D5 chime

          if (isSpeakAudio) {
            speakText(`Wonderful! You matched the ${firstCard.label}!`);
          }

          // Check if all matched
          if (newMatchTotal === cards.length / 2) {
            setCardGameWon(true);
            triggerCelebration();
            if (isSpeakAudio) {
              speakText(`What a delightful focus, ${patientName}! You matched all the lovely tiles.`);
            }
            recordCognitiveLog('Memory Flower Match', cards.length / 2, cards.length / 2, [
              `Completed ${gridSize} tile matching with peaceful focus.`,
              `Engaged warmly with ${firstCard.label} and cultural floral symbols.`,
            ]);
          }
        }, 600);
      } else {
        // NO MATCH - Flip back softly
        setTimeout(() => {
          updatedCards[firstIdx].isFlipped = false;
          updatedCards[secondIdx].isFlipped = false;
          setCards(updatedCards);
          setFlippedIndices([]);
          setIsEvaluating(false);
        }, 1100);
      }
    }
  };

  // Peek Hint
  const handlePeek = () => {
    if (isPeeking || cardGameWon) return;
    setIsPeeking(true);
    const peekCards = cards.map((c) => ({ ...c, isFlipped: true }));
    setCards(peekCards);

    setTimeout(() => {
      const resetCards = cards.map((c) => ({
        ...c,
        isFlipped: c.isMatched,
      }));
      setCards(resetCards);
      setFlippedIndices([]);
      setIsPeeking(false);
    }, 2000);
  };

  // ----------------------------------------------------
  // Rhythm Sequence Game Logic
  // ----------------------------------------------------
  const startRhythmRound = (roundNum: number = 1) => {
    setRhythmRound(roundNum);
    setUserSequenceIndex(0);
    setIsSequencePlaying(true);
    setRhythmFeedback('Listen closely to the glowing bells...');

    // Generate sequence of length = roundNum + 1 (e.g. 2 bells, 3 bells)
    const length = Math.min(roundNum + 1, 4);
    const newSeq: number[] = [];
    for (let i = 0; i < length; i++) {
      newSeq.push(Math.floor(Math.random() * RHYTHM_BELLS.length));
    }
    setRhythmSequence(newSeq);

    // Play sequence
    newSeq.forEach((bellIdx, step) => {
      setTimeout(() => {
        setActivePlayingBell(bellIdx);
        playChime(RHYTHM_BELLS[bellIdx].freq);
        setTimeout(() => setActivePlayingBell(null), 600);
      }, (step + 1) * 900);
    });

    setTimeout(() => {
      setIsSequencePlaying(false);
      setRhythmFeedback('Your turn! Tap the bells in the same order.');
      if (isSpeakAudio) {
        speakText('Your turn! Tap the gentle bells.');
      }
    }, (newSeq.length + 1) * 900);
  };

  const handleBellClick = (bellId: number) => {
    if (isSequencePlaying) return;

    playChime(RHYTHM_BELLS[bellId].freq);
    setActivePlayingBell(bellId);
    setTimeout(() => setActivePlayingBell(null), 350);

    if (rhythmSequence.length === 0) return;

    const expected = rhythmSequence[userSequenceIndex];

    if (bellId === expected) {
      const nextIndex = userSequenceIndex + 1;
      if (nextIndex === rhythmSequence.length) {
        // Round Completed
        triggerCelebration();
        setRhythmFeedback('Beautiful! You remembered the entire rhythm.');
        if (isSpeakAudio) {
          speakText(`Splendid rhythm, ${patientName}!`);
        }
        recordCognitiveLog('Gentle Rhythm Sequence', rhythmSequence.length, rhythmSequence.length, [
          `Successfully recalled a ${rhythmSequence.length}-step sensory nature rhythm.`,
          `Displayed steady attention and calm interaction.`,
        ]);
        setTimeout(() => {
          startRhythmRound(rhythmRound + 1);
        }, 1800);
      } else {
        setUserSequenceIndex(nextIndex);
        setRhythmFeedback(`Good! Step ${nextIndex} of ${rhythmSequence.length}.`);
      }
    } else {
      // Gentle reminder without error buzzer
      setRhythmFeedback('Let us listen to the rhythm once more together!');
      setTimeout(() => {
        // Replay sequence
        setIsSequencePlaying(true);
        setUserSequenceIndex(0);
        rhythmSequence.forEach((bId, step) => {
          setTimeout(() => {
            setActivePlayingBell(bId);
            playChime(RHYTHM_BELLS[bId].freq);
            setTimeout(() => setActivePlayingBell(null), 600);
          }, (step + 1) * 900);
        });
        setTimeout(() => {
          setIsSequencePlaying(false);
          setRhythmFeedback('Try tapping the bells again in order.');
        }, (rhythmSequence.length + 1) * 900);
      }, 700);
    }
  };

  // ----------------------------------------------------
  // Pairings Game Logic
  // ----------------------------------------------------
  const currentPairChallenge = PAIRING_CHALLENGES[pairingIndex % PAIRING_CHALLENGES.length];

  const handlePairSelection = (item: { name: string; emoji: string }) => {
    if (pairingSelected) return;
    setPairingSelected(item.name);

    const isCorrect = item.name === currentPairChallenge.correctMatch.name;
    if (isCorrect) {
      playChime(523.25);
      setPairingFeedback({
        isCorrect: true,
        text: currentPairChallenge.correctMatch.explanation,
      });
      setPairingCompletedCount((prev) => prev + 1);
      triggerCelebration();
      if (isSpeakAudio) {
        speakText(currentPairChallenge.correctMatch.explanation);
      }
    } else {
      playChime(330);
      setPairingFeedback({
        isCorrect: false,
        text: `That is nice too! But let us notice how ${currentPairChallenge.promptItem.name} pairs with ${currentPairChallenge.correctMatch.name}.`,
      });
      if (isSpeakAudio) {
        speakText(`Let us look at how ${currentPairChallenge.promptItem.name} pairs with ${currentPairChallenge.correctMatch.name}.`);
      }
    }
  };

  const handleNextPair = () => {
    setPairingSelected(null);
    setPairingFeedback(null);
    setPairingIndex((prev) => prev + 1);
    if (pairingIndex + 1 === PAIRING_CHALLENGES.length) {
      recordCognitiveLog('Warm Daily Pairings', PAIRING_CHALLENGES.length, pairingCompletedCount + 1, [
        `Explored cultural object and daily routine pairings with warm recognition.`,
      ]);
    }
  };

  // ----------------------------------------------------
  // Logging Helper (Non-Diagnostic Qualitative Observations)
  // ----------------------------------------------------
  const recordCognitiveLog = async (
    activityLabel: string,
    total: number,
    positive: number,
    observations: string[]
  ) => {
    try {
      const summary = await generateSummary({
        activity_type: 'cognitive_exercises',
        count: total,
        positive_count: positive,
        patient_name: patientName,
        patient_notes: `Completed ${activityLabel} module gently.`,
      });

      await saveActivityLog({
        activity_type: 'cognitive_exercises',
        descriptive_note: summary || `${patientName} engaged with ${activityLabel} today with joyful and calm focus.`,
        positive_count: positive,
        total_count: total,
        details: {
          exercise: activityLabel,
          observations,
          timestamp: new Date().toLocaleTimeString(),
        },
      });
    } catch (err) {
      console.error('Error logging cognitive activity:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#1D1F1A] border-2 border-[#BFB5A2] dark:border-[#4A4F41] rounded-[32px] p-5 sm:p-6 card-shadow">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[#143513] text-white flex items-center justify-center shadow-md shrink-0">
            <Flower2 className="w-8 h-8 text-[#F7C04D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="serif text-xl sm:text-2xl font-black text-[#143513] dark:text-[#FFFFFF]">
                Cognitive & Memory Exercises
              </h1>
              <span className="hidden sm:inline-block px-3 py-0.5 rounded-full bg-[#E0EDE0] dark:bg-[#263319] text-[#143513] dark:text-[#9BB858] text-xs font-black">
                🌸 Gentle Focus
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#121210] dark:text-[#F6F5EE] mt-0.5">
              Relaxed, pressure-free daily activities designed to spark joyful recall and peaceful engagement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPatientScreen('home')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F0EADF] dark:bg-[#272A22] border-2 border-[#BFB5A2] dark:border-[#4A4F41] text-xs sm:text-sm font-black text-[#121210] dark:text-[#F6F5EE] hover:bg-[#E0EDE0] transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4 text-[#143513] dark:text-[#9BB858]" />
            <span>Return Home</span>
          </button>
        </div>
      </div>

      {/* Exercise Mode Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => {
            setActiveTab('card_match');
            initializeCards(gridSize);
          }}
          className={`flex items-center justify-center gap-2.5 p-4 rounded-2xl border-2 transition-all cursor-pointer text-sm font-black ${
            activeTab === 'card_match'
              ? 'bg-[#143513] text-white border-[#143513] shadow-md scale-[1.02]'
              : 'bg-white dark:bg-[#1D1F1A] text-[#121210] dark:text-[#F6F5EE] border-[#BFB5A2] dark:border-[#4A4F41] hover:border-[#143513]'
          }`}
        >
          <Layers className="w-5 h-5 text-[#F7C04D]" />
          <span>1. Memory Flower Match</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('pattern_sequence');
            startRhythmRound(1);
          }}
          className={`flex items-center justify-center gap-2.5 p-4 rounded-2xl border-2 transition-all cursor-pointer text-sm font-black ${
            activeTab === 'pattern_sequence'
              ? 'bg-[#7B1F13] text-white border-[#7B1F13] shadow-md scale-[1.02]'
              : 'bg-white dark:bg-[#1D1F1A] text-[#121210] dark:text-[#F6F5EE] border-[#BFB5A2] dark:border-[#4A4F41] hover:border-[#7B1F13]'
          }`}
        >
          <Music className="w-5 h-5 text-[#F7C04D]" />
          <span>2. Gentle Rhythm Sequence</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('daily_pairs');
            setPairingSelected(null);
            setPairingFeedback(null);
          }}
          className={`flex items-center justify-center gap-2.5 p-4 rounded-2xl border-2 transition-all cursor-pointer text-sm font-black ${
            activeTab === 'daily_pairs'
              ? 'bg-[#6E3B00] text-white border-[#6E3B00] shadow-md scale-[1.02]'
              : 'bg-white dark:bg-[#1D1F1A] text-[#121210] dark:text-[#F6F5EE] border-[#BFB5A2] dark:border-[#4A4F41] hover:border-[#6E3B00]'
          }`}
        >
          <Smile className="w-5 h-5 text-[#F7C04D]" />
          <span>3. Warm Daily Pairings</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* EXERCISE 1: MEMORY FLOWER MATCH                                           */}
      {/* ========================================================================= */}
      {activeTab === 'card_match' && (
        <div className="bg-white dark:bg-[#1D1F1A] border-2 border-[#BFB5A2] dark:border-[#4A4F41] rounded-[36px] p-6 sm:p-8 card-shadow space-y-6">
          {/* Sub-header controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#BFB5A2] dark:border-[#4A4F41] pb-4">
            <div>
              <h2 className="serif text-xl sm:text-2xl font-black text-[#143513] dark:text-[#FFFFFF]">
                Memory Flower Match
              </h2>
              <p className="text-xs sm:text-sm font-bold text-[#121210] dark:text-[#F6F5EE] mt-0.5">
                Tap two cards to find their matching pairs. Take your time!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-full bg-[#F0EADF] dark:bg-[#272A22] p-1 border border-[#BFB5A2] dark:border-[#4A4F41] text-xs font-black">
                <button
                  onClick={() => {
                    setGridSize(4);
                    initializeCards(4);
                  }}
                  className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    gridSize === 4
                      ? 'bg-[#143513] text-white'
                      : 'text-[#121210] dark:text-[#F6F5EE]'
                  }`}
                >
                  Gentle (4 Tiles)
                </button>
                <button
                  onClick={() => {
                    setGridSize(6);
                    initializeCards(6);
                  }}
                  className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    gridSize === 6
                      ? 'bg-[#143513] text-white'
                      : 'text-[#121210] dark:text-[#F6F5EE]'
                  }`}
                >
                  Peaceful (6 Tiles)
                </button>
              </div>

              <button
                onClick={handlePeek}
                disabled={isPeeking || cardGameWon}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F8E7C6] text-[#6E3B00] border border-[#6E3B00]/40 text-xs font-black hover:bg-[#F5D899] transition-colors cursor-pointer disabled:opacity-50"
                title="Peek at all cards"
              >
                <Eye className="w-4 h-4" />
                <span>Peek at Cards 👁️</span>
              </button>

              <button
                onClick={() => initializeCards(gridSize)}
                className="p-2 rounded-full bg-[#F0EADF] dark:bg-[#272A22] text-[#121210] dark:text-[#F6F5EE] border border-[#BFB5A2] dark:border-[#4A4F41] hover:bg-[#E0EDE0] transition-colors cursor-pointer"
                title="Shuffle & Play Again"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div
            className={`grid gap-4 sm:gap-6 ${
              gridSize === 4 ? 'grid-cols-2 max-w-lg mx-auto' : 'grid-cols-2 sm:grid-cols-3 max-w-3xl mx-auto'
            }`}
          >
            {cards.map((card, index) => {
              const isVisible = card.isFlipped || card.isMatched || isPeeking;
              return (
                <motion.div
                  key={card.id}
                  whileHover={{ scale: isVisible ? 1 : 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleCardClick(index)}
                  className={`relative h-40 sm:h-48 rounded-[28px] border-3 p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none shadow-md ${
                    card.isMatched
                      ? 'bg-[#E0EDE0] dark:bg-[#263319] border-[#143513] dark:border-[#9BB858] opacity-90'
                      : isVisible
                      ? 'bg-white dark:bg-[#272A22] border-[#7B1F13] shadow-lg ring-4 ring-[#FAE4E1] dark:ring-[#3D2321]'
                      : 'bg-[#F0EADF] dark:bg-[#272A22] border-[#BFB5A2] dark:border-[#4A4F41] hover:border-[#143513]'
                  }`}
                >
                  {isVisible ? (
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center justify-center space-y-2"
                    >
                      <span className="text-4xl sm:text-5xl">{card.emoji}</span>
                      <div>
                        <h3 className="font-black text-base sm:text-lg text-[#000000] dark:text-[#FFFFFF]">
                          {card.label}
                        </h3>
                        <p className="text-[11px] font-bold text-[#121210] dark:text-[#F6F5EE] hidden sm:block">
                          {card.description}
                        </p>
                      </div>
                      {card.isMatched && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#143513] dark:text-[#9BB858] bg-white dark:bg-[#1D1F1A] px-2.5 py-0.5 rounded-full border border-[#143513]/20">
                          <Check className="w-3 h-3" /> Matched
                        </span>
                      )}
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#6E3B00] dark:text-[#F7C04D] space-y-2">
                      <div className="w-14 h-14 rounded-2xl bg-white/70 dark:bg-[#1D1F1A] flex items-center justify-center shadow-xs border border-[#BFB5A2] dark:border-[#4A4F41]">
                        <Flower2 className="w-8 h-8 text-[#143513] dark:text-[#9BB858]" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider text-[#121210] dark:text-[#F6F5EE]">
                        Tap to Reveal
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Victory Banner */}
          <AnimatePresence>
            {cardGameWon && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl bg-[#E0EDE0] dark:bg-[#263319] border-2 border-[#143513] p-6 text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-full bg-[#143513] text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8 text-[#F7C04D]" />
                </div>
                <div>
                  <h3 className="serif text-2xl font-black text-[#143513] dark:text-[#FFFFFF]">
                    Wonderful Focus, {patientName}!
                  </h3>
                  <p className="text-sm font-bold text-[#121210] dark:text-[#F6F5EE] mt-1 max-w-md mx-auto">
                    You matched all the memory flower cards so peacefully. Your mind is calm and bright.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    onClick={() => initializeCards(gridSize)}
                    className="px-6 py-3 rounded-full bg-[#143513] hover:bg-[#0C230B] text-white font-black text-sm uppercase tracking-wider shadow-md cursor-pointer"
                  >
                    Play Another Round 🌸
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('pattern_sequence');
                      startRhythmRound(1);
                    }}
                    className="px-6 py-3 rounded-full bg-white dark:bg-[#1D1F1A] border-2 border-[#143513] text-[#143513] dark:text-[#9BB858] font-black text-sm uppercase tracking-wider cursor-pointer"
                  >
                    Try Rhythm Game Next →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXERCISE 2: GENTLE RHYTHM SEQUENCE                                        */}
      {/* ========================================================================= */}
      {activeTab === 'pattern_sequence' && (
        <div className="bg-white dark:bg-[#1D1F1A] border-2 border-[#BFB5A2] dark:border-[#4A4F41] rounded-[36px] p-6 sm:p-8 card-shadow space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#BFB5A2] dark:border-[#4A4F41] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="serif text-xl sm:text-2xl font-black text-[#7B1F13] dark:text-[#FFFFFF]">
                  Gentle Rhythm Sequence
                </h2>
                <span className="px-3 py-0.5 rounded-full bg-[#FAE4E1] dark:bg-[#3D2321] text-[#7B1F13] dark:text-[#EA9688] text-xs font-black">
                  Round {rhythmRound}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#121210] dark:text-[#F6F5EE] mt-0.5">
                Listen to the peaceful melody notes and repeat the sequence.
              </p>
            </div>

            <button
              onClick={() => startRhythmRound(rhythmRound)}
              disabled={isSequencePlaying}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7B1F13] text-white font-black text-xs sm:text-sm shadow-md hover:bg-[#61150B] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Music className="w-4 h-4" />
              <span>Listen Again 🎵</span>
            </button>
          </div>

          {/* Feedback Guidance Banner */}
          <div className="rounded-2xl bg-[#F0EADF] dark:bg-[#272A22] border-2 border-[#BFB5A2] dark:border-[#4A4F41] p-4 text-center">
            <p className="text-sm sm:text-base font-black text-[#000000] dark:text-[#FFFFFF]">
              {rhythmFeedback}
            </p>
          </div>

          {/* Interactive Rhythm Bells Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto py-4">
            {RHYTHM_BELLS.map((bell) => {
              const isLit = activePlayingBell === bell.id;
              return (
                <motion.button
                  key={bell.id}
                  whileHover={{ scale: isSequencePlaying ? 1 : 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleBellClick(bell.id)}
                  disabled={isSequencePlaying}
                  className={`relative h-44 sm:h-52 rounded-[32px] border-4 p-5 flex flex-col items-center justify-between text-center transition-all cursor-pointer shadow-md ${
                    isLit
                      ? 'scale-105 border-white ring-8 ring-[#F7C04D] brightness-125'
                      : 'border-[#BFB5A2] dark:border-[#4A4F41] hover:border-[#7B1F13]'
                  }`}
                  style={{
                    backgroundColor: isLit ? bell.color : undefined,
                    color: isLit ? '#FFFFFF' : undefined,
                  }}
                >
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shadow-sm"
                    style={{ backgroundColor: isLit ? 'rgba(255,255,255,0.3)' : bell.bg }}
                  >
                    {bell.emoji}
                  </div>
                  <div>
                    <h4 className="font-black text-base sm:text-lg text-[#000000] dark:text-[#FFFFFF]">
                      {bell.label}
                    </h4>
                    <span className="text-[11px] font-extrabold opacity-80 uppercase tracking-wider">
                      Tap Bell
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-xs font-bold text-[#121210] dark:text-[#F6F5EE]">
              🌿 No rush or penalty. The music is here for peace and relaxation.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXERCISE 3: WARM DAILY PAIRINGS                                           */}
      {/* ========================================================================= */}
      {activeTab === 'daily_pairs' && (
        <div className="bg-white dark:bg-[#1D1F1A] border-2 border-[#BFB5A2] dark:border-[#4A4F41] rounded-[36px] p-6 sm:p-8 card-shadow space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#BFB5A2] dark:border-[#4A4F41] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="serif text-xl sm:text-2xl font-black text-[#6E3B00] dark:text-[#FFFFFF]">
                  Warm Daily Pairings
                </h2>
                <span className="px-3 py-0.5 rounded-full bg-[#F8E7C6] text-[#6E3B00] text-xs font-black">
                  Item {pairingIndex + 1} of {PAIRING_CHALLENGES.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#121210] dark:text-[#F6F5EE] mt-0.5">
                Which beloved item pairs naturally with the one on the left?
              </p>
            </div>

            <button
              onClick={() => {
                setPairingSelected(null);
                setPairingFeedback(null);
                setPairingIndex((prev) => (prev + 1) % PAIRING_CHALLENGES.length);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F0EADF] dark:bg-[#272A22] text-[#121210] dark:text-[#F6F5EE] border border-[#BFB5A2] dark:border-[#4A4F41] text-xs font-black hover:bg-[#E0EDE0] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Next Pairing</span>
            </button>
          </div>

          {/* Pairing Challenge Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Prompt Item (Left) */}
            <div className="md:col-span-5 bg-[#F8E7C6] dark:bg-[#423015] border-3 border-[#6E3B00] rounded-[32px] p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-md">
              <span className="text-xs font-black uppercase tracking-widest text-[#6E3B00] dark:text-[#F7C04D] px-3.5 py-1 rounded-full bg-white/70 dark:bg-[#1D1F1A]">
                Beloved Everyday Item
              </span>
              <div className="w-24 h-24 rounded-3xl bg-white dark:bg-[#1D1F1A] flex items-center justify-center text-6xl shadow-md border-2 border-[#6E3B00]/30">
                {currentPairChallenge.promptItem.emoji}
              </div>
              <div>
                <h3 className="serif text-2xl font-black text-[#6E3B00] dark:text-[#FFFFFF]">
                  {currentPairChallenge.promptItem.name}
                </h3>
                <p className="text-xs font-bold text-[#121210] dark:text-[#F6F5EE] mt-1">
                  {currentPairChallenge.promptItem.hint}
                </p>
              </div>
            </div>

            {/* Arrow Divider */}
            <div className="md:col-span-1 flex justify-center text-[#6E3B00] dark:text-[#F7C04D]">
              <div className="w-12 h-12 rounded-full bg-[#F0EADF] dark:bg-[#272A22] border-2 border-[#BFB5A2] dark:border-[#4A4F41] flex items-center justify-center shadow-xs">
                <ChevronRight className="w-6 h-6" />
              </div>
            </div>

            {/* Choices (Right) */}
            <div className="md:col-span-6 space-y-3">
              {[currentPairChallenge.correctMatch, ...currentPairChallenge.distractors]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((choice) => {
                  const isSelected = pairingSelected === choice.name;
                  const isCorrect = choice.name === currentPairChallenge.correctMatch.name;
                  return (
                    <motion.button
                      key={choice.name}
                      whileHover={{ scale: pairingSelected ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePairSelection(choice)}
                      className={`w-full p-4 sm:p-5 rounded-[24px] border-3 flex items-center gap-4 text-left transition-all cursor-pointer shadow-sm ${
                        isSelected && isCorrect
                          ? 'bg-[#E0EDE0] dark:bg-[#263319] border-[#143513] ring-4 ring-[#E0EDE0]'
                          : isSelected && !isCorrect
                          ? 'bg-[#F8E7C6] border-[#6E3B00]'
                          : 'bg-white dark:bg-[#272A22] border-[#BFB5A2] dark:border-[#4A4F41] hover:border-[#6E3B00]'
                      }`}
                    >
                      <span className="text-3xl sm:text-4xl p-2 rounded-2xl bg-[#F0EADF] dark:bg-[#1D1F1A] border border-[#BFB5A2] dark:border-[#4A4F41]">
                        {choice.emoji}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-black text-base sm:text-lg text-[#000000] dark:text-[#FFFFFF]">
                          {choice.name}
                        </h4>
                      </div>
                      {isSelected && isCorrect && (
                        <span className="w-8 h-8 rounded-full bg-[#143513] text-white flex items-center justify-center shrink-0">
                          <Check className="w-5 h-5" />
                        </span>
                      )}
                    </motion.button>
                  );
                })}
            </div>
          </div>

          {/* Feedback & Next Button */}
          <AnimatePresence>
            {pairingFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl bg-[#E0EDE0] dark:bg-[#263319] border-2 border-[#143513] p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#143513] text-white flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 text-[#F7C04D] fill-current" />
                  </div>
                  <p className="text-sm font-bold text-[#121210] dark:text-[#F6F5EE]">
                    {pairingFeedback.text}
                  </p>
                </div>

                <button
                  onClick={handleNextPair}
                  className="px-6 py-2.5 rounded-full bg-[#143513] hover:bg-[#0C230B] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shrink-0 cursor-pointer"
                >
                  Next Pair →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom Session Rest / Home Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#1D1F1A] border-2 border-[#BFB5A2] dark:border-[#4A4F41] rounded-[32px] p-6 card-shadow">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-[#7B1F13] dark:text-[#EA9688] fill-current shrink-0" />
          <div>
            <p className="text-xs sm:text-sm font-black text-[#000000] dark:text-[#FFFFFF]">
              Ready to finish this peaceful session?
            </p>
            <p className="text-xs font-bold text-[#121210] dark:text-[#F6F5EE]">
              Everything you engaged with today has been recorded gently for your loved ones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPatientScreen('session_end')}
            className="px-6 py-3 rounded-full bg-[#143513] hover:bg-[#0C230B] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            Complete Session & Rest 🌸
          </button>
        </div>
      </div>
    </div>
  );
};
