import { Task, TaskPriority, TaskCategory, RecommendationResult, ProductivitySummary } from '../types';

/**
 * Nexora Rule-Based Engine
 * 100% Client-side, deterministic decision heuristics for DevOps & Cyber task prioritization.
 * Zero external API calls or latency.
 */

// Priority weight constants for the ranking algorithm
const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  Critical: 45,
  High: 30,
  Medium: 15,
  Low: 5
};

export function isTaskOverdue(dueDateString: string, status: string): boolean {
  if (status === 'Completed') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateString);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

export function getDaysUntilDue(dueDateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateString);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Score task urgency using deterministic heuristics:
 * Score = PriorityWeight + DueDateUrgency + StatusBonus + CategoryUrgency
 */
export function calculateTaskUrgencyScore(task: Task): { score: number; reason: string } {
  if (task.status === 'Completed') {
    return { score: 0, reason: 'Task already completed' };
  }

  let score = PRIORITY_WEIGHTS[task.priority] || 10;
  const days = getDaysUntilDue(task.dueDate);
  const reasons: string[] = [];

  // Priority contribution
  reasons.push(`${task.priority} priority tier (+${score} pts)`);

  // Due Date contribution
  if (days < 0) {
    const overduePenalty = Math.min(40, 25 + Math.abs(days) * 5);
    score += overduePenalty;
    reasons.push(`Overdue by ${Math.abs(days)} day(s) (+${overduePenalty} pts)`);
  } else if (days === 0) {
    score += 25;
    reasons.push('Due today (+25 pts)');
  } else if (days <= 2) {
    score += 18;
    reasons.push(`Due in ${days} day(s) (+18 pts)`);
  } else if (days <= 5) {
    score += 10;
    reasons.push(`Due soon in ${days} days (+10 pts)`);
  }

  // In-progress momentum bonus (favor finishing active work to reduce WIP)
  if (task.status === 'In Progress') {
    score += 15;
    reasons.push('Work In Progress momentum (+15 pts)');
  }

  // Cybersecurity / Critical infrastructure domain weighting
  if (task.category === 'Security') {
    score += 8;
    reasons.push('Security domain vulnerability triage (+8 pts)');
  } else if (task.category === 'CI/CD' && task.priority === 'Critical') {
    score += 5;
    reasons.push('Pipeline block risk (+5 pts)');
  }

  return {
    score,
    reason: reasons.join(' • ')
  };
}

/**
 * Recommend which task to execute next based on the highest calculated urgency score
 */
export function recommendNextTask(tasks: Task[]): RecommendationResult {
  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  if (activeTasks.length === 0) {
    return {
      task: null,
      score: 0,
      reason: 'All tasks completed! Your DevOps backlog is clear.',
      urgencyLevel: 'low'
    };
  }

  let highestScore = -1;
  let topTask: Task | null = null;
  let topReason = '';

  for (const task of activeTasks) {
    const { score, reason } = calculateTaskUrgencyScore(task);
    if (score > highestScore) {
      highestScore = score;
      topTask = task;
      topReason = reason;
    }
  }

  let urgencyLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';
  if (highestScore >= 60) urgencyLevel = 'critical';
  else if (highestScore >= 40) urgencyLevel = 'high';
  else if (highestScore >= 25) urgencyLevel = 'medium';

  return {
    task: topTask,
    score: highestScore,
    reason: topReason,
    urgencyLevel
  };
}

/**
 * Natural Language Command Parser
 * Parses natural strings like:
 * "Add a high-priority task called Test Docker deployment"
 * "Create critical security task Patch OpenSSL vulnerability due 2026-10-15"
 * "Add task Setup AWS S3 bucket"
 */
export interface ParsedTaskCommand {
  isValid: boolean;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string;
  description: string;
  feedback: string;
}

export function parseNaturalLanguageTask(input: string): ParsedTaskCommand {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      title: '',
      category: 'DevOps',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      description: '',
      feedback: 'Please enter a task description or command.'
    };
  }

  const lower = trimmed.toLowerCase();

  // 1. Detect Priority
  let priority: TaskPriority = 'Medium';
  if (lower.includes('critical') || lower.includes('urgent') || lower.includes('p0')) {
    priority = 'Critical';
  } else if (lower.includes('high priority') || lower.includes('high-priority') || lower.includes('p1') || lower.includes('high')) {
    priority = 'High';
  } else if (lower.includes('low priority') || lower.includes('low-priority') || lower.includes('minor') || lower.includes('low')) {
    priority = 'Low';
  } else if (lower.includes('medium') || lower.includes('normal')) {
    priority = 'Medium';
  }

  // 2. Detect Category
  let category: TaskCategory = 'DevOps';
  if (lower.includes('security') || lower.includes('cve') || lower.includes('vulnerability') || lower.includes('audit') || lower.includes('rbac') || lower.includes('owasp')) {
    category = 'Security';
  } else if (lower.includes('ci/cd') || lower.includes('pipeline') || lower.includes('github action') || lower.includes('gitlab') || lower.includes('jenkins') || lower.includes('deploy')) {
    category = 'CI/CD';
  } else if (lower.includes('cloud') || lower.includes('aws') || lower.includes('azure') || lower.includes('gcp') || lower.includes('terraform')) {
    category = 'Cloud';
  } else if (lower.includes('docker') || lower.includes('container') || lower.includes('k8s') || lower.includes('kubernetes') || lower.includes('helm') || lower.includes('devops')) {
    category = 'DevOps';
  } else if (lower.includes('monitor') || lower.includes('grafana') || lower.includes('prometheus') || lower.includes('metric') || lower.includes('log') || lower.includes('alert')) {
    category = 'Monitoring';
  } else if (lower.includes('test') || lower.includes('qa') || lower.includes('e2e') || lower.includes('smoke') || lower.includes('unit')) {
    category = 'Testing';
  } else if (lower.includes('infra') || lower.includes('server') || lower.includes('network') || lower.includes('vpc') || lower.includes('dns')) {
    category = 'Infrastructure';
  }

  // 3. Detect Due Date if specified (e.g. "due 2026-10-15", "due tomorrow", "due in 3 days")
  let dueDate = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10); // default 3 days
  const dateMatch = lower.match(/due (\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    dueDate = dateMatch[1];
  } else if (lower.includes('due tomorrow')) {
    dueDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  } else if (lower.includes('due today')) {
    dueDate = new Date().toISOString().slice(0, 10);
  } else {
    const daysMatch = lower.match(/due in (\d+) days?/);
    if (daysMatch) {
      const days = parseInt(daysMatch[1], 10);
      dueDate = new Date(Date.now() + 86400000 * days).toISOString().slice(0, 10);
    }
  }

  // 4. Extract Title
  let extractedTitle = trimmed;

  // Patterns like: "Add a high-priority task called X", "Create task X", "Add task: X", "Add X"
  const calledMatch = trimmed.match(/called\s+["']?([^"']+)["']?/i);
  const titledMatch = trimmed.match(/titled\s+["']?([^"']+)["']?/i);
  const quoteMatch = trimmed.match(/["']([^"']+)["']/);

  if (calledMatch && calledMatch[1]) {
    extractedTitle = calledMatch[1].trim();
  } else if (titledMatch && titledMatch[1]) {
    extractedTitle = titledMatch[1].trim();
  } else if (quoteMatch && quoteMatch[1]) {
    extractedTitle = quoteMatch[1].trim();
  } else {
    // Strip common command prefixes
    extractedTitle = extractedTitle
      .replace(/^(add|create|new|schedule|insert)\s+(a\s+)?(task\s+)?/i, '')
      .replace(/^(high-priority|low-priority|critical|medium-priority|urgent)\s+(task\s+)?/i, '')
      .replace(/\s+due\s+(\d{4}-\d{2}-\d{2}|today|tomorrow|in \d+ days?)/i, '')
      .replace(/^(devops|security|cloud|ci\/cd)\s+task:?\s*/i, '')
      .trim();
  }

  // Capitalize first letter
  if (extractedTitle.length > 0) {
    extractedTitle = extractedTitle.charAt(0).toUpperCase() + extractedTitle.slice(1);
  } else {
    extractedTitle = 'New DevOps Task';
  }

  return {
    isValid: true,
    title: extractedTitle,
    category,
    priority,
    dueDate,
    description: `Created via task command on ${new Date().toLocaleDateString()}. Input: "${trimmed}"`,
    feedback: `Parsed successfully: [${priority}] Priority • Category: [${category}] • Due: ${dueDate}`
  };
}

/**
 * Generate deep daily productivity metrics & health score from real tasks
 */
export function generateProductivitySummary(tasks: Task[]): ProductivitySummary {
  const totalTasks = tasks.length;
  if (totalTasks === 0) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      completionRate: 0,
      criticalPendingCount: 0,
      healthScore: 100,
      healthStatus: 'Optimal',
      summaryText: 'Workspace initialized. Add tasks to start tracking DevOps throughput.'
    };
  }

  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'To Do').length;
  
  const overdueTasks = tasks.filter(t => isTaskOverdue(t.dueDate, t.status)).length;
  const criticalPendingCount = tasks.filter(t => t.status !== 'Completed' && t.priority === 'Critical').length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  // Health Score (0 - 100)
  // Deductions: 15 per overdue, 10 per critical pending, bonus for completed
  let healthScore = 100;
  healthScore -= overdueTasks * 14;
  healthScore -= criticalPendingCount * 8;
  healthScore = Math.max(10, Math.min(100, healthScore));

  let healthStatus: ProductivitySummary['healthStatus'] = 'Optimal';
  if (healthScore < 50 || overdueTasks >= 3) {
    healthStatus = 'Critical Bottlenecks';
  } else if (healthScore < 75 || overdueTasks > 0) {
    healthStatus = 'Needs Attention';
  } else if (healthScore < 90) {
    healthStatus = 'Stable';
  }

  // Dynamic context-aware summary text
  let summaryText = '';
  if (overdueTasks > 0) {
    summaryText = `Alert: ${overdueTasks} item${overdueTasks > 1 ? 's are' : ' is'} overdue, including ${criticalPendingCount} critical items. Recommend immediate backlog triage before opening new epics.`;
  } else if (criticalPendingCount > 0) {
    summaryText = `Pipeline active: ${criticalPendingCount} critical item${criticalPendingCount > 1 ? 's require' : ' requires'} attention. Overall completion rate stands at ${completionRate}%.`;
  } else if (completionRate > 80) {
    summaryText = `High sprint velocity: ${completionRate}% completed tasks. Infrastructure state is resilient and stable.`;
  } else {
    summaryText = `Healthy execution: ${inProgressTasks} active in-flight tasks and ${pendingTasks} ready in backlog. No overdue incidents.`;
  }

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    overdueTasks,
    completionRate,
    criticalPendingCount,
    healthScore,
    healthStatus,
    summaryText
  };
}
