import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  AppState,
  CaregiverUser,
  PatientProfile,
  FamilyPhoto,
  VoiceNote,
  Reminder,
  SupportContact,
  ActivityLog,
  FamiliarPlace,
  CompanionSettings,
  ActivityType,
} from '../types';

export type AppMode = 'role_select' | 'patient' | 'caregiver';
export type PatientScreen = 'home' | 'who_is_this' | 'sounds_of_home' | 'familiar_places' | 'cognitive_exercises' | 'session_end' | 'family_gallery' | 'reminders';
export type CaregiverTab = 'dashboard' | 'media' | 'reminders' | 'activity_log' | 'support_circle' | 'settings';

interface AppContextType {
  state: AppState | null;
  loading: boolean;
  error: string | null;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  patientScreen: PatientScreen;
  setPatientScreen: (screen: PatientScreen) => void;
  caregiverTab: CaregiverTab;
  setCaregiverTab: (tab: CaregiverTab) => void;
  showDisclaimerModal: boolean;
  setShowDisclaimerModal: (show: boolean) => void;
  showCallModal: boolean;
  setShowCallModal: (show: boolean) => void;
  selectedContactForCall: SupportContact | null;
  setSelectedContactForCall: (contact: SupportContact | null) => void;
  
  // Data actions
  refreshState: () => Promise<void>;
  updateCaregiver: (data: Partial<CaregiverUser>) => Promise<void>;
  updatePatient: (data: Partial<PatientProfile>) => Promise<void>;
  addPhoto: (photo: Partial<FamilyPhoto>) => Promise<FamilyPhoto | null>;
  deletePhoto: (id: string) => Promise<void>;
  addVoiceNote: (voiceNote: Partial<VoiceNote>) => Promise<VoiceNote | null>;
  deleteVoiceNote: (id: string) => Promise<void>;
  addReminder: (reminder: Partial<Reminder>) => Promise<Reminder | null>;
  toggleReminder: (id: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  addSupportContact: (contact: Partial<SupportContact>) => Promise<SupportContact | null>;
  deleteSupportContact: (id: string) => Promise<void>;
  saveActivityLog: (log: {
    activity_type: ActivityType;
    descriptive_note: string;
    positive_count: number;
    total_count: number;
    details?: any;
  }) => Promise<void>;
  updateSettings: (settings: Partial<CompanionSettings>) => Promise<void>;
  resetSeedData: () => Promise<void>;

  // AI Actions
  generateQuestion: (params: {
    person_name?: string;
    relationship?: string;
    language?: string;
    activity_type?: string;
    place_name?: string;
    place_location?: string;
  }) => Promise<string>;
  
  generateFeedback: (params: {
    is_correct: boolean;
    correct_name: string;
    relationship: string;
    language: string;
    activity_type?: string;
  }) => Promise<string>;

  generateSummary: (params: {
    activity_type: ActivityType;
    count: number;
    positive_count: number;
    patient_name: string;
    patient_notes?: string;
  }) => Promise<string>;

  translateText: (text: string, target_language: string) => Promise<string>;

  // Speech & Sound utilities
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  triggerCelebration: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [appMode, setAppMode] = useState<AppMode>('role_select');
  const [patientScreen, setPatientScreen] = useState<PatientScreen>('home');
  const [caregiverTab, setCaregiverTab] = useState<CaregiverTab>('dashboard');
  const [showDisclaimerModal, setShowDisclaimerModal] = useState<boolean>(false);
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [selectedContactForCall, setSelectedContactForCall] = useState<SupportContact | null>(null);

  const refreshState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Failed to load data from server');
      const data = await res.json();
      setState(data);
      setError(null);
    } catch (err: any) {
      console.error('State load error:', err);
      setError(err.message || 'Could not connect to backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Sync twilight mode to body and html class
  useEffect(() => {
    if (state?.settings?.twilightMode) {
      document.documentElement.classList.add('twilight-mode', 'dark');
      document.body.classList.add('twilight-mode', 'dark');
    } else {
      document.documentElement.classList.remove('twilight-mode', 'dark');
      document.body.classList.remove('twilight-mode', 'dark');
    }
  }, [state?.settings?.twilightMode]);

  // Speech synthesis helper
  const speakText = useCallback((text: string) => {
    if (!state?.settings?.speakAudio || !text) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const clean = text.replace(/[#*`_]/g, '');
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = state.settings.pacing === 'gentle_slow' || state.settings.manualTiredMode ? 0.8 : 0.95;
        utterance.pitch = 1.05; // warm, friendly
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  }, [state?.settings?.speakAudio, state?.settings?.pacing, state?.settings?.manualTiredMode]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#D69424', '#295526', '#C56851', '#F4EFEB'],
        disableForReducedMotion: true,
      });
    } catch (err) {
      // ignore in environments without canvas
    }
  }, []);

  // Update caregiver profile
  const updateCaregiver = async (data: Partial<CaregiverUser>) => {
    try {
      const res = await fetch('/api/caregiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setState(prev => prev ? { ...prev, caregiver: updated } : null);
      }
    } catch (err) {
      console.error('Update caregiver error:', err);
    }
  };

  // Update patient profile
  const updatePatient = async (data: Partial<PatientProfile>) => {
    try {
      const res = await fetch('/api/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setState(prev => prev ? { ...prev, patient: updated } : null);
      }
    } catch (err) {
      console.error('Update patient error:', err);
    }
  };

  // Add photo
  const addPhoto = async (photo: Partial<FamilyPhoto>): Promise<FamilyPhoto | null> => {
    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photo),
      });
      if (res.ok) {
        const created = await res.json();
        setState(prev => prev ? { ...prev, photos: [created, ...(prev.photos || [])] } : null);
        return created;
      }
    } catch (err) {
      console.error('Add photo error:', err);
    }
    return null;
  };

  // Delete photo
  const deletePhoto = async (id: string) => {
    try {
      const res = await fetch(`/api/photos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setState(prev => prev ? {
          ...prev,
          photos: (prev.photos || []).filter(p => p.id !== id),
        } : null);
      }
    } catch (err) {
      console.error('Delete photo error:', err);
    }
  };

  // Add voice note
  const addVoiceNote = async (voiceNote: Partial<VoiceNote>): Promise<VoiceNote | null> => {
    try {
      const res = await fetch('/api/voice-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voiceNote),
      });
      if (res.ok) {
        const created = await res.json();
        setState(prev => prev ? { ...prev, voiceNotes: [created, ...(prev.voiceNotes || [])] } : null);
        return created;
      }
    } catch (err) {
      console.error('Add voice note error:', err);
    }
    return null;
  };

  // Delete voice note
  const deleteVoiceNote = async (id: string) => {
    try {
      const res = await fetch(`/api/voice-notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setState(prev => prev ? {
          ...prev,
          voiceNotes: (prev.voiceNotes || []).filter(v => v.id !== id),
        } : null);
      }
    } catch (err) {
      console.error('Delete voice note error:', err);
    }
  };

  // Add reminder
  const addReminder = async (reminder: Partial<Reminder>): Promise<Reminder | null> => {
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminder),
      });
      if (res.ok) {
        const created = await res.json();
        setState(prev => prev ? { ...prev, reminders: [...(prev.reminders || []), created] } : null);
        return created;
      }
    } catch (err) {
      console.error('Add reminder error:', err);
    }
    return null;
  };

  // Toggle reminder
  const toggleReminder = async (id: string) => {
    // Optimistic update
    setState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        reminders: (prev.reminders || []).map(r => r.id === id ? {
          ...r,
          completed_today: !r.completed_today,
          completed_at: !r.completed_today ? new Date().toISOString() : undefined,
        } : r),
      };
    });

    try {
      const res = await fetch(`/api/reminders/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        if (updated.completed_today) {
          triggerCelebration();
        }
      } else {
        refreshState();
      }
    } catch (err) {
      console.error('Toggle reminder error:', err);
      refreshState();
    }
  };

  // Delete reminder
  const deleteReminder = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setState(prev => prev ? {
          ...prev,
          reminders: (prev.reminders || []).filter(r => r.id !== id),
        } : null);
      }
    } catch (err) {
      console.error('Delete reminder error:', err);
    }
  };

  // Add support contact
  const addSupportContact = async (contact: Partial<SupportContact>): Promise<SupportContact | null> => {
    try {
      const res = await fetch('/api/support-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });
      if (res.ok) {
        const created = await res.json();
        setState(prev => prev ? { ...prev, supportContacts: [...(prev.supportContacts || []), created] } : null);
        return created;
      }
    } catch (err) {
      console.error('Add support contact error:', err);
    }
    return null;
  };

  // Delete support contact
  const deleteSupportContact = async (id: string) => {
    try {
      const res = await fetch(`/api/support-contacts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setState(prev => prev ? {
          ...prev,
          supportContacts: (prev.supportContacts || []).filter(s => s.id !== id),
        } : null);
      }
    } catch (err) {
      console.error('Delete contact error:', err);
    }
  };

  // Save activity log
  const saveActivityLog = async (log: {
    activity_type: ActivityType;
    descriptive_note: string;
    positive_count: number;
    total_count: number;
    details?: any;
  }) => {
    try {
      const res = await fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
      if (res.ok) {
        const created = await res.json();
        setState(prev => prev ? { ...prev, activityLogs: [created, ...(prev.activityLogs || [])] } : null);
      }
    } catch (err) {
      console.error('Save activity log error:', err);
    }
  };

  // Update Settings
  const updateSettings = async (settings: Partial<CompanionSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const updated = await res.json();
        setState(prev => prev ? { ...prev, settings: updated } : null);
      }
    } catch (err) {
      console.error('Update settings error:', err);
    }
  };

  // Reset seed data
  const resetSeedData = async () => {
    try {
      const res = await fetch('/api/reset-seed', { method: 'POST' });
      if (res.ok) {
        const fresh = await res.json();
        setState(fresh);
      }
    } catch (err) {
      console.error('Reset seed error:', err);
    }
  };

  // AI: Gentle Question Generation
  const generateQuestion = async (params: {
    person_name?: string;
    relationship?: string;
    language?: string;
    activity_type?: string;
    place_name?: string;
    place_location?: string;
  }): Promise<string> => {
    try {
      const res = await fetch('/api/ai/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person_name: params.person_name,
          relationship: params.relationship,
          language: params.language || state?.patient?.preferred_language || 'English',
          activity_type: params.activity_type,
          place_name: params.place_name,
          place_location: params.place_location,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.question;
      }
    } catch (err) {
      console.error('AI question generation call error:', err);
    }
    return `Do you recognize this warm smile of your ${params.relationship || 'family member'}, ${params.person_name || ''}?`;
  };

  // AI: Encouraging Feedback Generation
  const generateFeedback = async (params: {
    is_correct: boolean;
    correct_name: string;
    relationship: string;
    language: string;
    activity_type?: string;
  }): Promise<string> => {
    try {
      const res = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_correct: params.is_correct,
          correct_name: params.correct_name,
          relationship: params.relationship,
          language: params.language || state?.patient?.preferred_language || 'English',
          activity_type: params.activity_type,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.feedback;
      }
    } catch (err) {
      console.error('AI feedback generation call error:', err);
    }
    return params.is_correct
      ? `Yes, absolutely! That is your wonderful ${params.relationship}, ${params.correct_name}.`
      : `This is your loving ${params.relationship}, ${params.correct_name}, who loves you so dearly.`;
  };

  // AI: Descriptive Summary Generation
  const generateSummary = async (params: {
    activity_type: ActivityType;
    count: number;
    positive_count: number;
    patient_name: string;
    patient_notes?: string;
  }): Promise<string> => {
    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: params.activity_type,
          count: params.count,
          positive_count: params.positive_count,
          patient_name: params.patient_name || state?.patient?.name || 'Ayo',
          patient_notes: params.patient_notes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.summary;
      }
    } catch (err) {
      console.error('AI summary call error:', err);
    }
    return `${params.patient_name} spent peaceful time looking at memories today and engaged comfortably with family moments.`;
  };

  // AI: Multilingual Translation
  const translateText = async (text: string, target_language: string): Promise<string> => {
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target_language }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.translated_text || text;
      }
    } catch (err) {
      console.error('Translation error:', err);
    }
    return text;
  };

  return (
    <AppContext.Provider
      value={{
        state,
        loading,
        error,
        appMode,
        setAppMode,
        patientScreen,
        setPatientScreen,
        caregiverTab,
        setCaregiverTab,
        showDisclaimerModal,
        setShowDisclaimerModal,
        showCallModal,
        setShowCallModal,
        selectedContactForCall,
        setSelectedContactForCall,
        refreshState,
        updateCaregiver,
        updatePatient,
        addPhoto,
        deletePhoto,
        addVoiceNote,
        deleteVoiceNote,
        addReminder,
        toggleReminder,
        deleteReminder,
        addSupportContact,
        deleteSupportContact,
        saveActivityLog,
        updateSettings,
        resetSeedData,
        generateQuestion,
        generateFeedback,
        generateSummary,
        translateText,
        speakText,
        stopSpeaking,
        triggerCelebration,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
