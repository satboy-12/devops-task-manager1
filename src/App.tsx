import { useState, useEffect } from 'react';
import { 
  Task, 
  TaskStatus, 
  ViewTab, 
  ToastMessage 
} from './types';
import { 
  getSavedTasks, 
  saveTasks, 
  resetDemoTasks, 
  clearAllTasks, 
  getStorageUsage 
} from './services/storage';
import { isTaskOverdue } from './services/assistantEngine';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TaskManagementView } from './components/TaskManagementView';
import { SmartAssistantView } from './components/SmartAssistantView';
import { DevOpsHubView } from './components/DevOpsHubView';
import { SettingsView } from './components/SettingsView';
import { TaskModal } from './components/TaskModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer } from './components/Toast';

import { LayoutDashboard, CheckSquare, Sparkles, Terminal, Settings } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => getSavedTasks());
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Confirmation Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {}
  });

  // Calculate storage usage
  const storageInfo = getStorageUsage();

  // Trigger toast helper
  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      message
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Synchronize tasks to LocalStorage on change
  const updateAndPersistTasks = (updated: Task[]) => {
    setTasks(updated);
    saveTasks(updated);
  };

  // Open task modal for new task
  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  // Open task modal for editing
  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => {
    if (taskData.id) {
      // Editing existing task
      const updated = tasks.map(t =>
        t.id === taskData.id
          ? {
              ...t,
              title: taskData.title,
              description: taskData.description,
              category: taskData.category,
              priority: taskData.priority,
              status: taskData.status,
              dueDate: taskData.dueDate,
              tags: taskData.tags,
              estimatedHours: taskData.estimatedHours,
              updatedAt: new Date().toISOString()
            }
          : t
      );
      updateAndPersistTasks(updated);
      addToast('success', 'Task Updated', `"${taskData.title}" saved successfully.`);
    } else {
      // Creating new task
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        priority: taskData.priority,
        status: taskData.status,
        dueDate: taskData.dueDate,
        tags: taskData.tags,
        estimatedHours: taskData.estimatedHours,
        createdAt: new Date().toISOString()
      };
      updateAndPersistTasks([newTask, ...tasks]);
      addToast('success', 'Task Created', `"${newTask.title}" added to your workspace.`);
    }
  };

  // Request Delete with confirmation
  const handleRequestDelete = (task: Task) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete DevOps Task?',
      message: `Are you sure you want to permanently delete "${task.title}"? This cannot be undone.`,
      confirmLabel: 'Delete Task',
      isDestructive: true,
      action: () => {
        const remaining = tasks.filter(t => t.id !== task.id);
        updateAndPersistTasks(remaining);
        addToast('info', 'Task Deleted', `Removed "${task.title}".`);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Quick Toggle Status: To Do -> In Progress -> Completed -> To Do
  const handleToggleTaskStatus = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let nextStatus: TaskStatus = 'To Do';
    if (task.status === 'To Do') nextStatus = 'In Progress';
    else if (task.status === 'In Progress') nextStatus = 'Completed';
    else nextStatus = 'To Do';

    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, status: nextStatus, updatedAt: new Date().toISOString() } : t
    );
    updateAndPersistTasks(updated);
    addToast(
      nextStatus === 'Completed' ? 'success' : 'info',
      `Status: ${nextStatus}`,
      `"${task.title}" is now marked as ${nextStatus}.`
    );
  };

  // Explicit Update Status (e.g. from dropdown or Kanban)
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    );
    updateAndPersistTasks(updated);
    addToast('info', `Moved to ${newStatus}`, `"${task.title}" updated.`);
  };

  // Reset to Demo tasks
  const handleResetDemoData = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Reset to Sample DevOps Tasks?',
      message: 'This will replace current workspace items with authentic cybersecurity and DevOps sprint templates.',
      confirmLabel: 'Reset Data',
      isDestructive: false,
      action: () => {
        const demo = resetDemoTasks();
        setTasks(demo);
        addToast('success', 'Demo Fixtures Loaded', 'Workspace restored to 8 sample DevOps tasks.');
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Clear all data
  const handleClearAllData = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Clear All Tasks?',
      message: 'Warning: All tasks in your local workspace will be wiped permanently. Back up first if needed.',
      confirmLabel: 'Clear All',
      isDestructive: true,
      action: () => {
        const empty = clearAllTasks();
        setTasks(empty);
        addToast('warning', 'Workspace Cleared', 'All tasks have been removed from LocalStorage.');
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Import tasks
  const handleImportTasks = (importedTasks: Task[]) => {
    updateAndPersistTasks(importedTasks);
  };

  // Metrics for badges
  const taskCounts = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'To Do').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    overdue: tasks.filter(t => isTaskOverdue(t.dueDate, t.status)).length
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCreateModal={handleOpenCreateModal}
        overdueCount={taskCounts.overdue}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          taskCounts={taskCounts}
          storageKB={storageInfo.usedKB}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 pb-20 md:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              onNavigate={setActiveTab}
              onOpenCreateModal={handleOpenCreateModal}
              onToggleTaskStatus={handleToggleTaskStatus}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskManagementView
              tasks={tasks}
              onOpenCreateModal={handleOpenCreateModal}
              onEditTask={handleEditTask}
              onRequestDelete={handleRequestDelete}
              onToggleTaskStatus={handleToggleTaskStatus}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          )}

          {activeTab === 'assistant' && (
            <SmartAssistantView
              tasks={tasks}
              onAddTask={handleSaveTask}
              onToggleTaskStatus={handleToggleTaskStatus}
              onEditTask={handleEditTask}
            />
          )}

          {activeTab === 'devops' && <DevOpsHubView />}

          {activeTab === 'settings' && (
            <SettingsView
              tasks={tasks}
              onResetDemoData={handleResetDemoData}
              onClearAllData={handleClearAllData}
              onImportTasks={handleImportTasks}
              onTriggerToast={addToast}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#161b22] border-t border-[#30363d] flex items-center justify-around py-2 px-1 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-colors ${
            activeTab === 'dashboard' ? 'text-[#f0f6fc]' : 'text-[#8b949e]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-colors ${
            activeTab === 'tasks' ? 'text-[#f0f6fc]' : 'text-[#8b949e]'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks</span>
        </button>

        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-colors ${
            activeTab === 'assistant' ? 'text-[#f0f6fc]' : 'text-[#8b949e]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab('devops')}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-colors ${
            activeTab === 'devops' ? 'text-[#f0f6fc]' : 'text-[#8b949e]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>DevOps</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-colors ${
            activeTab === 'settings' ? 'text-[#f0f6fc]' : 'text-[#8b949e]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        taskToEdit={taskToEdit}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        isDestructive={confirmConfig.isDestructive}
        onConfirm={confirmConfig.action}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
