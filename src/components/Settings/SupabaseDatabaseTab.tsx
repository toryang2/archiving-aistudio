import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabaseService } from '../../services/supabase';
import {
  Database,
  CloudUpload,
  CloudDownload,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Code2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Server,
  Zap,
  Trash2,
  FileText
} from 'lucide-react';

export const SupabaseDatabaseTab: React.FC = () => {
  const {
    isSupabaseConnected,
    supabaseConfig,
    saveSupabaseConfig,
    clearSupabaseConfig,
    syncToSupabase,
    pullFromSupabase,
    testSupabaseConnection,
    isSyncingSupabase,
    taxDeclarations,
    showToast,
  } = useApp();

  const [projectUrl, setProjectUrl] = useState(supabaseConfig.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey || '');
  const [autoSync, setAutoSync] = useState(supabaseConfig.autoSync || false);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    missingTables?: string[];
  } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);

  const handleTestConnection = async () => {
    if (!projectUrl.trim() || !anonKey.trim()) {
      showToast('Please enter both Supabase Project URL and Anon API Key.', 'warning');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(projectUrl, anonKey);
      setTestResult(res);
      if (res.success) {
        showToast('Connection verified successfully!', 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setTestResult({
        success: false,
        message: errorMsg,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectUrl.trim() || !anonKey.trim()) {
      showToast('Project URL and Anon API Key are required.', 'warning');
      return;
    }

    const cleanUrl = projectUrl.trim();
    const cleanKey = anonKey.trim();

    saveSupabaseConfig({
      url: cleanUrl,
      anonKey: cleanKey,
      autoSync: autoSync,
    });
  };

  const handleCopySql = () => {
    const sql = supabaseService.getSqlMigrationScript();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    showToast('SQL Schema migration script copied to clipboard!');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-xs">
      
      {/* Database Header & Status Banner */}
      <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50/70 to-blue-50/60 rounded-2xl border border-emerald-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span>Supabase Cloud PostgreSQL Database</span>
                {isSupabaseConnected ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>CONNECTED & ACTIVE</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>NOT CONNECTED (LOCAL STORAGE ONLY)</span>
                  </span>
                )}
              </h3>
              <p className="text-slate-500 text-[11px]">
                Connect your assessor office archive to a managed PostgreSQL instance with real-time replication, backup snapshots, and relational queries.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSqlModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-300 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-emerald-600" />
            <span>View SQL Schema</span>
          </button>
        </div>
      </div>

      {/* Sync Actions Bar */}
      {isSupabaseConnected && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs">Cloud Synchronization Operations</p>
              <p className="text-slate-500 text-[11px]">
                {taxDeclarations.length} local real property tax declaration records ready to synchronize.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => pullFromSupabase()}
              disabled={isSyncingSupabase}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <CloudDownload className={`w-4 h-4 text-blue-600 ${isSyncingSupabase ? 'animate-bounce' : ''}`} />
              <span>{isSyncingSupabase ? 'Syncing...' : 'Pull Cloud Database'}</span>
            </button>

            <button
              onClick={() => syncToSupabase()}
              disabled={isSyncingSupabase}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <CloudUpload className={`w-4 h-4 ${isSyncingSupabase ? 'animate-bounce' : ''}`} />
              <span>{isSyncingSupabase ? 'Syncing...' : 'Push Local Archive to Cloud'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Supabase Configuration Form */}
      <form onSubmit={handleSaveConfig} className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>Supabase Connection Credentials</span>
            </h4>
            <p className="text-slate-500 text-[11px]">
              Obtain your project URL and public anon API key from your Supabase Project Settings &rarr; API.
            </p>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 text-[11px] underline"
          >
            <span>Open Supabase Console</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Project URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://xyzcompany.supabase.co"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Anon / Public API Key <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="font-semibold text-slate-700">
              Enable Real-Time Auto-Replication (Pushes every Tax Dec creation, update, and cancellation)
            </span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !projectUrl || !anonKey}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>

            {isSupabaseConnected && (
              <button
                type="button"
                onClick={clearSupabaseConfig}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Disconnect Supabase"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            )}

            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Connect</span>
            </button>
          </div>
        </div>

        {/* Test Result Message Box */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 mt-3 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-bold">{testResult.message}</p>
              {testResult.missingTables && (
                <div className="text-[11px] mt-1 space-y-1">
                  <p className="text-slate-600">
                    Tables need to be created in Supabase SQL Editor:
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSqlModal(true)}
                    className="underline text-blue-700 font-bold flex items-center gap-1"
                  >
                    <span>Click here to open and copy the 1-click SQL Migration Script</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </form>

      {/* SQL Setup Instructions Card */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3">
        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Quick Setup Guide: Provisioning Supabase Database Tables</span>
        </h4>
        <ol className="list-decimal list-inside space-y-2 text-slate-600 text-xs">
          <li>
            Sign in to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold">Supabase.com</a> and create a new project (e.g. <code>rpt-assessor-archive</code>).
          </li>
          <li>
            Go to the <strong>SQL Editor</strong> tab on the left sidebar in Supabase.
          </li>
          <li>
            Click <strong>New Query</strong>, paste the provided Assessor SQL Schema, and click <strong>Run</strong>.
          </li>
          <li>
            Go to <strong>Project Settings &rarr; API</strong>, copy your <strong>Project URL</strong> and <strong>anon/public</strong> key, then paste them above!
          </li>
        </ol>
      </div>

      {/* SQL Schema Script Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Supabase PostgreSQL Database Migration Script
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied!' : 'Copy Script'}</span>
                </button>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto font-mono text-xs bg-slate-900 text-emerald-400 leading-relaxed whitespace-pre selection:bg-emerald-700 selection:text-white">
              {supabaseService.getSqlMigrationScript()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
