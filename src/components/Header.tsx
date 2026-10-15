import React from 'react';
import { Clinic } from '../types/clinic';
import { Bot, Sparkles, Building2, ChevronDown, Cpu } from 'lucide-react';
import { ModelConfig } from '../utils/storage';

interface HeaderProps {
  activeTab: 'chat' | 'faqs' | 'clinics' | 'widget' | 'logs';
  onTabChange: (tab: 'chat' | 'faqs' | 'clinics' | 'widget' | 'logs') => void;
  clinics: Clinic[];
  activeClinic: Clinic;
  onSelectClinic: (clinicId: string) => void;
  modelConfig: ModelConfig;
  onOpenModelModal: () => void;
  onOpenNewClinicModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  clinics,
  activeClinic,
  onSelectClinic,
  modelConfig,
  onOpenModelModal,
  onOpenNewClinicModal,
}) => {
  const getModelLabel = () => {
    switch (modelConfig.preference) {
      case 'gpt-4o':
        return 'GPT-4o';
      case 'gpt-4':
        return 'GPT-4';
      case 'local':
        return 'Local FAQ Matcher';
      default:
        return 'Gemini 3.8 / GPT-4';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('chat');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-teal-700 transition-colors"
            >
              CuraDesk
            </a>
          </div>

          {/* Zone 2: 4-5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onTabChange('chat')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'chat'
                  ? 'text-teal-700 border-teal-600 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Patient Chatbot
            </button>
            <button
              onClick={() => onTabChange('faqs')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'faqs'
                  ? 'text-teal-700 border-teal-600 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Knowledge Base
            </button>
            <button
              onClick={() => onTabChange('clinics')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'clinics'
                  ? 'text-teal-700 border-teal-600 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Clinics Directory
            </button>
            <button
              onClick={() => onTabChange('widget')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'widget'
                  ? 'text-teal-700 border-teal-600 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Widget Embed
            </button>
            <button
              onClick={() => onTabChange('logs')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'logs'
                  ? 'text-teal-700 border-teal-600 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Triage Logs
            </button>
          </nav>

          {/* Zone 3: Primary action / Clinic Switcher & AI Engine Status */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Model Engine Selector */}
            <button
              onClick={onOpenModelModal}
              title="Configure AI Model Engine (GPT-4 / Gemini)"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 border border-slate-200"
            >
              <Cpu className="w-3.5 h-3.5 text-teal-600" />
              <span>{getModelLabel()}</span>
            </button>

            {/* Clinic Switcher Select */}
            <div className="relative flex items-center">
              <label htmlFor="clinic-select" className="sr-only">
                Select Clinic
              </label>
              <Building2 className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                id="clinic-select"
                value={activeClinic.id}
                onChange={(e) => onSelectClinic(e.target.value)}
                className="pl-8 pr-7 py-1.5 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none max-w-[190px] sm:max-w-[220px] truncate"
              >
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
            </div>

            {/* Quick Add Clinic button */}
            <button
              onClick={onOpenNewClinicModal}
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              + Add Clinic
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center gap-4 py-2 border-t border-slate-100 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => onTabChange('chat')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'chat' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600'}`}
          >
            Chatbot
          </button>
          <button
            onClick={() => onTabChange('faqs')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'faqs' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600'}`}
          >
            Knowledge Base
          </button>
          <button
            onClick={() => onTabChange('clinics')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'clinics' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600'}`}
          >
            Clinics
          </button>
          <button
            onClick={() => onTabChange('widget')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'widget' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600'}`}
          >
            Widget
          </button>
          <button
            onClick={() => onTabChange('logs')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'logs' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600'}`}
          >
            Logs
          </button>
        </div>
      </div>
    </header>
  );
};
