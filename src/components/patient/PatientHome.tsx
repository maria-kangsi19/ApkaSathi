import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Gamepad2,
  Image as ImageIcon,
  CheckCircle2,
  PhoneCall,
  Sun,
  Volume2,
  Coffee,
  Heart,
  ChevronRight,
  Smile,
  Users,
  Music,
  MapPin,
  Flower2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NORTHEAST_IMAGES } from '../../assets/images';

export const PatientHome: React.FC = () => {
  const {
    state,
    setPatientScreen,
    setShowCallModal,
    speakText,
    toggleReminder,
  } = useApp();

  const patient = state?.patient;
  const reminders = state?.reminders || [];

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const greetingSentence = `${getGreeting()}, ${patient?.nickname || patient?.name || 'Grandmother'}! Today is ${todayFormatted}.`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Top Greeting Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1D1F1A] rounded-[36px] p-6 sm:p-10 card-shadow flex flex-col md:flex-row items-center gap-8 border-2 border-[#BFB5A2] dark:border-[#4A4F41]"
      >
        <div className="relative shrink-0">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-[28px] overflow-hidden border-4 border-[#6E3B00] dark:border-[#F7C04D] shrink-0 bg-black/5 shadow-md">
            <img
              src={patient?.profile_photo_url || NORTHEAST_IMAGES.grandmother}
              alt={patient?.name || 'Ayo'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => speakText(greetingSentence)}
            className="absolute -bottom-2 -right-2 p-3 rounded-full bg-[#143513] text-white shadow-lg hover:scale-110 transition-transform cursor-pointer"
            title="Read greeting aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="serif large-text font-black text-[#143513] dark:text-[#FFFFFF] mb-2">
            {getGreeting()}, {patient?.nickname || patient?.name || 'Grandmother'}!
          </h2>
          <p className="text-lg sm:text-xl text-[#121210] dark:text-[#F6F5EE] mb-4 font-bold">
            Today is <span className="font-black text-[#000000] dark:text-[#FFFFFF]">{todayFormatted}</span>. The air in {patient?.hometown || 'Home'} is peaceful and fresh.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-black text-[#121210] dark:text-[#F6F5EE]">
            <span className="px-3.5 py-1.5 rounded-full bg-[#F0EADF] dark:bg-[#272A22] border border-[#BFB5A2] dark:border-[#4A4F41]">
              🌿 {patient?.community || 'Naga'} Heritage
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-[#F0EADF] dark:bg-[#272A22] border border-[#BFB5A2] dark:border-[#4A4F41]">
              📍 {patient?.hometown || 'Nagaland'}
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-[#F0EADF] dark:bg-[#272A22] border border-[#BFB5A2] dark:border-[#4A4F41]">
              🗣️ {patient?.preferred_language || 'Nagamese / English'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Activities Grid - 4 Engaging Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Who is this */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPatientScreen('who_is_this')}
          className="bg-[#143513] text-white rounded-[32px] p-6 flex flex-col items-center justify-between gap-4 card-shadow btn-hover transition-all text-center cursor-pointer min-h-[260px] shadow-lg border-2 border-[#143513]"
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
            <Smile className="w-9 h-9 text-[#F7C04D]" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Who Is This?</h3>
            <p className="text-xs text-emerald-100 mt-1 font-bold">Warm family photo recognition with gentle AI prompts</p>
          </div>
          <span className="text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white">
            Start Photos →
          </span>
        </motion.div>

        {/* 2. Sounds of Home */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPatientScreen('sounds_of_home')}
          className="bg-[#7B1F13] text-white rounded-[32px] p-6 flex flex-col items-center justify-between gap-4 card-shadow btn-hover transition-all text-center cursor-pointer min-h-[260px] shadow-lg border-2 border-[#7B1F13]"
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
            <Music className="w-9 h-9 text-[#F7C04D]" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Sounds of Home</h3>
            <p className="text-xs text-rose-100 mt-1 font-bold">Listen to family voice notes, songs & village hymns</p>
          </div>
          <span className="text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white">
            Listen Notes →
          </span>
        </motion.div>

        {/* 3. Familiar Places */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPatientScreen('familiar_places')}
          className="bg-[#6E3B00] text-white rounded-[32px] p-6 flex flex-col items-center justify-between gap-4 card-shadow btn-hover transition-all text-center cursor-pointer min-h-[260px] shadow-lg border-2 border-[#6E3B00]"
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
            <MapPin className="w-9 h-9 text-[#FFFFFF]" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Familiar Places</h3>
            <p className="text-xs text-amber-100 mt-1 font-bold">Wander through beloved hometown hills & courtyards</p>
          </div>
          <span className="text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white">
            Visit Places →
          </span>
        </motion.div>

        {/* 4. Cognitive Exercises (New Feature!) */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPatientScreen('cognitive_exercises')}
          className="bg-[#1C3B35] text-white rounded-[32px] p-6 flex flex-col items-center justify-between gap-4 card-shadow btn-hover transition-all text-center cursor-pointer min-h-[260px] shadow-lg border-2 border-[#1C3B35]"
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
            <Flower2 className="w-9 h-9 text-[#F7C04D]" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Cognitive Play</h3>
            <p className="text-xs text-teal-100 mt-1 font-bold">Gentle memory matching, patterns & rhythm games</p>
          </div>
          <span className="text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white">
            Play Games →
          </span>
        </motion.div>
      </div>

      {/* Routine Reminders & Emergency Call */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Today's Needs / Reminders Card */}
        <div className="bg-white dark:bg-[#1D1F1A] rounded-[36px] p-8 border-2 border-[#BFB5A2] dark:border-[#4A4F41] card-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-widest text-[#000000] dark:text-[#FFFFFF] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#7B1F13]" />
                <span>Today's Routine</span>
              </h3>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-[#E0EDE0] text-[#143513] dark:bg-[#263319] dark:text-[#9BB858]">
                Tap to check off
              </span>
            </div>

            <div className="space-y-4">
              {reminders.slice(0, 3).map((reminder) => {
                const isDone = reminder.completed_today;
                return (
                  <div
                    key={reminder.id}
                    onClick={() => toggleReminder(reminder.id)}
                    className={`flex items-center gap-4 p-4 sm:p-5 rounded-3xl transition-all cursor-pointer ${
                      isDone
                        ? 'bg-[#F0EADF] dark:bg-[#272A22] border-l-8 border-[#143513]'
                        : 'bg-white dark:bg-[#1D1F1A] border-2 border-[#BFB5A2] dark:border-[#4A4F41] hover:border-[#7B1F13]'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                      isDone
                        ? 'bg-[#E0EDE0] text-[#143513] dark:bg-[#263319] dark:text-[#9BB858]'
                        : 'bg-[#FAE4E1] text-[#7B1F13] dark:bg-[#3D2321] dark:text-[#EA9688]'
                    }`}>
                      {reminder.time}
                    </div>
                    <div className="flex-1">
                      <p className={`font-black text-base sm:text-lg ${isDone ? 'line-through text-[#66635A] dark:text-[#8E8D85]' : 'text-[#000000] dark:text-[#FFFFFF]'}`}>
                        {reminder.label}
                      </p>
                      {reminder.notes && (
                        <p className="text-xs text-[#121210] dark:text-[#F6F5EE] mt-0.5 font-bold">{reminder.notes}</p>
                      )}
                    </div>
                    {isDone ? (
                      <span className="text-xs font-black text-[#143513] dark:text-[#9BB858] px-2.5 py-1 rounded-full bg-[#E0EDE0] dark:bg-[#263319]">Done ✨</span>
                    ) : (
                      <span className="text-xs font-black text-[#7B1F13] px-2.5 py-1 rounded-full bg-[#FAE4E1] dark:bg-[#3D2321]">Pending</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setPatientScreen('reminders')}
            className="w-full mt-6 py-4 bg-[#FAE4E1] dark:bg-[#3D2321] text-[#7B1F13] dark:text-[#EA9688] border-2 border-[#7B1F13]/40 rounded-full font-black uppercase tracking-widest text-xs hover:bg-[#F8E7C6] transition-colors cursor-pointer"
          >
            All Reminders & Schedule →
          </button>
        </div>

        {/* Call For Help & Family Gallery Card */}
        <div className="flex flex-col justify-between gap-6">
          {/* Big Call Button */}
          <div
            onClick={() => setShowCallModal(true)}
            className="bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-red-200 rounded-[36px] p-6 sm:p-8 border-2 border-red-300 dark:border-red-800 flex items-center justify-between shadow-lg btn-hover transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-md shrink-0">
                <PhoneCall className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-red-950 dark:text-red-100">
                  Call Loved Ones & Helpers
                </h4>
                <p className="font-bold text-red-800 dark:text-red-300 text-sm mt-0.5">
                  One-touch call for family & health workers
                </p>
              </div>
            </div>
            <ChevronRight className="w-8 h-8 opacity-70 shrink-0 text-red-700 dark:text-red-300" />
          </div>

          {/* Family Gallery Launch Button */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => setPatientScreen('family_gallery')}
            className="bg-white dark:bg-[#1D1F1A] border-2 border-[#BFB5A2] dark:border-[#4A4F41] rounded-[36px] p-6 sm:p-7 card-shadow flex items-center justify-between cursor-pointer btn-hover transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#E0EDE0] dark:bg-[#263319] flex items-center justify-center text-[#143513] dark:text-[#9BB858] shrink-0">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xl font-black uppercase tracking-tight text-[#000000] dark:text-[#FFFFFF]">Family Photo Album</h4>
                <p className="text-xs font-bold text-[#121210] dark:text-[#F6F5EE] mt-0.5">Browse through loved ones with voice clips</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-[#143513] dark:text-[#9BB858]" />
          </motion.div>

          {/* Gentle Comfort Footer Note */}
          <div className="rounded-[32px] bg-[#F8E7C6] dark:bg-[#423015] border-2 border-[#6E3B00]/40 p-5 flex items-center gap-3">
            <Heart className="w-6 h-6 text-[#6E3B00] dark:text-[#F7C04D] fill-current shrink-0" />
            <p className="text-xs sm:text-sm text-[#542C00] dark:text-[#F8E7C6] font-bold leading-relaxed">
              Take all the time you need. There is no rush or testing here. Everything is safe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
