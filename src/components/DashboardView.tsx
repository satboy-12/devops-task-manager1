import { Task, ViewTab } from '../types';
import { 
  Check, 
  ArrowRight, 
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  generateProductivitySummary, 
  recommendNextTask, 
  isTaskOverdue, 
  getDaysUntilDue 
} from '../services/assistantEngine';

interface DashboardViewProps {
  tasks: Task[];
  onNavigate: (tab: ViewTab) => void;
  onOpenCreateModal: () => void;
  onToggleTaskStatus: (taskId: string) => void;
}

export function DashboardView({
  tasks,
  onNavigate,
  onOpenCreateModal,
  onToggleTaskStatus
}: DashboardViewProps) {
  const summary = generateProductivitySummary(tasks);
  const recommendation = recommendNextTask(tasks);

  // Upcoming deadlines (tasks not completed, sorted by due date)
  const upcomingTasks = [...tasks]
    .filter(t => t.status !== 'Completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Recent tasks (sorted by created date)
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Priority color map (muted, functional text colors)
  const priorityColor = {
    Critical: 'text-[#f85149]',
    High: 'text-[#d29922]',
    Medium: 'text-[#58a6ff]',
    Low: 'text-[#8b949e]'
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Human Greeting & Concise Overview */}
      <div className="border-b border-[#30363d] pb-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[#f0f6fc] tracking-tight">
              DevOps Workspace
            </h1>
            <p className="text-sm text-[#8b949e] mt-1.5 leading-relaxed">
              {summary.overdueTasks > 0 ? (
                <>
                  You have <span className="text-[#f85149] font-medium font-mono">{summary.overdueTasks} overdue</span> task{summary.overdueTasks > 1 ? 's' : ''} and{' '}
                  <span className="text-[#e6edf3] font-medium font-mono">{summary.inProgressTasks}</span> in progress.
                </>
              ) : (
                <>
                  <span className="text-[#3fb950] font-medium">All tasks are on schedule.</span> {summary.inProgressTasks} tasks currently in progress,{' '}
                  {summary.pendingTasks} in backlog.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('tasks')}
              className="px-3 py-1.5 text-xs font-medium text-[#c9d1d9] hover:text-white bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-md transition-colors"
            >
              View Task List
            </button>
            <button
              onClick={onOpenCreateModal}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#1f6feb] hover:bg-[#388bfd] rounded-md transition-colors"
            >
              Add Task
            </button>
          </div>
        </div>

        {/* 2. Simple Metric Strip (Clean, hairline dividers, tabular numbers) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#30363d] border border-[#30363d] rounded-lg overflow-hidden mt-6">
          <div className="bg-[#161b22] p-4">
            <div className="text-xs text-[#8b949e]">Total Tasks</div>
            <div className="text-2xl font-semibold text-[#f0f6fc] font-mono tabular-nums mt-1">
              {summary.totalTasks}
            </div>
            <div className="text-[11px] text-[#8b949e] mt-1 font-mono">
              {summary.completionRate}% completed
            </div>
          </div>

          <div className="bg-[#161b22] p-4">
            <div className="text-xs text-[#8b949e]">In Progress</div>
            <div className="text-2xl font-semibold text-[#d29922] font-mono tabular-nums mt-1">
              {summary.inProgressTasks}
            </div>
            <div className="text-[11px] text-[#8b949e] mt-1 font-mono">
              {summary.pendingTasks} in backlog
            </div>
          </div>

          <div className="bg-[#161b22] p-4">
            <div className="text-xs text-[#8b949e]">Overdue</div>
            <div className={`text-2xl font-semibold font-mono tabular-nums mt-1 ${summary.overdueTasks > 0 ? 'text-[#f85149]' : 'text-[#8b949e]'}`}>
              {summary.overdueTasks}
            </div>
            <div className="text-[11px] text-[#8b949e] mt-1 font-mono">
              {summary.criticalPendingCount} critical active
            </div>
          </div>

          <div className="bg-[#161b22] p-4">
            <div className="text-xs text-[#8b949e]">Completed</div>
            <div className="text-2xl font-semibold text-[#3fb950] font-mono tabular-nums mt-1">
              {summary.completedTasks}
            </div>
            <div className="text-[11px] text-[#8b949e] mt-1 font-mono">
              Sprint deliverables
            </div>
          </div>
        </div>
      </div>

      {/* 3. Next Recommended Task (Powered by local rules engine, clean editorial callout) */}
      {recommendation.task && (
        <div className="p-4 rounded-lg border border-[#30363d] bg-[#161b22] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-[#8b949e]">
              <span className="text-[#58a6ff] font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Next recommended task
              </span>
              <span>·</span>
              <span className="font-mono text-[11px]">Local rules engine score: {recommendation.score}</span>
            </div>
            <h3 className="text-sm font-semibold text-[#f0f6fc]">
              {recommendation.task.title}
            </h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              {recommendation.reason}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleTaskStatus(recommendation.task!.id)}
              className="px-3 py-1.5 text-xs font-medium text-[#3fb950] hover:text-white hover:bg-[#238636] border border-[#238636]/40 rounded-md transition-colors"
            >
              Mark Done
            </button>
            <button
              onClick={() => onNavigate('tasks')}
              className="px-3 py-1.5 text-xs font-medium text-[#c9d1d9] hover:text-white bg-[#21262d] hover:bg-[#30363d] rounded-md transition-colors"
            >
              View in Tasks
            </button>
          </div>
        </div>
      )}

      {/* 4. Asymmetrical Layout: Main Work Queue & Sidebar Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left (2 cols): Upcoming Deadlines & Priority List */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#30363d]">
              <h2 className="text-sm font-semibold text-[#f0f6fc]">
                Active Work & Deadlines
              </h2>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-[#58a6ff] hover:underline"
              >
                View all ({tasks.length})
              </button>
            </div>

            {upcomingTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8b949e] border border-dashed border-[#30363d] rounded-lg">
                No active tasks pending. All deliverables completed.
              </div>
            ) : (
              <div className="divide-y divide-[#21262d] border border-[#30363d] rounded-lg bg-[#161b22] overflow-hidden">
                {upcomingTasks.map(task => {
                  const isOverdue = isTaskOverdue(task.dueDate, task.status);
                  const daysLeft = getDaysUntilDue(task.dueDate);

                  return (
                    <div
                      key={task.id}
                      className="p-3.5 hover:bg-[#1c2128] transition-colors flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onToggleTaskStatus(task.id)}
                            className="w-4 h-4 rounded border border-[#484f58] hover:border-[#58a6ff] flex items-center justify-center text-transparent hover:text-[#58a6ff] transition-colors shrink-0"
                            title="Mark as completed"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <h4 className="text-xs font-medium text-[#f0f6fc] truncate">
                            {task.title}
                          </h4>
                        </div>

                        {/* Clean unboxed metadata with separators */}
                        <div className="flex items-center gap-2 text-[11px] text-[#8b949e] font-mono pl-6">
                          <span className={priorityColor[task.priority]}>{task.priority}</span>
                          <span aria-hidden="true">·</span>
                          <span>{task.category}</span>
                          {task.estimatedHours && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{task.estimatedHours}h est.</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Due date status */}
                      <div className="text-right shrink-0">
                        <div
                          className={`text-xs font-mono tabular-nums ${
                            isOverdue
                              ? 'text-[#f85149] font-medium'
                              : daysLeft === 0
                              ? 'text-[#d29922] font-medium'
                              : 'text-[#8b949e]'
                          }`}
                        >
                          {isOverdue
                            ? `${Math.abs(daysLeft)}d overdue`
                            : daysLeft === 0
                            ? 'Due today'
                            : `${daysLeft}d left`}
                        </div>
                        <div className="text-[10px] text-[#8b949e] font-mono">
                          {task.dueDate}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Productivity Insight section (Local rules engine) */}
          <div className="p-4 rounded-lg border border-[#30363d] bg-[#161b22] space-y-2">
            <div className="text-xs font-medium text-[#8b949e] flex items-center justify-between">
              <span>Sprint Health & Velocity</span>
              <span className="font-mono text-[#f0f6fc]">{summary.healthStatus}</span>
            </div>
            <p className="text-xs text-[#c9d1d9] leading-relaxed">
              {summary.summaryText}
            </p>
          </div>
        </div>

        {/* Right (1 col): Recent Activity & Priority Breakdown */}
        <div className="space-y-6">
          {/* Priority Breakdown (Clean table, no candy bars) */}
          <div className="p-4 rounded-lg border border-[#30363d] bg-[#161b22] space-y-3">
            <h3 className="text-xs font-semibold text-[#f0f6fc]">
              Priority Breakdown
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-[#21262d]">
                <span className="text-[#f85149]">Critical (P0)</span>
                <span className="text-[#f0f6fc] font-medium">
                  {tasks.filter(t => t.priority === 'Critical').length}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#21262d]">
                <span className="text-[#d29922]">High (P1)</span>
                <span className="text-[#f0f6fc] font-medium">
                  {tasks.filter(t => t.priority === 'High').length}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#21262d]">
                <span className="text-[#58a6ff]">Medium (P2)</span>
                <span className="text-[#f0f6fc] font-medium">
                  {tasks.filter(t => t.priority === 'Medium').length}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#8b949e]">Low (P3)</span>
                <span className="text-[#f0f6fc] font-medium">
                  {tasks.filter(t => t.priority === 'Low').length}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="p-4 rounded-lg border border-[#30363d] bg-[#161b22] space-y-3">
            <h3 className="text-xs font-semibold text-[#f0f6fc]">
              Recent Activity
            </h3>
            <div className="space-y-3 text-xs">
              {recentTasks.map(task => (
                <div key={task.id} className="space-y-0.5">
                  <div className="text-[#f0f6fc] font-medium truncate">
                    {task.title}
                  </div>
                  <div className="text-[11px] text-[#8b949e] font-mono flex items-center gap-1.5">
                    <span>{task.status}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
