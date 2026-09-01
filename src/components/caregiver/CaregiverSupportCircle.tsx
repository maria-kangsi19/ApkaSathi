import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Plus,
  Trash2,
  PhoneCall,
  Heart,
  ShieldCheck,
  X,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupportContact } from '../../types';

export const CaregiverSupportCircle: React.FC = () => {
  const { state, addSupportContact, deleteSupportContact } = useApp();
  const contacts = state?.supportContacts || [];

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'family' | 'asha_worker' | 'doctor' | 'neighbor' | 'other'>('family');
  const [phone, setPhone] = useState('+91 ');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');

  const sampleContactPresets = [
    {
      name: 'Dr. Jamir',
      role: 'doctor' as const,
      phone: '+91 98765 43210',
      photoUrl: '/src/assets/images/northeast_doctor_1788273951193.jpg',
      notes: 'Family Physician at Mokokchung District Hospital',
    },
    {
      name: 'Lipokla',
      role: 'asha_worker' as const,
      phone: '+91 94360 11223',
      photoUrl: '/src/assets/images/northeast_asha_worker_1788273924498.jpg',
      notes: 'ASHA Health Worker, Ungma Village',
    },
  ];

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    await addSupportContact({
      name,
      role,
      phone,
      photo_url: photoUrl || '/src/assets/images/northeast_granddaughter_1788273863871.jpg',
      notes,
    });

    setName('');
    setRole('family');
    setPhone('+91 ');
    setPhotoUrl('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCD4C4] dark:border-[#3C4035] pb-6">
        <div>
          <h1 className="serif text-2xl sm:text-3xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
            Support Circle & Emergency Contacts
          </h1>
          <p className="text-xs sm:text-sm text-[#3D3A33] dark:text-[#D1D0C5] font-semibold mt-1">
            Contacts that appear as one-touch big buttons on the Patient "Call Loved Ones" screen.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#264D24] hover:bg-[#1D3D1B] text-white text-sm font-extrabold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Support Contact</span>
        </button>
      </div>

      {/* Grid of Contacts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map((contact) => (
          <motion.div
            key={contact.id}
            layout
            className="rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#DCD4C4] dark:border-[#3C4035] hover:border-[#264D24] p-6 shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={
                    contact.photo_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={contact.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#264D24] shadow-xs"
                />
                <div>
                  <h3 className="serif text-lg sm:text-xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
                    {contact.name}
                  </h3>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#9C382A]/10 text-[#9C382A] dark:text-[#E38B7D] text-xs font-extrabold capitalize border border-[#9C382A]/20">
                    {contact.role.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs sm:text-sm text-[#3D3A33] dark:text-[#D1D0C5] mb-4">
                <p className="font-extrabold text-[#141310] dark:text-[#FCFBF7]">📞 {contact.phone}</p>
                {contact.notes && <p className="font-semibold">{contact.notes}</p>}
              </div>
            </div>

            <div className="pt-4 border-t border-[#DCD4C4] dark:border-[#3C4035] flex items-center justify-between">
              <a
                href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EBF3E8] dark:bg-[#242E18] text-[#264D24] dark:text-[#8DA850] font-extrabold text-xs hover:bg-[#264D24] hover:text-white transition-colors border border-[#264D24]/20"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Test Dial</span>
              </a>

              <button
                onClick={() => deleteSupportContact(contact.id)}
                className="p-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                title="Delete contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1D1F1A] border-2 border-[#264D24] p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="serif text-xl font-extrabold text-[#141310] dark:text-[#FCFBF7]">
                  Add to Support Circle
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5 text-[#3D3A33] dark:text-[#D1D0C5]" />
                </button>
              </div>

              {/* Sample presets */}
              <div className="mb-4">
                <label className="text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] uppercase tracking-wider mb-2 block">
                  Quick Select Sample Helper:
                </label>
                <div className="flex flex-wrap gap-2">
                  {sampleContactPresets.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setName(preset.name);
                        setRole(preset.role);
                        setPhone(preset.phone);
                        setPhotoUrl(preset.photoUrl);
                        setNotes(preset.notes);
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#F3EFE6] dark:bg-[#272A22] hover:bg-[#EBF3E8] text-xs font-bold text-[#141310] dark:text-[#FCFBF7] border border-[#DCD4C4] dark:border-[#3C4035] cursor-pointer"
                    >
                      {preset.name} ({preset.role})
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveContact} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jamir / Sentila"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                      Role *
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none cursor-pointer"
                    >
                      <option value="family">Family</option>
                      <option value="asha_worker">ASHA Worker</option>
                      <option value="doctor">Doctor</option>
                      <option value="neighbor">Neighbor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                    Photo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#141310] dark:text-[#FCFBF7] mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Can be called during morning tea hours"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-[#DCD4C4] dark:border-[#3C4035] bg-white dark:bg-[#1D1F1A] text-[#141310] dark:text-[#FCFBF7] text-sm focus:border-[#264D24] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DCD4C4] dark:border-[#3C4035]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-full text-sm font-extrabold text-[#3D3A33] dark:text-[#D1D0C5] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#264D24] hover:bg-[#1D3D1B] text-white text-sm font-extrabold shadow-md cursor-pointer"
                  >
                    Save Contact
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
