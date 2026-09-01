import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneCall,
  PhoneOff,
  User,
  X,
  Heart,
  Volume2,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupportContact } from '../../types';

export const PatientCallModal: React.FC = () => {
  const {
    showCallModal,
    setShowCallModal,
    state,
    selectedContactForCall,
    setSelectedContactForCall,
    speakText,
  } = useApp();

  const contacts: SupportContact[] = state?.supportContacts || [];
  const [isCalling, setIsCalling] = useState(false);
  const [activeCallContact, setActiveCallContact] = useState<SupportContact | null>(null);

  if (!showCallModal) return null;

  const handleStartCall = (contact: SupportContact) => {
    setActiveCallContact(contact);
    setIsCalling(true);
    speakText(`Calling ${contact.name}. Connecting you with love...`);
  };

  const handleEndCall = () => {
    setIsCalling(false);
    setActiveCallContact(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#1D1F1A] border-3 border-[#264D24] shadow-2xl p-6 sm:p-8 text-[#141310] dark:text-[#FCFBF7]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#DCD4C4] dark:border-[#3C4035] pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#264D24] text-white flex items-center justify-center shadow-md">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h2 className="serif text-xl sm:text-2xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
                  Call Family & Helpers
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-[#3D3A33] dark:text-[#D1D0C5]">
                  Tap any person to reach them directly
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCallModal(false)}
              className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#141310] dark:text-[#FCFBF7] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* If In Active Call Screen */}
          {isCalling && activeCallContact ? (
            <div className="text-center py-8">
              <div className="relative inline-block mb-6">
                <img
                  src={
                    activeCallContact.photo_url ||
                    '/src/assets/images/northeast_son_caregiver_1788273841141.jpg'
                  }
                  alt={activeCallContact.name}
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-[#264D24] shadow-xl animate-pulse"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#264D24] text-white flex items-center justify-center shadow-md">
                  <PhoneCall className="w-5 h-5 animate-bounce" />
                </div>
              </div>

              <h3 className="serif text-2xl sm:text-3xl font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                {activeCallContact.name}
              </h3>
              <p className="text-base font-extrabold text-[#9C382A] dark:text-[#E38B7D] mb-4">
                {activeCallContact.role.toUpperCase()} • {activeCallContact.phone}
              </p>

              <div className="p-4 rounded-2xl bg-[#EBF3E8] dark:bg-[#1E2818] border-2 border-[#264D24]/40 max-w-md mx-auto mb-8">
                <p className="text-sm font-bold text-[#264D24] dark:text-[#8DA850]">
                  Connecting call... If you're on a mobile device, tap below to open your dialer.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={`tel:${activeCallContact.phone.replace(/[^0-9+]/g, '')}`}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#264D24] hover:bg-[#1D3D1B] text-white font-extrabold text-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="w-6 h-6" />
                  <span>Open Phone Dialer</span>
                </a>
                <button
                  onClick={handleEndCall}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#9C382A] hover:bg-[#7E291E] text-white font-extrabold text-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneOff className="w-6 h-6" />
                  <span>End Call</span>
                </button>
              </div>
            </div>
          ) : (
            /* Contact Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {contacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-2xl p-4 bg-[#F3EFE6] dark:bg-[#272A22] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#264D24] flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        contact.photo_url ||
                        '/src/assets/images/northeast_granddaughter_1788273863871.jpg'
                      }
                      alt={contact.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
                    />
                    <div>
                      <h4 className="font-extrabold text-base text-[#141310] dark:text-[#FCFBF7]">
                        {contact.name}
                      </h4>
                      <p className="text-xs font-extrabold text-[#9C382A] dark:text-[#E38B7D] capitalize">
                        {contact.role}
                      </p>
                      <p className="text-xs font-semibold text-[#3D3A33] dark:text-[#D1D0C5]">{contact.phone}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartCall(contact)}
                    className="p-3.5 rounded-2xl bg-[#264D24] hover:bg-[#1D3D1B] text-white shadow-md hover:scale-105 transition-transform shrink-0 cursor-pointer"
                    title={`Call ${contact.name}`}
                  >
                    <PhoneCall className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Footer note */}
          <div className="border-t-2 border-[#DCD4C4] dark:border-[#3C4035] pt-4 text-center text-xs text-[#3D3A33] dark:text-[#D1D0C5] font-semibold flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-[#9C382A]" />
            <span>Your family and health circle are always ready to support you.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
