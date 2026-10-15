import { Clinic, ChatTranscript } from '../types/clinic';
import { INITIAL_CLINICS } from '../data/mockClinics';

const CLINICS_STORAGE_KEY = 'curadesk_clinics_v1';
const ACTIVE_CLINIC_ID_KEY = 'curadesk_active_clinic_id';
const TRANSCRIPTS_STORAGE_KEY = 'curadesk_transcripts_v1';
const MODEL_CONFIG_KEY = 'curadesk_model_config_v1';

export interface ModelConfig {
  preference: 'gemini-3.8-flash' | 'gpt-4o' | 'gpt-4' | 'local';
  customOpenAiKey?: string;
}

export function loadClinics(): Clinic[] {
  try {
    const raw = localStorage.getItem(CLINICS_STORAGE_KEY);
    if (!raw) {
      saveClinics(INITIAL_CLINICS);
      return INITIAL_CLINICS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CLINICS;
  } catch (e) {
    console.error('Failed to load clinics from storage:', e);
    return INITIAL_CLINICS;
  }
}

export function saveClinics(clinics: Clinic[]): void {
  try {
    localStorage.setItem(CLINICS_STORAGE_KEY, JSON.stringify(clinics));
  } catch (e) {
    console.error('Failed to save clinics:', e);
  }
}

export function getActiveClinicId(clinics: Clinic[]): string {
  const saved = localStorage.getItem(ACTIVE_CLINIC_ID_KEY);
  if (saved && clinics.some(c => c.id === saved)) {
    return saved;
  }
  return clinics[0]?.id || 'apex-dental';
}

export function setActiveClinicId(id: string): void {
  localStorage.setItem(ACTIVE_CLINIC_ID_KEY, id);
}

export function loadTranscripts(): ChatTranscript[] {
  try {
    const raw = localStorage.getItem(TRANSCRIPTS_STORAGE_KEY);
    if (!raw) {
      const defaultTranscripts = generateSampleTranscripts();
      saveTranscripts(defaultTranscripts);
      return defaultTranscripts;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveTranscripts(transcripts: ChatTranscript[]): void {
  try {
    localStorage.setItem(TRANSCRIPTS_STORAGE_KEY, JSON.stringify(transcripts));
  } catch (e) {
    console.error('Failed to save transcripts:', e);
  }
}

export function loadModelConfig(): ModelConfig {
  try {
    const raw = localStorage.getItem(MODEL_CONFIG_KEY);
    if (!raw) {
      return { preference: 'gemini-3.8-flash' };
    }
    return JSON.parse(raw);
  } catch (e) {
    return { preference: 'gemini-3.8-flash' };
  }
}

export function saveModelConfig(config: ModelConfig): void {
  try {
    localStorage.setItem(MODEL_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save model config:', e);
  }
}

function generateSampleTranscripts(): ChatTranscript[] {
  return [
    {
      id: 'tr-1',
      clinicId: 'apex-dental',
      clinicName: 'Apex Dental & Orthodontics',
      patientName: 'Emma Richardson',
      timestamp: 'Today at 10:45 AM',
      messagesCount: 4,
      resolved: true,
      escalated: false,
      topic: 'Delta Dental Insurance Coverage & In-House Plan',
      messages: [
        {
          id: 'm1',
          sender: 'user',
          text: 'Hi, do you take Delta Dental Premier insurance? How much will a cleaning cost?',
          timestamp: '10:45 AM',
        },
        {
          id: 'm2',
          sender: 'bot',
          text: 'Yes! Apex Dental is in-network with Delta Dental Premier and PPO. Under most preventative plans, routine cleanings and exams are covered at 100% with a $0 copay.',
          timestamp: '10:45 AM',
          modelUsed: 'GPT-4 / Gemini 3.8 Flash',
        },
        {
          id: 'm3',
          sender: 'user',
          text: 'Great! Can I book an appointment for this Thursday morning?',
          timestamp: '10:46 AM',
        },
        {
          id: 'm4',
          sender: 'bot',
          text: 'Certainly! I have forwarded your request to our scheduling desk for Thursday morning with Dr. Campbell.',
          timestamp: '10:46 AM',
        },
      ],
    },
    {
      id: 'tr-2',
      clinicId: 'evergreen-pediatrics',
      clinicName: 'Evergreen Pediatric & Family Health',
      patientName: 'Michael Chang (Parent)',
      timestamp: 'Today at 8:15 AM',
      messagesCount: 5,
      resolved: true,
      escalated: true,
      topic: 'Fever Guidelines for 2-month-old Infant',
      messages: [
        {
          id: 'm5',
          sender: 'user',
          text: 'My 7-week-old baby has a rectal temperature of 100.8 F. Should I give Tylenol or bring him in?',
          timestamp: '8:15 AM',
        },
        {
          id: 'm6',
          sender: 'bot',
          text: '⚠️ URGENT CLINICAL PROTOCOL: For any infant under 3 months with a temperature >= 100.4°F, immediate emergency evaluation is required. Do NOT administer fever reducers prior to clinical evaluation. Please proceed to the nearest pediatric emergency department or call 911.',
          timestamp: '8:15 AM',
          isEmergencyWarning: true,
          isEscalated: true,
        },
      ],
    },
    {
      id: 'tr-3',
      clinicId: 'summit-pt',
      clinicName: 'Summit Spine & Physical Therapy Center',
      patientName: 'David Miller',
      timestamp: 'Yesterday at 3:20 PM',
      messagesCount: 3,
      resolved: true,
      escalated: false,
      topic: 'Direct Access Evaluation (No Doctor Referral Needed)',
      messages: [
        {
          id: 'm7',
          sender: 'user',
          text: 'Do I need a prescription from an orthopedic surgeon before I can come in for a knee assessment?',
          timestamp: '3:20 PM',
        },
        {
          id: 'm8',
          sender: 'bot',
          text: 'No referral is required! Under Direct Access, you can begin treatment immediately with our licensed physical therapists for up to 12 visits or 45 days.',
          timestamp: '3:20 PM',
        },
      ],
    },
  ];
}
