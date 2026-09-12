import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  KeyRound,
  Plus,
  Copy,
  Check,
  Ban,
  UserCheck,
  Clock,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  Info,
  Lock,
  Stethoscope,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DoctorAccessGrant } from '../../types';

export const CaregiverDoctorAccess: React.FC = () => {
  const {
    state,
    setCaregiverTab,
    generateDoctorAccessCode,
    revokeDoctorAccessCode,
  } = useApp();

  const patient = state?.patient;
  const grants = state?.doctorAccessGrants || [];

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newlyCreatedGrant, setNewlyCreatedGrant] = useState<DoctorAccessGrant | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [grantToRevoke, setGrantToRevoke] = useState<DoctorAccessGrant | null>(null);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const grant = await generateDoctorAccessCode();
      setNewlyCreatedGrant(grant);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const handleConfirmRevoke = async () => {
    if (!grantToRevoke) return;
    setIsRevoking(true);
    try {
      await revokeDoctorAccessCode(grantToRevoke.id);
      if (newlyCreatedGrant?.id === grantToRevoke.id) {
        setNewlyCreatedGrant(null);
      }
      setGrantToRevoke(null);
    } finally {
      setIsRevoking(false);
    }
  };

  const activeGrants = grants.filter(g => g.status === 'active');
  const revokedGrants = grants.filter(g => g.status === 'revoked');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => setCaregiverTab('dashboard')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-[#264D24] dark:text-[#9BB858] hover:underline mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Caregiver Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E0EDE0] dark:bg-[#263319] text-[#143513] dark:text-[#9BB858] flex items-center justify-center shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="serif text-2xl sm:text-3xl font-black text-[#141310] dark:text-[#FCFBF7]">
                Doctor Access Management
              </h1>
              <p className="text-xs sm:text-sm font-bold text-[#66635A] dark:text-[#8E8D85]">
                Consent-based, read-only tracking codes for {patient?.name || 'the patient'}’s doctors
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerateCode}
          disabled={isGenerating}
          className="px-5 py-3 rounded-full bg-[#264D24] hover:bg-[#1C3A1A] text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{isGenerating ? 'Generating Code...' : '+ Generate Access Code'}</span>
        </button>
      </div>

      {/* Persistent Privacy & Framing Notice */}
      <div className="p-5 rounded-[28px] bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] card-shadow space-y-3">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#E0EDE0] dark:bg-[#263319] text-[#143513] dark:text-[#9BB858] flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <h3 className="font-black text-[#141310] dark:text-[#FCFBF7]">
              Privacy & Non-Diagnostic Clinical Framing
            </h3>
            <p className="text-[#66635A] dark:text-[#8E8D85] font-bold leading-relaxed">
              Doctor access to a patient is only possible through a code you explicitly generate and share.
              Doctors receive <strong>read-only access</strong> to medicine adherence records and engagement trend summaries.
              To protect family privacy, doctors <strong>never</strong> have access to family photos, voice notes, or private activities.
              All data is framed strictly as caregiver-recorded descriptive information and does not replace the doctor’s own clinical assessment.
            </p>
          </div>
        </div>
      </div>

      {/* Newly Created Code Highlight Card */}
      <AnimatePresence>
        {newlyCreatedGrant && newlyCreatedGrant.status === 'active' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="p-6 sm:p-8 rounded-[32px] bg-[#F1F7EE] dark:bg-[#202919] border-2 border-[#264D24] dark:border-[#9BB858] shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#264D24] text-white text-xs font-black uppercase tracking-wider">
                <KeyRound className="w-3.5 h-3.5" />
                New Access Code Generated
              </span>
              <button
                onClick={() => setNewlyCreatedGrant(null)}
                className="text-xs font-black text-[#66635A] dark:text-[#8E8D85] hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#1D1F1A] border border-[#264D24]/30">
              <div>
                <p className="text-xs font-bold text-[#66635A] dark:text-[#8E8D85] uppercase tracking-wider">
                  Patient Access Code:
                </p>
                <div className="serif text-3xl sm:text-4xl font-black text-[#264D24] dark:text-[#9BB858] tracking-widest mt-1">
                  {newlyCreatedGrant.access_code}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCopy(newlyCreatedGrant.access_code)}
                  className="px-5 py-3 rounded-full bg-[#264D24] hover:bg-[#1C3A1A] text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-xs transition-transform hover:scale-105 cursor-pointer"
                >
                  {copiedCode === newlyCreatedGrant.access_code ? (
                    <>
                      <Check className="w-4 h-4 text-[#F5B83D]" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] font-bold">
              💡 Share this 6-character code directly with your doctor via phone call, SMS, or during your consultation.
              When the doctor enters this code on the Aapka Saathi Doctor portal, they will be linked to {patient?.name || 'the patient'}’s adherence log.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Doctor Grants List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-[#141310] dark:text-[#FCFBF7]">
              Active Access Grants ({activeGrants.length})
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E0EDE0] dark:bg-[#263319] text-[#143513] dark:text-[#9BB858]">
              Authorized
            </span>
          </div>
        </div>

        {activeGrants.length === 0 ? (
          <div className="p-8 rounded-[32px] bg-white dark:bg-[#1D1F1A] border-2 border-dashed border-[#DCD4C4] dark:border-[#3C4035] text-center space-y-3">
            <KeyRound className="w-10 h-10 text-[#66635A] mx-auto" />
            <h3 className="text-base font-black text-[#141310] dark:text-[#FCFBF7]">
              No Active Doctor Access Codes
            </h3>
            <p className="text-xs text-[#66635A] dark:text-[#8E8D85] font-bold max-w-md mx-auto">
              Generate an access code above whenever you want to share medicine adherence and engagement trends with your healthcare provider.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGrants.map(grant => (
              <div
                key={grant.id}
                className="p-6 rounded-[28px] bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#264D24] transition-all card-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0EDE0] dark:bg-[#263319] text-[#143513] dark:text-[#9BB858] font-black text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Active Access
                    </span>

                    <button
                      onClick={() => setGrantToRevoke(grant)}
                      className="px-3 py-1 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-950/50 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 text-xs font-black flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Revoke</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F9F7F1] dark:bg-[#23261F] border border-[#EBE5D8] dark:border-[#32362C] mb-4">
                    <div>
                      <div className="text-[11px] font-bold text-[#66635A] dark:text-[#8E8D85] uppercase tracking-wider">
                        Access Code:
                      </div>
                      <div className="serif text-2xl font-black text-[#264D24] dark:text-[#9BB858] tracking-widest">
                        {grant.access_code}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(grant.access_code)}
                      className="p-2 rounded-xl bg-white dark:bg-[#1D1F1A] border border-[#DCD4C4] hover:border-[#264D24] text-[#141310] dark:text-[#FCFBF7] text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Copy code"
                    >
                      {copiedCode === grant.access_code ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs font-bold">
                    <div className="flex items-center justify-between text-[#3D3A33] dark:text-[#D1D0C5]">
                      <span className="flex items-center gap-1.5 text-[#66635A] dark:text-[#8E8D85]">
                        <UserCheck className="w-3.5 h-3.5" />
                        Linked Doctor:
                      </span>
                      <span className="font-black text-[#141310] dark:text-[#FCFBF7]">
                        {grant.doctor_name ? (
                          <>
                            {grant.doctor_name}
                            {grant.doctor_contact && ` (${grant.doctor_contact})`}
                          </>
                        ) : (
                          <span className="text-amber-700 dark:text-amber-400 italic">
                            Awaiting doctor link
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[#3D3A33] dark:text-[#D1D0C5]">
                      <span className="flex items-center gap-1.5 text-[#66635A] dark:text-[#8E8D85]">
                        <Calendar className="w-3.5 h-3.5" />
                        Date Granted:
                      </span>
                      <span>
                        {new Date(grant.granted_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[#3D3A33] dark:text-[#D1D0C5]">
                      <span className="flex items-center gap-1.5 text-[#66635A] dark:text-[#8E8D85]">
                        <Clock className="w-3.5 h-3.5" />
                        Last Viewed by Doctor:
                      </span>
                      <span className="font-black text-[#264D24] dark:text-[#9BB858]">
                        {grant.last_viewed_at
                          ? new Date(grant.last_viewed_at).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })
                          : 'Never viewed yet'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revoked Grants History */}
      {revokedGrants.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#DCD4C4] dark:border-[#3C4035]">
          <h2 className="text-lg font-black text-[#66635A] dark:text-[#8E8D85]">
            Revoked Access History ({revokedGrants.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {revokedGrants.map(grant => (
              <div
                key={grant.id}
                className="p-4 rounded-2xl bg-[#F9F7F1]/60 dark:bg-[#1A1C17]/60 border border-[#DCD4C4] dark:border-[#32362C] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold line-through text-[#66635A] tracking-wider">
                      {grant.access_code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold">
                      Revoked
                    </span>
                  </div>
                  <div className="text-[11px] text-[#66635A] dark:text-[#8E8D85] mt-0.5">
                    {grant.doctor_name || 'Unlinked'} • Revoked on{' '}
                    {grant.revoked_at
                      ? new Date(grant.revoked_at).toLocaleDateString()
                      : 'Past'}
                  </div>
                </div>

                <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">
                  Dashboard access terminated
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revoke Confirmation Modal */}
      <AnimatePresence>
        {grantToRevoke && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#1D1F1A] rounded-[32px] p-6 sm:p-8 border-2 border-red-500 shadow-2xl space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="serif text-xl sm:text-2xl font-black text-[#141310] dark:text-[#FCFBF7]">
                  Revoke Doctor Access?
                </h3>
                <p className="text-xs sm:text-sm text-[#66635A] dark:text-[#8E8D85] font-bold leading-relaxed">
                  Are you sure you want to revoke code{' '}
                  <strong className="font-mono text-red-600">{grantToRevoke.access_code}</strong>
                  {grantToRevoke.doctor_name ? ` for ${grantToRevoke.doctor_name}` : ''}?
                  This will immediately cut off this doctor’s ability to view the patient tracking dashboard on their next load or refresh.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setGrantToRevoke(null)}
                  disabled={isRevoking}
                  className="flex-1 py-3 rounded-full border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:bg-[#F3EFE6] dark:hover:bg-[#272A22] text-[#141310] dark:text-[#FCFBF7] text-xs font-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRevoke}
                  disabled={isRevoking}
                  className="flex-1 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Ban className="w-4 h-4" />
                  <span>{isRevoking ? 'Revoking...' : 'Confirm Revoke'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
