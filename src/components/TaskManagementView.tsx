import React, { useState, useMemo } from 'react';
import { 
  Task, 
  TaskCategory, 
  TaskPriority, 
  TaskStatus, 
  SortOption, 
  TaskViewMode 
} from '../types';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  LayoutList, 
  Kanban,
  Check,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { isTaskOverdue, getDaysUntilDue } from '../services/assistantEngine';

interface TaskManagementViewProps {
  tasks: Task[];
  onOpenCreateModal: () => void;
  onEditTask: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
}

const CATEGORIES: ('All' | TaskCategory)[] = [
  'All',
  'DevOps',
  'Security',
  'CI/CD',
  'Cloud',
  'Infrastructure',
  'Monitoring',
  'Testing',
  'General'
];

export function TaskManagementView({
  tasks,
  onOpenCreateModal,
  onEditTask,
  onRequestDelete,
  onToggleTaskStatus,
  onUpdateTaskStatus
}: TaskManagementViewProps) {
  const [viewMode, setViewMode] = useState<TaskViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | TaskPriority>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | TaskCategory>('All');
  const [sortBy, setSortBy] = useState<SortOption>('dueDateAsc');

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(q);
          const matchesDesc = task.description.toLowerCase().includes(q);
          const matchesTags = task.tags?.some(tag => tag.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDesc && !matchesTags) return false;
        }

        if (statusFilter !== 'All' && task.status !== statusFilter) return false;
        if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;
        if (categoryFilter !== 'All' && task.category !== categoryFilter) return false;

        return true;
      })
      .sort((a, b) => {
        const priorityScore: Record<TaskPriority, number> = {
          Critical: 4,
          High: 3,
          Medium: 2,
          Low: 1
        };

        switch (sortBy) {
          case 'dueDateAsc':
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          case 'dueDateDesc':
            return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
          case 'priorityDesc':
            return priorityScore[b.priority] - priorityScore[a.priority];
          case 'priorityAsc':
            return priorityScore[a.priority] - priorityScore[b.priority];
          case 'createdDesc':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'titleAsc':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy]);

  // Priority color map (muted, functional text colors)
  const priorityColor = {
    Critical: 'text-[#f85149]',
    High: 'text-[#d29922]',
    Medium: 'text-[#58a6ff]',
    Low: 'text-[#8b949e]'
  };

  const kanbanColumns: { status: TaskStatus; label: string }[] = [
    { status: 'To Do', label: 'Backlog' },
    { status: 'In Progress', label: 'In Progress' },
    { status: 'Completed', label: 'Completed' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#30363d]">
        <div>
          <h1 className="text-xl font-semibold text-[#f0f6fc] tracking-tight">
            Task Management
          </h1>
          <p className="text-xs text-[#8b949e] mt-1">
            Organize sprint deliverables, security audits, and infrastructure tasks ({filteredTasks.length} tasks)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* List / Kanban switcher */}
          <div className="flex items-center p-0.5 rounded-md bg-[#161b22] border border-[#30363d]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#21262d] text-[#f0f6fc]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
              title="List View"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-[#21262d] text-[#f0f6fc]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
              title="Board View"
            >
              <Kanban className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1f6feb] hover:bg-[#388bfd] rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (Clean toolbar) */}
      <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'All' | TaskStatus)}
              className="w-full px-2.5 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
            >
              <option value="All">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as 'All' | TaskPriority)}
              className="w-full px-2.5 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="w-full px-2.5 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
            >
              <option value="dueDateAsc">Due Date (Earliest)</option>
              <option value="dueDateDesc">Due Date (Latest)</option>
              <option value="priorityDesc">Priority (Critical first)</option>
              <option value="priorityAsc">Priority (Low first)</option>
              <option value="createdDesc">Recently Created</option>
              <option value="titleAsc">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
          <span className="text-[11px] text-[#8b949e] font-mono mr-1">Category:</span>
          {CATEGORIES.map(cat => {
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                    : 'text-[#8b949e] hover:text-[#c9d1d9]'
                }`}
              >
                {cat}
              </button>
            );
          })}

          {(searchQuery || statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setPriorityFilter('All');
                setCategoryFilter('All');
              }}
              className="text-xs text-[#f85149] hover:underline ml-auto pl-2 whitespace-nowrap font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main View: List or Board */}
      {filteredTasks.length === 0 ? (
        <div className="py-12 text-center rounded-lg border border-dashed border-[#30363d] bg-[#161b22] space-y-3">
          <h3 className="text-sm font-semibold text-[#f0f6fc]">No tasks found</h3>
          <p className="text-xs text-[#8b949e] max-w-sm mx-auto">
            Try adjusting your search terms or filters, or add a new task to your workspace.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="px-3 py-1.5 text-xs font-medium text-white bg-[#1f6feb] hover:bg-[#388bfd] rounded-md transition-colors"
          >
            Create Task
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* List Mode: Clean, high-density row layout */
        <div className="divide-y divide-[#21262d] border border-[#30363d] rounded-lg bg-[#161b22] overflow-hidden">
          {filteredTasks.map(task => {
            const isOverdue = isTaskOverdue(task.dueDate, task.status);
            const daysLeft = getDaysUntilDue(task.dueDate);

            return (
              <div
                key={task.id}
                className="p-3.5 hover:bg-[#1c2128] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                {/* Left: Checkbox + Title + Metadata */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleTaskStatus(task.id)}
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      task.status === 'Completed'
                        ? 'bg-[#238636] border-[#238636] text-white'
                        : 'border-[#484f58] hover:border-[#58a6ff] text-transparent hover:text-[#58a6ff]'
                    }`}
                    title={task.status === 'Completed' ? 'Mark uncompleted' : 'Mark completed'}
                  >
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    <h3
                      className={`font-medium ${
                        task.status === 'Completed'
                          ? 'line-through text-[#8b949e]'
                          : 'text-[#f0f6fc]'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {/* Clean unboxed metadata with separators */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8b949e] font-mono">
                      <span className={priorityColor[task.priority]}>{task.priority}</span>
                      <span aria-hidden="true">·</span>
                      <span>{task.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className={isOverdue ? 'text-[#f85149]' : ''}>
                        {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `Due ${task.dueDate}`}
                      </span>
                      {task.estimatedHours && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{task.estimatedHours}h</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status selector and inline actions */}
                <div className="flex items-center gap-2 shrink-0 sm:self-center pl-7 sm:pl-0">
                  <select
                    value={task.status}
                    onChange={e => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                    className="px-2 py-1 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button
                    onClick={() => onEditTask(task)}
                    className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] rounded transition-colors"
                    title="Edit task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRequestDelete(task)}
                    className="p-1.5 text-[#8b949e] hover:text-[#f85149] hover:bg-[#21262d] rounded transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Board Mode: Clean 3-column Kanban */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kanbanColumns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.status);

            return (
              <div
                key={col.status}
                className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] flex flex-col min-h-[400px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#30363d]">
                  <span className="text-xs font-semibold text-[#f0f6fc]">
                    {col.label}
                  </span>
                  <span className="font-mono text-xs text-[#8b949e] tabular-nums">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2 flex-1">
                  {colTasks.length === 0 ? (
                    <div className="h-28 flex items-center justify-center border border-dashed border-[#30363d] rounded text-[#8b949e] text-xs">
                      No tasks
                    </div>
                  ) : (
                    colTasks.map(task => {
                      const isOverdue = isTaskOverdue(task.dueDate, task.status);

                      return (
                        <div
                          key={task.id}
                          className="p-3 rounded-md bg-[#0d1117] border border-[#30363d] space-y-2 text-xs"
                        >
                          <h4 className="font-medium text-[#f0f6fc] leading-snug">
                            {task.title}
                          </h4>

                          <div className="flex items-center gap-2 text-[11px] text-[#8b949e] font-mono">
                            <span className={priorityColor[task.priority]}>{task.priority}</span>
                            <span aria-hidden="true">·</span>
                            <span>{task.category}</span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-[#21262d] text-[11px] font-mono">
                            <span className={isOverdue ? 'text-[#f85149]' : 'text-[#8b949e]'}>
                              {task.dueDate}
                            </span>

                            <div className="flex items-center gap-1">
                              {task.status !== 'To Do' && (
                                <button
                                  onClick={() => onUpdateTaskStatus(task.id, task.status === 'Completed' ? 'In Progress' : 'To Do')}
                                  className="p-1 text-[#8b949e] hover:text-[#f0f6fc] rounded"
                                  title="Move Left"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                              )}
                              {task.status !== 'Completed' && (
                                <button
                                  onClick={() => onUpdateTaskStatus(task.id, task.status === 'To Do' ? 'In Progress' : 'Completed')}
                                  className="p-1 text-[#8b949e] hover:text-[#f0f6fc] rounded"
                                  title="Move Right"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => onEditTask(task)}
                                className="p-1 text-[#8b949e] hover:text-[#f0f6fc] rounded"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
