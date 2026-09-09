import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileCheck, 
  Search, 
  Filter, 
  ShieldCheck, 
  History, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight,
  Database,
  Building2,
  Trash2
} from 'lucide-react';
import { AuditLog } from '../../types';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      log.userName.toLowerCase().includes(q) ||
      log.description.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      (log.targetTdNumber && log.targetTdNumber.toLowerCase().includes(q)) ||
      (log.targetPin && log.targetPin.toLowerCase().includes(q));

    return matchesAction && matchesSearch;
  });

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">TD CREATED</span>;
      case 'SUPERSEDE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">TD SUPERSEDED</span>;
      case 'CANCEL':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">TD CANCELLED</span>;
      case 'UPDATE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">TD UPDATED</span>;
      case 'DOCUMENT_UPLOAD':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">DOC ATTACHED</span>;
      case 'SETTINGS_CHANGE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">SETTINGS SYNC</span>;
      case 'LOGIN':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">USER LOGIN</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{action}</span>;
    }
  };

  return (
    <div id="audit-logs-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Assessor System Audit Trail & History Log
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable transaction record for property transfers, lineage links, cancellations, and staff actions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-blue-100 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-200"
          >
            <option value="ALL">All Event Types</option>
            <option value="CREATE">Tax Dec Created</option>
            <option value="SUPERSEDE">Tax Dec Superseded</option>
            <option value="CANCEL">Tax Dec Cancelled</option>
            <option value="UPDATE">Tax Dec Updated</option>
            <option value="DOCUMENT_UPLOAD">Document Uploaded</option>
            <option value="SETTINGS_CHANGE">Settings Updated</option>
            <option value="LOGIN">User Logins</option>
          </select>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="pl-8 pr-3 py-2 text-xs bg-slate-50 border border-blue-100 rounded-full focus:bg-white focus:ring-2 focus:ring-blue-200 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/70 border-b border-blue-50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              <th className="p-4">Timestamp</th>
              <th className="p-4">Event Type</th>
              <th className="p-4">Target Record / PIN</th>
              <th className="p-4">Action Summary & Details</th>
              <th className="p-4">Authorized Personnel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-50 font-sans">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p>No audit trail logs match your filter criteria.</p>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="p-4 text-slate-500 whitespace-nowrap text-[11px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.timestamp}</span>
                    </div>
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>

                  <td className="p-4 whitespace-nowrap font-mono text-[11px]">
                    {log.targetTdNumber ? (
                      <div>
                        <span className="font-bold text-blue-900">{log.targetTdNumber}</span>
                        {log.targetPin && (
                          <p className="text-[10px] text-slate-400">{log.targetPin}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="p-4 text-slate-700">
                    <p className="font-medium text-xs leading-relaxed">{log.description}</p>
                    {log.details && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
                    )}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-sky-600" />
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{log.userName || log.performedByName || 'System'}</p>
                        <p className="text-[10px] text-slate-500">{log.performedByRole || 'Staff'}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
