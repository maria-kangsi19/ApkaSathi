import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Stethoscope,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  User,
  Phone,
  Mail,
  FileBadge2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DoctorUser } from '../../types';

export const DoctorLogin: React.FC = () => {
  const {
    state,
    setAppMode,
    currentDoctor,
    loginDoctor,
    verifyAndLinkDoctorCode,
    setShowDisclaimerModal,
  } = useApp();

  const [name, setName] = useState<string>(currentDoctor?.name || '');
  const [contact, setContact] = useState<string>(currentDoctor?.phone_or_email || '');
  const [regId, setRegId] = useState<string>(currentDoctor?.medical_registration_id || '');
  const [accessCode, setAccessCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if there are active codes in state for demo reference
  const activeGrants = (state?.doctorAccessGrants || []).filter(g => g.status === 'active');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedContact = contact.trim();
    const trimmedCode = accessCode.trim().toUpperCase();

    if (!trimmedName) {
      setErrorMessage('Please enter your full name or title.');
      return;
    }
    if (!trimmedContact) {
      setErrorMessage('Please enter your contact phone number or email address.');
      return;
    }
    if (!trimmedCode) {
      setErrorMessage('Please enter the 6-character patient access code shared by the family.');
      return;
    }

    const doctorProfile: DoctorUser = {
      id: currentDoctor?.id || `doc-${Date.now()}`,
      name: trimmedName.startsWith('Dr.') ? trimmedName : `Dr. ${trimmedName}`,
      phone_or_email: trimmedContact,
      medical_registration_id: regId.trim() || undefined,
    };

    setIsVerifying(true);
    try {
      // 1. Save doctor profile in session
      loginDoctor(doctorProfile);

      // 2. Verify and link patient access code
      const result = await verifyAndLinkDoctorCode(trimmedCode);
      if (!result.success) {
        setErrorMessage(
          result.error || "This code isn't valid or has been removed. Please check with the caregiver."
        );
      }
    } catch (err) {
      setErrorMessage("This code isn't valid or has been removed. Please check with the caregiver.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl">
        {/* Back navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setAppMode('role_select')}
            className="inline-flex items-center gap-2 text-xs font-black text-[#1E4D6B] dark:text-[#93C5FD] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Role Selection</span>
          </button>

          <span className="text-[11px] font-bold text-[#66635A] dark:text-[#8E8D85]">
            Aapka Saathi • Clinician Portal
          </span>
        </div>

        {/* Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1D1F1A] rounded-[36px] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-6 sm:p-8 card-shadow space-y-6"
        >
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E3EFF7] dark:bg-[#1C2C39] text-[#1E4D6B] dark:text-[#93C5FD] flex items-center justify-center shrink-0 shadow-xs">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E3EFF7] dark:bg-[#1C2C39] text-[#1E4D6B] dark:text-[#93C5FD] text-[11px] font-black uppercase tracking-wider">
                <Lock className="w-3 h-3" />
                Consent-Based Doctor Access
              </div>
              <h1 className="serif text-2xl sm:text-3xl font-black text-[#141310] dark:text-[#FCFBF7]">
                Healthcare Provider Sign-In
              </h1>
              <p className="text-xs sm:text-sm text-[#66635A] dark:text-[#8E8D85] font-bold">
                Review patient adherence and engagement trends with explicit caregiver authorization.
              </p>
            </div>
          </div>

          {/* Framing notice box */}
          <div className="p-4 rounded-2xl bg-[#F4F8FA] dark:bg-[#18232D] border border-[#BBD5E8] dark:border-[#2C4052] text-xs font-bold text-[#1E4D6B] dark:text-[#93C5FD] space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-2 font-black">
              <ShieldCheck className="w-4 h-4 text-[#1E4D6B] dark:text-[#93C5FD] shrink-0" />
              <span>Descriptive, Caregiver-Recorded Information Only</span>
            </div>
            <p className="text-[11px] text-[#3D5A70] dark:text-[#BFD8EB]">
              This portal provides observational context gathered by family caregivers. It does not provide medical diagnoses and does not replace your clinical consultation.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Doctor Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-[#141310] dark:text-[#FCFBF7] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#1E4D6B] dark:text-[#93C5FD]" />
                <span>Doctor / Clinician Full Name</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Dr. Sentila Longkumer"
                className="w-full px-4 py-3 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#DCD4C4] dark:border-[#3C4035] text-xs sm:text-sm font-bold text-[#141310] dark:text-[#FCFBF7] focus:outline-none focus:border-[#1E4D6B] dark:focus:border-[#60A5FA]"
                required
              />
            </div>

            {/* Contact Phone / Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-[#141310] dark:text-[#FCFBF7] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#1E4D6B] dark:text-[#93C5FD]" />
                <span>Phone Number or Email</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="e.g. +91 94360 12345 or doctor@hospital.org"
                className="w-full px-4 py-3 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#DCD4C4] dark:border-[#3C4035] text-xs sm:text-sm font-bold text-[#141310] dark:text-[#FCFBF7] focus:outline-none focus:border-[#1E4D6B] dark:focus:border-[#60A5FA]"
                required
              />
            </div>

            {/* Medical Registration ID (Optional, self-declared) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#141310] dark:text-[#FCFBF7] flex items-center gap-1.5">
                  <FileBadge2 className="w-3.5 h-3.5 text-[#1E4D6B] dark:text-[#93C5FD]" />
                  <span>Medical Registration ID</span>
                </label>
                <span className="text-[10px] font-bold text-[#66635A] dark:text-[#8E8D85]">
                  Optional • Self-declared
                </span>
              </div>
              <input
                type="text"
                value={regId}
                onChange={e => setRegId(e.target.value)}
                placeholder="e.g. NMC-2018-94812 / State Medical Council No."
                className="w-full px-4 py-3 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#DCD4C4] dark:border-[#3C4035] text-xs sm:text-sm font-bold text-[#141310] dark:text-[#FCFBF7] focus:outline-none focus:border-[#1E4D6B] dark:focus:border-[#60A5FA]"
              />
            </div>

            {/* 6-Character Access Code */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#141310] dark:text-[#FCFBF7] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#1E4D6B] dark:text-[#93C5FD]" />
                  <span>Patient Access Code</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] font-bold text-[#66635A] dark:text-[#8E8D85]">
                  6 alphanumeric characters
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={accessCode}
                  onChange={e => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SAATHI or DR7842"
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border-2 border-[#1E4D6B]/50 dark:border-[#93C5FD]/50 text-base sm:text-lg font-mono font-black tracking-widest text-[#1E4D6B] dark:text-[#93C5FD] placeholder:text-neutral-400 focus:outline-none focus:border-[#1E4D6B] dark:focus:border-[#60A5FA] text-center uppercase"
                  required
                />
              </div>
              <p className="text-[11px] text-[#66635A] dark:text-[#8E8D85] font-bold">
                Provided directly to you by the patient’s primary caregiver.
              </p>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Demo Helper Hint */}
            {activeGrants.length > 0 && (
              <div className="p-3 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#EBE5D8] dark:border-[#32362C] flex items-center justify-between text-xs">
                <span className="text-[#66635A] dark:text-[#8E8D85] font-bold">
                  Demo access code:
                </span>
                <div className="flex items-center gap-1.5">
                  {activeGrants.slice(0, 2).map(g => (
                    <button
                      type="button"
                      key={g.id}
                      onClick={() => setAccessCode(g.access_code)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1D1F1A] border border-[#DCD4C4] dark:border-[#3C4035] font-mono font-bold text-[#1E4D6B] dark:text-[#93C5FD] text-[11px] hover:border-[#1E4D6B] cursor-pointer"
                    >
                      {g.access_code}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-4 rounded-full bg-[#1E4D6B] hover:bg-[#16384E] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 mt-4"
            >
              {isVerifying ? (
                <span>Verifying Access Code...</span>
              ) : (
                <>
                  <span>Verify Code & Open Tracking Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer disclaimer */}
          <div className="pt-4 border-t border-[#EBE5D8] dark:border-[#32362C] flex items-center justify-between text-[11px] text-[#66635A] dark:text-[#8E8D85] font-bold">
            <button
              type="button"
              onClick={() => setShowDisclaimerModal(true)}
              className="hover:underline flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Read Clinical Disclaimer & Scope</span>
            </button>
            <span>Patient Privacy Preserved</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
