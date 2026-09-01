import React from 'react';
import {
  LayoutDashboard,
  Image as ImageIcon,
  Clock,
  Activity,
  Users,
  Settings,
  Eye,
  Heart,
} from 'lucide-react';
import { useApp, CaregiverTab } from '../../context/AppContext';
import { CaregiverDashboard } from './CaregiverDashboard';
import { CaregiverMediaHub } from './CaregiverMediaHub';
import { CaregiverReminders } from './CaregiverReminders';
import { CaregiverActivityLog } from './CaregiverActivityLog';
import { CaregiverSupportCircle } from './CaregiverSupportCircle';
import { CaregiverSettings } from './CaregiverSettings';

export const CaregiverHubLayout: React.FC = () => {
  const { caregiverTab, setCaregiverTab, setAppMode, setPatientScreen } = useApp();

  const navItems: Array<{ id: CaregiverTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'media', label: 'Photos & Voice', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'reminders', label: 'Daily Routines', icon: <Clock className="w-4 h-4" /> },
    { id: 'activity_log', label: 'Activity Logs', icon: <Activity className="w-4 h-4" /> },
    { id: 'support_circle', label: 'Support Circle', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings & Profile', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] pb-16">
      {/* Sub Navigation Bar */}
      <div className="bg-white dark:bg-[#1D1F1A] border-b border-[#DCD4C4] dark:border-[#3C4035] sticky top-16 md:top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-2.5 gap-2 no-scrollbar">
            <div className="flex items-center gap-1.5 shrink-0">
              {navItems.map((item) => {
                const isActive = caregiverTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCaregiverTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#264D24] text-white shadow-xs'
                        : 'text-[#3D3A33] dark:text-[#D1D0C5] hover:text-[#141310] dark:hover:text-[#FCFBF7] hover:bg-[#F3EFE6] dark:hover:bg-[#272A22]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setAppMode('patient');
                setPatientScreen('home');
              }}
              className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#9C382A] hover:bg-[#832E22] text-white text-xs font-extrabold shadow-xs shrink-0 transition-all hover:scale-105 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Launch Patient View 🌸</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <main>
        {caregiverTab === 'dashboard' && <CaregiverDashboard />}
        {caregiverTab === 'media' && <CaregiverMediaHub />}
        {caregiverTab === 'reminders' && <CaregiverReminders />}
        {caregiverTab === 'activity_log' && <CaregiverActivityLog />}
        {caregiverTab === 'support_circle' && <CaregiverSupportCircle />}
        {caregiverTab === 'settings' && <CaregiverSettings />}
      </main>
    </div>
  );
};
