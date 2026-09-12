import React from 'react';
import { useApp } from '../../context/AppContext';
import { DoctorLogin } from './DoctorLogin';
import { DoctorDashboard } from './DoctorDashboard';

export const DoctorContainer: React.FC = () => {
  const { activePatientGrant, state } = useApp();

  const currentGrantInState = (state?.doctorAccessGrants || []).find(
    g => g.id === activePatientGrant?.id
  );

  if (
    !activePatientGrant ||
    activePatientGrant.status === 'revoked' ||
    (currentGrantInState && currentGrantInState.status === 'revoked')
  ) {
    return <DoctorLogin />;
  }

  return <DoctorDashboard />;
};
