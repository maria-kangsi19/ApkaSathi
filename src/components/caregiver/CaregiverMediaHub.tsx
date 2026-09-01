import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Image as ImageIcon,
  Mic,
  Plus,
  Trash2,
  Play,
  Pause,
  Upload,
  Sparkles,
  Heart,
  Volume2,
  Square,
  Radio,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FamilyPhoto, VoiceNote } from '../../types';

export const CaregiverMediaHub: React.FC = () => {
  const { state, addPhoto, deletePhoto, addVoiceNote, deleteVoiceNote, speakText } = useApp();
  const photos = state?.photos || [];
  const voiceNotes = state?.voiceNotes || [];

  const [activeTab, setActiveTab] = useState<'photos' | 'voice_notes'>('photos');

  // Photo Modal / Form State
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [newPhotoName, setNewPhotoName] = useState('');
  const [newPhotoRelationship, setNewPhotoRelationship] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoNotes, setNewPhotoNotes] = useState('');

  // Voice Note Modal / Form State
  const [showAddVoiceModal, setShowAddVoiceModal] = useState(false);
  const [newVoiceLabel, setNewVoiceLabel] = useState('');
  const [newVoiceSpeaker, setNewVoiceSpeaker] = useState('');
  const [newVoiceTranscript, setNewVoiceTranscript] = useState('');
  const [newVoiceAudioUrl, setNewVoiceAudioUrl] = useState('');

  // In-Browser Live Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Sample photo presets for quick testing
  const samplePresets = [
    {
      name: 'Moa',
      relationship: 'Son (Primary Caregiver)',
      url: '/src/assets/images/northeast_son_caregiver_1788273841141.jpg',
      notes: 'Moa smiling at the harvest festival wearing traditional Naga shawl',
    },
    {
      name: 'Sentila',
      relationship: 'Granddaughter',
      url: '/src/assets/images/northeast_granddaughter_1788273863871.jpg',
      notes: 'Sentila in school uniform with her prize drawing',
    },
    {
      name: 'Lipokla',
      relationship: 'ASHA Health Worker & Friend',
      url: '/src/assets/images/northeast_asha_worker_1788273924498.jpg',
      notes: 'Lipokla visiting with warm herbal tea and blood pressure cuff',
    },
    {
      name: 'Imti Longchar',
      relationship: 'Younger Brother',
      url: '/src/assets/images/northeast_brother_uncle_1788273884571.jpg',
      notes: 'Imti bringing fresh garden harvest and bamboo shoot pickles',
    },
  ];

  // Live Microphone Recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access failed:', err);
      alert('Could not access microphone. You can still type the transcript or enter an audio link.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // Image Upload helper
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoName || !newPhotoRelationship) return;

    await addPhoto({
      person_name: newPhotoName,
      relationship_label: newPhotoRelationship,
      photo_url:
        newPhotoUrl ||
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      notes: newPhotoNotes,
    });

    setNewPhotoName('');
    setNewPhotoRelationship('');
    setNewPhotoUrl('');
    setNewPhotoNotes('');
    setShowAddPhotoModal(false);
  };

  const handleSaveVoiceNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoiceLabel || !newVoiceSpeaker) return;

    await addVoiceNote({
      label: newVoiceLabel,
      speaker_name: newVoiceSpeaker,
      transcript: newVoiceTranscript,
      audio_url: recordedAudioUrl || newVoiceAudioUrl,
      duration_sec: recordingTime || 5,
    });

    setNewVoiceLabel('');
    setNewVoiceSpeaker('');
    setNewVoiceTranscript('');
    setNewVoiceAudioUrl('');
    setRecordedAudioBlob(null);
    setRecordedAudioUrl(null);
    setShowAddVoiceModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCD4C4] dark:border-[#3C4035] pb-6">
        <div>
          <h1 className="serif text-2xl sm:text-3xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
            Personalized Media Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#3D3A33] dark:text-[#D1D0C5] font-semibold mt-1">
            Personalize your loved one's companion with real family portraits, voice greetings, and songs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] p-1.5 rounded-full shadow-2xs">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-[#264D24] text-white shadow-xs'
                : 'text-[#3D3A33] dark:text-[#D1D0C5] hover:text-[#141310] dark:hover:text-[#FCFBF7]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Family Photos ({photos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('voice_notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'voice_notes'
                ? 'bg-[#9C382A] text-white shadow-xs'
                : 'text-[#3D3A33] dark:text-[#D1D0C5] hover:text-[#141310] dark:hover:text-[#FCFBF7]'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Voice Notes ({voiceNotes.length})</span>
          </button>
        </div>
      </div>

      {/* PHOTOS TAB */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="serif text-xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
              Family Face Recognition Photos
            </h2>
            <button
              onClick={() => setShowAddPhotoModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#264D24] hover:bg-[#1D3D1B] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Family Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                layout
                className="rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#264D24] p-4 card-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative rounded-2xl overflow-hidden aspect-square bg-black/5 mb-3 shadow-inner">
                    <img
                      src={photo.photo_url}
                      alt={photo.person_name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="serif text-xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
                    {photo.person_name}
                  </h3>
                  <p className="text-xs font-extrabold text-[#9C382A] dark:text-[#E38B7D] mt-0.5">
                    {photo.relationship_label}
                  </p>
                  {photo.notes && (
                    <p className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] font-medium mt-2 line-clamp-2">
                      {photo.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#DCD4C4] dark:border-[#3C4035] flex items-center justify-between">
                  <button
                    onClick={() =>
                      speakText(
                        `${photo.person_name}, your ${photo.relationship_label}. ${photo.notes || ''}`
                      )
                    }
                    className="text-xs text-[#264D24] dark:text-[#8DA850] font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Prompt Audio</span>
                  </button>

                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Delete photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* VOICE NOTES TAB */}
      {activeTab === 'voice_notes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="serif text-xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
              Cherished Voice Greetings & Melodies
            </h2>
            <button
              onClick={() => setShowAddVoiceModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#9C382A] hover:bg-[#832E22] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Record / Add Voice Note</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {voiceNotes.map((note) => (
              <motion.div
                key={note.id}
                layout
                className="rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#9C382A] p-5 sm:p-6 card-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3.5 py-1 rounded-full bg-[#FDEEEC] dark:bg-[#3A2220] text-[#9C382A] dark:text-[#E38B7D] text-xs font-extrabold border border-[#9C382A]/20">
                      {note.speaker_name || 'Family Voice'}
                    </span>
                    <span className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] font-semibold">
                      {note.duration_sec ? `${note.duration_sec}s` : 'Voice recording'}
                    </span>
                  </div>

                  <h3 className="serif text-lg sm:text-xl font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                    {note.label}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#3D3A33] dark:text-[#D1D0C5] italic leading-relaxed mb-4 font-medium">
                    "{note.transcript || 'Warm audio greeting recorded for your elder.'}"
                  </p>
                </div>

                <div className="pt-4 border-t border-[#DCD4C4] dark:border-[#3C4035] flex items-center justify-between">
                  <button
                    onClick={() => speakText(note.transcript || note.label)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#EBF3E8] dark:bg-[#242E18] text-[#264D24] dark:text-[#8DA850] font-extrabold text-xs hover:bg-[#264D24] hover:text-white transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Play Voice</span>
                  </button>

                  <button
                    onClick={() => deleteVoiceNote(note.id)}
                    className="p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Delete voice note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ADD PHOTO MODAL */}
      <AnimatePresence>
        {showAddPhotoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#264D24] p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="serif text-xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
                  Add Family Memory Photo
                </h3>
                <button
                  onClick={() => setShowAddPhotoModal(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5 text-[#3D3A33] dark:text-[#D1D0C5]" />
                </button>
              </div>

              {/* Presets Quick Pick */}
              <div className="mb-4">
                <label className="text-xs font-extrabold text-[#3D3A33] dark:text-[#D1D0C5] uppercase mb-2 block tracking-wider">
                  Quick Select Sample Preset:
                </label>
                <div className="flex flex-wrap gap-2">
                  {samplePresets.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setNewPhotoName(preset.name);
                        setNewPhotoRelationship(preset.relationship);
                        setNewPhotoUrl(preset.url);
                        setNewPhotoNotes(preset.notes);
                      }}
                      className="px-3 py-1 rounded-full bg-[#F3EFE6] dark:bg-[#272A22] hover:bg-[#EBF3E8] dark:hover:bg-[#242E18] text-xs font-bold text-[#141310] dark:text-[#FCFBF7] border border-[#DCD4C4] dark:border-[#3C4035] cursor-pointer"
                    >
                      {preset.name} ({preset.relationship.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSavePhoto} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                    Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sentila"
                    value={newPhotoName}
                    onChange={(e) => setNewPhotoName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                    Relationship Label *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Granddaughter / Daughter-in-law"
                    value={newPhotoRelationship}
                    onChange={(e) => setNewPhotoRelationship(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                    Photo URL or Local Upload
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none mb-2"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="text-xs text-[#3D3A33] dark:text-[#D1D0C5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                    Gentle Reminiscing Note
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Sentila in her bright red traditional festive jacket"
                    value={newPhotoNotes}
                    onChange={(e) => setNewPhotoNotes(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DCD4C4] dark:border-[#3C4035]">
                  <button
                    type="button"
                    onClick={() => setShowAddPhotoModal(false)}
                    className="px-5 py-2.5 rounded-full text-sm font-extrabold text-[#3D3A33] dark:text-[#D1D0C5] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#264D24] hover:bg-[#1D3D1B] text-white text-sm font-extrabold shadow-md cursor-pointer"
                  >
                    Save Photo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RECORD / ADD VOICE NOTE MODAL */}
      <AnimatePresence>
        {showAddVoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#9C382A] p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="serif text-xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
                  Record or Add Voice Greeting
                </h3>
                <button
                  onClick={() => setShowAddVoiceModal(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5 text-[#3D3A33] dark:text-[#D1D0C5]" />
                </button>
              </div>

              {/* Live Microphone Recorder Box */}
              <div className="rounded-2xl bg-[#FDF3DF] dark:bg-[#32281E] border-2 border-[#965A04] p-5 mb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#965A04] dark:text-[#F5B83D]">
                    {isRecording ? `Recording... (${recordingTime}s)` : 'In-Browser Microphone'}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-4 my-4">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-6 py-3 rounded-full bg-[#9C382A] hover:bg-[#832E22] text-white font-extrabold text-sm flex items-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer"
                    >
                      <Mic className="w-5 h-5" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-md animate-pulse cursor-pointer"
                    >
                      <Square className="w-5 h-5" />
                      <span>Stop Recording ({recordingTime}s)</span>
                    </button>
                  )}
                </div>

                {recordedAudioUrl && (
                  <div className="mt-2 p-2 rounded-xl bg-black/5 flex items-center justify-center gap-3">
                    <span className="text-xs font-bold text-[#264D24] dark:text-[#8DA850]">Recorded audio ready!</span>
                    <audio controls src={recordedAudioUrl} className="h-8 max-w-[200px]" />
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveVoiceNote} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                    Greeting Title / Label *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sentila singing evening church hymn"
                    value={newVoiceLabel}
                    onChange={(e) => setNewVoiceLabel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#9C382A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                    Speaker Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sentila"
                    value={newVoiceSpeaker}
                    onChange={(e) => setNewVoiceSpeaker(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#9C382A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                    Transcript / Words spoken (For read-aloud)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Good evening Ayo! I hope your afternoon tea was warm and sweet."
                    value={newVoiceTranscript}
                    onChange={(e) => setNewVoiceTranscript(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#9C382A] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DCD4C4] dark:border-[#3C4035]">
                  <button
                    type="button"
                    onClick={() => setShowAddVoiceModal(false)}
                    className="px-5 py-2.5 rounded-full text-sm font-extrabold text-[#3D3A33] dark:text-[#D1D0C5] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#9C382A] hover:bg-[#832E22] text-white text-sm font-extrabold shadow-md cursor-pointer"
                  >
                    Save Voice Note
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
