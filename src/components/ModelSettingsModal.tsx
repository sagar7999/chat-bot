import React, { useState } from 'react';
import { ModelConfig } from '../utils/storage';
import { Cpu, Check, X, Shield, Sparkles, Key } from 'lucide-react';

interface ModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ModelConfig;
  onSaveConfig: (newConfig: ModelConfig) => void;
}

export const ModelSettingsModal: React.FC<ModelSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [preference, setPreference] = useState<'gemini-3.8-flash' | 'gpt-4o' | 'gpt-4' | 'local'>(
    config.preference
  );
  const [customKey, setCustomKey] = useState(config.customOpenAiKey || '');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      preference,
      customOpenAiKey: customKey.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 uppercase tracking-wider font-mono">
            <Cpu className="w-4 h-4 text-teal-600" />
            <span>AI Model Architecture</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            Customer Support Intelligence Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose which AI model processes and grounds clinic patient inquiries.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2.5">
            {/* Gemini 3.8 Flash Option */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                preference === 'gemini-3.8-flash'
                  ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="model-engine"
                checked={preference === 'gemini-3.8-flash'}
                onChange={() => setPreference('gemini-3.8-flash')}
                className="mt-1 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Gemini 3.8 Flash (Grounded Server-Side AI)
                  </span>
                  <span className="text-[10px] text-teal-700 bg-teal-100 font-mono px-1.5 py-0.5 rounded font-semibold">
                    Instant &amp; Preconfigured
                  </span>
                </div>
                <p className="text-slate-500 mt-1">
                  Ultra-low latency (~0.8s), high-throughput medical Q&amp;A. Server-side `@google/genai`
                  grounded strictly in clinic FAQs.
                </p>
              </div>
            </label>

            {/* OpenAI GPT-4o Option */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                preference === 'gpt-4o'
                  ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="model-engine"
                checked={preference === 'gpt-4o'}
                onChange={() => setPreference('gpt-4o')}
                className="mt-1 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">OpenAI GPT-4o (Omni)</span>
                  <span className="text-[10px] text-slate-600 bg-slate-100 font-mono px-1.5 py-0.5 rounded">
                    Advanced Reasoning
                  </span>
                </div>
                <p className="text-slate-500 mt-1">
                  High intelligence flagship model for handling multi-turn patient FAQ disambiguation.
                </p>
              </div>
            </label>

            {/* OpenAI GPT-4 Option */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                preference === 'gpt-4'
                  ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="model-engine"
                checked={preference === 'gpt-4'}
                onChange={() => setPreference('gpt-4')}
                className="mt-1 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">OpenAI GPT-4</span>
                  <span className="text-[10px] text-slate-600 bg-slate-100 font-mono px-1.5 py-0.5 rounded">
                    Clinical Strict
                  </span>
                </div>
                <p className="text-slate-500 mt-1">
                  Standard GPT-4 architecture tailored for medical practice guidelines and patient care.
                </p>
              </div>
            </label>

            {/* Local Fallback Engine */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                preference === 'local'
                  ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="model-engine"
                checked={preference === 'local'}
                onChange={() => setPreference('local')}
                className="mt-1 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1 text-xs">
                <span className="font-bold text-slate-900">Local Semantic FAQ Matcher</span>
                <p className="text-slate-500 mt-1">
                  Zero external calls. Strictly retrieves matching clinic FAQ pairs and formats them
                  locally.
                </p>
              </div>
            </label>
          </div>

          {/* Optional Custom OpenAI Key for GPT-4 Testing */}
          {(preference === 'gpt-4o' || preference === 'gpt-4') && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Key className="w-3.5 h-3.5 text-teal-600" />
                <span>Custom OpenAI API Key (Optional)</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                If provided, requests are routed to OpenAI GPT-4. If left blank, our server handles
                grounded responses using Gemini with GPT-4 compatibility prompts.
              </p>
              <input
                type="password"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
          )}

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Patient Privacy &amp; Grounding Guarantee:</strong> Regardless of engine, patient
              questions are answered strictly from the selected clinic&apos;s verified FAQ knowledge
              base with emergency symptom triage safeguards.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
