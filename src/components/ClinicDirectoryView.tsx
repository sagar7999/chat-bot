import React, { useState } from 'react';
import { Clinic, ClinicDoctor, ClinicHours } from '../types/clinic';
import {
  Building2,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Plus,
  MessageSquare,
  FileQuestion,
  Users,
  Check,
  ChevronRight,
  X,
} from 'lucide-react';

interface ClinicDirectoryViewProps {
  clinics: Clinic[];
  activeClinic: Clinic;
  onSelectClinic: (id: string) => void;
  onNavigateToChat: () => void;
  onNavigateToFaqs: () => void;
  onAddNewClinic: (newClinic: Clinic) => void;
}

export const ClinicDirectoryView: React.FC<ClinicDirectoryViewProps> = ({
  clinics,
  activeClinic,
  onSelectClinic,
  onNavigateToChat,
  onNavigateToFaqs,
  onAddNewClinic,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // New clinic form states
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [tagline, setTagline] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [hoursString, setHoursString] = useState('Mon - Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM');
  const [insuranceString, setInsuranceString] = useState('Blue Cross, Aetna, Cigna, UnitedHealthcare, Medicare');
  const [botGreeting, setBotGreeting] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorSpecialty, setDoctorSpecialty] = useState('');

  const handleCreateClinic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedHours: ClinicHours[] = hoursString
      .split(',')
      .map((h) => {
        const parts = h.split(':');
        return {
          days: parts[0]?.trim() || 'Weekdays',
          time: parts.slice(1).join(':').trim() || '8:00 AM – 5:00 PM',
        };
      })
      .filter((h) => h.days && h.time);

    const parsedInsurances = insuranceString
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    const newClinic: Clinic = {
      id: `clinic-${Date.now()}`,
      name,
      specialty: specialty || 'General Practice',
      tagline: tagline || 'Dedicated to compassionate, patient-centered care.',
      phone: phone || '(555) 123-4567',
      email: email || 'contact@cliniccare.com',
      address: address || '100 Medical Center Blvd, Suite 200',
      hours: parsedHours.length > 0 ? parsedHours : [{ days: 'Mon – Fri', time: '8:00 AM – 5:00 PM' }],
      acceptedInsurances: parsedInsurances,
      emergencyDisclaimer: 'For life-threatening symptoms, please call 911 or visit the emergency room immediately.',
      botGreeting:
        botGreeting ||
        `Welcome to ${name}. I'm your virtual patient care assistant. How can I help you today?`,
      themeColor: '#0d9488',
      avatar: '/src/assets/images/clinic_care_specialist_1792041298304.jpg',
      heroImage: '/src/assets/images/clinic_modern_lobby_1792041298795.jpg',
      doctors: [
        {
          id: `doc-${Date.now()}`,
          name: doctorName || 'Dr. Alex Morgan, MD',
          title: 'Lead Physician',
          specialty: doctorSpecialty || specialty || 'Primary Care',
          availability: 'Monday – Friday',
        },
      ],
      faqs: [
        {
          id: `faq-init-1`,
          category: 'insurance',
          question: `What insurances are accepted at ${name}?`,
          answer: `We accept ${parsedInsurances.join(', ')}. For patients with out-of-network plans, our team files electronic courtesy claims.`,
          keywords: ['insurance', 'coverage', 'in-network'],
          isActive: true,
          lastUpdated: new Date().toISOString().split('T')[0],
        },
        {
          id: `faq-init-2`,
          category: 'appointment',
          question: 'What is your appointment cancellation policy?',
          answer: 'Please notify us at least 24 hours in advance to reschedule or cancel without penalty.',
          keywords: ['cancellation', 'reschedule', 'notice'],
          isActive: true,
          lastUpdated: new Date().toISOString().split('T')[0],
        },
      ],
    };

    onAddNewClinic(newClinic);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider font-mono">
            Network Architecture
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Multi-Clinic Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            CuraDesk powers unique GPT-4 / Gemini support bots tailored for each clinic&apos;s
            specialty, doctors, and policies.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Clinic</span>
        </button>
      </div>

      {/* Clinics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clinics.map((c) => {
          const isActive = c.id === activeClinic.id;
          return (
            <div
              key={c.id}
              className={`bg-white rounded-xl border overflow-hidden transition-all shadow-xs ${
                isActive ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="relative h-28 bg-slate-100 overflow-hidden">
                <img
                  src={c.heroImage}
                  alt={c.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-black/40 backdrop-blur-2xs">
                    {c.specialty}
                  </span>
                  {isActive && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-500 text-white flex items-center gap-1 font-mono">
                      <Check className="w-3 h-3" />
                      Active Clinic
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{c.tagline}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{c.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-mono text-[11px] truncate">
                      {c.hours[0]?.days}: {c.hours[0]?.time}
                    </span>
                  </div>
                </div>

                {/* Badges / Stats unboxed */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span>{c.doctors.length} Doctors</span>
                  <span aria-hidden="true">·</span>
                  <span>{c.faqs.length} FAQs</span>
                  <span aria-hidden="true">·</span>
                  <span>{c.acceptedInsurances.length} Insurances</span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectClinic(c.id);
                      onNavigateToChat();
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Test Patient Chat</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectClinic(c.id);
                      onNavigateToFaqs();
                    }}
                    className="py-1.5 px-3 rounded-lg text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                  >
                    <FileQuestion className="w-3.5 h-3.5" />
                    <span>FAQs</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Clinic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 my-8">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider font-mono">
                Provisioning
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">Register a New Clinic</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Each clinic receives its own grounded customer support chatbot and knowledge base.
              </p>
            </div>

            <form onSubmit={handleCreateClinic} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Clinic Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Metro Eye Institute"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Medical Specialty *
                  </label>
                  <input
                    type="text"
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Ophthalmology & LASIK"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tagline / Mission
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Precision laser vision correction and retinal care."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Main Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 789-0123"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="desk@metroeye.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Clinic Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 500 Grand Ave, Suite 300, New York, NY"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Working Hours (Comma separated)
                </label>
                <input
                  type="text"
                  value={hoursString}
                  onChange={(e) => setHoursString(e.target.value)}
                  placeholder="Mon - Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Accepted Insurances (Comma separated)
                </label>
                <input
                  type="text"
                  value={insuranceString}
                  onChange={(e) => setInsuranceString(e.target.value)}
                  placeholder="Blue Cross, Aetna, Cigna, Medicare"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Primary Doctor / Specialist Name
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Olivia Carter, MD"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Doctor Specialty / Title
                  </label>
                  <input
                    type="text"
                    value={doctorSpecialty}
                    onChange={(e) => setDoctorSpecialty(e.target.value)}
                    placeholder="e.g. Cornea & Refractive Surgeon"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs"
                >
                  Save Clinic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
