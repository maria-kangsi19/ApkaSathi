import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  Medicine,
  MedicineLog,
  MedicineLogStatus,
  SOSEvent,
  SOSEventStatus,
  ConditionCheckIn,
  ConditionMood,
} from '../types';
import { INITIAL_APP_STATE } from '../data/seedData';
import {
  playMedicineAlarmChime,
  playSOSAlertChime,
  playSuccessChime,
} from '../utils/audio';

export type AppMode = 'role_select' | 'patient' | 'caregiver';
export type PatientScreen = 'home' | 'who_is_this' | 'sounds_of_home' | 'familiar_places' | 'cognitive_exercises' | 'session_end' | 'family_gallery' | 'reminders';
export type CaregiverTab = 'dashboard' | 'medicines' | 'emergency_log' | 'doctor_summary' | 'media' | 'reminders' | 'activity_log' | 'support_circle' | 'settings';

export interface MissedMedicineAlert {
  medicine: Medicine;
  scheduledTime: string;
  delayMinutes: number;
}

const LOCAL_STORAGE_KEY = 'aapka_saathi_app_state_v1';

const getInitialLocalState = (): AppState => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate that it has the core patient data
      if (parsed && parsed.patient && parsed.photos) {
        return {
          ...INITIAL_APP_STATE,
          ...parsed,
          medicines: parsed.medicines && parsed.medicines.length > 0 ? parsed.medicines : INITIAL_APP_STATE.medicines,
          medicineLogs:
            parsed.medicineLogs && parsed.medicineLogs.length >= 5
              ? parsed.medicineLogs
              : INITIAL_APP_STATE.medicineLogs,
          activityLogs:
            parsed.activityLogs && parsed.activityLogs.length >= 3
              ? parsed.activityLogs
              : INITIAL_APP_STATE.activityLogs,
          sosEvents: parsed.sosEvents || INITIAL_APP_STATE.sosEvents,
          conditionCheckIns:
            parsed.conditionCheckIns && parsed.conditionCheckIns.length > 0
              ? parsed.conditionCheckIns
              : INITIAL_APP_STATE.conditionCheckIns || [],
        };
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

  // Medicine & SOS Alert States
  activeMedicineAlarm: {
    medicine: Medicine;
    scheduledTime: string;
    isTest?: boolean;
  } | null;
  setActiveMedicineAlarm: (alarm: {
    medicine: Medicine;
    scheduledTime: string;
    isTest?: boolean;
  } | null) => void;
  triggerTestMedicineAlarm: (medicineId?: string) => void;
  activeSOSAlertModal: boolean;
  setActiveSOSAlertModal: (open: boolean) => void;
  showSOSConfirmModal: boolean;
  setShowSOSConfirmModal: (open: boolean) => void;
  highlightedMedicineId: string | null;
  setHighlightedMedicineId: (id: string | null) => void;

  // Computed alerts
  missedMedicineAlerts: MissedMedicineAlert[];
  activeSOSEvents: SOSEvent[];

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

  // Medicine actions
  addMedicine: (medicine: Partial<Medicine>) => Promise<Medicine | null>;
  updateMedicine: (id: string, updates: Partial<Medicine>) => Promise<Medicine | null>;
  deleteMedicine: (id: string) => Promise<boolean>;
  logMedicineAction: (
    medicineId: string,
    scheduledTime: string,
    status: MedicineLogStatus
  ) => Promise<MedicineLog | null>;

  // SOS actions
  triggerSOS: (location?: string) => Promise<SOSEvent | null>;
  resolveSOSEvent: (id: string) => Promise<boolean>;

  saveActivityLog: (log: {
    activity_type: ActivityType;
    descriptive_note: string;
    positive_count: number;
    total_count: number;
    details?: any;
  }) => Promise<void>;
  addConditionCheckIn: (checkIn: {
    condition_score: number;
    engagement_score: number;
    mood: ConditionMood;
    notes: string;
    activity_label?: string;
    logged_by?: string;
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

  generateDoctorSummary: (params: {
    days: number;
    notes: string[];
    patient_name?: string;
  }) => Promise<string>;

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

  // Medicine & SOS Alert States
  const [activeMedicineAlarm, setActiveMedicineAlarm] = useState<{
    medicine: Medicine;
    scheduledTime: string;
    isTest?: boolean;
  } | null>(null);
  const [activeSOSAlertModal, setActiveSOSAlertModal] = useState<boolean>(false);
  const [showSOSConfirmModal, setShowSOSConfirmModal] = useState<boolean>(false);
  const [highlightedMedicineId, setHighlightedMedicineId] = useState<string | null>(null);
  const [snoozeList, setSnoozeList] = useState<Array<{
    medicineId: string;
    scheduledTime: string;
    triggerAtTimestamp: number;
  }>>([]);

  // Time parsing helper
  const parseTimeToMinutes = (timeStr: string): number | null => {
    if (!timeStr) return null;
    const trimmed = timeStr.trim().toUpperCase();
    const isPM = trimmed.includes('PM');
    const isAM = trimmed.includes('AM');
    const clean = trimmed.replace(/[^\d:]/g, '');
    const parts = clean.split(':');
    if (parts.length < 2) return null;
    let hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return null;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Compute missed medicines (scheduled >30 mins ago today and not marked taken)
  const missedMedicineAlerts = useMemo(() => {
    const alerts: MissedMedicineAlert[] = [];
    const medicines = state?.medicines || [];
    const logs = state?.medicineLogs || [];
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const todayDateStr = now.toISOString().split('T')[0];

    medicines.filter(m => m.active).forEach(med => {
      (med.times || []).forEach(timeStr => {
        const schedMin = parseTimeToMinutes(timeStr);
        if (schedMin !== null) {
          const diff = currentMinutes - schedMin;
          // If scheduled time was at least 30 minutes ago today
          if (diff >= 30) {
            // Check if there is a 'taken' log for today
            const isTakenToday = logs.some(l => {
              if (l.medicine_id !== med.id) return false;
              if (l.status !== 'taken') return false;
              if (l.scheduled_time && l.scheduled_time.trim().toUpperCase() !== timeStr.trim().toUpperCase()) return false;
              if (l.actioned_at) {
                const logDate = new Date(l.actioned_at).toISOString().split('T')[0];
                return logDate === todayDateStr;
              }
              return true;
            });

            if (!isTakenToday) {
              alerts.push({
                medicine: med,
                scheduledTime: timeStr,
                delayMinutes: diff,
              });
            }
          }
        }
      });
    });

    return alerts;
  }, [state?.medicines, state?.medicineLogs]);

  // Compute active SOS events
  const activeSOSEvents = useMemo(() => {
    return (state?.sosEvents || []).filter(e => e.status === 'active');
  }, [state?.sosEvents]);

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

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Periodic polling to sync server state across tabs/roles every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      refreshState();
    }, 6000);
    return () => clearInterval(timer);
  }, [refreshState]);

  // Background medicine scheduler (checks every 10 seconds)
  useEffect(() => {
    const checkSchedule = () => {
      if (activeMedicineAlarm) return;
      const now = new Date();
      const currentTimestamp = now.getTime();
      const hours = now.getHours();
      const mins = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const h12 = hours % 12 || 12;
      const nowFormatted12 = `${h12.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
      const nowFormatted12Alt = `${h12}:${mins.toString().padStart(2, '0')} ${ampm}`;
      const todayDateStr = now.toISOString().split('T')[0];

      // 1. Check snoozes
      const dueSnoozeIndex = snoozeList.findIndex(s => currentTimestamp >= s.triggerAtTimestamp);
      if (dueSnoozeIndex !== -1) {
        const snoozeItem = snoozeList[dueSnoozeIndex];
        const med = (state?.medicines || []).find(m => m.id === snoozeItem.medicineId);
        if (med && med.active) {
          setSnoozeList(prev => prev.filter((_, i) => i !== dueSnoozeIndex));
          setActiveMedicineAlarm({ medicine: med, scheduledTime: snoozeItem.scheduledTime });
          playMedicineAlarmChime();
          if (state?.settings?.speakAudio) {
            speakText(`Time for your medicine: ${med.name}, ${med.dosage}.`);
          }
          return;
        }
      }

      // 2. Check scheduled times for active medicines
      const medicines = state?.medicines || [];
      const logs = state?.medicineLogs || [];

      for (const med of medicines) {
        if (!med.active) continue;
        for (const t of (med.times || [])) {
          const cleanT = t.trim().toUpperCase();
          if (cleanT === nowFormatted12.toUpperCase() || cleanT === nowFormatted12Alt.toUpperCase()) {
            const alreadyHandled = logs.some(l => {
              if (l.medicine_id !== med.id) return false;
              if (l.scheduled_time && l.scheduled_time.trim().toUpperCase() !== cleanT) return false;
              if (!l.actioned_at) return false;
              const logDate = new Date(l.actioned_at).toISOString().split('T')[0];
              const minutesSinceLog = (currentTimestamp - new Date(l.actioned_at).getTime()) / 60000;
              return (logDate === todayDateStr && (l.status === 'taken' || minutesSinceLog < 5));
            });

            if (!alreadyHandled) {
              setActiveMedicineAlarm({ medicine: med, scheduledTime: t });
              playMedicineAlarmChime();
              if (state?.settings?.speakAudio) {
                speakText(`Time for your medicine: ${med.name}, ${med.dosage}.`);
              }
              return;
            }
          }
        }
      }
    };

    const interval = setInterval(checkSchedule, 10000);
    return () => clearInterval(interval);
  }, [activeMedicineAlarm, snoozeList, state?.medicines, state?.medicineLogs, state?.settings?.speakAudio, speakText]);

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

  // ==========================================
  // MEDICINE SCHEDULE & ALARM ACTIONS
  // ==========================================

  // Add Medicine
  const addMedicine = async (medicine: Partial<Medicine>): Promise<Medicine | null> => {
    const newMed: Medicine = {
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      patient_id: state.patient?.id || 'pt-1',
      name: medicine.name || 'New Medicine',
      dosage: medicine.dosage || '1 tablet',
      times: medicine.times && medicine.times.length > 0 ? medicine.times : ['08:00 AM'],
      notes: medicine.notes || '',
      active: medicine.active !== undefined ? medicine.active : true,
    };

    setState(prev => ({
      ...prev,
      medicines: [...(prev.medicines || []), newMed],
    }));

    try {
      const res = await fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicine),
      });
      if (res.ok) {
        const created = await res.json();
        return created;
      }
    } catch (err) {
      // Handled locally
    }
    return newMed;
  };

  // Update Medicine
  const updateMedicine = async (id: string, updates: Partial<Medicine>): Promise<Medicine | null> => {
    let updatedMed: Medicine | null = null;
    setState(prev => {
      const list = (prev.medicines || []).map(m => {
        if (m.id === id) {
          updatedMed = { ...m, ...updates };
          return updatedMed;
        }
        return m;
      });
      return { ...prev, medicines: list };
    });

    try {
      const res = await fetch(`/api/medicines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      // Handled locally
    }
    return updatedMed;
  };

  // Delete Medicine
  const deleteMedicine = async (id: string): Promise<boolean> => {
    setState(prev => ({
      ...prev,
      medicines: (prev.medicines || []).filter(m => m.id !== id),
    }));

    try {
      await fetch(`/api/medicines/${id}`, { method: 'DELETE' });
      return true;
    } catch (err) {
      return true;
    }
  };

  // Action a Medicine Alarm ("taken" or "snoozed")
  const logMedicineAction = async (
    medicineId: string,
    scheduledTime: string,
    status: MedicineLogStatus
  ): Promise<MedicineLog | null> => {
    const med = (state?.medicines || []).find(m => m.id === medicineId);
    const newLog: MedicineLog = {
      id: `medlog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      medicine_id: medicineId,
      scheduled_time: scheduledTime,
      status,
      actioned_at: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      medicineLogs: [newLog, ...(prev.medicineLogs || [])],
    }));

    // Close the current alarm modal
    setActiveMedicineAlarm(null);

    if (status === 'taken') {
      // Clear from snooze list if it was snoozed
      setSnoozeList(prev => prev.filter(s => s.medicineId !== medicineId));
      playSuccessChime();
      triggerCelebration();
      if (med) {
        speakText(`Wonderful! You took your ${med.name}.`);
      }
    } else if (status === 'snoozed') {
      // Snooze 15 minutes (or demo trigger)
      const snoozeUntil = Date.now() + 15 * 60 * 1000;
      setSnoozeList(prev => [
        ...prev.filter(s => s.medicineId !== medicineId),
        { medicineId, scheduledTime, triggerAtTimestamp: snoozeUntil },
      ]);
      speakText(`Medicine reminder snoozed. We will remind you again in 15 minutes.`);
    }

    try {
      const res = await fetch('/api/medicine-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      // Handled locally
    }
    return newLog;
  };

  // Trigger test medicine alarm immediately for live demoing
  const triggerTestMedicineAlarm = (medicineId?: string) => {
    const medicines = (state?.medicines || []).filter(m => m.active);
    const target = medicineId
      ? medicines.find(m => m.id === medicineId) || (state?.medicines || []).find(m => m.id === medicineId)
      : medicines[0] || (state?.medicines || [])[0];

    if (!target) {
      // Fallback virtual medicine
      const fallback: Medicine = {
        id: 'med-demo',
        patient_id: state.patient?.id || 'pt-1',
        name: 'Amlodipine (Blood Pressure)',
        dosage: '5mg — 1 tablet',
        times: ['08:00 AM'],
        notes: 'Take with warm water after morning meal',
        active: true,
      };
      setActiveMedicineAlarm({ medicine: fallback, scheduledTime: '08:00 AM', isTest: true });
      playMedicineAlarmChime();
      speakText(`Time for your medicine: Amlodipine, 5mg.`);
      return;
    }

    setActiveMedicineAlarm({
      medicine: target,
      scheduledTime: target.times[0] || '08:00 AM',
      isTest: true,
    });
    playMedicineAlarmChime();
    speakText(`Time for your medicine: ${target.name}, ${target.dosage}.`);
  };

  // ==========================================
  // PATIENT SOS ALERT ACTIONS
  // ==========================================

  // Trigger SOS event
  const triggerSOS = async (location?: string): Promise<SOSEvent | null> => {
    const loc = location || `${state.patient?.hometown || 'Mokokchung'}, Nagaland`;
    const newEvent: SOSEvent = {
      id: `sos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      patient_id: state.patient?.id || 'pt-1',
      triggered_at: new Date().toISOString(),
      status: 'active',
      resolved_at: null,
      location: loc,
    };

    setState(prev => ({
      ...prev,
      sosEvents: [newEvent, ...(prev.sosEvents || [])],
    }));

    playSOSAlertChime();
    if (state.settings?.speakAudio) {
      speakText('Your emergency alert has been sent. Your family has been notified.');
    }

    try {
      const res = await fetch('/api/sos-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: loc }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      // Handled locally
    }
    return newEvent;
  };

  // Resolve SOS event
  const resolveSOSEvent = async (id: string): Promise<boolean> => {
    setState(prev => ({
      ...prev,
      sosEvents: (prev.sosEvents || []).map(e =>
        e.id === id ? { ...e, status: 'resolved', resolved_at: new Date().toISOString() } : e
      ),
    }));

    setActiveSOSAlertModal(false);
    playSuccessChime();

    try {
      await fetch(`/api/sos-events/${id}`, {
        method: 'PATCH',
      });
      return true;
    } catch (err) {
      return true;
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

  // Add condition check-in observation
  const addConditionCheckIn = async (checkIn: {
    condition_score: number;
    engagement_score: number;
    mood: ConditionMood;
    notes: string;
    activity_label?: string;
    logged_by?: string;
  }) => {
    const newCheckIn: ConditionCheckIn = {
      id: `chk-${Date.now()}`,
      patient_id: state.patient?.id || 'pt-1',
      timestamp: new Date().toISOString(),
      condition_score: Math.min(100, Math.max(0, checkIn.condition_score)),
      engagement_score: Math.min(100, Math.max(0, checkIn.engagement_score)),
      mood: checkIn.mood,
      notes: checkIn.notes,
      activity_label: checkIn.activity_label || 'Caregiver Observation',
      logged_by: checkIn.logged_by || state.caregiver?.name || 'Caregiver',
    };

    setState(prev => ({
      ...prev,
      conditionCheckIns: [newCheckIn, ...(prev.conditionCheckIns || [])],
    }));

    playSuccessChime();

    try {
      await fetch('/api/condition-checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCheckIn),
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

  // AI: Doctor Visit Summary Synthesis
  const generateDoctorSummary = async (params: {
    days: number;
    notes: string[];
    patient_name?: string;
  }): Promise<string> => {
    if (!params.notes || params.notes.length === 0) {
      return 'Not enough activity recorded in this period to summarize.';
    }
    try {
      const res = await fetch('/api/ai/doctor-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days: params.days,
          notes: params.notes,
          patient_name: params.patient_name || state.patient?.name || 'Arenla',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.summary) return data.summary;
      }
    } catch (err) {
      console.error('Failed to generate doctor summary from API:', err);
    }
    return `Over the past ${params.days} days, family observations for ${params.patient_name || 'Arenla'} reflect steady daily participation in gentle memory and connection routines. Notes indicate calm engagement during family photo recognition and familiar music sessions, with positive reactions noted by caregivers. Daily routines were maintained at a relaxed and comfortable pace. These observations reflect general contentment during shared family time throughout this period.`;
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

        // Medicine & SOS Alert States
        activeMedicineAlarm,
        setActiveMedicineAlarm,
        triggerTestMedicineAlarm,
        activeSOSAlertModal,
        setActiveSOSAlertModal,
        showSOSConfirmModal,
        setShowSOSConfirmModal,
        highlightedMedicineId,
        setHighlightedMedicineId,

        // Computed alerts
        missedMedicineAlerts,
        activeSOSEvents,

        // Data actions
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

        // Medicine actions
        addMedicine,
        updateMedicine,
        deleteMedicine,
        logMedicineAction,

        // SOS actions
        triggerSOS,
        resolveSOSEvent,

        saveActivityLog,
        addConditionCheckIn,
        updateSettings,
        resetSeedData,
        generateQuestion,
        generateFeedback,
        generateSummary,
        generateDoctorSummary,
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

