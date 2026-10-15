import React, { useState } from 'react';
import { Clinic, ClinicFAQ, FAQCategory } from '../types/clinic';
import {
  Search,
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  FileText,
  Filter,
  Check,
  Building2,
  Layers,
} from 'lucide-react';

interface FaqManagerViewProps {
  clinic: Clinic;
  onUpdateClinicFaqs: (clinicId: string, updatedFaqs: ClinicFAQ[]) => void;
}

export const FaqManagerView: React.FC<FaqManagerViewProps> = ({ clinic, onUpdateClinicFaqs }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ClinicFAQ | null>(null);

  // Form states
  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<FAQCategory>('general');
  const [keywordsInput, setKeywordsInput] = useState('');

  // AI Generator state
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiTopicInput, setAiTopicInput] = useState('');
  const [generatedSuggestions, setGeneratedSuggestions] = useState<any[]>([]);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All FAQs' },
    { id: 'insurance', label: 'Insurance & Coverage' },
    { id: 'appointment', label: 'Appointments & Scheduling' },
    { id: 'preparation', label: 'Clinical Prep & Post-Op' },
    { id: 'prescriptions', label: 'Prescriptions & Refills' },
    { id: 'billing', label: 'Pricing & Billing' },
    { id: 'general', label: 'General Practice' },
  ];

  const filteredFaqs = clinic.faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (faq.keywords || []).some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleToggleFaqActive = (id: string) => {
    const updated = clinic.faqs.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f));
    onUpdateClinicFaqs(clinic.id, updated);
  };

  const handleDeleteFaq = (id: string) => {
    if (window.confirm('Are you sure you want to remove this FAQ from the bot knowledge base?')) {
      const updated = clinic.faqs.filter((f) => f.id !== id);
      onUpdateClinicFaqs(clinic.id, updated);
    }
  };

  const handleOpenEdit = (faq: ClinicFAQ) => {
    setEditingFaq(faq);
    setQuestionInput(faq.question);
    setAnswerInput(faq.answer);
    setCategoryInput(faq.category);
    setKeywordsInput(faq.keywords.join(', '));
    setShowAddModal(true);
  };

  const handleOpenNew = () => {
    setEditingFaq(null);
    setQuestionInput('');
    setAnswerInput('');
    setCategoryInput('general');
    setKeywordsInput('');
    setGeneratedSuggestions([]);
    setAiTopicInput('');
    setShowAddModal(true);
  };

  const handleSaveFaqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || !answerInput.trim()) return;

    const keywords = keywordsInput
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    if (editingFaq) {
      const updated = clinic.faqs.map((f) =>
        f.id === editingFaq.id
          ? {
              ...f,
              question: questionInput,
              answer: answerInput,
              category: categoryInput,
              keywords,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : f
      );
      onUpdateClinicFaqs(clinic.id, updated);
    } else {
      const newFaq: ClinicFAQ = {
        id: `faq-${Date.now()}`,
        question: questionInput,
        answer: answerInput,
        category: categoryInput,
        keywords,
        isActive: true,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      onUpdateClinicFaqs(clinic.id, [newFaq, ...clinic.faqs]);
    }

    setShowAddModal(false);
  };

  const handleAiGenerate = async () => {
    if (!aiTopicInput.trim() || isAiGenerating) return;
    setIsAiGenerating(true);

    try {
      const res = await fetch('/api/generate-faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicName: clinic.name,
          specialty: clinic.specialty,
          topicOrText: aiTopicInput,
        }),
      });

      if (!res.ok) throw new Error('AI FAQ generation failed');
      const data = await res.json();
      if (Array.isArray(data.faqs) && data.faqs.length > 0) {
        setGeneratedSuggestions(data.faqs);
      }
    } catch (err) {
      console.error(err);
      alert('Unable to generate FAQs automatically. Please check your network or enter manually.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleApplySuggestion = (sug: any) => {
    setQuestionInput(sug.question);
    setAnswerInput(sug.answer);
    if (sug.category) setCategoryInput(sug.category);
    if (Array.isArray(sug.keywords)) setKeywordsInput(sug.keywords.join(', '));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Clinic Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 font-mono">
            <Building2 className="w-3.5 h-3.5" />
            <span>KNOWLEDGE BASE MANAGEMENT</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            {clinic.name} FAQ Repository
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            The GPT-4 / Gemini support bot retrieves these verified clinical answers in real-time
            to assist patients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New FAQ</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by symptom, insurance, or policy..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white bg-slate-50 text-slate-900"
            />
          </div>

          <div className="text-xs text-slate-500 self-end sm:self-center font-mono">
            Showing {filteredFaqs.length} of {clinic.faqs.length} FAQs
          </div>
        </div>

        {/* Category Tabs (Interactive Filter Buttons per Constitution) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">No FAQs found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No clinical questions match your filter or search query. Click &quot;Add New FAQ&quot; or
              generate one with AI to train the bot.
            </p>
            <button
              onClick={handleOpenNew}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create FAQ</span>
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className={`bg-white rounded-xl border p-4 transition-all ${
                faq.isActive ? 'border-slate-200' : 'border-slate-200/60 bg-slate-50/50 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  {/* Clean unboxed metadata with typographic separator */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span className="uppercase text-teal-700 font-semibold">{faq.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>Updated {faq.lastUpdated}</span>
                    <span aria-hidden="true">·</span>
                    <span className={faq.isActive ? 'text-emerald-700' : 'text-slate-400'}>
                      {faq.isActive ? 'Active in Bot' : 'Inactive / Draft'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{faq.question}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {faq.answer}
                  </p>

                  {/* Keywords list */}
                  {faq.keywords && faq.keywords.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                      <span className="font-medium text-slate-500">Keywords:</span>
                      <span className="text-slate-600 font-mono">{faq.keywords.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleFaqActive(faq.id)}
                    title={faq.isActive ? 'Deactivate FAQ' : 'Activate FAQ'}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      faq.isActive
                        ? 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-slate-400 border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {faq.isActive ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(faq)}
                    title="Edit FAQ"
                    className="p-1.5 text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(faq.id)}
                    title="Delete FAQ"
                    className="p-1.5 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit FAQ Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 my-8">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider font-mono">
                Knowledge Base Curator
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {editingFaq ? 'Edit Clinical FAQ' : 'Add New Clinical FAQ'}
              </h2>
            </div>

            {/* AI Assistant Generator Section */}
            {!editingFaq && (
              <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>AI Assistant: Generate FAQs from Topic or Clinic Notes</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiTopicInput}
                    onChange={(e) => setAiTopicInput(e.target.value)}
                    placeholder="e.g. Flu shot walk-in policies, sedation fasting rules, insurance copay..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={!aiTopicInput.trim() || isAiGenerating}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {isAiGenerating ? 'Drafting...' : 'Generate with AI'}
                  </button>
                </div>

                {/* Suggestions List */}
                {generatedSuggestions.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-600">
                      Generated Suggestions (Click to fill form):
                    </span>
                    {generatedSuggestions.map((sug, i) => (
                      <div
                        key={i}
                        onClick={() => handleApplySuggestion(sug)}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg hover:border-teal-500 cursor-pointer transition-all text-xs space-y-1"
                      >
                        <div className="font-semibold text-slate-900 flex items-center justify-between">
                          <span>{sug.question}</span>
                          <span className="text-[10px] text-teal-700 font-mono">Use This</span>
                        </div>
                        <p className="text-slate-600 text-[11px] line-clamp-2">{sug.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSaveFaqSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value as FAQCategory)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                >
                  <option value="general">General Practice & Hours</option>
                  <option value="insurance">Insurance & Billing Coverage</option>
                  <option value="appointment">Appointments & Cancellation</option>
                  <option value="preparation">Clinical Preparation & Post-Op</option>
                  <option value="prescriptions">Prescriptions & Pharmacy Refills</option>
                  <option value="billing">Pricing & Self-Pay Options</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Question (Patient Query) *
                </label>
                <input
                  type="text"
                  required
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="e.g. Do you accept Delta Dental Premier insurance?"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Answer (Grounded Clinical Policy) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder="Provide precise details, steps, fees, timelines, or clinic directions..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Semantic Matching Keywords (Comma-separated)
                </label>
                <input
                  type="text"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  placeholder="e.g. delta dental, in-network, copay, insurance, coverage"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
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
                  {editingFaq ? 'Save Changes' : 'Add to Knowledge Base'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
