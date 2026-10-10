import { useState } from 'react';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2
} from 'lucide-react';
import { Task } from '../types';
import { 
  exportTasksToJson, 
  parseImportedTasks, 
  getStorageUsage 
} from '../services/storage';

interface SettingsViewProps {
  tasks: Task[];
  onResetDemoData: () => void;
  onClearAllData: () => void;
  onImportTasks: (tasks: Task[]) => void;
  onTriggerToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message?: string) => void;
}

export function SettingsView({
  tasks,
  onResetDemoData,
  onClearAllData,
  onImportTasks,
  onTriggerToast
}: SettingsViewProps) {
  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const storageInfo = getStorageUsage();

  const handleExport = () => {
    try {
      const dataStr = exportTasksToJson(tasks);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nexora-tasks-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onTriggerToast('success', 'Backup Exported', 'Downloaded task dataset as JSON.');
    } catch {
      onTriggerToast('error', 'Export Failed', 'Could not export tasks.');
    }
  };

  const handleImport = () => {
    if (!importText.trim()) {
      onTriggerToast('warning', 'Empty Input', 'Please paste valid JSON data.');
      return;
    }
    const imported = parseImportedTasks(importText);
    if (!imported || imported.length === 0) {
      onTriggerToast('error', 'Invalid Format', 'JSON could not be parsed into tasks.');
      return;
    }
    onImportTasks(imported);
    setShowImportBox(false);
    setImportText('');
    onTriggerToast('success', 'Tasks Imported', `Loaded ${imported.length} tasks.`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#30363d] pb-4">
        <h1 className="text-xl font-semibold text-[#f0f6fc] tracking-tight">
          Settings & Data Management
        </h1>
        <p className="text-xs text-[#8b949e] mt-1.5 leading-relaxed">
          Manage local storage persistence, JSON backups, demo fixtures, and workspace configuration.
        </p>
      </div>

      {/* Storage Architecture */}
      <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
          <h2 className="text-xs font-semibold text-[#f0f6fc]">
            Browser Storage
          </h2>
          <span className="text-xs font-mono text-[#8b949e] tabular-nums">
            {storageInfo.usedKB} KB used of 5,120 KB quota
          </span>
        </div>

        <p className="text-xs text-[#8b949e] leading-relaxed">
          Tasks are stored locally in your browser's <code className="text-[#c9d1d9]">window.localStorage</code> partition. Data persists across refreshes and browser restarts, but does not synchronize across separate devices without manual export.
        </p>

        {/* Storage Bar */}
        <div className="w-full bg-[#0d1117] rounded-full h-1.5 overflow-hidden border border-[#30363d]">
          <div
            className="bg-[#1f6feb] h-1.5 rounded-full"
            style={{ width: `${Math.min(100, Math.max(3, (storageInfo.usedKB / 5120) * 100))}%` }}
          />
        </div>
      </div>

      {/* Backup and Portability */}
      <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3">
        <h2 className="text-xs font-semibold text-[#f0f6fc]">
          Data Portability
        </h2>
        <p className="text-xs text-[#8b949e]">
          Export your entire sprint workspace as standard JSON for version control or importing into another browser.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => setShowImportBox(!showImportBox)}
            className="px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white rounded text-xs font-medium border border-[#30363d] transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>
        </div>

        {showImportBox && (
          <div className="mt-3 p-3 rounded bg-[#0d1117] border border-[#30363d] space-y-2">
            <span className="text-[11px] font-mono text-[#8b949e] block">
              Paste JSON payload:
            </span>
            <textarea
              rows={4}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder='{"tasks": [...]}'
              className="w-full p-2.5 rounded bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportBox(false)}
                className="px-2.5 py-1 text-xs text-[#8b949e] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="px-3 py-1 text-xs font-medium bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded"
              >
                Load Tasks
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Demo Fixtures & Reset */}
      <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3">
        <h2 className="text-xs font-semibold text-[#f0f6fc]">
          Workspace Reset
        </h2>
        <p className="text-xs text-[#8b949e]">
          Restore sample cybersecurity and DevOps sprint tasks, or wipe all workspace data.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={onResetDemoData}
            className="px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white rounded text-xs font-medium border border-[#30363d] transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span>Reset to Demo DevOps Tasks</span>
          </button>

          <button
            onClick={onClearAllData}
            className="px-3 py-1.5 bg-[#21262d] hover:bg-[#f85149]/20 text-[#f85149] rounded text-xs font-medium border border-[#f85149]/30 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Project Specs */}
      <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2 text-xs">
        <h2 className="font-semibold text-[#f0f6fc]">
          Project Details
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[#8b949e] font-mono pt-1">
          <div>
            <span className="block text-[10px] text-[#8b949e]">NAME</span>
            <span className="text-[#f0f6fc]">Nexora AI</span>
          </div>
          <div>
            <span className="block text-[10px] text-[#8b949e]">REPO</span>
            <span className="text-[#58a6ff]">nexora-ai-devops-manager</span>
          </div>
          <div>
            <span className="block text-[10px] text-[#8b949e]">FRAMEWORK</span>
            <span className="text-[#f0f6fc]">React 19 + Vite</span>
          </div>
          <div>
            <span className="block text-[10px] text-[#8b949e]">VERSION</span>
            <span className="text-[#f0f6fc]">1.2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
