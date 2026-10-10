export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';

export type TaskCategory = 
  | 'DevOps'
  | 'Security'
  | 'CI/CD'
  | 'Cloud'
  | 'Infrastructure'
  | 'Monitoring'
  | 'Testing'
  | 'General';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  updatedAt?: string;
  tags?: string[];
  estimatedHours?: number;
}

export type ViewTab = 'dashboard' | 'tasks' | 'assistant' | 'devops' | 'settings';

export type TaskViewMode = 'list' | 'kanban';

export type SortOption = 
  | 'dueDateAsc'
  | 'dueDateDesc'
  | 'priorityDesc'
  | 'priorityAsc'
  | 'createdDesc'
  | 'titleAsc';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

export interface RecommendationResult {
  task: Task | null;
  score: number;
  reason: string;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
}

export interface ProductivitySummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  criticalPendingCount: number;
  healthScore: number;
  healthStatus: 'Optimal' | 'Stable' | 'Needs Attention' | 'Critical Bottlenecks';
  summaryText: string;
}
