import React, { useState } from 'react';
import { Clinic } from '../types/clinic';
import {
  Code,
  Copy,
  Check,
  Globe,
  Sliders,
  MessageCircle,
  X,
  Send,
  Building2,
  ExternalLink,
} from 'lucide-react';

interface WidgetEmbedViewProps {
  clinic: Clinic;
}

export const WidgetEmbedView: React.FC<WidgetEmbedViewProps> = ({ clinic }) => {
  const [copied, setCopied] = useState(false);
  const [widgetPosition, setWidgetPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testMessages, setTestMessages] = useState<{ sender: 'bot' | 'user'; text: string }[]>([
    {
      sender: 'bot',
      text: clinic.botGreeting,
    },
  ]);

  const embedScript = `<!-- CuraDesk AI Clinic Customer Support Widget -->
<script
  src="https://cdn.curadesk.health/widget.js"
  data-clinic-id="${clinic.id}"
  data-clinic-name="${clinic.name}"
  data-theme-color="${clinic.themeColor}"
  data-position="${widgetPosition}"
  data-model="gpt-4"
  async
></script>
<!-- End CuraDesk Widget -->`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTestMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const userText = testInput;
    setTestMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setTestInput('');

    // Simulated widget response
    setTimeout(() => {
      setTestMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Thank you for asking! For ${clinic.name}, our verified FAQ policy states we are open ${clinic.hours[0]?.time} and accept ${clinic.acceptedInsurances.slice(0, 3).join(', ')}. Contact us at ${clinic.phone} to book!`,
        },
      ]);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider font-mono">
            Website Integration
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Embeddable Support Widget</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deploy this automated GPT-4 / Gemini FAQ chatbot onto {clinic.name}&apos;s public website
            with a single line of JavaScript.
          </p>
        </div>

        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Code Copied!' : 'Copy Embed Code'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Code & Customization (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              <span>Widget Configuration</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Active Clinic Source
              </label>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>{clinic.name}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Widget Screen Position
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWidgetPosition('bottom-right')}
                  className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                    widgetPosition === 'bottom-right'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Bottom Right (Default)
                </button>
                <button
                  type="button"
                  onClick={() => setWidgetPosition('bottom-left')}
                  className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                    widgetPosition === 'bottom-left'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Bottom Left
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                HTML Embed Snippet
              </label>
              <div className="relative">
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {embedScript}
                </pre>
                <button
                  onClick={handleCopyCode}
                  className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 text-teal-900 text-xs space-y-1">
              <div className="font-semibold">Plug & Play Compatibility</div>
              <p className="text-[11px] leading-relaxed">
                Compatible with any web CMS including WordPress, Squarespace, Webflow, Shopify,
                Next.js, and static HTML pages. Loads asynchronously with zero impact on page speed.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Clinic Website Simulator (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg">
            {/* Browser chrome header */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex-1 max-w-sm mx-auto px-3 py-1 rounded bg-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-center gap-1.5 truncate">
                <Globe className="w-3 h-3" />
                <span>https://www.{clinic.id}.com/patient-portal</span>
              </div>
            </div>

            {/* Simulated Clinic Website Canvas */}
            <div className="relative bg-slate-100 h-[560px] overflow-hidden flex flex-col justify-between">
              {/* Simulated clinic web content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="font-bold text-slate-900 text-base">{clinic.name}</span>
                  <div className="hidden sm:flex items-center gap-4 text-xs text-slate-600">
                    <span>Doctors</span>
                    <span>Treatments</span>
                    <span>Insurance</span>
                    <span>Patient Portal</span>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 max-w-md">
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider font-mono">
                    Welcome to our practice
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">{clinic.tagline}</h2>
                  <p className="text-xs text-slate-600">
                    Questions about appointment prep, insurance claims, or booking with our doctors?
                    Click the chat icon in the corner to speak with our instant FAQ assistant.
                  </p>
                </div>
              </div>

              {/* Floating Widget In Simulator */}
              <div
                className={`absolute bottom-5 ${
                  widgetPosition === 'bottom-right' ? 'right-5' : 'left-5'
                } z-20 flex flex-col items-${widgetPosition === 'bottom-right' ? 'end' : 'start'}`}
              >
                {/* Expanded Widget Window */}
                {widgetOpen && (
                  <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mb-3 animate-in fade-in zoom-in-95 flex flex-col h-[400px]">
                    {/* Widget Header */}
                    <div className="p-3 bg-teal-600 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={clinic.avatar}
                          alt="Bot"
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-white/30"
                        />
                        <div>
                          <div className="text-xs font-bold leading-tight">{clinic.name} AI</div>
                          <div className="text-[10px] text-teal-100">Live Support & FAQ Specialist</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setWidgetOpen(false)}
                        className="p-1 text-white/80 hover:text-white rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Widget Messages */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs bg-slate-50">
                      {testMessages.map((m, idx) => (
                        <div
                          key={idx}
                          className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl px-3 py-2 ${
                              m.sender === 'user'
                                ? 'bg-teal-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Widget Input Form */}
                    <form
                      onSubmit={handleSendTestMessage}
                      className="p-2 border-t border-slate-200 bg-white flex items-center gap-1.5"
                    >
                      <input
                        type="text"
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        placeholder="Type a test question..."
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      <button
                        type="submit"
                        className="p-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}

                {/* Floating Widget Button */}
                <button
                  onClick={() => setWidgetOpen(!widgetOpen)}
                  className="w-13 h-13 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105"
                >
                  {widgetOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <MessageCircle className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
