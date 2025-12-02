import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  FlowInstance,
  FlowTemplate,
  MetricSnapshot,
  Notification,
  RoleDefinition,
  Task,
  TaskProblem,
  TaskStatus,
  Unit,
  User,
  WorkloadSummary,
} from '@/types/domain';
import { apiFetch } from '@/services/api';

const DEFAULT_PASSWORD = 'Process123*';

const lower = <T extends string>(value: T | undefined, fallback: T): T =>
  ((value ?? fallback) as string).toLowerCase() as T;

const normalizeTask = (task: any): Task => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: lower<TaskStatus>(task.status, 'pending' as TaskStatus),
  ownerId: task.ownerId,
  assignerId: task.assignerId,
  flowInstanceId: task.flowInstanceId ?? undefined,
  priority: lower<Task['priority']>(task.priority, 'medium' as Task['priority']),
  deadline: task.deadline,
  createdAt: task.createdAt ?? task.deadline ?? new Date().toISOString(),
  updatedAt: task.updatedAt ?? task.createdAt ?? new Date().toISOString(),
  progress: task.progress ?? 0,
  durationDays: task.durationDays ?? 0,
  dependencies: task.dependencies ?? [],
  relatedTaskIds: task.relatedTaskIds ?? [],
  tags: task.tags ?? [],
  allowRejection: task.allowRejection ?? true,
  problems: (task.problems ?? []).map((problem: TaskProblem) => ({
    ...problem,
    status: lower<TaskProblem['status']>(problem.status, 'open'),
  })),
  history: task.history ?? [],
  subTasks: (task.subTasks ?? []).map((subTask: any) => ({
    ...subTask,
    status: lower<TaskStatus>(subTask.status, 'pending' as TaskStatus),
  })),
  owner: task.owner ?? null,
  assigner: task.assigner ?? null,
});

const normalizeFlowInstance = (instance: any): FlowInstance => ({
  id: instance.id,
  templateId: instance.templateId,
  name: instance.name,
  kickoffDate: instance.kickoffDate,
  dueDate: instance.dueDate,
  progress: instance.progress ?? 0,
  health: lower<FlowInstance['health']>(instance.health, 'on_track'),
  template: instance.template ?? undefined,
  ownerUnitId: instance.ownerUnitId,
  ownerUnit: instance.ownerUnit ?? undefined,
  stageStatuses:
    instance.stageStatuses?.map((stage: any) => ({
      id: stage.id,
      status: lower<TaskStatus>(stage.status, 'pending' as TaskStatus),
      progress: stage.progress ?? 0,
      owner: stage.owner ?? null,
      stage: stage.stage,
    })) ?? [],
  stageStatus: instance.stageStatus,
});

const normalizeWorkload = (entry: any): WorkloadSummary => {
  const userId = entry.userId ?? entry.ownerId ?? 'unknown';
  const assigned = entry.assigned ?? 0;
  return {
    userId,
    assigned,
    inProgress: entry.inProgress ?? 0,
    blocked: entry.blocked ?? 0,
    overdue: entry.overdue ?? 0,
    capacity: Math.max(entry.capacity ?? assigned ?? 1, 1),
  };
};

interface LoginPayload {
  email: string;
  password: string;
}

interface CreateTaskPayload {
  title: string;
  description: string;
  ownerId?: string;
  assignerId?: string;
  priority: Task['priority'];
  deadline: string;
  tags?: string[];
  flowInstanceId?: string;
}

interface CreateUserPayload {
  fullName: string;
  email: string;
  password?: string;
  roleId: string;
  unitId: string;
}

interface UpdateUserPayload {
  id: string;
  fullName?: string;
  email?: string;
  password?: string;
  roleId?: string;
  unitId?: string;
}

interface UpdateProfilePayload {
  fullName?: string;
  email?: string;
  password?: string;
  unitId?: string | null;
  avatarColor?: string;
}

interface CreateUnitPayload {
  name: string;
  parentId?: string | null;
  leadId?: string | null;
}

interface CreateFlowPayload {
  name: string;
  description: string;
  businessObjective: string;
  stages: FlowTemplate['stages'];
  ownerId: string;
  typicalDurationDays: number;
}

interface InstantiateFlowPayload {
  templateId: string;
  ownerUnitId: string;
  kickoffDate: string;
  dueDate: string;
  name: string;
  stageTasks?: {
    stageId: string;
    tasks: {
      title: string;
      description?: string;
      priority?: Task['priority'] | Uppercase<Task['priority']>;
      dueInDays?: number;
      ownerId?: string;
    }[];
  }[];
}

interface AppContextValue {
  token: string | null;
  loading: boolean;
  currentUser: User | null;
  roles: RoleDefinition[];
  units: Unit[];
  users: User[];
  tasks: Task[];
  flowTemplates: FlowTemplate[];
  flowInstances: FlowInstance[];
  notifications: Notification[];
  metrics: MetricSnapshot[];
  workload: WorkloadSummary[];
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  createTask: (payload: CreateTaskPayload) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  changeTaskStatus: (taskId: string, status: TaskStatus, progress?: number) => Promise<void>;
  reportProblem: (taskId: string, description: string) => Promise<void>;
  createUser: (payload: CreateUserPayload) => Promise<void>;
  updateUser: (payload: UpdateUserPayload) => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  createUnit: (payload: CreateUnitPayload) => Promise<void>;
  updateUnit: (id: string, payload: CreateUnitPayload) => Promise<void>;
  createFlowTemplate: (payload: CreateFlowPayload) => Promise<void>;
  instantiateFlow: (payload: InstantiateFlowPayload) => Promise<void>;
  deleteFlowTemplate: (id: string) => Promise<void>;
  deleteFlowInstance: (id: string) => Promise<void>;
}

interface AppData {
  roles: RoleDefinition[];
  units: Unit[];
  users: User[];
  tasks: Task[];
  flowTemplates: FlowTemplate[];
  flowInstances: FlowInstance[];
  notifications: Notification[];
  metrics: MetricSnapshot[];
  workload: WorkloadSummary[];
}

const defaultData: AppData = {
  roles: [],
  units: [],
  users: [],
  tasks: [],
  flowTemplates: [],
  flowInstances: [],
  notifications: [],
  metrics: [],
  workload: [],
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('psa:token'));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('psa:user');
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [data, setData] = useState<AppData>(defaultData);
  const [loading, setLoading] = useState(false);

  const authenticatedFetch = useCallback(
    async <T,>(path: string, options: RequestInit = {}) => {
      if (!token) {
        throw new Error('No token available');
      }
      return apiFetch<T>(path, { ...options, token });
    },
    [token],
  );

  const buildMetrics = useCallback((tasks: Task[]): MetricSnapshot[] => {
    if (!tasks.length) {
      return [];
    }
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const delayed = tasks.filter(
      (task) => task.status !== 'completed' && new Date(task.deadline) < new Date(),
    ).length;
    return [
      {
        date: new Date().toISOString(),
        completed,
        delayed,
        reassigned: tasks.filter((task) => task.history?.length > 0).length ?? 0,
      },
    ];
  }, []);

  const fetchInitialData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [roles, units, users, tasks, flowTemplates, flowInstances, alerts, workload] =
        await Promise.all([
          authenticatedFetch<RoleDefinition[]>('/roles'),
          authenticatedFetch<Unit[]>('/units'),
          authenticatedFetch<User[]>('/users'),
          authenticatedFetch<any[]>('/tasks'),
          authenticatedFetch<FlowTemplate[]>('/flows/templates'),
          authenticatedFetch<any[]>('/flows/instances'),
          authenticatedFetch<any[]>('/tasks/alerts'),
          authenticatedFetch<any[]>('/tasks/workload/summary'),
        ]);

      const normalizedTasks = tasks.map(normalizeTask);
      const normalizedAlerts = alerts.map(normalizeTask);
      const normalizedInstances = flowInstances.map(normalizeFlowInstance);
      const normalizedWorkload = workload.map(normalizeWorkload);

      const notifications: Notification[] = normalizedAlerts.map((task) => ({
        id: `ntf-${task.id}`,
        message: `La tarea "${task.title}" requiere atención (${task.status}).`,
        severity: task.status === 'blocked' ? 'danger' : 'warning',
        createdAt: new Date().toISOString(),
        link: '/app/tasks/alerts',
      }));

      setData({
        roles,
        units,
        users,
        tasks: normalizedTasks,
        flowTemplates,
        flowInstances: normalizedInstances,
        notifications,
        metrics: buildMetrics(normalizedTasks),
        workload: normalizedWorkload,
      });
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, buildMetrics, token]);

  useEffect(() => {
    if (token) {
      fetchInitialData();
    }
  }, [token, fetchInitialData]);

  const login = useCallback(
    async ({ email, password }: LoginPayload) => {
      const response = await apiFetch<{ accessToken: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(response.accessToken);
      setCurrentUser(response.user);
      localStorage.setItem('psa:token', response.accessToken);
      localStorage.setItem('psa:user', JSON.stringify(response.user));
    },
    [],
  );

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    setData(defaultData);
    localStorage.removeItem('psa:token');
    localStorage.removeItem('psa:user');
  }, []);

  const refreshAfterAction = useCallback(async () => {
    await fetchInitialData();
  }, [fetchInitialData]);

  const createTask = useCallback(
    async (payload: CreateTaskPayload) => {
      if (!currentUser) throw new Error('Usuario no autenticado');
      const ownerId = payload.ownerId ?? currentUser.id;
      const assignerId = payload.assignerId ?? currentUser.id;
      const created = await authenticatedFetch<any>('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          ownerId,
          assignerId,
          priority: payload.priority.toUpperCase(),
        }),
      });
      await refreshAfterAction();
      return normalizeTask(created);
    },
    [authenticatedFetch, refreshAfterAction, currentUser],
  );

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      const body: Record<string, unknown> = { ...updates };
      if (updates.priority) {
        body.priority = updates.priority.toUpperCase();
      }
      await authenticatedFetch(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      await refreshAfterAction();
    },
    [authenticatedFetch, refreshAfterAction],
  );

  const changeTaskStatus = useCallback(
    async (taskId: string, status: TaskStatus, progress?: number) => {
      await authenticatedFetch(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: status.toUpperCase(), progress }),
      });
      await refreshAfterAction();
    },
    [authenticatedFetch, refreshAfterAction],
  );

  const reportProblem = useCallback(
    async (taskId: string, description: string) => {
      await authenticatedFetch(`/tasks/${taskId}/problems`, {
        method: 'POST',
        body: JSON.stringify({ description }),
      });
      await refreshAfterAction();
    },
    [authenticatedFetch, refreshAfterAction],
  );

  const createUser = useCallback(
    async (payload: CreateUserPayload) => {
      await authenticatedFetch('/users', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          password: payload.password ?? DEFAULT_PASSWORD,
        }),
      });
      await refreshAfterAction();
    },
    [authenticatedFetch, refreshAfterAction],
  );

  const updateUser = useCallback(
    async ({ id, ...updates }: UpdateUserPayload) => {
      await authenticatedFetch(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      await refreshAfterAction();
    },
    [authenticatedFetch, refreshAfterAction],
  );

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      const updated = await authenticatedFetch<User>('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setCurrentUser(updated);
      localStorage.setItem('psa:user', JSON.stringify(updated));
      await refreshAfterAction();
    },
    [authenticatedFetch, refreshAfterAction],
  );

  const createUnit = useCallback(
    async (payload: CreateUnitPayload) => {
      await authenticatedFetch('/units', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await refreshAfterAction();
    },
    [authenticatedFetch, refreshAfterAction],
  );

  const updateUnit = useCallback(
    async (id: string, payload: CreateUnitPayload) => {
      await authenticatedFetch(`/units/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      await refreshAfterAction();
    },
    [authenticatedFetch, refreshAfterAction],
  );

  const createFlowTemplate = useCallback(
    async (payload: CreateFlowPayload) => {
      await authenticatedFetch('/flows/templates', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await refreshAfterAction();
    },
    [authenticatedFetch, refreshAfterAction],
  );

  const instantiateFlow = useCallback(
    async (payload: InstantiateFlowPayload) => {
      await authenticatedFetch('/flows/instances', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await refreshAfterAction();
    },
    [authenticatedFetch, refreshAfterAction],
  );

  const deleteFlowTemplate = useCallback(
    async (id: string) => {
      await authenticatedFetch(`/flows/templates/${id}`, { method: 'DELETE' });
      await refreshAfterAction();
    },
    [authenticatedFetch, refreshAfterAction],
  );

  const deleteFlowInstance = useCallback(
    async (id: string) => {
      await authenticatedFetch(`/flows/instances/${id}`, { method: 'DELETE' });
      await refreshAfterAction();
    },
    [authenticatedFetch, refreshAfterAction],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      token,
      loading,
      currentUser,
      ...data,
      login,
      logout,
      createTask,
      updateTask,
      changeTaskStatus,
      reportProblem,
      createUser,
      updateUser,
      updateProfile,
      createUnit,
      updateUnit,
      createFlowTemplate,
      instantiateFlow,
      deleteFlowTemplate,
      deleteFlowInstance,
    }),
    [
      token,
      loading,
      currentUser,
      data,
      login,
      logout,
      createTask,
      updateTask,
      changeTaskStatus,
      reportProblem,
      createUser,
      updateUser,
      updateProfile,
      createUnit,
      updateUnit,
      createFlowTemplate,
      instantiateFlow,
      deleteFlowTemplate,
      deleteFlowInstance,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
