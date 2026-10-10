import { Plus, Terminal } from 'lucide-react';
import { ViewTab } from '../types';

interface NavbarProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenCreateModal: () => void;
  overdueCount: number;
}

export function Navbar({ activeTab, onTabChange, onOpenCreateModal, overdueCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-[#30363d] bg-[#0d1117] px-4 sm:px-6 flex items-center justify-between gap-6">
      {/* Zone 1: Brand wordmark & workspace context */}
      <div className="flex items-center gap-3 shrink-0">
        <button 
          onClick={() => onTabChange('dashboard')} 
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="w-7 h-7 rounded-md bg-[#161b22] border border-[#30363d] flex items-center justify-center text-[#58a6ff]">
            <Terminal className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#f0f6fc]">
            Nexora
          </span>
        </button>
        <span className="text-[#484f58] text-xs font-mono">/</span>
        <span className="text-xs font-medium text-[#8b949e] hidden sm:inline">
          DevOps Workspace
        </span>
      </div>

      {/* Zone 2: Navigation links */}
      <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-[#8b949e]">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'dashboard'
              ? 'text-[#f0f6fc] bg-[#161b22]'
              : 'hover:text-[#c9d1d9] hover:bg-[#161b22]/50'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onTabChange('tasks')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'tasks'
              ? 'text-[#f0f6fc] bg-[#161b22]'
              : 'hover:text-[#c9d1d9] hover:bg-[#161b22]/50'
          }`}
        >
          Tasks
        </button>
        <button
          onClick={() => onTabChange('assistant')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'assistant'
              ? 'text-[#f0f6fc] bg-[#161b22]'
              : 'hover:text-[#c9d1d9] hover:bg-[#161b22]/50'
          }`}
        >
          Task Assistant
        </button>
        <button
          onClick={() => onTabChange('devops')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'devops'
              ? 'text-[#f0f6fc] bg-[#161b22]'
              : 'hover:text-[#c9d1d9] hover:bg-[#161b22]/50'
          }`}
        >
          DevOps Hub
        </button>
        <button
          onClick={() => onTabChange('settings')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'settings'
              ? 'text-[#f0f6fc] bg-[#161b22]'
              : 'hover:text-[#c9d1d9] hover:bg-[#161b22]/50'
          }`}
        >
          Settings
        </button>
      </nav>

      {/* Zone 3: Primary action button */}
      <div className="flex items-center gap-3 shrink-0">
        {overdueCount > 0 && (
          <span className="text-xs font-mono text-[#f85149] hidden lg:inline">
            {overdueCount} overdue
          </span>
        )}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#1f6feb] hover:bg-[#388bfd] transition-colors shadow-xs active:translate-y-px"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
}
