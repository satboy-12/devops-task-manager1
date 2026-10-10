import React, { useState } from 'react';
import { Task } from '../types';
import { 
  Sparkles, 
  Send, 
  Check, 
  AlertCircle
} from 'lucide-react';
import { 
  parseNaturalLanguageTask, 
  recommendNextTask, 
  isTaskOverdue, 
  getDaysUntilDue
} from '../services/assistantEngine';

interface SmartAssistantViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export function SmartAssistantView({
  tasks,
  onAddTask,
  onToggleTaskStatus,
  onEditTask
}: SmartAssistantViewProps) {
  const [nlpInput, setNlpInput] = useState('');
  const [lastCreatedNotice, setLastCreatedNotice] = useState<string | null>(null);

  const topRecommendation = recommendNextTask(tasks);
  const parsedPreview = nlpInput.trim() ? parseNaturalLanguageTask(nlpInput) : null;

  const overdueTasks = tasks.filter(t => isTaskOverdue(t.dueDate, t.status));
  const criticalPendingTasks = tasks.filter(t => t.status !== 'Completed' && t.priority === 'Critical');

  const handleCreateFromNLP = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!parsedPreview || !parsedPreview.title) return;

    onAddTask({
      title: parsedPreview.title,
      description: parsedPreview.description,
      category: parsedPreview.category,
      priority: parsedPreview.priority,
      status: 'To Do',
      dueDate: parsedPreview.dueDate,
      tags: [parsedPreview.category.toLowerCase()]
    });

    setLastCreatedNotice(`Added "${parsedPreview.title}" to backlog.`);
    setNlpInput('');
    setTimeout(() => setLastCreatedNotice(null), 3500);
  };

  const samplePrompts = [
    'Add a high-priority task called Test Docker deployment',
    'Create critical security task Audit Kubernetes RBAC due tomorrow',
    'Add task Run Trivy vulnerability scan on production image',
    'Add low priority task Review Prometheus alerting rules'
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#30363d] pb-4">
        <h1 className="text-xl font-semibold text-[#f0f6fc] tracking-tight">
          Task Assistant & Command Parser
        </h1>
        <p className="text-xs text-[#8b949e] mt-1.5 leading-relaxed">
          Rule-based heuristics for sprint prioritization and natural-language task creation. Evaluated locally in your browser without external APIs.
        </p>
      </div>

      {/* Natural Language Task Input */}
      <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3">
        <label className="block text-xs font-medium text-[#c9d1d9]">
          Quick Task Command
        </label>

        <form onSubmit={handleCreateFromNLP} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={nlpInput}
              onChange={e => setNlpInput(e.target.value)}
              placeholder="e.g. Add a high-priority task called Test Docker deployment due tomorrow"
              className="w-full pl-3.5 pr-24 py-2 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none font-mono"
            />
            <button
              type="submit"
              disabled={!nlpInput.trim()}
              className="absolute right-1.5 top-1.5 px-3 py-1 text-xs font-medium text-white bg-[#1f6feb] hover:bg-[#388bfd] disabled:bg-[#21262d] disabled:text-[#8b949e] rounded transition-colors"
            >
              Parse & Add
            </button>
          </div>

          {/* Sample Prompts */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#8b949e]">
            <span className="text-[11px] font-mono mr-1">Examples:</span>
            {samplePrompts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setNlpInput(sample)}
                className="text-[11px] px-2 py-0.5 rounded bg-[#0d1117] hover:bg-[#21262d] text-[#c9d1d9] border border-[#30363d] transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>
        </form>

        {/* Live Parsed Preview */}
        {parsedPreview && (
          <div className="mt-3 p-3 rounded-md bg-[#0d1117] border border-[#30363d] space-y-3 text-xs">
            <div className="text-[11px] font-mono text-[#8b949e]">
              Parsed Spec:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              <div>
                <span className="text-[#8b949e] block text-[10px]">TITLE</span>
                <span className="text-[#f0f6fc] font-medium truncate block">{parsedPreview.title}</span>
              </div>
              <div>
                <span className="text-[#8b949e] block text-[10px]">PRIORITY</span>
                <span className="text-[#d29922] font-medium">{parsedPreview.priority}</span>
              </div>
              <div>
                <span className="text-[#8b949e] block text-[10px]">CATEGORY</span>
                <span className="text-[#58a6ff] font-medium">{parsedPreview.category}</span>
              </div>
              <div>
                <span className="text-[#8b949e] block text-[10px]">DUE DATE</span>
                <span className="text-[#3fb950] font-medium">{parsedPreview.dueDate}</span>
              </div>
            </div>

            <button
              onClick={() => handleCreateFromNLP()}
              className="w-full py-1.5 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded text-xs font-medium transition-colors"
            >
              Confirm and Add Task
            </button>
          </div>
        )}

        {lastCreatedNotice && (
          <div className="p-2.5 rounded bg-[#161b22] border border-[#238636]/40 text-xs text-[#3fb950] flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{lastCreatedNotice}</span>
          </div>
        )}
      </div>

      {/* Grid: Next Recommended Task & Incident Triage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Next Recommendation Card */}
        <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
            <h3 className="text-xs font-semibold text-[#f0f6fc]">
              Priority Recommendation
            </h3>
            {topRecommendation.task && (
              <span className="text-[11px] font-mono text-[#8b949e]">
                Urgency Score: {topRecommendation.score}
              </span>
            )}
          </div>

          {topRecommendation.task ? (
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <h4 className="font-medium text-[#f0f6fc]">
                  {topRecommendation.task.title}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-[#8b949e] font-mono">
                  <span>{topRecommendation.task.priority}</span>
                  <span aria-hidden="true">·</span>
                  <span>{topRecommendation.task.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>Due {topRecommendation.task.dueDate}</span>
                </div>
              </div>

              <p className="text-[#c9d1d9] leading-relaxed bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
                {topRecommendation.reason}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onToggleTaskStatus(topRecommendation.task!.id)}
                  className="px-3 py-1.5 text-xs font-medium text-[#3fb950] hover:text-white hover:bg-[#238636] border border-[#238636]/40 rounded transition-colors"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => onEditTask(topRecommendation.task!)}
                  className="px-3 py-1.5 text-xs font-medium text-[#c9d1d9] hover:text-white bg-[#21262d] rounded transition-colors"
                >
                  Edit Task
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-[#8b949e]">
              No active tasks pending. Backlog is clear.
            </div>
          )}
        </div>

        {/* SLA & Triage Queue */}
        <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
            <h3 className="text-xs font-semibold text-[#f0f6fc]">
              Triage Queue
            </h3>
            <span className="text-[11px] font-mono text-[#8b949e]">
              {overdueTasks.length} overdue · {criticalPendingTasks.length} critical
            </span>
          </div>

          {overdueTasks.length === 0 && criticalPendingTasks.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#8b949e]">
              No overdue items or critical bottlenecks.
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {overdueTasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className="p-2.5 rounded bg-[#0d1117] border border-[#30363d] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[#f0f6fc] font-medium truncate">
                      {task.title}
                    </div>
                    <div className="text-[11px] text-[#f85149] font-mono">
                      {Math.abs(getDaysUntilDue(task.dueDate))}d overdue
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleTaskStatus(task.id)}
                    className="px-2 py-1 text-[11px] font-medium text-[#3fb950] hover:bg-[#238636]/20 rounded border border-[#238636]/30"
                  >
                    Done
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
