import React, { useState, useEffect } from 'react';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '../types';
import { X } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  taskToEdit?: Task | null;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => void;
}

const CATEGORIES: TaskCategory[] = [
  'DevOps',
  'Security',
  'CI/CD',
  'Cloud',
  'Infrastructure',
  'Monitoring',
  'Testing',
  'General'
];

const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Completed'];

export function TaskModal({ isOpen, taskToEdit, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('DevOps');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>(4);
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setDueDate(taskToEdit.dueDate);
      setEstimatedHours(taskToEdit.estimatedHours || 2);
      setTagsInput(taskToEdit.tags?.join(', ') || '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('DevOps');
      setPriority('Medium');
      setStatus('To Do');
      const defaultDate = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10);
      setDueDate(defaultDate);
      setEstimatedHours(4);
      setTagsInput('devops');
    }
    setErrors({});
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required.';
    }

    if (!dueDate) {
      newErrors.dueDate = 'Due date is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const cleanTags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    onSave({
      ...(taskToEdit ? { id: taskToEdit.id } : {}),
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status,
      dueDate,
      estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
      tags: cleanTags
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl my-8 overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#30363d]">
          <h2 className="text-sm font-semibold text-[#f0f6fc]">
            {taskToEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-[#8b949e] hover:text-[#f0f6fc] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-[#c9d1d9] mb-1">
              Title <span className="text-[#f85149]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
              }}
              placeholder="e.g. Audit AWS IAM policies for least-privilege compliance"
              className={`w-full px-3 py-1.5 rounded-md bg-[#0d1117] border ${
                errors.title ? 'border-[#f85149]' : 'border-[#30363d] focus:border-[#58a6ff]'
              } text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none transition-colors`}
            />
            {errors.title && <p className="text-[11px] text-[#f85149] mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[#c9d1d9] mb-1">
              Description <span className="text-[#f85149]">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => {
                setDescription(e.target.value);
                if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
              }}
              placeholder="Technical details, commands to run, verification steps..."
              className={`w-full px-3 py-1.5 rounded-md bg-[#0d1117] border ${
                errors.description ? 'border-[#f85149]' : 'border-[#30363d] focus:border-[#58a6ff]'
              } text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none transition-colors resize-none`}
            />
            {errors.description && <p className="text-[11px] text-[#f85149] mt-1">{errors.description}</p>}
          </div>

          {/* Row: Category, Priority, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#c9d1d9] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TaskCategory)}
                className="w-full px-2.5 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c9d1d9] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full px-2.5 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c9d1d9] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full px-2.5 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Due Date, Hours, Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#c9d1d9] mb-1">
                Due Date <span className="text-[#f85149]">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) setErrors(prev => ({ ...prev, dueDate: '' }));
                }}
                className={`w-full px-2.5 py-1.5 rounded-md bg-[#0d1117] border ${
                  errors.dueDate ? 'border-[#f85149]' : 'border-[#30363d] focus:border-[#58a6ff]'
                } text-[#f0f6fc] focus:outline-none`}
              />
              {errors.dueDate && <p className="text-[11px] text-[#f85149] mt-1">{errors.dueDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c9d1d9] mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                min={1}
                max={160}
                value={estimatedHours || ''}
                onChange={e => setEstimatedHours(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="4"
                className="w-full px-2.5 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c9d1d9] mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="docker, k8s, cve"
                className="w-full px-2.5 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#30363d]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-[#c9d1d9] hover:text-white bg-[#21262d] hover:bg-[#30363d] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1f6feb] hover:bg-[#388bfd] rounded-md transition-colors"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
