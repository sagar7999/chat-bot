/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clinic, ClinicFAQ, ChatMessage, ChatTranscript } from './types/clinic';
import {
  loadClinics,
  saveClinics,
  getActiveClinicId,
  setActiveClinicId,
  loadTranscripts,
  saveTranscripts,
  loadModelConfig,
  saveModelConfig,
  ModelConfig,
} from './utils/storage';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { FaqManagerView } from './components/FaqManagerView';
import { ClinicDirectoryView } from './components/ClinicDirectoryView';
import { WidgetEmbedView } from './components/WidgetEmbedView';
import { TriageLogsView } from './components/TriageLogsView';
import { ModelSettingsModal } from './components/ModelSettingsModal';

export default function App() {
  const [clinics, setClinics] = useState<Clinic[]>(() => loadClinics());
  const [activeClinicId, setActiveClinicIdState] = useState<string>(() =>
    getActiveClinicId(clinics)
  );
  const [activeTab, setActiveTab] = useState<'chat' | 'faqs' | 'clinics' | 'widget' | 'logs'>('chat');
  const [transcripts, setTranscripts] = useState<ChatTranscript[]>(() => loadTranscripts());
  const [modelConfig, setModelConfig] = useState<ModelConfig>(() => loadModelConfig());
  const [showModelModal, setShowModelModal] = useState(false);

  // Active clinic object
  const activeClinic =
    clinics.find((c) => c.id === activeClinicId) || clinics[0];

  const handleSelectClinic = (id: string) => {
    setActiveClinicIdState(id);
    setActiveClinicId(id);
  };

  const handleUpdateClinicFaqs = (clinicId: string, updatedFaqs: ClinicFAQ[]) => {
    const updated = clinics.map((c) => (c.id === clinicId ? { ...c, faqs: updatedFaqs } : c));
    setClinics(updated);
    saveClinics(updated);
  };

  const handleAddNewClinic = (newClinic: Clinic) => {
    const updated = [newClinic, ...clinics];
    setClinics(updated);
    saveClinics(updated);
    handleSelectClinic(newClinic.id);
    setActiveTab('chat');
  };

  const handleRecordTranscript = (
    messages: ChatMessage[],
    topic: string,
    escalated: boolean
  ) => {
    const newTranscript: ChatTranscript = {
      id: `tr-${Date.now()}`,
      clinicId: activeClinic.id,
      clinicName: activeClinic.name,
      patientName: 'Patient Guest',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messagesCount: messages.length,
      resolved: !escalated,
      escalated,
      topic: topic || 'General Patient Consultation',
      messages,
    };

    const updated = [newTranscript, ...transcripts];
    setTranscripts(updated);
    saveTranscripts(updated);
  };

  const handleSaveModelConfig = (newConfig: ModelConfig) => {
    setModelConfig(newConfig);
    saveModelConfig(newConfig);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        clinics={clinics}
        activeClinic={activeClinic}
        onSelectClinic={handleSelectClinic}
        modelConfig={modelConfig}
        onOpenModelModal={() => setShowModelModal(true)}
        onOpenNewClinicModal={() => setActiveTab('clinics')}
      />

      <main className="flex-1 pb-12">
        {activeTab === 'chat' && (
          <ChatView
            clinic={activeClinic}
            modelConfig={modelConfig}
            onRecordTranscript={handleRecordTranscript}
          />
        )}

        {activeTab === 'faqs' && (
          <FaqManagerView
            clinic={activeClinic}
            onUpdateClinicFaqs={handleUpdateClinicFaqs}
          />
        )}

        {activeTab === 'clinics' && (
          <ClinicDirectoryView
            clinics={clinics}
            activeClinic={activeClinic}
            onSelectClinic={handleSelectClinic}
            onNavigateToChat={() => setActiveTab('chat')}
            onNavigateToFaqs={() => setActiveTab('faqs')}
            onAddNewClinic={handleAddNewClinic}
          />
        )}

        {activeTab === 'widget' && <WidgetEmbedView clinic={activeClinic} />}

        {activeTab === 'logs' && (
          <TriageLogsView
            transcripts={transcripts}
            clinics={clinics}
            activeClinic={activeClinic}
          />
        )}
      </main>

      <ModelSettingsModal
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
        config={modelConfig}
        onSaveConfig={handleSaveModelConfig}
      />

      {/* Quiet, compliant footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CuraDesk Multi-Clinic Patient Support Platform</span>
          <span>Automatic FAQ Resolution &amp; Triage</span>
        </div>
      </footer>
    </div>
  );
}
