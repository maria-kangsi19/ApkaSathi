export type Community = 'Naga' | 'Khasi' | 'Mizo' | 'Assamese' | 'Manipuri' | 'Tripuri' | 'Other';

export interface CaregiverUser {
  id: string;
  name: string;
  phone_number: string;
  relationship_to_patient: string;
}

export interface PatientProfile {
  id: string;
  caregiver_id: string;
  name: string;
  nickname?: string;
  age: number;
  profile_photo_url: string;
  community: Community;
  preferred_language: string;
  hometown?: string;
  caregiver_notes?: string;
}

export interface FamilyPhoto {
  id: string;
  patient_id: string;
  photo_url: string;
  person_name: string;
  relationship_label: string;
  audio_url?: string;
  notes?: string;
  is_preset?: boolean;
}

export interface VoiceNote {
  id: string;
  patient_id: string;
  audio_url: string;
  label: string;
  transcript?: string;
  speaker_name?: string;
  duration_sec?: number;
  date_recorded?: string;
}

export type ReminderType = 'medicine' | 'hydration' | 'meal' | 'appointment' | 'routine';

export interface Reminder {
  id: string;
  patient_id: string;
  type: ReminderType;
  time: string;
  label: string;
  completed_today: boolean;
  notes?: string;
  completed_at?: string;
}

export type SupportRole = 'family' | 'community health worker' | 'neighbor' | 'doctor' | 'other';

export interface SupportContact {
  id: string;
  patient_id: string;
  name: string;
  phone: string;
  role: SupportRole;
  photo_url?: string;
  is_primary?: boolean;
  notes?: string;
}

export type ActivityType = 'who_is_this' | 'sounds_of_home' | 'familiar_places' | 'cognitive_exercises';

export interface ActivityLog {
  id: string;
  patient_id: string;
  activity_type: ActivityType;
  timestamp: string;
  descriptive_note: string;
  positive_count?: number;
  total_count?: number;
  details?: {
    items_shown?: string[];
    observations?: string[];
  };
}

export interface FamiliarPlace {
  id: string;
  patient_id: string;
  name: string;
  location: string;
  photo_url: string;
  prompt_clue: string;
  memory_fact: string;
}

export interface CompanionSettings {
  pacing: 'gentle_slow' | 'standard';
  twilightMode: boolean;
  speakAudio: boolean;
  language: string;
  manualTiredMode: boolean;
  soundEffects: boolean;
}

export interface AppState {
  caregiver: CaregiverUser;
  patient: PatientProfile;
  photos: FamilyPhoto[];
  voiceNotes: VoiceNote[];
  reminders: Reminder[];
  supportContacts: SupportContact[];
  activityLogs: ActivityLog[];
  familiarPlaces: FamiliarPlace[];
  settings: CompanionSettings;
}
