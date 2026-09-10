import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  X,
  Heart,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PatientSOSModal: React.FC = () => {
  const {
    showSOSConfirmModal,
    setShowSOSConfirmModal,
    triggerSOS,
    state,
    setSelectedContactForCall,
    setShowCallModal,
  } = useApp();

  const [countdown, setCountdown] = useState<number>(5);
  const [hasSent, setHasSent] = useState<boolean>(false);
  const [sentTimestamp, setSentTimestamp] = useState<string>('');

  const caregiver = state?.caregiver;
  const primaryContact = (state?.supportContacts || []).find((c) => c.is_primary) || state?.supportContacts?.[0];
  const patientLocation = `${state?.patient?.hometown || 'Mokokchung'}, Nagaland`;

  // Countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showSOSConfirmModal && !hasSent) {
      if (countdown > 0) {
        timer = setTimeout(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        // Countdown reached 0: automatically trigger SOS
        handleTriggerSOS();
      }
    }
    return () => clearTimeout(timer);
  }, [showSOSConfirmModal, countdown, hasSent]);

  // Reset states when modal is opened
  useEffect(() => {
    if (showSOSConfirmModal) {
      setCountdown(5);
      setHasSent(false);
    }
  }, [showSOSConfirmModal]);

  const handleTriggerSOS = async () => {
    setHasSent(true);
    setSentTimestamp(
      new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
    await triggerSOS(patientLocation);
  };

  const handleCancel = () => {
    setShowSOSConfirmModal(false);
    setHasSent(false);
  };

  const handleCallCaregiver = () => {
    setShowSOSConfirmModal(false);
    if (primaryContact) {
      setSelectedContactForCall(primaryContact);
      setShowCallModal(true);
    } else if (caregiver?.phone) {
      window.location.href = `tel:${caregiver.phone}`;
    }
  };

  if (!showSOSConfirmModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`bg-white dark:bg-[#1D1F1A] rounded-[44px] p-6 sm:p-10 max-w-lg w-full border-4 shadow-2xl space-y-6 text-center relative overflow-hidden ${
            hasSent ? 'border-[#264D24]' : 'border-red-600'
          }`}
        >
          {!hasSent ? (
            /* Phase 1: Confirmation & 5s Countdown */
            <>
              {/* Pulsing Alert Icon */}
              <div className="mx-auto w-24 h-24 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center animate-pulse shadow-md">
                <AlertTriangle className="w-12 h-12" />
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-black text-[#141310] dark:text-[#FCFBF7] leading-tight">
                  Do you need help?
                </h2>
                <p className="text-base font-bold text-[#66635A] dark:text-[#8E8D85] max-w-sm mx-auto">
                  Alerting your caregiver <span className="font-black text-[#141310] dark:text-[#FCFBF7]">{caregiver?.name || 'Caregiver'}</span> in...
                </p>

                {/* Big Visual Countdown Number */}
                <div className="flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-red-600 flex items-center justify-center text-4xl font-black text-red-600 dark:text-red-400 animate-bounce shadow-inner">
                    {countdown}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleTriggerSOS}
                  className="w-full py-4 px-6 rounded-3xl bg-red-600 hover:bg-red-700 text-white font-black text-lg shadow-xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldAlert className="w-6 h-6" />
                  <span>Send SOS Alert Now</span>
                </button>

                <button
                  onClick={handleCancel}
                  className="w-full py-3.5 px-6 rounded-3xl bg-[#F3EFE6] dark:bg-[#272A22] hover:bg-[#EAE4D7] text-[#141310] dark:text-[#FCFBF7] border-2 border-[#BFB5A2] dark:border-[#4A4F41] font-black text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                  <span>No, I'm okay — Cancel</span>
                </button>
              </div>

              {/* Safety Framing Copy */}
              <div className="pt-3 border-t border-[#EBE5D8] dark:border-[#32362C] flex items-center justify-center gap-2 text-[11px] font-bold text-[#66635A] dark:text-[#8E8D85]">
                <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                <span>
                  Safety notice: SOS alerts your trusted caregiver. It is not a substitute for 112 emergency services.
                </span>
              </div>
            </>
          ) : (
            /* Phase 2: Help is on the way */
            <>
              <div className="mx-auto w-24 h-24 rounded-full bg-[#E0EDE0] text-[#143513] dark:bg-[#263319] dark:text-[#9BB858] flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 text-xs font-black text-[#264D24] dark:text-[#9BB858] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Alert Received</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#141310] dark:text-[#FCFBF7]">
                  Help is on the way!
                </h2>
                <p className="text-sm font-bold text-[#66635A] dark:text-[#8E8D85] max-w-sm mx-auto">
                  <span className="font-black text-[#141310] dark:text-[#FCFBF7]">{caregiver?.name || 'Your caregiver'}</span> has been notified at {sentTimestamp}. Please remain in a comfortable spot.
                </p>

                <div className="p-3 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] text-xs font-bold text-[#3D3A33] dark:text-[#D1D0C5] flex items-center justify-center gap-2 border border-[#EBE5D8] dark:border-[#32362C]">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>Reported Location: {patientLocation}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleCallCaregiver}
                  className="w-full py-4 px-6 rounded-3xl bg-[#264D24] hover:bg-[#1E3E1C] text-white font-black text-lg shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="w-6 h-6" />
                  <span>Call {caregiver?.name || 'Caregiver'} Directly</span>
                </button>

                <button
                  onClick={() => setShowSOSConfirmModal(false)}
                  className="w-full py-3.5 px-6 rounded-3xl bg-[#F3EFE6] dark:bg-[#272A22] text-[#141310] dark:text-[#FCFBF7] border-2 border-[#BFB5A2] dark:border-[#4A4F41] font-black text-base cursor-pointer hover:bg-[#EAE4D7]"
                >
                  <span>Return to Home Screen</span>
                </button>
              </div>

              {/* Safety Framing Copy */}
              <div className="pt-3 border-t border-[#EBE5D8] dark:border-[#32362C] flex items-center justify-center gap-2 text-[11px] font-bold text-[#66635A] dark:text-[#8E8D85]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#264D24]" />
                <span>
                  Support tool: Alerts your family contact. Call 112 directly if urgent medical attention is needed.
                </span>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
