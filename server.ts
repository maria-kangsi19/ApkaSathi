import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

// Initialize Gemini client lazily or safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Initial seed data reflecting a North Eastern Indian family
const INITIAL_SEED_DATA = {
  caregiver: {
    id: 'cg-1',
    name: 'Moa Jamir',
    phone_number: '+91 98621 54321',
    relationship_to_patient: 'Son / Primary Caregiver',
  },
  patient: {
    id: 'pt-1',
    caregiver_id: 'cg-1',
    name: 'Arenla Ao',
    nickname: 'Ayo (Grandmother)',
    age: 76,
    profile_photo_url: '/src/assets/images/northeast_elderly_grandmother_1788273820405.jpg',
    community: 'Naga',
    preferred_language: 'Nagamese / English',
    hometown: 'Mokokchung, Nagaland',
    caregiver_notes: 'Loves traditional Naga folk melodies, enjoys sitting by the veranda looking at the orchids. Speaks Nagamese and English.',
  },
  photos: [
    {
      id: 'photo-1',
      patient_id: 'pt-1',
      photo_url: '/src/assets/images/northeast_son_caregiver_1788273841141.jpg',
      person_name: 'Moa',
      relationship_label: 'Your loving son',
      notes: 'Moa who brings you morning Assam tea and fresh oranges.',
      audio_url: '',
      is_preset: true,
    },
    {
      id: 'photo-2',
      patient_id: 'pt-1',
      photo_url: '/src/assets/images/northeast_granddaughter_1788273863871.jpg',
      person_name: 'Sentila',
      relationship_label: 'Your granddaughter',
      notes: 'Sentila who studies in Dimapur and loves singing hymns with you.',
      audio_url: '',
      is_preset: true,
    },
    {
      id: 'photo-3',
      patient_id: 'pt-1',
      photo_url: '/src/assets/images/northeast_brother_uncle_1788273884571.jpg',
      person_name: 'Imti Longchar',
      relationship_label: 'Your younger brother',
      notes: 'Imti from Ungma village who always brings bamboo shoot pickles.',
      audio_url: '',
      is_preset: true,
    },
    {
      id: 'photo-4',
      patient_id: 'pt-1',
      photo_url: '/src/assets/images/northeast_daughter_in_law_1788273903280.jpg',
      person_name: 'Aienla',
      relationship_label: 'Your daughter-in-law',
      notes: 'Aienla who weaves lovely traditional shawls and cooks your favourite stew.',
      audio_url: '',
      is_preset: true,
    },
  ],
  voiceNotes: [
    {
      id: 'vn-1',
      patient_id: 'pt-1',
      audio_url: '', // synthesizer/speech fallback or custom audio
      label: 'Morning Greeting from Sentila',
      speaker_name: 'Sentila (Granddaughter)',
      transcript: 'Good morning Ayo! May your day be blessed with sunshine and sweet tea. I love you!',
      duration_sec: 12,
      date_recorded: new Date().toISOString(),
    },
    {
      id: 'vn-2',
      patient_id: 'pt-1',
      audio_url: '',
      label: 'Village Church Hymn Melody',
      speaker_name: 'Moa (Son)',
      transcript: 'Singing gentle hills hymn: "How great Thou art" hummed warmly.',
      duration_sec: 24,
      date_recorded: new Date().toISOString(),
    },
    {
      id: 'vn-3',
      patient_id: 'pt-1',
      audio_url: '',
      label: 'Tea Time Reminder & Laughter',
      speaker_name: 'Aienla (Daughter-in-law)',
      transcript: 'Ayo, the kettle is whistling on the fire stove. Time for warm ginger tea!',
      duration_sec: 15,
      date_recorded: new Date().toISOString(),
    },
  ],
  reminders: [
    {
      id: 'rem-1',
      patient_id: 'pt-1',
      type: 'meal',
      time: '08:00 AM',
      label: 'Morning Warm Tea & Rice Cake',
      completed_today: true,
      notes: 'Loves Lal Cha with a pinch of cardamom and warm steamed rice cake.',
      completed_at: new Date().toISOString(),
    },
    {
      id: 'rem-2',
      patient_id: 'pt-1',
      type: 'medicine',
      time: '09:00 AM',
      label: 'Morning Blood Pressure Tablet',
      completed_today: true,
      notes: 'Small white pill after breakfast with half a glass of warm water.',
      completed_at: new Date().toISOString(),
    },
    {
      id: 'rem-3',
      patient_id: 'pt-1',
      type: 'hydration',
      time: '11:30 AM',
      label: 'Sip Fresh Water & Sit in Garden',
      completed_today: false,
      notes: 'Gentle hydration while watching the green hills from veranda.',
    },
    {
      id: 'rem-4',
      patient_id: 'pt-1',
      type: 'routine',
      time: '04:30 PM',
      label: 'Gentle Veranda Walk & Hymn Listening',
      completed_today: false,
      notes: 'Walking 10 minutes near the potted orchids in the courtyard.',
    },
    {
      id: 'rem-5',
      patient_id: 'pt-1',
      type: 'medicine',
      time: '08:30 PM',
      label: 'Night Calcium & Vitamin Tablet',
      completed_today: false,
      notes: 'Taken after evening dinner.',
    },
  ],
  supportContacts: [
    {
      id: 'sc-1',
      patient_id: 'pt-1',
      name: 'Moa Jamir (Son)',
      phone: '+91 98621 54321',
      role: 'family',
      photo_url: '/src/assets/images/northeast_son_caregiver_1788273841141.jpg',
      is_primary: true,
      notes: 'Lives in the same house. First person to call.',
    },
    {
      id: 'sc-2',
      patient_id: 'pt-1',
      name: 'Lipokla (ASHA Worker)',
      phone: '+91 94360 12890',
      role: 'community health worker',
      photo_url: '/src/assets/images/northeast_asha_worker_1788273924498.jpg',
      is_primary: false,
      notes: 'Visits every Tuesday for routine vitals and friendly chat.',
    },
    {
      id: 'sc-3',
      patient_id: 'pt-1',
      name: 'Sentila (Granddaughter)',
      phone: '+91 97740 98123',
      role: 'family',
      photo_url: '/src/assets/images/northeast_granddaughter_1788273863871.jpg',
      is_primary: false,
      notes: 'Available on video calls and phone every afternoon.',
    },
    {
      id: 'sc-4',
      patient_id: 'pt-1',
      name: 'Dr. T. Jamir (Family Doctor)',
      phone: '+91 94360 55432',
      role: 'doctor',
      photo_url: '/src/assets/images/northeast_doctor_1788273951193.jpg',
      is_primary: false,
      notes: 'District Hospital Mokokchung Clinic.',
    },
  ],
  activityLogs: [
    {
      id: 'log-1',
      patient_id: 'pt-1',
      activity_type: 'who_is_this',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      descriptive_note: 'Arenla warmly recognized photos of Moa and Sentila, smiling gently when talking about village memories.',
      positive_count: 3,
      total_count: 4,
    },
    {
      id: 'log-2',
      patient_id: 'pt-1',
      activity_type: 'sounds_of_home',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      descriptive_note: 'Listened attentively to the church hymn voice note and hummed along with a peaceful expression.',
      positive_count: 2,
      total_count: 2,
    },
  ],
  familiarPlaces: [
    {
      id: 'fp-1',
      patient_id: 'pt-1',
      name: 'Mokokchung Town & Hills',
      location: 'Mokokchung, Nagaland',
      photo_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80',
      prompt_clue: 'The misty blue hills where the morning roosters call across the pine trees.',
      memory_fact: 'Where the family home has stood for over forty years.',
    },
    {
      id: 'fp-2',
      patient_id: 'pt-1',
      name: 'Village Baptist Church',
      location: 'Ungma Village',
      photo_url: 'https://images.unsplash.com/photo-1548625361-195feee8233f?auto=format&fit=crop&w=600&q=80',
      prompt_clue: 'The wooden church with the white steeple where Sunday hymns fill the morning air.',
      memory_fact: 'Where you loved singing in the choir during Easter and Christmas.',
    },
    {
      id: 'fp-3',
      patient_id: 'pt-1',
      name: 'The Veranda & Orchid Garden',
      location: 'Family Home',
      photo_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
      prompt_clue: 'The peaceful wooden porch with yellow wild orchids hanging in bamboo pots.',
      memory_fact: 'Your favourite spot for enjoying warm ginger tea in the golden afternoon light.',
    },
    {
      id: 'fp-4',
      patient_id: 'pt-1',
      name: 'Dzukou Valley Flower Meadows',
      location: 'Nagaland - Manipur border',
      photo_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      prompt_clue: 'The rolling emerald green valleys where wild lilies bloom under gentle clouds.',
      memory_fact: 'A famous mountain valley visited with loved ones during harvest time.',
    },
  ],
  settings: {
    pacing: 'gentle_slow',
    twilightMode: false,
    speakAudio: true,
    language: 'Nagamese / English',
    manualTiredMode: false,
    soundEffects: true,
  },
  medicines: [
    {
      id: 'med-1',
      patient_id: 'pt-1',
      name: 'Amlodipine (Blood Pressure)',
      dosage: '5mg — 1 tablet',
      times: ['08:00 AM'],
      notes: 'Take with warm water after morning meal',
      active: true,
    },
    {
      id: 'med-2',
      patient_id: 'pt-1',
      name: 'Calcium + Vitamin D3',
      dosage: '500mg — 1 tablet',
      times: ['01:30 PM'],
      notes: 'Take after lunch with lukewarm water',
      active: true,
    },
    {
      id: 'med-3',
      patient_id: 'pt-1',
      name: 'Donepezil (Memory Support)',
      dosage: '5mg — 1 tablet',
      times: ['08:30 PM'],
      notes: 'Take right before bedtime with half glass of water',
      active: true,
    },
  ],
  medicineLogs: [
    {
      id: 'medlog-1',
      medicine_id: 'med-1',
      scheduled_time: '08:00 AM',
      status: 'taken',
      actioned_at: new Date().toISOString(),
    },
  ],
  sosEvents: [
    {
      id: 'sos-prev-1',
      patient_id: 'pt-1',
      triggered_at: new Date(Date.now() - 3600000 * 42).toISOString(),
      status: 'resolved',
      resolved_at: new Date(Date.now() - 3600000 * 42 + 240000).toISOString(),
      location: 'Veranda & Orchid Courtyard, Mokokchung',
    },
  ],
  doctorAccessGrants: [
    {
      id: 'grant-seed-1',
      doctor_id: null,
      patient_id: 'pt-1',
      access_code: 'SAATHI',
      status: 'active',
      granted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      revoked_at: null,
      doctor_name: null,
      doctor_contact: null,
      last_viewed_at: null,
    },
    {
      id: 'grant-seed-2',
      doctor_id: 'doc-jamir',
      patient_id: 'pt-1',
      access_code: 'DR7842',
      status: 'active',
      granted_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      revoked_at: null,
      doctor_name: 'Dr. T. Jamir',
      doctor_contact: '+91 94360 55432',
      last_viewed_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
  ],
  developerFeedback: [
    {
      id: 'fb-seed-1',
      caregiver_id: 'cg-1',
      caregiver_name: 'Moa Jamir',
      caregiver_contact: '+91 98621 54321',
      category: 'cultural_languages',
      topic: 'Ao Naga traditional lullabies and hymns',
      details: 'Ayo responded with great joy and calmness when listening to Sentila and the church choir recording. Would love to have a direct library of North Eastern traditional folk lullabies and songs from Mokokchung and Ungma villages in the Sounds of Home section.',
      priority: 'helpful',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      app_version: 'v1.4 (North East India Edition)',
      system_info: {
        screen_size: '1024x768',
        language: 'Nagamese / English',
      },
      status: 'received',
    },
  ],
  conditionCheckIns: [
    {
      id: 'chk-1',
      patient_id: 'pt-1',
      timestamp: new Date(new Date().setHours(6, 30, 0, 0)).toISOString(),
      condition_score: 84,
      engagement_score: 35,
      mood: 'peaceful',
      activity_label: 'Morning Awakening & Warm Water',
      notes: 'Woke up gently to soft birdsong outside. Expressed peaceful comfort.',
      logged_by: 'Moa Jamir',
    },
    {
      id: 'chk-2',
      patient_id: 'pt-1',
      timestamp: new Date(new Date().setHours(8, 15, 0, 0)).toISOString(),
      condition_score: 93,
      engagement_score: 82,
      mood: 'radiant',
      activity_label: 'Morning Assam Tea & Blood Pressure Medicine',
      notes: 'Cheerfully took Amlodipine with breakfast. Smiled while talking about the weather.',
      logged_by: 'Moa Jamir',
    },
    {
      id: 'chk-3',
      patient_id: 'pt-1',
      timestamp: new Date(new Date().setHours(9, 45, 0, 0)).toISOString(),
      condition_score: 95,
      engagement_score: 94,
      mood: 'radiant',
      activity_label: 'Family Photo Album & Voice Clips',
      notes: 'Recognized Moa and granddaughter Sentila immediately. Reminisced warmly about Ungma village.',
      logged_by: 'Sentila',
    },
    {
      id: 'chk-4',
      patient_id: 'pt-1',
      timestamp: new Date(new Date().setHours(11, 30, 0, 0)).toISOString(),
      condition_score: 88,
      engagement_score: 72,
      mood: 'peaceful',
      activity_label: 'Veranda Orchid Stroll & Flower Matching',
      notes: 'Enjoyed looking at the blooming wild orchids. Matched 3 floral memory cards.',
      logged_by: 'Moa Jamir',
    },
    {
      id: 'chk-5',
      patient_id: 'pt-1',
      timestamp: new Date(new Date().setHours(13, 30, 0, 0)).toISOString(),
      condition_score: 80,
      engagement_score: 45,
      mood: 'mild_fatigue',
      activity_label: 'Warm Midday Stew & Calcium Dose',
      notes: 'Ate warm rice stew. Showed gentle drowsiness; took midday calcium quietly.',
      logged_by: 'Aienla',
    },
    {
      id: 'chk-6',
      patient_id: 'pt-1',
      timestamp: new Date(new Date().setHours(14, 45, 0, 0)).toISOString(),
      condition_score: 90,
      engagement_score: 20,
      mood: 'peaceful',
      activity_label: 'Afternoon Rest & Ambient Rain Sounds',
      notes: 'Deep peaceful resting period on comfortable cane chair with soft wool shawl.',
      logged_by: 'Moa Jamir',
    },
    {
      id: 'chk-7',
      patient_id: 'pt-1',
      timestamp: new Date(new Date().setHours(16, 15, 0, 0)).toISOString(),
      condition_score: 92,
      engagement_score: 86,
      mood: 'radiant',
      activity_label: 'Church Choir Hymns & Sentila Audio Check-in',
      notes: 'Hummed happily along to Ao Naga choir recording. Very engaged with Sentila’s voice.',
      logged_by: 'Sentila',
    },
    {
      id: 'chk-8',
      patient_id: 'pt-1',
      timestamp: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
      condition_score: 86,
      engagement_score: 68,
      mood: 'peaceful',
      activity_label: 'Evening Ginger Chai & Shawl Weaving Memories',
      notes: 'Comfortable relaxed evening session. Looked at family weaving patterns with calm affection.',
      logged_by: 'Moa Jamir',
    },
  ],
};

// Database helper functions
async function loadDb() {
  try {
    const dataDir = path.dirname(DB_FILE);
    if (!existsSync(dataDir)) {
      await fs.mkdir(dataDir, { recursive: true });
    }
    if (!existsSync(DB_FILE)) {
      await fs.writeFile(DB_FILE, JSON.stringify(INITIAL_SEED_DATA, null, 2), 'utf-8');
      return JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
    }
    const raw = await fs.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    let dirty = false;

    // Ensure all collections exist
    if (!Array.isArray(parsed.doctorAccessGrants) || parsed.doctorAccessGrants.length === 0) {
      parsed.doctorAccessGrants = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.doctorAccessGrants || []));
      dirty = true;
    }
    if (!Array.isArray(parsed.medicines) || parsed.medicines.length === 0) {
      parsed.medicines = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.medicines || []));
      dirty = true;
    }
    if (!Array.isArray(parsed.medicineLogs) || parsed.medicineLogs.length === 0) {
      parsed.medicineLogs = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.medicineLogs || []));
      dirty = true;
    }
    if (!Array.isArray(parsed.sosEvents)) {
      parsed.sosEvents = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.sosEvents || []));
      dirty = true;
    }
    if (!Array.isArray(parsed.conditionCheckIns) || parsed.conditionCheckIns.length === 0) {
      parsed.conditionCheckIns = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.conditionCheckIns || []));
      dirty = true;
    }
    if (!Array.isArray(parsed.developerFeedback) || parsed.developerFeedback.length === 0) {
      parsed.developerFeedback = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.developerFeedback || []));
      dirty = true;
    }

    if (dirty) {
      await saveDb(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Error loading DB, returning in-memory initial data:', err);
    return JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
  }
}

async function saveDb(data: any) {
  try {
    const dataDir = path.dirname(DB_FILE);
    if (!existsSync(dataDir)) {
      await fs.mkdir(dataDir, { recursive: true });
    }
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Serve uploaded and local asset images statically
  app.use('/src/assets/images', express.static(path.join(process.cwd(), 'src', 'assets', 'images')));

  // API Routes

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'Aapka Saathi', timestamp: new Date().toISOString() });
  });

  // Reset database back to authentic Northeast Indian seed data
  app.post('/api/reset-seed', async (req, res) => {
    try {
      await saveDb(INITIAL_SEED_DATA);
      res.json({ success: true, message: 'Reset to authentic Northeast Indian seed data successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get entire application state
  app.get('/api/state', async (req, res) => {
    try {
      const db = await loadDb();
      res.json(db);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update Caregiver profile
  app.post('/api/caregiver', async (req, res) => {
    try {
      const db = await loadDb();
      db.caregiver = { ...db.caregiver, ...req.body };
      await saveDb(db);
      res.json(db.caregiver);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update or Create Patient profile
  app.post('/api/patient', async (req, res) => {
    try {
      const db = await loadDb();
      db.patient = { ...db.patient, ...req.body };
      await saveDb(db);
      res.json(db.patient);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add Family Photo
  app.post('/api/photos', async (req, res) => {
    try {
      const db = await loadDb();
      const newPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        patient_id: db.patient?.id || 'pt-1',
        photo_url: req.body.photo_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        person_name: req.body.person_name || 'Loved One',
        relationship_label: req.body.relationship_label || 'Family Member',
        notes: req.body.notes || '',
        audio_url: req.body.audio_url || '',
        is_preset: false,
      };
      db.photos = [newPhoto, ...(db.photos || [])];
      await saveDb(db);
      res.json(newPhoto);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete Family Photo
  app.delete('/api/photos/:id', async (req, res) => {
    try {
      const db = await loadDb();
      db.photos = (db.photos || []).filter((p: any) => p.id !== req.params.id);
      await saveDb(db);
      res.json({ success: true, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add Voice Note
  app.post('/api/voice-notes', async (req, res) => {
    try {
      const db = await loadDb();
      const newNote = {
        id: `vn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        patient_id: db.patient?.id || 'pt-1',
        audio_url: req.body.audio_url || '',
        label: req.body.label || 'Voice Note',
        speaker_name: req.body.speaker_name || 'Family Member',
        transcript: req.body.transcript || '',
        duration_sec: req.body.duration_sec || 10,
        date_recorded: new Date().toISOString(),
      };
      db.voiceNotes = [newNote, ...(db.voiceNotes || [])];
      await saveDb(db);
      res.json(newNote);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete Voice Note
  app.delete('/api/voice-notes/:id', async (req, res) => {
    try {
      const db = await loadDb();
      db.voiceNotes = (db.voiceNotes || []).filter((v: any) => v.id !== req.params.id);
      await saveDb(db);
      res.json({ success: true, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add Reminder
  app.post('/api/reminders', async (req, res) => {
    try {
      const db = await loadDb();
      const newReminder = {
        id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        patient_id: db.patient?.id || 'pt-1',
        type: req.body.type || 'routine',
        time: req.body.time || '10:00 AM',
        label: req.body.label || 'Gentle Reminder',
        completed_today: false,
        notes: req.body.notes || '',
      };
      db.reminders = [...(db.reminders || []), newReminder];
      await saveDb(db);
      res.json(newReminder);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Toggle Reminder Completed Status
  app.patch('/api/reminders/:id/toggle', async (req, res) => {
    try {
      const db = await loadDb();
      const rem = (db.reminders || []).find((r: any) => r.id === req.params.id);
      if (rem) {
        rem.completed_today = !rem.completed_today;
        rem.completed_at = rem.completed_today ? new Date().toISOString() : undefined;
        await saveDb(db);
        res.json(rem);
      } else {
        res.status(404).json({ error: 'Reminder not found' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete Reminder
  app.delete('/api/reminders/:id', async (req, res) => {
    try {
      const db = await loadDb();
      db.reminders = (db.reminders || []).filter((r: any) => r.id !== req.params.id);
      await saveDb(db);
      res.json({ success: true, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add Support Contact
  app.post('/api/support-contacts', async (req, res) => {
    try {
      const db = await loadDb();
      const newContact = {
        id: `sc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        patient_id: db.patient?.id || 'pt-1',
        name: req.body.name || 'Support Contact',
        phone: req.body.phone || '',
        role: req.body.role || 'family',
        photo_url: req.body.photo_url || '',
        is_primary: !!req.body.is_primary,
        notes: req.body.notes || '',
      };
      db.supportContacts = [...(db.supportContacts || []), newContact];
      await saveDb(db);
      res.json(newContact);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete Support Contact
  app.delete('/api/support-contacts/:id', async (req, res) => {
    try {
      const db = await loadDb();
      db.supportContacts = (db.supportContacts || []).filter((s: any) => s.id !== req.params.id);
      await saveDb(db);
      res.json({ success: true, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add Activity Log
  app.post('/api/activity-logs', async (req, res) => {
    try {
      const db = await loadDb();
      const newLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        patient_id: db.patient?.id || 'pt-1',
        activity_type: req.body.activity_type || 'who_is_this',
        timestamp: new Date().toISOString(),
        descriptive_note: req.body.descriptive_note || 'Engaged gently in the memory activity.',
        positive_count: req.body.positive_count,
        total_count: req.body.total_count,
        details: req.body.details,
      };
      db.activityLogs = [newLog, ...(db.activityLogs || [])];
      await saveDb(db);
      res.json(newLog);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update Settings
  app.post('/api/settings', async (req, res) => {
    try {
      const db = await loadDb();
      db.settings = { ...db.settings, ...req.body };
      await saveDb(db);
      res.json(db.settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // MEDICINE SCHEDULE & LOGS ENDPOINTS
  // ==========================================

  // Get medicines
  app.get('/api/medicines', async (req, res) => {
    try {
      const db = await loadDb();
      res.json(db.medicines || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add Medicine
  app.post('/api/medicines', async (req, res) => {
    try {
      const db = await loadDb();
      const newMedicine = {
        id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        patient_id: db.patient?.id || 'pt-1',
        name: req.body.name || 'Medicine',
        dosage: req.body.dosage || '1 tablet',
        times: Array.isArray(req.body.times) && req.body.times.length > 0 ? req.body.times : ['08:00 AM'],
        notes: req.body.notes || '',
        active: req.body.active !== undefined ? !!req.body.active : true,
      };
      db.medicines = [...(db.medicines || []), newMedicine];
      await saveDb(db);
      res.json(newMedicine);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update Medicine
  app.put('/api/medicines/:id', async (req, res) => {
    try {
      const db = await loadDb();
      const medIndex = (db.medicines || []).findIndex((m: any) => m.id === req.params.id);
      if (medIndex === -1) {
        return res.status(404).json({ error: 'Medicine not found' });
      }
      db.medicines[medIndex] = {
        ...db.medicines[medIndex],
        ...req.body,
        id: req.params.id,
      };
      await saveDb(db);
      res.json(db.medicines[medIndex]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete Medicine
  app.delete('/api/medicines/:id', async (req, res) => {
    try {
      const db = await loadDb();
      db.medicines = (db.medicines || []).filter((m: any) => m.id !== req.params.id);
      await saveDb(db);
      res.json({ success: true, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get Medicine Logs
  app.get('/api/medicine-logs', async (req, res) => {
    try {
      const db = await loadDb();
      res.json(db.medicineLogs || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add or Update Medicine Log
  app.post('/api/medicine-logs', async (req, res) => {
    try {
      const db = await loadDb();
      const { medicine_id, scheduled_time, status, actioned_at } = req.body;
      const newLog = {
        id: `medlog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        medicine_id,
        scheduled_time,
        status: status || 'taken',
        actioned_at: actioned_at || new Date().toISOString(),
      };
      db.medicineLogs = [newLog, ...(db.medicineLogs || [])];
      await saveDb(db);
      res.json(newLog);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // PATIENT SOS ALERT ENDPOINTS
  // ==========================================

  // Get SOS Events
  app.get('/api/sos-events', async (req, res) => {
    try {
      const db = await loadDb();
      res.json(db.sosEvents || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Trigger SOS Event
  app.post('/api/sos-events', async (req, res) => {
    try {
      const db = await loadDb();
      const newEvent = {
        id: `sos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        patient_id: db.patient?.id || 'pt-1',
        triggered_at: new Date().toISOString(),
        status: 'active',
        resolved_at: null,
        location: req.body.location || 'Ungma Road, Mokokchung, Nagaland',
      };
      db.sosEvents = [newEvent, ...(db.sosEvents || [])];
      await saveDb(db);
      res.json(newEvent);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Resolve SOS Event
  app.patch('/api/sos-events/:id', async (req, res) => {
    try {
      const db = await loadDb();
      const eventIndex = (db.sosEvents || []).findIndex((e: any) => e.id === req.params.id);
      if (eventIndex === -1) {
        return res.status(404).json({ error: 'SOS Event not found' });
      }
      db.sosEvents[eventIndex] = {
        ...db.sosEvents[eventIndex],
        status: 'resolved',
        resolved_at: new Date().toISOString(),
      };
      await saveDb(db);
      res.json(db.sosEvents[eventIndex]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Reset to initial seed demo data
  app.post('/api/reset-seed', async (req, res) => {
    try {
      const fresh = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
      await saveDb(fresh);
      res.json(fresh);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // AI INTEGRATION POINTS (GEMINI)
  // ==========================================

  // 1. Gentle Question Generation for Activities
  app.post('/api/ai/question', async (req, res) => {
    const {
      person_name = 'Moa',
      relationship = 'Son',
      language = 'English / Nagamese',
      activity_type = 'who_is_this',
      place_name = '',
      place_location = '',
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback warm questions
      let fallback = `Do you recognize this warm smile of your ${relationship}, ${person_name}?`;
      if (activity_type === 'familiar_places' && place_name) {
        fallback = `Do you remember visiting this beautiful place, ${place_name}?`;
      } else if (activity_type === 'sounds_of_home') {
        fallback = `Whose warm and familiar voice do you hear right now?`;
      }
      return res.json({ question: fallback, source: 'fallback' });
    }

    try {
      let promptText = '';
      if (activity_type === 'who_is_this') {
        promptText = `Generate a short, warm, simple question in ${language} to ask an elderly person with memory difficulties about a photo of their ${relationship}, named ${person_name}. The question should be gentle and non-pressuring, like something a caring family member would ask. Keep it under 15 words. Respond with ONLY the question text, nothing else.`;
      } else if (activity_type === 'familiar_places') {
        promptText = `Generate a short, gentle, heartwarming question in ${language} to ask an elderly person about a cherished familiar place: "${place_name}" in ${place_location}. The question should be warm, soothing, and non-pressuring. Keep it under 15 words. Respond with ONLY the question text, nothing else.`;
      } else {
        promptText = `Generate a short, comforting question in ${language} to ask an elderly person after listening to a family voice note from ${person_name} (${relationship}). Keep it under 15 words, loving and peaceful. Respond with ONLY the question text, nothing else.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: promptText,
      });

      const question = response.text?.trim() || `Look at this lovely photo of your ${relationship}, ${person_name}.`;
      res.json({ question, source: 'gemini' });
    } catch (err: any) {
      console.error('Gemini question generation error:', err);
      res.json({
        question: `Do you recognize this kind face of your ${relationship}, ${person_name}?`,
        source: 'fallback_on_error',
      });
    }
  });

  // 2. Encouraging Feedback Generation (never judgmental)
  app.post('/api/ai/feedback', async (req, res) => {
    const {
      is_correct = true,
      correct_name = 'Moa',
      relationship = 'Son',
      language = 'English / Nagamese',
      activity_type = 'who_is_this',
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      let fallback = is_correct
        ? `Yes, absolutely! That is your wonderful ${relationship}, ${correct_name}.`
        : `This is your loving ${relationship}, ${correct_name}, who cherishes you so much.`;
      return res.json({ feedback: fallback, source: 'fallback' });
    }

    try {
      const conditionClause = is_correct
        ? 'they answered correctly.'
        : `they answered differently than expected — gently and warmly let them know who it actually is, named ${correct_name}, their ${relationship}, without making them feel wrong or tested.`;

      const promptText = `Generate a warm, gentle response for an elderly person with memory difficulties after they answered a question about a family photo. [${conditionClause}] Respond in ${language}. Keep it under 20 words, warm and encouraging in tone, never clinical or corrective-sounding. Respond with ONLY the message text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: promptText,
      });

      const feedback = response.text?.trim() || (is_correct
        ? `Yes, how wonderful! That is indeed ${correct_name}, your ${relationship}.`
        : `This is your sweet ${relationship}, ${correct_name}. It's so nice looking at this photo together.`);
      res.json({ feedback, source: 'gemini' });
    } catch (err: any) {
      console.error('Gemini feedback error:', err);
      res.json({
        feedback: is_correct
          ? `Wonderful! That is your dear ${relationship}, ${correct_name}.`
          : `This is your caring ${relationship}, ${correct_name}. Thank you for sharing this moment.`,
        source: 'fallback_on_error',
      });
    }
  });

  // 3. Descriptive (Non-Diagnostic) Activity Summaries for Caregiver Dashboard
  app.post('/api/ai/summary', async (req, res) => {
    const {
      activity_type = 'who_is_this',
      count = 4,
      positive_count = 3,
      patient_name = 'Arenla',
      patient_notes = '',
    } = req.body;

    const ai = getGeminiClient();

    const activityName = activity_type === 'who_is_this'
      ? 'family photo recognition'
      : activity_type === 'sounds_of_home'
      ? 'familiar voice notes and sounds'
      : activity_type === 'familiar_places'
      ? 'cherished places exploration'
      : 'gentle pattern matching and cognitive engagement';

    if (!ai) {
      const fallback = `${patient_name} spent peaceful time looking at ${count} photos and engaged warmly with ${positive_count} of them today.`;
      return res.json({ summary: fallback, source: 'fallback' });
    }

    try {
      const promptText = `Write one short, warm, plain-language sentence summarizing a dementia patient's engagement with a memory activity session for their family caregiver to read. Details: patient name: ${patient_name}, activity type: ${activityName}, number of photos/prompts shown: ${count}, number engaged with positively: ${positive_count}. ${patient_notes ? `Extra context: ${patient_notes}` : ''}

IMPORTANT: Do not use clinical language, scores, percentages, or any language implying diagnosis, treatment, or cognitive assessment. Frame this purely as a warm, descriptive observation of a shared activity — like a family member reporting how a visit went. Respond with ONLY the sentence.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: promptText,
      });

      const summary = response.text?.trim() || `${patient_name} enjoyed looking at family memories today and showed a happy, calm connection.`;
      res.json({ summary, source: 'gemini' });
    } catch (err: any) {
      console.error('Gemini summary error:', err);
      res.json({
        summary: `${patient_name} spent comfortable time with ${activityName} today, enjoying moments with family memories.`,
        source: 'fallback_on_error',
      });
    }
  });

  // 4. Multilingual Translation
  app.post('/api/ai/translate', async (req, res) => {
    const { text = '', target_language = 'Assamese' } = req.body;
    if (!text) {
      return res.json({ translated_text: '' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ translated_text: text, source: 'original_fallback' });
    }

    try {
      const promptText = `Translate the following text into ${target_language} for an elderly person in North East India. Make it sound simple, warm, natural, and caring — not robotic or formal. Text: "${text}". Respond with ONLY the translated text, nothing else.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: promptText,
      });

      res.json({
        translated_text: response.text?.trim() || text,
        source: 'gemini',
      });
    } catch (err: any) {
      console.error('Gemini translation error:', err);
      res.json({ translated_text: text, source: 'fallback_on_error' });
    }
  });

  // 5. Doctor Access Grant Management & Verification (Consent-based, read-only)
  app.get('/api/doctor-grants', async (req, res) => {
    try {
      const db = await loadDb();
      res.json(db.doctorAccessGrants || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/doctor-grants', async (req, res) => {
    try {
      const db = await loadDb();
      if (!Array.isArray(db.doctorAccessGrants)) {
        db.doctorAccessGrants = [];
      }

      let code = req.body?.access_code ? String(req.body.access_code).trim().toUpperCase() : '';
      if (!code) {
        const codeChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        for (let i = 0; i < 6; i++) {
          code += codeChars.charAt(Math.floor(Math.random() * codeChars.length));
        }
      }

      const grantId = req.body?.id || `dag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newGrant = {
        id: grantId,
        doctor_id: req.body?.doctor_id || null,
        patient_id: req.body?.patient_id || db.patient?.id || 'pt-1',
        access_code: code,
        status: 'active',
        granted_at: req.body?.granted_at || new Date().toISOString(),
        revoked_at: null,
        doctor_name: req.body?.doctor_name || null,
        doctor_contact: req.body?.doctor_contact || null,
        last_viewed_at: null,
      };

      // Filter out existing grant with identical ID or identical access code
      db.doctorAccessGrants = [
        newGrant,
        ...(db.doctorAccessGrants.filter(
          (g: any) => g.id !== grantId && (g.access_code || '').toString().trim().toUpperCase() !== code
        )),
      ];
      await saveDb(db);
      res.json(newGrant);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/doctor-grants/:id/revoke', async (req, res) => {
    try {
      const db = await loadDb();
      let updated: any = null;
      db.doctorAccessGrants = (db.doctorAccessGrants || []).map((g: any) => {
        if (g.id === req.params.id) {
          updated = {
            ...g,
            status: 'revoked',
            revoked_at: new Date().toISOString(),
          };
          return updated;
        }
        return g;
      });
      await saveDb(db);
      if (!updated) {
        return res.status(404).json({ error: 'Grant not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/doctor/verify-code', async (req, res) => {
    try {
      const { access_code, doctor_id, doctor_name, doctor_contact } = req.body;
      const cleanCode = (access_code || '').toString().trim().toUpperCase();

      if (!cleanCode) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid access code.',
        });
      }

      const db = await loadDb();
      const grants = db.doctorAccessGrants || [];
      const matchIndex = grants.findIndex(
        (g: any) => (g.access_code || '').toString().trim().toUpperCase() === cleanCode
      );

      if (matchIndex === -1) {
        return res.status(404).json({
          success: false,
          error: "This code isn't valid or has been removed. Please check with the caregiver.",
        });
      }

      const grant = grants[matchIndex];
      if (grant.status === 'revoked') {
        return res.status(403).json({
          success: false,
          error: "This code has been revoked by the patient's caregiver.",
        });
      }

      // Update grant with doctor details and last_viewed_at
      const updatedGrant = {
        ...grant,
        doctor_id: doctor_id || grant.doctor_id || `doc-${Date.now()}`,
        doctor_name: doctor_name || grant.doctor_name || 'Healthcare Provider',
        doctor_contact: doctor_contact || grant.doctor_contact || '',
        last_viewed_at: new Date().toISOString(),
      };
      grants[matchIndex] = updatedGrant;
      db.doctorAccessGrants = grants;
      await saveDb(db);

      // Return only scoped, non-private context
      const patient = db.patient || {};
      const safePatient = {
        id: patient.id || 'pt-1',
        name: patient.name || 'Arenla Ao',
        nickname: patient.nickname,
        age: patient.age,
        hometown: patient.hometown,
        community: patient.community,
        preferred_language: patient.preferred_language,
        caregiver_notes: patient.caregiver_notes,
      };

      res.json({
        success: true,
        grant: updatedGrant,
        patient: safePatient,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Developer Feedback & App Improvement Suggestions
  app.get('/api/developer-feedback', async (req, res) => {
    try {
      const db = await loadDb();
      res.json(db.developerFeedback || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/developer-feedback', async (req, res) => {
    try {
      const {
        caregiver_id,
        caregiver_name,
        caregiver_contact,
        category,
        topic,
        details,
        priority,
        app_version,
        system_info,
      } = req.body;

      if (!topic || !details || !category) {
        return res.status(400).json({
          error: 'Please provide a category, summary topic, and details for your feedback.',
        });
      }

      const db = await loadDb();
      if (!Array.isArray(db.developerFeedback)) {
        db.developerFeedback = [];
      }

      const feedbackItem = {
        id: `dfb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        caregiver_id: caregiver_id || db.caregiver?.id || 'cg-1',
        caregiver_name: caregiver_name || db.caregiver?.name || 'Caregiver',
        caregiver_contact: caregiver_contact || db.caregiver?.phone || db.caregiver?.phone_number || '',
        category: category,
        topic: topic.trim(),
        details: details.trim(),
        priority: priority || 'standard',
        created_at: new Date().toISOString(),
        app_version: app_version || 'v1.4 (North East India Edition)',
        system_info: system_info || null,
        status: 'received',
      };

      db.developerFeedback.unshift(feedbackItem);
      await saveDb(db);

      res.status(201).json(feedbackItem);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development vs Static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aapka Saathi server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
