import { LayoutDashboard, CheckSquare, Sparkles, Terminal, Settings } from 'lucide-react';
import { ViewTab } from '../types';

interface SidebarProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  taskCounts: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  storageKB: number;
}

export function Sidebar({ activeTab, onTabChange, taskCounts, storageKB }: SidebarProps) {
  const navItems: { id: ViewTab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4 text-[#8b949e]" />
    },
    {
      id: 'tasks',
      label: 'All Tasks',
      icon: <CheckSquare className="w-4 h-4 text-[#8b949e]" />,
      count: taskCounts.total
    },
    {
      id: 'assistant',
      label: 'Task Assistant',
      icon: <Sparkles className="w-4 h-4 text-[#8b949e]" />
    },
    {
      id: 'devops',
      label: 'DevOps & CI/CD',
      icon: <Terminal className="w-4 h-4 text-[#8b949e]" />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4 text-[#8b949e]" />
    }
  ];

  return (
    <aside className="w-56 shrink-0 hidden md:flex flex-col justify-between border-r border-[#30363d] bg-[#0d1117] p-3 min-h-[calc(100vh-3.5rem)] text-xs">
      {/* Navigation Links */}
      <div className="space-y-4">
        <div>
          <div className="px-2.5 py-1 text-[11px] font-medium text-[#8b949e] uppercase tracking-wider">
            Workspace
          </div>
          <nav className="mt-1 space-y-0.5">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md font-medium transition-colors ${
                    isActive
                      ? 'bg-[#161b22] text-[#f0f6fc] border border-[#30363d]'
                      : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="font-mono tabular-nums text-[#8b949e] text-[11px]">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Current status summary */}
        <div className="px-2.5 py-3 rounded-md bg-[#161b22] border border-[#30363d] space-y-2">
          <div className="text-[11px] font-medium text-[#8b949e]">
            Sprint Status
          </div>
          <div className="space-y-1.5 font-mono text-[11px] text-[#8b949e]">
            <div className="flex justify-between items-center">
              <span>In Progress:</span>
              <span className="text-[#e6edf3] font-medium">{taskCounts.inProgress}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Backlog:</span>
              <span className="text-[#e6edf3] font-medium">{taskCounts.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Resolved:</span>
              <span className="text-[#e6edf3] font-medium">{taskCounts.completed}</span>
            </div>
            {taskCounts.overdue > 0 && (
              <div className="flex justify-between items-center pt-1 border-t border-[#30363d] text-[#f85149]">
                <span>Overdue:</span>
                <span className="font-medium">{taskCounts.overdue}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-2.5 py-2 pt-3 border-t border-[#30363d] text-[11px] text-[#8b949e] space-y-1 font-mono">
        <div className="flex justify-between items-center">
          <span>Storage</span>
          <span className="text-[#c9d1d9]">{storageKB} KB</span>
        </div>
        <div className="text-[10px] text-[#8b949e] truncate">
          nexora-ai-devops-manager
        </div>
      </div>
    </aside>
  );
}
