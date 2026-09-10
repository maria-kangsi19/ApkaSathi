import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Filter,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SOSEvent } from '../../types';

export const CaregiverEmergencyLog: React.FC = () => {
  const { state, resolveSOSEvent, triggerSOS, refreshState } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [isTriggeringDemo, setIsTriggeringDemo] = useState(false);

  const sosEvents: SOSEvent[] = state?.sosEvents || [];
  const activeEvents = sosEvents.filter((e) => e.status === 'active');
  const patient = state?.patient;

  const filteredEvents = sosEvents.filter((event) => {
    if (filter === 'active') return event.status === 'active';
    if (filter === 'resolved') return event.status === 'resolved';
    return true;
  });

  const handleTriggerDemoSOS = async () => {
    setIsTriggeringDemo(true);
    await triggerSOS('Veranda & Courtyard, Mokokchung, Nagaland');
    setIsTriggeringDemo(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#1D1F1A] rounded-[32px] p-6 sm:p-8 border-2 border-[#DCD4C4] dark:border-[#3C4035] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-300 text-xs font-black uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Emergency Alert Log</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#141310] dark:text-[#FCFBF7]">
              Patient SOS & Emergency History
            </h1>
            <p className="text-sm font-bold text-[#66635A] dark:text-[#8E8D85] max-w-2xl">
              Real-time records of one-touch emergency alerts sent from {patient?.name || 'Ayo'}'s companion screen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={refreshState}
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#F3EFE6] dark:bg-[#272A22] border-2 border-[#BFB5A2] dark:border-[#4A4F41] text-[#141310] dark:text-[#FCFBF7] text-xs font-black hover:border-[#143513] transition-all cursor-pointer shadow-xs"
              title="Refresh log status"
            >
              <RefreshCw className="w-4 h-4 text-[#264D24]" />
              <span>Refresh Status</span>
            </button>

            <button
              onClick={handleTriggerDemoSOS}
              disabled={isTriggeringDemo}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black shadow-md hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
              title="Trigger a test SOS alert to verify caregiver response workflows"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isTriggeringDemo ? 'Triggering...' : 'Test Trigger SOS Now 🚨'}</span>
            </button>
          </div>
        </div>

        {/* Safety Framing Disclaimer Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-950 dark:text-red-200 leading-relaxed font-bold">
            <span className="font-black">Safety & Support Framing: </span>
            The SOS feature alerts trusted family and caregiver contacts directly. It is not a substitute for
            government emergency services (112 / ambulance). In life-threatening emergencies, always dial 112 immediately.
          </p>
        </div>
      </div>

      {/* Active Alerts Banner if any exist */}
      {activeEvents.length > 0 && (
        <div className="p-6 rounded-[32px] bg-red-600 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">
                🚨 {activeEvents.length} Active Emergency Alert{activeEvents.length > 1 ? 's' : ''}!
              </h3>
              <p className="text-xs text-red-100 font-bold mt-1">
                {patient?.name || 'Ayo'} triggered an emergency alert. Please check on them immediately.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeEvents.map((evt) => (
              <button
                key={evt.id}
                onClick={() => resolveSOSEvent(evt.id)}
                className="px-5 py-2.5 rounded-full bg-white text-red-700 hover:bg-red-50 text-xs font-black shadow-md cursor-pointer transition-transform hover:scale-105"
              >
                Mark Alert as Resolved ✓
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Content */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-black text-[#141310] dark:text-[#FCFBF7] flex items-center gap-2">
            <span>Alert Records ({filteredEvents.length})</span>
          </h2>

          {/* Filter Pills */}
          <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-white dark:bg-[#1D1F1A] border border-[#DCD4C4] dark:border-[#3C4035]">
            {(['all', 'active', 'resolved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black capitalize transition-colors cursor-pointer ${
                  filter === f
                    ? 'bg-[#264D24] text-white shadow-2xs'
                    : 'text-[#66635A] dark:text-[#8E8D85] hover:text-[#141310] dark:hover:text-[#FCFBF7]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="bg-white dark:bg-[#1D1F1A] rounded-[32px] p-12 text-center border-2 border-dashed border-[#DCD4C4] dark:border-[#3C4035]">
            <ShieldCheck className="w-12 h-12 text-[#264D24] mx-auto mb-3" />
            <h3 className="text-lg font-black text-[#141310] dark:text-[#FCFBF7]">No Alerts in this Category</h3>
            <p className="text-sm font-bold text-[#66635A] dark:text-[#8E8D85] mt-1">
              Everything is currently safe and peaceful.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const isActive = event.status === 'active';
              const triggerTime = new Date(event.triggered_at);
              const formattedTrigger = triggerTime.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              let resolvedDetails = 'Pending action';
              if (event.resolved_at) {
                const resTime = new Date(event.resolved_at);
                const diffMins = Math.round((resTime.getTime() - triggerTime.getTime()) / 60000);
                resolvedDetails = `Resolved after ${diffMins} min${diffMins !== 1 ? 's' : ''} at ${resTime.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}`;
              }

              return (
                <div
                  key={event.id}
                  className={`bg-white dark:bg-[#1D1F1A] rounded-[28px] p-6 border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs ${
                    isActive
                      ? 'border-red-500 ring-2 ring-red-400/20 bg-red-50/50 dark:bg-red-950/20'
                      : 'border-[#DCD4C4] dark:border-[#3C4035]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-[#E0EDE0] text-[#143513] dark:bg-[#263319] dark:text-[#9BB858]'
                      }`}
                    >
                      {isActive ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                            isActive
                              ? 'bg-red-600 text-white'
                              : 'bg-[#E0EDE0] text-[#143513] dark:bg-[#263319] dark:text-[#9BB858]'
                          }`}
                        >
                          {isActive ? 'Active Emergency Alert' : 'Resolved'}
                        </span>
                        <span className="text-xs text-[#66635A] dark:text-[#8E8D85] font-bold">
                          {formattedTrigger}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-[#141310] dark:text-[#FCFBF7]">
                        Alert for {patient?.name || 'Ayo'}
                      </h4>

                      {event.location && (
                        <p className="text-xs text-[#3D3A33] dark:text-[#D1D0C5] flex items-center gap-1 font-bold">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          <span>Reported Location: {event.location}</span>
                        </p>
                      )}

                      {!isActive && (
                        <p className="text-xs text-[#264D24] dark:text-[#9BB858] font-bold">
                          {resolvedDetails}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {isActive ? (
                      <button
                        onClick={() => resolveSOSEvent(event.id)}
                        className="w-full md:w-auto px-5 py-2.5 rounded-full bg-[#264D24] hover:bg-[#1E3E1C] text-white text-xs font-black shadow-md transition-all cursor-pointer"
                      >
                        Mark as Resolved ✓
                      </button>
                    ) : (
                      <span className="text-xs font-black text-[#66635A] dark:text-[#8E8D85] px-3 py-1.5 rounded-full bg-[#F3EFE6] dark:bg-[#272A22]">
                        Incident Closed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
