export type FAQCategory = 
  | 'insurance'
  | 'appointment'
  | 'preparation'
  | 'prescriptions'
  | 'billing'
  | 'general';

export interface ClinicFAQ {
  id: string;
  category: FAQCategory;
  question: string;
  answer: string;
  keywords: string[];
  isActive: boolean;
  lastUpdated: string;
}

export interface ClinicDoctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  availability: string;
}

export interface ClinicHours {
  days: string;
  time: string;
}

export interface Clinic {
  id: string;
  name: string;
  specialty: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  hours: ClinicHours[];
  acceptedInsurances: string[];
  emergencyDisclaimer: string;
  botGreeting: string;
  themeColor: string;
  avatar: string;
  heroImage: string;
  doctors: ClinicDoctor[];
  faqs: ClinicFAQ[];
}

export interface ChatSuggestedAction {
  label: string;
  action: 'book' | 'call' | 'refill' | 'faq_query' | 'escalate';
  payload?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  sourceFaqIds?: string[];
  suggestedActions?: ChatSuggestedAction[];
  isEscalated?: boolean;
  isEmergencyWarning?: boolean;
  modelUsed?: string;
}

export interface AppointmentRequest {
  clinicId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  preferredDate: string;
  preferredTime: string;
  reasonForVisit: string;
  insuranceProvider?: string;
  doctorId?: string;
}

export interface ChatTranscript {
  id: string;
  clinicId: string;
  clinicName: string;
  patientName: string;
  timestamp: string;
  messagesCount: number;
  resolved: boolean;
  escalated: boolean;
  topic: string;
  messages: ChatMessage[];
}
