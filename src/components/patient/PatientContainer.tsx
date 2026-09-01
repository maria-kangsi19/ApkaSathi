import React from 'react';
import { useApp } from '../../context/AppContext';
import { PatientHome } from './PatientHome';
import { ActivityWhoIsThis } from './ActivityWhoIsThis';
import { ActivitySoundsOfHome } from './ActivitySoundsOfHome';
import { ActivityFamiliarPlaces } from './ActivityFamiliarPlaces';
import { ActivityCognitiveExercises } from './ActivityCognitiveExercises';
import { ActivitySessionEnd } from './ActivitySessionEnd';
import { PatientFamilyGallery } from './PatientFamilyGallery';
import { PatientReminders } from './PatientReminders';
import { PatientCallModal } from './PatientCallModal';

export const PatientContainer: React.FC = () => {
  const { patientScreen } = useApp();

  return (
    <div className="min-h-[calc(100vh-5rem)] pb-16">
      {patientScreen === 'home' && <PatientHome />}
      {patientScreen === 'who_is_this' && <ActivityWhoIsThis />}
      {patientScreen === 'sounds_of_home' && <ActivitySoundsOfHome />}
      {patientScreen === 'familiar_places' && <ActivityFamiliarPlaces />}
      {patientScreen === 'cognitive_exercises' && <ActivityCognitiveExercises />}
      {patientScreen === 'session_end' && <ActivitySessionEnd />}
      {patientScreen === 'family_gallery' && <PatientFamilyGallery />}
      {patientScreen === 'reminders' && <PatientReminders />}

      <PatientCallModal />
    </div>
  );
};
