import React, { useState } from 'react';
import { ChatTranscript, Clinic } from '../types/clinic';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Search,
  ChevronRight,
  X,
  Filter,
  BarChart3,
} from 'lucide-react';

interface TriageLogsViewProps {
  transcripts: ChatTranscript[];
  clinics: Clinic[];
  activeClinic: Clinic;
}

export const TriageLogsView: React.FC<TriageLogsViewProps> = ({
  transcripts,
  clinics,
  activeClinic,
}) => {
  const [filterClinicId, setFilterClinicId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'resolved' | 'escalated'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTranscript, setSelectedTranscript] = useState<ChatTranscript | null>(null);

  const filteredTranscripts = transcripts.filter((t) => {
    const matchesClinic = filterClinicId === 'all' || t.clinicId === filterClinicId;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'resolved' && t.resolved && !t.escalated) ||
      (filterStatus === 'escalated' && t.escalated);
    const matchesSearch =
      t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.clinicName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClinic && matchesStatus && matchesSearch;
  });

  const totalLogs = transcripts.length;
  const escalatedLogs = transcripts.filter((t) => t.escalated).length;
  const resolvedLogs = totalLogs - escalatedLogs;
  const resolutionPercentage = totalLogs > 0 ? ((resolvedLogs / totalLogs) * 100).toFixed(1) : '100.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider font-mono">
            Auditing & Quality Assurance
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Patient Chat & Triage Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor patient conversations, clinical accuracy, automated FAQ resolution rates, and front desk handoffs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">Live Recording Enabled</span>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Conversations</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {totalLogs}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Patient sessions recorded</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Bot Resolution Rate</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono tabular-nums">
            {resolutionPercentage}%
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Solved automatically via FAQs</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Front Desk Escalations</div>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono tabular-nums">
            {escalatedLogs}
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">Transferred to nurse/staff</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Average Response Latency</div>
          <div className="text-2xl font-bold text-teal-600 mt-1 font-mono tabular-nums">
            0.84s
          </div>
          <div className="text-[11px] text-teal-700 mt-0.5">Grounded model latency</div>
        </div>
      </div>

      {/* Filter and Search toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Clinic filter select */}
          <select
            value={filterClinicId}
            onChange={(e) => setFilterClinicId(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-slate-50 text-slate-900"
          >
            <option value="all">All Clinics Network</option>
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('resolved')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filterStatus === 'resolved'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => setFilterStatus('escalated')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filterStatus === 'escalated'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Escalated
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcript topics..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
          />
        </div>
      </div>

      {/* Transcripts Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Clinic</th>
                <th className="py-3 px-4">Patient / Subject</th>
                <th className="py-3 px-4">Primary Inquired Topic</th>
                <th className="py-3 px-4 text-center">Messages</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTranscripts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No conversation transcripts match your filter.
                  </td>
                </tr>
              ) : (
                filteredTranscripts.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTranscript(t)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {t.clinicName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      {t.patientName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {t.topic}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono tabular-nums text-slate-500">
                      {t.messagesCount || t.messages.length}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {t.escalated ? (
                        <span className="text-amber-700 font-medium flex items-center gap-1 font-mono text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Escalated to Staff
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium flex items-center gap-1 font-mono text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Bot Resolved
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {t.timestamp}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-teal-700 hover:text-teal-900 font-semibold text-xs inline-flex items-center gap-0.5">
                        View <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Transcript Inspection Modal */}
      {selectedTranscript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 my-8">
            <button
              onClick={() => setSelectedTranscript(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider font-mono">
                Audit Transcript #{selectedTranscript.id}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {selectedTranscript.clinicName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-1">
                <span>Patient: {selectedTranscript.patientName}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedTranscript.timestamp}</span>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="space-y-3 max-h-96 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              {selectedTranscript.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    m.sender === 'user' ? 'items-end' : 'items-start'
                  } space-y-1`}
                >
                  <span className="text-[10px] text-slate-400 font-mono">
                    {m.sender === 'user' ? selectedTranscript.patientName : 'Clinic AI Bot'} ·{' '}
                    {m.timestamp}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-teal-700 text-white'
                        : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
              <div className="text-slate-500">
                Outcome:{' '}
                <span
                  className={`font-semibold ${
                    selectedTranscript.escalated ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {selectedTranscript.escalated ? 'Staff Escalation' : 'Resolved by FAQ Engine'}
                </span>
              </div>
              <button
                onClick={() => setSelectedTranscript(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
