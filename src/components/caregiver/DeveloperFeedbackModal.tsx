import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MessageSquarePlus,
  Send,
  Lightbulb,
  HeartHandshake,
  Globe,
  Pill,
  Bug,
  Sparkles,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FeedbackCategory, FeedbackPriority } from '../../types';

export const DeveloperFeedbackModal: React.FC = () => {
  const { isFeedbackModalOpen, setIsFeedbackModalOpen, submitDeveloperFeedback, state } = useApp();

  const [category, setCategory] = useState<FeedbackCategory>('feature_suggestion');
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [priority, setPriority] = useState<FeedbackPriority>('helpful');
  const [caregiverName, setCaregiverName] = useState(state?.caregiver?.name || 'Caregiver');
  const [caregiverContact, setCaregiverContact] = useState(
    state?.caregiver?.phone || state?.caregiver?.phone_number || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isFeedbackModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !details.trim()) return;

    setIsSubmitting(true);
    try {
      await submitDeveloperFeedback({
        caregiver_id: state?.caregiver?.id || 'cg-1',
        caregiver_name: caregiverName.trim() || 'Caregiver',
        caregiver_contact: caregiverContact.trim(),
        category,
        topic: topic.trim(),
        details: details.trim(),
        priority,
        app_version: 'v1.4 (North East India Edition)',
        system_info: {
          screen_size: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Standard',
          language: state?.patient?.preferred_language || 'Nagamese / English',
        },
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setTopic('');
        setDetails('');
        setIsFeedbackModalOpen(false);
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsFeedbackModalOpen(false);
      setSubmitted(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#DCD4C4] dark:border-[#3C4035] flex items-center justify-between bg-[#F8F5EE] dark:bg-[#242721]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#183C17] text-white">
                <MessageSquarePlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#141310] dark:text-[#FCFBF7]">
                  Suggest an App Improvement
                </h3>
                <p className="text-[11px] text-[#6E6A60] dark:text-[#B3AFA5]">
                  Direct message to the Aapka Saathi developer team
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#545048] dark:text-[#B3AFA5] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <div className="p-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#E4EFE0] dark:bg-[#242E18] text-[#183C17] dark:text-[#8DA850] flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-[#141310] dark:text-[#FCFBF7]">
                Thank You for Helping Us Improve!
              </h4>
              <p className="text-xs text-[#545048] dark:text-[#B3AFA5] max-w-md mx-auto">
                Your suggestion has been logged and sent to the developers. We deeply value your daily caregiving perspective.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Category Pills */}
              <div>
                <label className="block font-black uppercase text-[10px] tracking-wider text-[#706B61] dark:text-[#A8A499] mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: 'feature_suggestion', label: 'Feature Idea', icon: Lightbulb },
                    { id: 'elder_comfort', label: 'Elder Comfort', icon: HeartHandshake },
                    { id: 'cultural_languages', label: 'Languages & Songs', icon: Globe },
                    { id: 'medicines_routines', label: 'Medicines', icon: Pill },
                    { id: 'issue_bug', label: 'Report Glitch', icon: Bug },
                    { id: 'general_appreciation', label: 'Feedback', icon: Sparkles },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as FeedbackCategory)}
                        className={`flex items-center gap-1.5 p-2 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#183C17] text-white border-[#183C17]'
                            : 'bg-white dark:bg-[#252820] text-[#3D3A33] dark:text-[#D1D0C5] border-[#DCD4C4] dark:border-[#3C4035]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label
                  htmlFor="quick-feedback-topic"
                  className="block font-black uppercase text-[10px] tracking-wider text-[#706B61] dark:text-[#A8A499] mb-1"
                >
                  Topic or Summary *
                </label>
                <input
                  id="quick-feedback-topic"
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Larger buttons for dementia interaction, or Bihu folk song"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#252820] text-[#141310] dark:text-[#FCFBF7] font-medium outline-none focus:border-[#183C17]"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="quick-feedback-details"
                  className="block font-black uppercase text-[10px] tracking-wider text-[#706B61] dark:text-[#A8A499] mb-1"
                >
                  Details & Observations *
                </label>
                <textarea
                  id="quick-feedback-details"
                  required
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Explain how this suggestion would help your elder or details of any problem you faced..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#252820] text-[#141310] dark:text-[#FCFBF7] font-medium outline-none focus:border-[#183C17] leading-relaxed resize-y"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block font-black uppercase text-[10px] tracking-wider text-[#706B61] dark:text-[#A8A499] mb-1">
                  Daily Care Impact
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'standard', label: 'Nice to have' },
                    { id: 'helpful', label: 'Helpful for daily care' },
                    { id: 'urgent', label: 'Important issue' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id as FeedbackPriority)}
                      className={`flex-1 py-1.5 px-2 text-center rounded-lg border font-bold text-[11px] transition-colors cursor-pointer ${
                        priority === p.id
                          ? 'bg-[#183C17] text-white border-[#183C17]'
                          : 'bg-white dark:bg-[#252820] text-[#545048] dark:text-[#B3AFA5] border-[#DCD4C4] dark:border-[#3C4035]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caregiver Name & Contact */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-[#706B61] dark:text-[#A8A499] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={caregiverName}
                    onChange={(e) => setCaregiverName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#252820] text-[#141310] dark:text-[#FCFBF7] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#706B61] dark:text-[#A8A499] mb-1">
                    Phone or Email
                  </label>
                  <input
                    type="text"
                    value={caregiverContact}
                    onChange={(e) => setCaregiverContact(e.target.value)}
                    placeholder="Optional follow-up"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#252820] text-[#141310] dark:text-[#FCFBF7] font-medium"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCD4C4] dark:border-[#3C4035]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-full font-bold text-[#545048] dark:text-[#B3AFA5] hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !topic.trim() || !details.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#183C17] hover:bg-[#112B10] disabled:bg-[#8A9689] text-white font-black shadow-md cursor-pointer transition-all"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to Developers</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
