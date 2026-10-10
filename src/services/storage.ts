import { Task } from '../types';

const STORAGE_KEY = 'nexora_devops_tasks_v1';
const INITIALIZED_KEY = 'nexora_initialized';

export const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: 'task-sec-101',
    title: 'Configure Kubernetes RBAC & Pod Security Standards',
    description: 'Enforce non-root execution, disable privilege escalation, and restrict cluster-admin privileges to CI/CD service accounts.',
    category: 'Security',
    priority: 'Critical',
    status: 'In Progress',
    dueDate: '2026-10-12',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    tags: ['k8s', 'rbac', 'hardening'],
    estimatedHours: 6
  },
  {
    id: 'task-devops-102',
    title: 'Multi-stage Dockerfile Optimization & Image Hardening',
    description: 'Refactor production Dockerfile using alpine base, prune unnecessary dev dependencies, and integrate non-root user execution.',
    category: 'DevOps',
    priority: 'High',
    status: 'Completed',
    dueDate: '2026-10-09',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    tags: ['docker', 'optimization'],
    estimatedHours: 4
  },
  {
    id: 'task-cicd-103',
    title: 'Automate GitHub Actions CI/CD with Trivy Vulnerability Scan',
    description: 'Implement automated pipeline step to scan container images for CVEs before pushing to registry. Fail builds on High/Critical CVEs.',
    category: 'CI/CD',
    priority: 'Critical',
    status: 'To Do',
    dueDate: '2026-10-14',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    tags: ['github-actions', 'trivy', 'devsecops'],
    estimatedHours: 8
  },
  {
    id: 'task-cloud-104',
    title: 'AWS IAM Least-Privilege Role Audit & Secrets Rotation',
    description: 'Audit overly permissive S3 and KMS policies; implement AWS Secrets Manager 30-day automated rotation lambda.',
    category: 'Cloud',
    priority: 'High',
    status: 'To Do',
    dueDate: '2026-10-16',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    tags: ['aws', 'iam', 'secrets'],
    estimatedHours: 5
  },
  {
    id: 'task-mon-105',
    title: 'Prometheus & Grafana Alerting for CrashLoopBackOff',
    description: 'Create Alertmanager rules to ping Slack/PagerDuty when node memory exceeds 85% or pod restart count > 3 in 10 minutes.',
    category: 'Monitoring',
    priority: 'Medium',
    status: 'Completed',
    dueDate: '2026-10-08',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    tags: ['prometheus', 'grafana', 'alerts'],
    estimatedHours: 4
  },
  {
    id: 'task-infra-106',
    title: 'Terraform State Locking with S3 & DynamoDB Migration',
    description: 'Prevent concurrent pipeline state collision by migrating local state files to remote backend with server-side AES256 encryption.',
    category: 'Infrastructure',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '2026-10-18',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    tags: ['terraform', 's3', 'iac'],
    estimatedHours: 3
  },
  {
    id: 'task-sec-107',
    title: 'OWASP Top 10 API Security Penetration Test',
    description: 'Perform black-box fuzzing on staging REST endpoints checking for BOLA (Broken Object Level Authorization) and rate limit evasion.',
    category: 'Security',
    priority: 'Critical',
    status: 'To Do',
    dueDate: '2026-10-11',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    tags: ['owasp', 'pentest', 'api'],
    estimatedHours: 10
  },
  {
    id: 'task-test-108',
    title: 'End-to-End Smoke Test Suite for Kubernetes Ingress Controller',
    description: 'Validate TLS termination, automated Let’s Encrypt cert-manager renewals, and path routing for internal microservices.',
    category: 'Testing',
    priority: 'Low',
    status: 'In Progress',
    dueDate: '2026-10-20',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    tags: ['k8s', 'ingress', 'smoke-test'],
    estimatedHours: 3
  }
];

export function getSavedTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First run: load initial demo tasks
      saveTasks(INITIAL_DEMO_TASKS);
      localStorage.setItem(INITIALIZED_KEY, 'true');
      return INITIAL_DEMO_TASKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_DEMO_TASKS;
  } catch (err) {
    console.error('Failed to read tasks from LocalStorage:', err);
    return INITIAL_DEMO_TASKS;
  }
}

export function saveTasks(tasks: Task[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (err) {
    console.error('Failed to persist tasks to LocalStorage:', err);
    return false;
  }
}

export function resetDemoTasks(): Task[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_TASKS));
    return INITIAL_DEMO_TASKS;
  } catch (err) {
    console.error('Failed to reset demo tasks:', err);
    return INITIAL_DEMO_TASKS;
  }
}

export function clearAllTasks(): Task[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  } catch (err) {
    console.error('Failed to clear tasks:', err);
    return [];
  }
}

export function exportTasksToJson(tasks: Task[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      appName: 'Nexora AI DevOps Workspace',
      version: '1.2.0',
      tasksCount: tasks.length,
      tasks
    },
    null,
    2
  );
}

export function parseImportedTasks(jsonString: string): Task[] | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed && Array.isArray(parsed.tasks)) {
      return parsed.tasks;
    }
    return null;
  } catch {
    return null;
  }
}

export function getStorageUsage(): { usedKB: number; quotaEstimateKB: number; taskCount: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '';
    const bytes = new Blob([raw]).size;
    const usedKB = Math.round((bytes / 1024) * 10) / 10;
    const taskCount = raw ? (JSON.parse(raw) as unknown[]).length : 0;
    return {
      usedKB,
      quotaEstimateKB: 5120, // Standard 5MB browser quota
      taskCount
    };
  } catch {
    return { usedKB: 0, quotaEstimateKB: 5120, taskCount: 0 };
  }
}
