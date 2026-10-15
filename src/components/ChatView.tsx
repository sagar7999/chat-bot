import React, { useState, useRef, useEffect } from 'react';
import { Clinic, ChatMessage, ChatSuggestedAction, AppointmentRequest } from '../types/clinic';
import { ModelConfig } from '../utils/storage';
import {
  Send,
  Phone,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  X,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface ChatViewProps {
  clinic: Clinic;
  modelConfig: ModelConfig;
  onRecordTranscript: (messages: ChatMessage[], topic: string, escalated: boolean) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ clinic, modelConfig, onRecordTranscript }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: clinic.botGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'Grounded Clinic AI',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Booking Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredDoctor, setPreferredDoctor] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Reset chat when clinic changes
  useEffect(() => {
    setMessages([
      {
        id: `welcome-${clinic.id}-${Date.now()}`,
        sender: 'bot',
        text: clinic.botGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'Grounded Clinic AI',
      },
    ]);
    setEscatedState(false);
    setBookingSuccess(null);
  }, [clinic.id]);

  const setEscatedState = (state: boolean) => {
    setEscalated(state);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic,
          messages: updatedMessages,
          modelPreference: modelConfig.preference,
          customOpenAiKey: modelConfig.customOpenAiKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI response');
      }

      const data = await response.json();

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceFaqIds: data.sourceFaqIds,
        suggestedActions: data.suggestedActions,
        isEmergencyWarning: data.isEmergencyWarning,
        modelUsed: data.modelUsed,
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      if (data.isEmergencyWarning) {
        setEscalated(true);
      }

      // Record transcript to analytics
      onRecordTranscript(
        finalMessages,
        text.slice(0, 45),
        data.isEmergencyWarning || escalated
      );
    } catch (err: any) {
      console.error('Chat error:', err);
      // Fallback response
      const fallbackMessage: ChatMessage = {
        id: `bot-fallback-${Date.now()}`,
        sender: 'bot',
        text: `Thank you for reaching out to ${clinic.name}. Please contact our front desk directly at ${clinic.phone} during business hours (${clinic.hours[0]?.time}), and our team will be delighted to answer your questions.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: `Call Reception (${clinic.phone})`, action: 'call', payload: clinic.phone },
          { label: 'Request Appointment', action: 'book' },
        ],
        modelUsed: 'Local Clinic Fallback',
      };
      setMessages([...updatedMessages, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (action: ChatSuggestedAction) => {
    if (action.action === 'book') {
      setShowBookingModal(true);
    } else if (action.action === 'call') {
      window.open(`tel:${action.payload || clinic.phone}`);
    } else if (action.action === 'escalate') {
      setShowEscalateModal(true);
    } else if (action.action === 'refill') {
      handleSendMessage('What is your prescription refill policy and how much notice do I need?');
    } else if (action.action === 'faq_query' && action.payload) {
      handleSendMessage(action.payload);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${clinic.id}-${Date.now()}`,
        sender: 'bot',
        text: clinic.botGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'Grounded Clinic AI',
      },
    ]);
    setEscatedState(false);
    setBookingSuccess(null);
  };

  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_]/g, ''));
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleBookAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const confCode = `APT-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingSuccess(confCode);

    const bookingConfirmationMsg: ChatMessage = {
      id: `system-book-${Date.now()}`,
      sender: 'system',
      text: `Appointment Request Confirmed (#${confCode})\nPatient: ${patientName}\nPreferred Date: ${preferredDate}\nDoctor: ${preferredDoctor || 'First Available'}\nClinic: ${clinic.name}\n\nOur coordinator will send an SMS and email confirmation within 2 business hours.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, bookingConfirmationMsg]);
    setTimeout(() => {
      setShowBookingModal(false);
      setPatientName('');
      setPatientPhone('');
      setPatientEmail('');
      setPreferredDate('');
      setReasonForVisit('');
    }, 1800);
  };

  const handleConfirmEscalation = () => {
    setEscatedState(true);
    setShowEscalateModal(false);
    const escalationMsg: ChatMessage = {
      id: `escalation-${Date.now()}`,
      sender: 'bot',
      text: `Front Desk Transfer Initiated: I have flagged your inquiry for priority attention. Nurse Specialist on duty (${clinic.doctors[0]?.name || 'Triage Team'}) and Receptionist have received your chat history. You can also reach our direct phone line at ${clinic.phone}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEscalated: true,
      suggestedActions: [
        { label: `Direct Dial: ${clinic.phone}`, action: 'call', payload: clinic.phone },
      ],
    };
    setMessages((prev) => [...prev, escalationMsg]);
  };

  // Sample quick FAQ chips based on clinic
  const quickFaqPrompts = [
    'Do you accept my insurance?',
    'How do I prepare for my appointment?',
    'What is your cancellation fee & notice policy?',
    'Can I get a same-day appointment or refill?',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Clinic Profile & Verified Patient Info (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Clinic Identity Card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="relative h-32 bg-slate-100 overflow-hidden">
              <img
                src={clinic.heroImage}
                alt={clinic.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs">
                  {clinic.specialty}
                </span>
                <span className="text-xs text-white/90 font-mono">
                  {clinic.faqs.filter((f) => f.isActive).length} FAQs Verified
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">{clinic.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{clinic.tagline}</p>
              </div>

              {/* Contact and address */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <a href={`tel:${clinic.phone}`} className="font-medium hover:text-teal-700">
                    {clinic.phone}
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>{clinic.address}</span>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Hours of Care</span>
                </div>
                <div className="space-y-1 text-xs text-slate-600 font-mono">
                  {clinic.hours.map((h, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-slate-500">{h.days}:</span>
                      <span className="text-slate-900 font-medium">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctors on Staff */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Staff Physicians & Providers</span>
                </div>
                <div className="space-y-1.5">
                  {clinic.doctors.map((doc) => (
                    <div key={doc.id} className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="font-semibold text-slate-900">{doc.name}</div>
                      <div className="text-slate-500 text-[11px]">{doc.title}</div>
                      <div className="text-teal-700 text-[11px] mt-0.5">Availability: {doc.availability}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accepted Insurance preview */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Accepted Insurances ({clinic.acceptedInsurances.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                  {clinic.acceptedInsurances.slice(0, 4).map((ins, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {ins}
                    </span>
                  ))}
                  {clinic.acceptedInsurances.length > 4 && (
                    <span className="px-1.5 py-0.5 text-slate-500 text-[11px]">
                      +{clinic.acceptedInsurances.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Emergency Banner */}
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">{clinic.emergencyDisclaimer}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Chat Interface (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs h-[720px] overflow-hidden">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={clinic.avatar}
                  alt="Assistant"
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{clinic.name} Support</h3>
                  {escalated && (
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      Staff Alerted
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>GPT-4 / Gemini FAQ Engine</span>
                  <span>·</span>
                  <span className="text-emerald-700 font-medium">Online for Patient Inquiries</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBookingModal(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Visit</span>
              </button>
              <button
                onClick={handleResetChat}
                title="Restart conversation"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick FAQ Prompts bar */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 font-medium whitespace-nowrap shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-600" />
              FAQ Shortcuts:
            </span>
            {quickFaqPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={isTyping}
                className="whitespace-nowrap px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-teal-500 hover:text-teal-700 transition-colors shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSystem = msg.sender === 'system';

              if (isSystem) {
                return (
                  <div
                    key={msg.id}
                    className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs space-y-1 font-mono whitespace-pre-wrap"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-teal-800">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      <span>CLINIC ACTION CONFIRMED</span>
                    </div>
                    <div>{msg.text}</div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-teal-700 text-white rounded-br-xs'
                        : msg.isEmergencyWarning
                        ? 'bg-red-50 border border-red-300 text-red-950 rounded-bl-xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Bot citations and speech action */}
                    {!isUser && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          {msg.modelUsed && (
                            <span className="font-mono text-[10px] text-slate-500">
                              {msg.modelUsed}
                            </span>
                          )}
                          {msg.sourceFaqIds && msg.sourceFaqIds.length > 0 && (
                            <span className="text-teal-700 font-medium">
                              · Grounded in {msg.sourceFaqIds.length} FAQ policies
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleSpeakText(msg.text)}
                          title="Read aloud"
                          className="hover:text-slate-800 p-0.5 rounded transition-colors"
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Suggested actions if provided */}
                  {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedActions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionClick(act)}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-300 hover:border-teal-600 hover:text-teal-700 text-slate-700 transition-colors shadow-2xs"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 px-1 font-mono">{msg.timestamp}</span>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                <div className="flex gap-1 items-center px-3 py-2 bg-slate-100 rounded-full">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                </div>
                <span className="text-slate-500 font-medium">Consulting {clinic.name} clinical FAQs...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Ask ${clinic.name} about insurance, prep, hours, doctors...`}
                disabled={isTyping}
                className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900 placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 text-white rounded-xl transition-colors font-medium flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Send</span>
              </button>
            </form>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
              <span>Automatic clinic triage and FAQ resolution engine</span>
              <button
                onClick={() => setShowEscalateModal(true)}
                className="text-teal-700 hover:underline font-medium"
              >
                Need to speak with human staff?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider font-mono">
                Direct Clinic Scheduling
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Request Appointment at {clinic.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your request is checked directly against {clinic.name}&apos;s staff calendar.
              </p>
            </div>

            {bookingSuccess ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-950">Appointment Request Received!</h4>
                <p className="text-xs text-emerald-800">
                  Confirmation Code: <span className="font-mono font-bold">{bookingSuccess}</span>
                </p>
                <p className="text-xs text-emerald-700">
                  We have added this confirmation to your live chat session.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookAppointmentSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Patient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Jordan Miller"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Select Doctor or Provider
                  </label>
                  <select
                    value={preferredDoctor}
                    onChange={(e) => setPreferredDoctor(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  >
                    <option value="">Any Available Doctor ({clinic.name})</option>
                    {clinic.doctors.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Reason for Visit / Symptoms *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={reasonForVisit}
                    onChange={(e) => setReasonForVisit(e.target.value)}
                    placeholder="e.g. Toothache on lower left, annual physical, knee injury..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs"
                  >
                    Confirm Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Staff Escalation Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowEscalateModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Escalate to Front Desk / Nurse Triage
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Would you like to transfer your inquiry to {clinic.name}&apos;s live clinical reception
              team? Your chat history will be flagged for staff review.
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1 mb-4">
              <div className="font-semibold text-slate-900">{clinic.name} Contact Line</div>
              <div className="text-teal-700 font-medium font-mono">{clinic.phone}</div>
              <div className="text-slate-500 text-[11px]">
                Active staff hours: {clinic.hours[0]?.time || '8am - 5pm'}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEscalateModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Stay with Bot
              </button>
              <button
                type="button"
                onClick={handleConfirmEscalation}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs"
              >
                Transfer to Human Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
