import React from 'react';
import { useApp } from '../../context/AppContext';
import { DoctorLogin } from './DoctorLogin';
import { DoctorDashboard } from './DoctorDashboard';

export const DoctorContainer: React.FC = () => {
  const { activePatientGrant } = useApp();

  if (!activePatientGrant || activePatientGrant.status === 'revoked') {
    return <DoctorLogin />;
  }

  return <DoctorDashboard />;
};
