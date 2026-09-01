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
import { INITIAL_APP_STATE } from '../data/seedData';

export type AppMode = 'role_select' | 'patient' | 'caregiver';
export type PatientScreen = 'home' | 'who_is_this' | 'sounds_of_home' | 'familiar_places' | 'cognitive_exercises' | 'session_end' | 'family_gallery' | 'reminders';
export type CaregiverTab = 'dashboard' | 'media' | 'reminders' | 'activity_log' | 'support_circle' | 'settings';

const LOCAL_STORAGE_KEY = 'aapka_saathi_app_state_v1';

const getInitialLocalState = (): AppState => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate that it has the core patient data
      if (parsed && parsed.patient && parsed.photos) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read from local storage:', e);
  }
  return INITIAL_APP_STATE;
};

interface AppContextType {
  state: AppState;
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
  const [state, setState] = useState<AppState>(getInitialLocalState);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [appMode, setAppMode] = useState<AppMode>('role_select');
  const [patientScreen, setPatientScreen] = useState<PatientScreen>('home');
  const [caregiverTab, setCaregiverTab] = useState<CaregiverTab>('dashboard');
  const [showDisclaimerModal, setShowDisclaimerModal] = useState<boolean>(false);
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [selectedContactForCall, setSelectedContactForCall] = useState<SupportContact | null>(null);

  // Sync state to local storage whenever it changes
  useEffect(() => {
    if (state) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn('Failed to save state to localStorage:', e);
      }
    }
  }, [state]);

  const refreshState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        if (data && data.patient) {
          setState(data);
          setError(null);
        }
      }
    } catch (err: any) {
      // Backend not running (e.g. static hosting on Vercel) - smoothly continue with client-side state
      console.log('App running in local/standalone mode with authentic Northeast dataset.');
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
    setState(prev => ({
      ...prev,
      caregiver: { ...prev.caregiver, ...data },
    }));

    try {
      await fetch('/api/caregiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      // Handled locally
    }
  };

  // Update patient profile
  const updatePatient = async (data: Partial<PatientProfile>) => {
    setState(prev => ({
      ...prev,
      patient: { ...prev.patient, ...data },
    }));

    try {
      await fetch('/api/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      // Handled locally
    }
  };

  // Add photo
  const addPhoto = async (photo: Partial<FamilyPhoto>): Promise<FamilyPhoto | null> => {
    const newPhoto: FamilyPhoto = {
      id: `photo-${Date.now()}`,
      patient_id: state.patient?.id || 'pt-1',
      photo_url: photo.photo_url || '',
      person_name: photo.person_name || 'Family Member',
      relationship_label: photo.relationship_label || 'Family',
      notes: photo.notes || '',
      ...photo,
    };

    setState(prev => ({
      ...prev,
      photos: [newPhoto, ...(prev.photos || [])],
    }));

    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photo),
      });
      if (res.ok) {
        const created = await res.json();
        return created;
      }
    } catch (err) {
      // Return local object
    }
    return newPhoto;
  };

  // Delete photo
  const deletePhoto = async (id: string) => {
    setState(prev => ({
      ...prev,
      photos: (prev.photos || []).filter(p => p.id !== id),
    }));

    try {
      await fetch(`/api/photos/${id}`, { method: 'DELETE' });
    } catch (err) {
      // Handled locally
    }
  };

  // Add voice note
  const addVoiceNote = async (voiceNote: Partial<VoiceNote>): Promise<VoiceNote | null> => {
    const newNote: VoiceNote = {
      id: `vn-${Date.now()}`,
      patient_id: state.patient?.id || 'pt-1',
      label: voiceNote.label || 'Voice Note',
      audio_url: voiceNote.audio_url || '',
      duration_sec: voiceNote.duration_sec || 30,
      speaker_name: voiceNote.speaker_name || 'Family Member',
      transcript: voiceNote.transcript || '',
      date_recorded: new Date().toISOString(),
      ...voiceNote,
    };

    setState(prev => ({
      ...prev,
      voiceNotes: [newNote, ...(prev.voiceNotes || [])],
    }));

    try {
      const res = await fetch('/api/voice-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voiceNote),
      });
      if (res.ok) {
        const created = await res.json();
        return created;
      }
    } catch (err) {
      // Handled locally
    }
    return newNote;
  };

  // Delete voice note
  const deleteVoiceNote = async (id: string) => {
    setState(prev => ({
      ...prev,
      voiceNotes: (prev.voiceNotes || []).filter(v => v.id !== id),
    }));

    try {
      await fetch(`/api/voice-notes/${id}`, { method: 'DELETE' });
    } catch (err) {
      // Handled locally
    }
  };

  // Add reminder
  const addReminder = async (reminder: Partial<Reminder>): Promise<Reminder | null> => {
    const newRem: Reminder = {
      id: `rem-${Date.now()}`,
      patient_id: state.patient?.id || 'pt-1',
      time: reminder.time || '10:00 AM',
      label: reminder.label || 'Reminder',
      type: reminder.type || 'routine',
      completed_today: false,
      notes: reminder.notes || '',
      ...reminder,
    };

    setState(prev => ({
      ...prev,
      reminders: [...(prev.reminders || []), newRem],
    }));

    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminder),
      });
      if (res.ok) {
        const created = await res.json();
        return created;
      }
    } catch (err) {
      // Handled locally
    }
    return newRem;
  };

  // Toggle reminder
  const toggleReminder = async (id: string) => {
    let completedNow = false;
    setState(prev => {
      const updatedList = (prev.reminders || []).map(r => {
        if (r.id === id) {
          const nextVal = !r.completed_today;
          if (nextVal) completedNow = true;
          return {
            ...r,
            completed_today: nextVal,
            completed_at: nextVal ? new Date().toISOString() : undefined,
          };
        }
        return r;
      });
      return { ...prev, reminders: updatedList };
    });

    if (completedNow) {
      triggerCelebration();
    }

    try {
      await fetch(`/api/reminders/${id}/toggle`, { method: 'PATCH' });
    } catch (err) {
      // Handled locally
    }
  };

  // Delete reminder
  const deleteReminder = async (id: string) => {
    setState(prev => ({
      ...prev,
      reminders: (prev.reminders || []).filter(r => r.id !== id),
    }));

    try {
      await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
    } catch (err) {
      // Handled locally
    }
  };

  // Add support contact
  const addSupportContact = async (contact: Partial<SupportContact>): Promise<SupportContact | null> => {
    const newContact: SupportContact = {
      id: `sc-${Date.now()}`,
      patient_id: state.patient?.id || 'pt-1',
      name: contact.name || 'Contact',
      phone: contact.phone || '',
      role: contact.role || 'family',
      photo_url: contact.photo_url || '',
      is_primary: contact.is_primary || false,
      notes: contact.notes || '',
      ...contact,
    };

    setState(prev => ({
      ...prev,
      supportContacts: [...(prev.supportContacts || []), newContact],
    }));

    try {
      const res = await fetch('/api/support-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });
      if (res.ok) {
        const created = await res.json();
        return created;
      }
    } catch (err) {
      // Handled locally
    }
    return newContact;
  };

  // Delete support contact
  const deleteSupportContact = async (id: string) => {
    setState(prev => ({
      ...prev,
      supportContacts: (prev.supportContacts || []).filter(s => s.id !== id),
    }));

    try {
      await fetch(`/api/support-contacts/${id}`, { method: 'DELETE' });
    } catch (err) {
      // Handled locally
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
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      patient_id: state.patient?.id || 'pt-1',
      activity_type: log.activity_type,
      timestamp: new Date().toISOString(),
      positive_count: log.positive_count,
      total_count: log.total_count,
      descriptive_note: log.descriptive_note,
      details: log.details,
    };

    setState(prev => ({
      ...prev,
      activityLogs: [newLog, ...(prev.activityLogs || [])],
    }));

    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
    } catch (err) {
      // Handled locally
    }
  };

  // Update Settings
  const updateSettings = async (settings: Partial<CompanionSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch (err) {
      // Handled locally
    }
  };

  // Reset seed data
  const resetSeedData = async () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setState(INITIAL_APP_STATE);

    try {
      await fetch('/api/reset-seed', { method: 'POST' });
    } catch (err) {
      // Handled locally
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
          language: params.language || state.patient?.preferred_language || 'English',
          activity_type: params.activity_type,
          place_name: params.place_name,
          place_location: params.place_location,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.question) return data.question;
      }
    } catch (err) {
      // Use authentic regional fallback
    }

    if (params.place_name) {
      return `Look at this peaceful scene of ${params.place_name}. Does it bring back memories of the misty hillside breezes?`;
    }

    const lang = (params.language || state.patient?.preferred_language || '').toLowerCase();
    if (lang.includes('nagamese')) {
      return `Ayo, etu sundor chehra kune asey? Apnar ${params.relationship || 'ghor manu'}, ${params.person_name || ''} ke yaad asey?`;
    }
    return `Look at this warm smile, Ayo. Do you recognize your ${params.relationship || 'loving family member'}, ${params.person_name || ''}?`;
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
          language: params.language || state.patient?.preferred_language || 'English',
          activity_type: params.activity_type,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.feedback) return data.feedback;
      }
    } catch (err) {
      // Fallback
    }

    const lang = (params.language || state.patient?.preferred_language || '').toLowerCase();
    if (lang.includes('nagamese')) {
      return params.is_correct
        ? `Ekdom thik Ayo! Etu apnar ${params.relationship}, ${params.correct_name} asey. Bahut bhal laagishey!`
        : `Etu apnar bhal pawa ${params.relationship}, ${params.correct_name} asey, juntu apnake sadai yaad karey.`;
    }

    return params.is_correct
      ? `Yes, wonderful Ayo! That is indeed your ${params.relationship}, ${params.correct_name}.`
      : `This is your loving ${params.relationship}, ${params.correct_name}, who cherishes you so dearly.`;
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
          patient_name: params.patient_name || state.patient?.name || 'Ayo',
          patient_notes: params.patient_notes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.summary) return data.summary;
      }
    } catch (err) {
      // Fallback
    }
    return `${params.patient_name || 'Ayo'} spent peaceful time looking at memories today and engaged with heartwarming comfort throughout the session.`;
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
        if (data && data.translated_text) return data.translated_text;
      }
    } catch (err) {
      // Fallback to source
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

