import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Volume2,
  Home,
  X,
  Play,
  Pause,
  User,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FamilyPhoto } from '../../types';

export const PatientFamilyGallery: React.FC = () => {
  const { state, setPatientScreen, speakText } = useApp();
  const photos: FamilyPhoto[] = state?.photos || [];

  const [selectedPhoto, setSelectedPhoto] = useState<FamilyPhoto | null>(null);

  const handleOpenPhoto = (photo: FamilyPhoto) => {
    setSelectedPhoto(photo);
    speakText(`${photo.person_name}, ${photo.relationship_label}. ${photo.notes || ''}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setPatientScreen('home')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#264D24] text-sm font-extrabold text-[#141310] dark:text-[#FCFBF7] shadow-2xs transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4 text-[#264D24]" />
          <span>Home</span>
        </button>

        <div className="text-center">
          <h1 className="serif text-2xl sm:text-4xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
            My Family & Loved Ones
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#3D3A33] dark:text-[#D1D0C5] mt-1">
            Tap any picture to look closer and hear their loving voice
          </p>
        </div>

        <div className="w-16" /> {/* Spacer */}
      </div>

      {/* Grid of Polaroid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {photos.map((photo) => (
          <motion.div
            key={photo.id}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenPhoto(photo)}
            className="cursor-pointer rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#264D24] p-4 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-square bg-black/5 mb-4 shadow-inner">
              <img
                src={photo.photo_url}
                alt={photo.person_name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#F5B83D] text-[#141310] flex items-center justify-center shadow-md">
                <Heart className="w-5 h-5 fill-current text-[#9C382A]" />
              </div>
            </div>

            <div className="px-2 pb-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
                {photo.person_name}
              </h3>
              <p className="text-sm font-bold text-[#9C382A] dark:text-[#E38B7D] mt-0.5">
                {photo.relationship_label}
              </p>
              {photo.notes && (
                <p className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] mt-2 line-clamp-2 font-medium">
                  {photo.notes}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Enlarged Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#1D1F1A] border-3 border-[#965A04] shadow-2xl p-6 sm:p-8 text-[#141310] dark:text-[#FCFBF7]"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors cursor-pointer text-[#141310] dark:text-[#FCFBF7]"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="rounded-2xl overflow-hidden aspect-square max-h-[380px] w-full bg-black/5 mb-6 shadow-md border-2 border-[#DCD4C4] dark:border-[#3C4035]">
                <img
                  src={selectedPhoto.photo_url}
                  alt={selectedPhoto.person_name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                  {selectedPhoto.person_name}
                </h2>
                <p className="text-base sm:text-lg font-extrabold text-[#9C382A] dark:text-[#E38B7D] mb-2">
                  {selectedPhoto.relationship_label}
                </p>
                {selectedPhoto.notes && (
                  <p className="text-sm sm:text-base text-[#3D3A33] dark:text-[#D1D0C5] leading-relaxed max-w-md mx-auto font-medium">
                    {selectedPhoto.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() =>
                    speakText(
                      `${selectedPhoto.person_name}, ${selectedPhoto.relationship_label}. ${selectedPhoto.notes || ''}`
                    )
                  }
                  className="px-6 py-3 rounded-full bg-[#264D24] hover:bg-[#1D3D1B] text-white font-extrabold text-sm sm:text-base flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Listen Aloud</span>
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="px-6 py-3 rounded-full bg-[#F3EFE6] dark:bg-[#272A22] border border-[#DCD4C4] dark:border-[#3C4035] hover:bg-[#FBE8C4] text-sm sm:text-base font-bold text-[#141310] dark:text-[#FCFBF7] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
